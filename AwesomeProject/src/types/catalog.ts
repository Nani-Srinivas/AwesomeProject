export interface Category {
  _id: string;
  name: string;
  imageUrl: string;
  storeId: string;
  masterCategoryId?: string;
  description?: string;
  createdBy: string;
  createdByModel: string;
  isActive: boolean;
}

export interface StoreCategoryPopulated {
  _id: string;
  name: string;
  imageUrl: string;
  // Add other fields if needed from the populated StoreCategory
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number; // Deprecated, kept for backwards compatibility
  costPrice: number;
  sellingPrice: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  storeCategoryId: StoreCategoryPopulated; // Updated to be populated object
  storeSubcategoryId?: string;
  images: string[];
  isAvailable: boolean;
  createdBy: string;
  createdByModel: string;
  storeId: string;
  masterProductId?: string;
  category: string; // This is still needed for filtering
  tag: string;
  weight: string;
  time: string;
  discount: string;
  mrp: number; // Deprecated, kept for backwards compatibility
}
