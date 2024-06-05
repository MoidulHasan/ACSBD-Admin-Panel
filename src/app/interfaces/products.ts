export interface IProductAttributeValue {
  id: number;
  attribute_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface IProductAttribute {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  values: IProductAttributeValue[];
}

export interface CategoryData {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  parent_id: number;
  meta_title: string;
  meta_description: string;
  visibility_status: string;
  children: CategoryData[] | [];
}

export interface MinifiedCategory {
  id: number | null;
  name: string;
  parent_id: number | null;
}
export interface IWarrantyAndServices {
  Service: string;
  Warranty: string;
}

export interface IPrice {
  id: number;
  product_id: number;
  base_price: string;
  is_percent: number;
  discount_amount: string;
  final_price: string;
  created_at: string;
  updated_at: string;
}

export interface IBrand {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  visibility_status: string;
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
}

export interface ICategory {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  parent_id: number | null;
  visibility_status: string;
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
}

export interface IImage {
  id: number;
  imageable_id: number;
  imageable_type: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface IProduct {
  id: number;
  name: string;
  slug: string;
  visibility_status: string;
  description: string;
  warranty_and_services: IWarrantyAndServices;
  price: IPrice;
  brand: IBrand;
  category: ICategory;
  images: IImage[];
  created_at: string;
  updated_at: string;
}
