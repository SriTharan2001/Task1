export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    userId: string;
    userName: string;
    email: string;
    role: string;
    objectId: string;
  };
}