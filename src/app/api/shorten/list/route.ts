/**
 * @author: leroy
 * @date: 2024-07-04 17:20
 * @description：route
 */

import { initClient } from '@/utils/redis';

export const dynamic = 'force-dynamic';
export async function GET() {
  const redis = await initClient();
  const shortUrlsStr = await redis?.get('short-urls');
  const urls: Record<string, string | number>[] = shortUrlsStr ? JSON.parse(shortUrlsStr) : [];
  return Response.json({
    status: 'success',
    data: urls,
  });
}
