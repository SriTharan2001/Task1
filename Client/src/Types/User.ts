export interface User {
  objectId: string;
  name?: string;
  userName?: string;
  email: string;
  role: string;
}

export interface User {
  user: User | null;
}
