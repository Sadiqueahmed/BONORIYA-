import { NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/db';

export async function GET() {
  try {
    if (!isDatabaseAvailable()) {
      // Return mock branches when database isn't configured
      return NextResponse.json([
        {
          id: '1',
          name: 'Bonoriya Betkuchi',
          address: 'Dhani Ram Boro Path, Betkuchi, Guwahati, Assam 781040',
          landmark: 'Behind Maa Medicos, Near RGU',
          phone: '+91 9876543210',
          openTime: '12:00 PM',
          closeTime: '10:00 PM',
          daysOpen: 'Mon-Sat',
          isMain: true,
          mapEmbed: null
        },
        {
          id: '2',
          name: 'Bonoriya Narengi Tiniali',
          address: 'Narengi Tiniali, Guwahati, Assam',
          landmark: 'Main Road',
          phone: null,
          openTime: '12:00 PM',
          closeTime: '10:00 PM',
          daysOpen: 'Mon-Sat',
          isMain: false,
          mapEmbed: null
        }
      ]);
    }

    const branches = await prisma!.branch.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json([]);
  }
}
