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
  packageName: string;
  packageCode: string;
  slug: string;
  price: number;
  currencyCode: string;
  smsStatus: boolean;
  duration: number;
  location: string;
  activeType: string;
  retailPrice: number;
  speed: string;
  multiregion: boolean;
  favourite?: boolean;
  operators?: string;
} 