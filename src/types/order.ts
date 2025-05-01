export interface Order {
  id: string;
  orderNo: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  packageId: string;
  userId: string;
  paymentOrderNo?: string;
  paymentState?: string;
  finalAmountPaid?: number;
  paidAmount?: number | string;
  transactionId?: string;
  currency?: string;
  pmName?: string;
  discountCode?: string;
  discountPercentage?: number;
  dataUsed?: number;
  dataRemaining?: number;
  daysRemaining?: number;
  expiryDate?: string;
  iccid?: string;
  eid?: string;
  qrCode?: string;
  esimStatus?: string;
  smdpStatus?: string;
} 