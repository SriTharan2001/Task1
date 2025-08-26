export interface User {
  objectId: string;
  name?: string;
  userName?: string;
  email: string;
  role: string;
}

// Define UserWithId to use 'id' as a string, potentially replacing or extending User
export interface UserWithId extends Omit<User, 'objectId'> {
  id: string;
}
