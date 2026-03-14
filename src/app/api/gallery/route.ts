import { NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/db';

export async function GET() {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json([]);
    }

    const images = await prisma!.galleryImage.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json([]);
  }
}
