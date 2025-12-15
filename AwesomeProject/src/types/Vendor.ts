// types/Vendor.ts
export interface VendorAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface ContactPerson {
  name?: string;
  phone?: string;
  email?: string;
}

export interface Vendor {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: VendorAddress;
  contactPerson?: ContactPerson;
  paymentTerms?: string;
  rating?: number;
  notes?: string;
  status?: 'active' | 'inactive' | 'blacklisted';
  paymentStatus?: 'paid' | 'partial' | 'pending';
  payableAmount?: number;
  assignedCategories?: any[];
  createdAt: string;
  updatedAt: string;
}