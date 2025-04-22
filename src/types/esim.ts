/**
 * Represents an eSIM profile with all its details
 */
export type EsimProfile = {
  /** QR code URL for downloading the eSIM */
  qrCode: string;
  /** Integrated Circuit Card Identifier */
  iccid: string;
  /** eSIM Identifier */
  eid: string;
  /** SMDP (Subscription Manager Data Preparation) status */
  smdpStatus: string;
  /** eSIM status */
  esimStatus: string;
  /** Remaining data in bytes */
  dataRemaining: number;
  /** Used data in bytes */
  dataUsed: number;
  /** Expiry date of the eSIM */
  expiryDate: string | null;
  /** Number of days remaining until expiry */
  daysRemaining: number;
}; 