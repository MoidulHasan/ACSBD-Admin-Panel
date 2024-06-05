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