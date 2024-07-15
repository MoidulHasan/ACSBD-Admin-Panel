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

export interface IAttributeFormData {
  name: string;
  values: string[];
}

export interface ICategoryResponse {
  id: number;
  image_url: string;
  meta_description: string;
  meta_title: string;
  name: string;
  parent_id: number;
  slug: string;
  visibility_status: string;
  childrens?: ICategoryResponse[] | [];
  index?: number;
}

export interface ICategoryData {
  key: string;
  data: {
    id: number;
    image_url: string;
    meta_description: string;
    meta_title: string;
    name: string;
    parent_id: number;
    slug: string;
    visibility_status: string;
  };
  children: ICategoryData[] | [];
}

export interface IMinifiedCategory {
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

export interface IImage {
  id: number;
  imageable_id: number;
  imageable_type: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface ICollection {
  id?: number;
  title: string;
  status: string;
  slug?: string;
}

export interface IProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  category: ICategoryResponse;
  brand: IBrand;
  price: IPrice;
  installment?: string;
  visibility_status: string;
  short_description: string;
  warranty_and_services: string;
  description: string;
  collections: ICollection[];
  attributes: IProductAttribute[];
  images: IImage[];
  meta_title: string;
  meta_tags: string[];
  created_at: string;
  updated_at: string;
}

export interface IStatus {
  name: "Public" | "Hidden";
  code: "public" | "private" | "hidden";
}

export interface IStock {
  product_id: number;
  quantity: number;
}

export interface IStockWithName extends IStock {
  name: string;
}
