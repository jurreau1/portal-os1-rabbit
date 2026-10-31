export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  bio?: string;
  theme: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}
