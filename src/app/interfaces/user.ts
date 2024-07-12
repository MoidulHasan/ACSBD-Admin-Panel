export interface IUser {
  id: number;
  name: string;
  user_name: string | null;
  email: string;
  email_verified_at: string;
  status: "active" | "inactive";
  telephone_number: null | string;
  address: null | string;
  created_at: string;
  updated_at: string | null;
  deleted_at: null | string;
}
