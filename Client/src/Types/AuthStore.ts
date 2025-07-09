export interface AuthUser {
  userName: string;
  email: string;
  role: string;
  _id: string;
}

export interface AuthStore {
  user: AuthUser | null;
}
// src/Types/AuthStore.ts
export interface AuthStore {
 
  token: string | null;
}