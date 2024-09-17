import type { IUser } from "~/app/interfaces/user";

export interface Link {
  url: string | null;
  label: string;
  active: boolean;
}

export interface Meta {
  current_page: number;
  from: number;
  last_page: number;
  links: Link[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface Links {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface IPaginatedResponse<T> {
  data: T;
  links?: Links;
  meta?: Meta;
}

export interface IAllCategoryResponse<T> {
  data: T;
}

export interface IDataResponse<T> {
  data: T;
}

export interface ICreateResponse {
  message: string;
}

export interface IDeleteResponse {
  message: string;
}

export interface IUpdateResponse<T> {
  message: string;
  data: T;
}

export interface IErrorResponse {
  errors: Record<string, string[]>;
}

export interface IAuthSuccessResponse {
  token: string;
  user: IUser;
  message: string;
}

export interface IFAQ {
  id?: number;
  question: string;
  answer: string;
  category: "service" | "ac_rent" | "product" | "policy";
  status: true | false;
}

export interface IBannerSliderImage {
  id: number;
  type: "slider" | "banner";
  path: string;
}
