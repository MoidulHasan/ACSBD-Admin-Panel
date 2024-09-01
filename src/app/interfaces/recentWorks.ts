export interface FormData {
  id?: number;
  title: string;
  subTitle: string;
  fromDate: string | Date;
  toDate?: string | Date;
  status: string;
  type: string;
  description: string;
  completedBy: string;
  client: string;
  image: File[] | string[];
  galleryImages: File[] | string[];
}

export interface IWorkImage {
  id: number;
  path: string;
}

export interface IWorkData {
  id?: number;
  title: string;
  sub_title: string;
  from_date: string | Date;
  to_date?: string | Date;
  status: string;
  type: string;
  description: string;
  completed_by: string;
  client: string;
  image: File[] | string[];
  gallery_image: File[] | string[] | IWorkImage[];
}
