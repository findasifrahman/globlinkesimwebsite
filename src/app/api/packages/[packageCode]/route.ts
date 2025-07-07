import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Countries to exclude from the package list
const EXCLUDED_COUNTRIES = ['RU', 'BY', 'IR']; // Russia, Belarus, Iran

/**
 * Checks if a package should be excluded based on its location
 * @param location The location field from the package (can contain country codes)
 * @returns true if the package should be excluded, false otherwise
 */
function shouldExcludePackage(location?: string): boolean {
  if (!location) return false;
  
  // Split location by comma to handle multiple countries
  const countryCodes = location.split(',').map(code => code.trim().toUpperCase());
  
  // Check if any of the country codes are in the excluded list
  return countryCodes.some(code => EXCLUDED_COUNTRIES.includes(code));
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const packageDetails = await prisma.allPackage.findFirst({
      where: { packageCode: slug },
    });

    if (!packageDetails) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // Check if the package should be excluded
    if (shouldExcludePackage(packageDetails.location)) {
      return NextResponse.json({ error: 'Package not available' }, { status: 404 });
    }

    return NextResponse.json({ package: packageDetails });
  } catch (error) {
    console.error('Error fetching package details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch package details' },
      { status: 500 }
    );
  }
} 