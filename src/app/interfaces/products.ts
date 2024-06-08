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
  children: CategoryData[] | [];
}

export interface MinifiedCategory {
  id: number | null;
  name: string;
  parent_id: number | null;
}
