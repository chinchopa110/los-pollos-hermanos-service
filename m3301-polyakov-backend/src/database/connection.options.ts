export const databaseConnectionOptions = {
  type: 'postgres' as const,
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'kfc_app',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'kfc_restaurant',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
} as const;

export function buildDatabaseUrl(): string {
  const { username, password, host, port, database } =
    databaseConnectionOptions;
  const auth =
    password.length > 0
      ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
      : '';
  return `postgresql://${auth}${host}:${port}/${database}`;
}
