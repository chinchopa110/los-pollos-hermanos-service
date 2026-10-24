export type PaginatedSlice<T> = {
  data: T[];
  total: number;
};

export function paginateSlice<T>(
  items: T[],
  page: number,
  limit: number,
): PaginatedSlice<T> {
  const total = items.length;
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * limit;
  const data = items.slice(start, start + limit);
  return { data, total };
}

export function totalPages(total: number, limit: number): number {
  if (total === 0) return 1;
  return Math.ceil(total / limit);
}
