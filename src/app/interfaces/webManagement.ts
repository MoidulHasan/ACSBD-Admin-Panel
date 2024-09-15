export interface IClient {
  id: number;
  name: string;
  image: string;
}

export interface IBlog {
  id: number | string;
  title: string;
  sub_title: string;
  category: string;
  tags: string[];
  slug: string;
  image: string;
  description: string;
}

export interface ILocation {
  id?: number;
  location_type: string;
  title: string;
  subtitle: string;
  address: string;
  phone: string;
  map_url: string;
}

export interface IVisitorMessage {
  id?: number;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: "Pending" | "Contacted";
  contact_note: null | string;
}
