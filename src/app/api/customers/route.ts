import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Get current customer profile
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get customer from database
    let customer = await prisma.customer.findUnique({
      where: { clerkId: userId },
      include: {
        testimonials: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // If customer doesn't exist, create from Clerk data
    if (!customer) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      
      const primaryEmail = user.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId
      )?.emailAddress;

      customer = await prisma.customer.create({
        data: {
          clerkId: userId,
          email: primaryEmail,
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.firstName || user.username || 'Anonymous',
          imageUrl: user.imageUrl,
        },
        include: {
          testimonials: true
        }
      });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ error: 'Failed to fetch customer profile' }, { status: 500 });
  }
}

// POST - Sync customer data from Clerk
export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    const primaryEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress;

    const customer = await prisma.customer.upsert({
      where: { clerkId: userId },
      update: {
        email: primaryEmail,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName || user.username || 'Anonymous',
        imageUrl: user.imageUrl,
      },
      create: {
        clerkId: userId,
        email: primaryEmail,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName || user.username || 'Anonymous',
        imageUrl: user.imageUrl,
      }
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error syncing customer:', error);
    return NextResponse.json({ error: 'Failed to sync customer profile' }, { status: 500 });
  }
}
