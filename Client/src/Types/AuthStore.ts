export interface AuthUser {
  userName: string;
  email: string;
  role: string;
  _id: string;
}

export interface AuthStore {
  user: AuthUser | null;
}
