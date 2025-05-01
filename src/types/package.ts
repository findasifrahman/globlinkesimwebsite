export interface PackageResponse {
  packages: Package[];
}

export interface Package {
  name: string;
  code: string;
  price: string;
  currency?: string;
  smsStatus?: boolean;
  duration: string;
  location: string;
  activeType?: string;
  retailPrice?: string;
  speed?: string;
}

export interface ProcessedPackage {
  id: string;
  packageName: string;
  packageCode: string;
  duration: number;
  dataSize: number;
  location: string;
  speed: string;
  price: number;
  description?: string;
  features?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
} 