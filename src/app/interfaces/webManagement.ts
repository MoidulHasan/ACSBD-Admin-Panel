export interface IClient {
  id: number;
  name: string;
  image: string;
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
