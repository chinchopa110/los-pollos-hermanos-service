import { Injectable } from '@nestjs/common';

export type SessionUser = { name: string; username: string };

@Injectable()
export class AuthService {
  private readonly accounts: Record<
    string,
    { password: string; name: string }
  > = {
    admin: { password: 'password', name: 'Густаво Фринг' },
    client: { password: 'client2024', name: 'Обычный клиент' },
  };

  validateCredentials(username: string, password: string): SessionUser | null {
    const account = this.accounts[username];
    if (account && account.password === password) {
      return { name: account.name, username };
    }
    return null;
  }
}
