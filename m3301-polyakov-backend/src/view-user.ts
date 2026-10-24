export type ViewUser = {
  name: string;
  username: string;
  isAdmin: boolean;
};

export function toViewUser(
  user: { name: string; username: string } | undefined | null,
): ViewUser | null {
  if (!user) return null;
  return {
    name: user.name,
    username: user.username,
    isAdmin: user.username === 'admin',
  };
}
