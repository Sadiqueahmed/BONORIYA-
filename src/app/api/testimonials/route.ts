import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/db';

// Maximum number of testimonials to display
const MAX_DISPLAYED_TESTIMONIALS = 10;

// In-memory storage for demo mode (persists during server lifetime)
let demoTestimonials: any[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    rating: 5,
    comment: 'Food, atmosphere and service is really good. The 21 Bowl is absolutely delicious and the portion size is generous. Will definitely come back!',
    source: 'Google',
    customer: null,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: '2',
    name: 'Priya Das',
    rating: 5,
    comment: 'Best ethnic food bowl at an affordable price in the entire locality. The tribal bowl with pork is a must-try! Authentic flavors of Assam.',
    source: 'Zomato',
    customer: null,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: '3',
    name: 'Amit Kalita',
    rating: 5,
    comment: 'Great place, good and friendly people and very delicious meal. The eco-friendly packaging is a big plus. Love the concept!',
    source: 'Swiggy',
    customer: null,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: '4',
    name: 'Sneha Bora',
    rating: 4,
    comment: 'Comfort food at its best! The flavours were rich and authentic. Reminds me of home-cooked meals. Highly recommended for students near RGU.',
    source: 'Google',
    customer: null,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: '5',
    name: 'Vikram Hazarika',
    rating: 5,
    comment: 'Feels like homely food, made with care and attention to health. The prices are very reasonable and quality is top-notch. My go-to place for lunch!',
    source: 'Google',
    customer: null,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// GET - Fetch all testimonials (or limited for carousel)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    
    if (!isDatabaseAvailable()) {
      // Sort by newest first
      const sorted = [...demoTestimonials].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Return limited or all testimonials
      if (limit) {
        return NextResponse.json(sorted.slice(0, parseInt(limit)));
      }
      return NextResponse.json(sorted);
    }

    const testimonials = await prisma!.testimonial.findMany({
      where: { active: true },
      orderBy: [
        { createdAt: 'desc' },
        { order: 'asc' }
      ],
      include: {
        customer: {
          select: {
            name: true,
            imageUrl: true
          }
        }
      },
      ...(limit ? { take: parseInt(limit) } : {})
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(demoTestimonials);
  }
}

// POST - Submit a new testimonial (requires authentication)
export async function POST(request: NextRequest) {
  try {
    // Dynamic import to avoid build errors
    const { auth, clerkClient } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to submit a review.' }, { status: 401 });
    }

    const body = await request.json();
    const { rating, comment, source, name, email } = body;

    // Validate input
    if (!comment || comment.trim().length < 10) {
      return NextResponse.json({ error: 'Review must be at least 10 characters long' }, { status: 400 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Get user info from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const userName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.firstName || user.username || name || 'Anonymous';
    const userImage = user.imageUrl;

    // Create testimonial object
    const newTestimonial = {
      id: `user-${Date.now()}`,
      name: userName,
      rating: parseInt(rating),
      comment: comment.trim(),
      source: source || 'Website',
      customer: {
        name: userName,
        imageUrl: userImage
      },
      createdAt: new Date().toISOString()
    };

    if (!isDatabaseAvailable()) {
      // Add new testimonial at the beginning
      demoTestimonials.unshift(newTestimonial);
      
      // Keep only the most recent testimonials (remove oldest if exceeds limit)
      if (demoTestimonials.length > MAX_DISPLAYED_TESTIMONIALS) {
        // Store removed testimonials count for info
        const removedCount = demoTestimonials.length - MAX_DISPLAYED_TESTIMONIALS;
        demoTestimonials = demoTestimonials.slice(0, MAX_DISPLAYED_TESTIMONIALS);
        console.log(`Removed ${removedCount} old testimonial(s) to maintain limit of ${MAX_DISPLAYED_TESTIMONIALS}`);
      }
      
      // Return the updated list
      return NextResponse.json({ 
        success: true, 
        testimonial: newTestimonial,
        testimonials: demoTestimonials.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
        message: 'Review submitted successfully!' 
      });
    }

    // Get or create customer in database
    let customer = await prisma!.customer.findUnique({
      where: { clerkId: userId }
    });

    if (!customer) {
      const primaryEmail = user.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId
      )?.emailAddress;

      customer = await prisma!.customer.create({
        data: {
          clerkId: userId,
          email: primaryEmail || email,
          name: userName,
          imageUrl: userImage,
        }
      });
    }

    // Create testimonial in database
    const testimonial = await prisma!.testimonial.create({
      data: {
        name: userName,
        rating: parseInt(rating),
        comment: comment.trim(),
        source: source || 'Website',
        clerkId: userId,
        active: true,
      }
    });

    // Check if we need to archive old testimonials
    const totalTestimonials = await prisma!.testimonial.count({ where: { active: true } });
    
    if (totalTestimonials > MAX_DISPLAYED_TESTIMONIALS) {
      // Get the oldest testimonials to archive
      const oldestTestimonials = await prisma!.testimonial.findMany({
        where: { active: true },
        orderBy: { createdAt: 'asc' },
        take: totalTestimonials - MAX_DISPLAYED_TESTIMONIALS,
        select: { id: true }
      });
      
      // Archive (set active to false) instead of deleting
      if (oldestTestimonials.length > 0) {
        await prisma!.testimonial.updateMany({
          where: { id: { in: oldestTestimonials.map(t => t.id) } },
          data: { active: false }
        });
      }
    }

    // Get updated list
    const updatedTestimonials = await prisma!.testimonial.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            name: true,
            imageUrl: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      testimonial,
      testimonials: updatedTestimonials
    });
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    return NextResponse.json({ error: 'Failed to submit testimonial' }, { status: 500 });
  }
}
