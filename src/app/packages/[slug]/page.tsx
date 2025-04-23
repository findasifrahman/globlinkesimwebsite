import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import PackageDetail from '@/components/PackageDetail';

interface PackagePageProps {
  params: {
    slug: string;
  };
}

async function getPackageData(slug: string) {
  const packageData = await prisma.allPackage.findFirst({
    where: {
      slug: slug
    }
  });

  if (!packageData) {
    return null;
  }

  return packageData;
}

export default async function PackagePage({ params }: PackagePageProps) {
  const packageData = await getPackageData(params.slug);

  if (!packageData) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PackageDetail packageData={packageData} />
    </div>
  );
} 