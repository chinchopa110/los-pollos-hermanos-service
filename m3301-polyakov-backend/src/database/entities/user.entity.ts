export interface UserEntity {
  id: string;
  username: string;
  displayName: string;
  passwordHash: string;
  role: 'guest' | 'admin' | 'staff';
  createdAt: Date;
}
