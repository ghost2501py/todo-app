export interface IUser {
  _id?: string;
  auth0_id: string;
  email: string;
  name: string;
  created_at: Date;
}

export interface CreateUserDTO {
  auth0_id: string;
  email: string;
  name: string;
}

