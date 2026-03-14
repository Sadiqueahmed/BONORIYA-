import { NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/db';

export async function GET() {
  try {
    if (!isDatabaseAvailable()) {
      // Return default settings when database isn't configured
      return NextResponse.json({
        siteName: 'Bonoriya',
        tagline: 'Ethnic rice bowls for modern lives',
        instagram: '@bonoriyafood',
        zomato: 'https://www.zomato.com/bonoriya',
        swiggy: 'https://www.swiggy.com/bonoriya'
      });
    }

    const settings = await prisma!.setting.findMany();
    
    // Convert array to object
    const settingsObj: Record<string, string> = {};
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value;
    });

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({
      siteName: 'Bonoriya',
      tagline: 'Ethnic rice bowls for modern lives',
      instagram: '@bonoriyafood',
      zomato: 'https://www.zomato.com/bonoriya',
      swiggy: 'https://www.swiggy.com/bonoriya'
    });
  }
}
