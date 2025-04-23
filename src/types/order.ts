export interface Order {
  orderNo: string;
  status: string;
  package_code: string;
  packageCode?: string;
  qrCode?: string;
  iccid?: string;
  smdpStatus?: string;
  esimStatus?: string;
  dataRemaining?: number;
  dataUsed?: number;
  expiryDate?: string;
  daysRemaining?: number;
  profile?: {
    packageCode: string;
    count: number;
    price: number;
    periodNum: number;
  };
} 