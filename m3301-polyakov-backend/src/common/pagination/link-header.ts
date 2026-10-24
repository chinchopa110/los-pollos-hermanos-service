import type { Request, Response } from 'express';
import { totalPages } from './paginate';

export function setPaginationLinkHeader(
  req: Request,
  res: Response,
  page: number,
  limit: number,
  total: number,
): void {
  const last = totalPages(total, limit);
  const protocol = req.protocol;
  const host = req.get('host') ?? 'localhost';
  const links: string[] = [];

  const buildUrl = (p: number): string => {
    const url = new URL(req.originalUrl, `${protocol}://${host}`);
    url.searchParams.set('page', String(p));
    url.searchParams.set('limit', String(limit));
    return url.toString();
  };

  if (page > 1) {
    links.push(`<${buildUrl(page - 1)}>; rel="prev"`);
  }
  if (page < last) {
    links.push(`<${buildUrl(page + 1)}>; rel="next"`);
  }

  if (links.length > 0) {
    res.setHeader('Link', links.join(', '));
  }
}
