import { NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/db';

export async function GET() {
  try {
    if (!isDatabaseAvailable()) {
      // Return mock categories when database isn't configured
      return NextResponse.json([
        { id: '1', name: 'Rice Bowls', slug: 'rice-bowls', icon: 'bowl', order: 1 },
        { id: '2', name: 'Fried Rice', slug: 'fried-rice', icon: 'rice', order: 2 },
        { id: '3', name: 'Salads', slug: 'salads', icon: 'salad', order: 3 },
        { id: '4', name: 'Seasonal Combos', slug: 'combos', icon: 'utensils', order: 4 },
        { id: '5', name: 'Beverages', slug: 'beverages', icon: 'cup', order: 5 }
      ]);
    }

    const categories = await prisma!.category.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json([]);
  }
}
