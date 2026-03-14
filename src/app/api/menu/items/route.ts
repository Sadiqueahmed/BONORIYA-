import { NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/db';

export async function GET() {
  try {
    if (!isDatabaseAvailable()) {
      // Return mock menu items when database isn't configured
      return NextResponse.json([
        {
          id: '1',
          name: 'The 21 Bowl (Veg)',
          description: 'A complete wholesome meal with steamed rice, crispy fries, seasonal vegetables, and traditional Assamese sides. Perfect for a healthy lunch!',
          price: 140,
          image: null,
          isVeg: true,
          isPopular: true,
          isAvailable: true,
          category: { id: '1', name: 'Rice Bowls', slug: 'rice-bowls', icon: 'bowl' }
        },
        {
          id: '2',
          name: 'The 21 Bowl (Chicken)',
          description: 'Signature rice bowl with tender chicken pieces, assorted vegetables, and authentic tribal spices. A customer favorite!',
          price: 180,
          image: null,
          isVeg: false,
          isPopular: true,
          isAvailable: true,
          category: { id: '1', name: 'Rice Bowls', slug: 'rice-bowls', icon: 'bowl' }
        },
        {
          id: '3',
          name: 'The 21 Bowl (Pork)',
          description: 'Traditional pork preparation with ethnic spices, served with rice and seasonal vegetables. Experience authentic tribal flavors!',
          price: 200,
          image: null,
          isVeg: false,
          isPopular: true,
          isAvailable: true,
          category: { id: '1', name: 'Rice Bowls', slug: 'rice-bowls', icon: 'bowl' }
        },
        {
          id: '4',
          name: 'The Tribal Bowl (Chicken)',
          description: 'A special tribal-style chicken preparation with indigenous herbs and spices, served with fragrant rice and local greens.',
          price: 190,
          image: null,
          isVeg: false,
          isPopular: false,
          isAvailable: true,
          category: { id: '1', name: 'Rice Bowls', slug: 'rice-bowls', icon: 'bowl' }
        },
        {
          id: '5',
          name: 'The Tribal Bowl (Pork)',
          description: 'Authentic tribal recipe with slow-cooked pork, traditional bamboo shoot, and aromatic rice. A true taste of Assam!',
          price: 220,
          image: null,
          isVeg: false,
          isPopular: false,
          isAvailable: true,
          category: { id: '1', name: 'Rice Bowls', slug: 'rice-bowls', icon: 'bowl' }
        },
        {
          id: '6',
          name: 'Mixed Fried Rice',
          description: 'Wok-tossed rice with fresh vegetables, eggs, and choice of protein. Light, flavorful, and satisfying!',
          price: 150,
          image: null,
          isVeg: false,
          isPopular: false,
          isAvailable: true,
          category: { id: '2', name: 'Fried Rice', slug: 'fried-rice', icon: 'rice' }
        },
        {
          id: '7',
          name: 'Veg Fried Rice',
          description: 'Fluffy rice stir-fried with colorful vegetables and aromatic spices. Simple yet delicious!',
          price: 120,
          image: null,
          isVeg: true,
          isPopular: false,
          isAvailable: true,
          category: { id: '2', name: 'Fried Rice', slug: 'fried-rice', icon: 'rice' }
        },
        {
          id: '8',
          name: 'Fresh Garden Salad',
          description: 'Crisp seasonal vegetables with a light vinaigrette dressing. Healthy and refreshing!',
          price: 80,
          image: null,
          isVeg: true,
          isPopular: false,
          isAvailable: true,
          category: { id: '3', name: 'Salads', slug: 'salads', icon: 'salad' }
        },
        {
          id: '9',
          name: 'Family Feast Combo',
          description: 'Perfect for sharing! Includes 2 rice bowls, 1 fried rice, and beverages. Great value for families!',
          price: 450,
          image: null,
          isVeg: false,
          isPopular: true,
          isAvailable: true,
          category: { id: '4', name: 'Seasonal Combos', slug: 'combos', icon: 'utensils' }
        },
        {
          id: '10',
          name: 'Fresh Lime Soda',
          description: 'Refreshing lime soda with a hint of mint. Perfect companion for your meal!',
          price: 40,
          image: null,
          isVeg: true,
          isPopular: false,
          isAvailable: true,
          category: { id: '5', name: 'Beverages', slug: 'beverages', icon: 'cup' }
        },
        {
          id: '11',
          name: 'Assam Tea',
          description: 'Authentic Assamese tea brewed to perfection. Experience the taste of the land!',
          price: 30,
          image: null,
          isVeg: true,
          isPopular: false,
          isAvailable: true,
          category: { id: '5', name: 'Beverages', slug: 'beverages', icon: 'cup' }
        }
      ]);
    }

    const menuItems = await prisma!.menuItem.findMany({
      where: { isAvailable: true },
      orderBy: [
        { isPopular: 'desc' },
        { order: 'asc' }
      ],
      include: {
        category: true
      }
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json([]);
  }
}
