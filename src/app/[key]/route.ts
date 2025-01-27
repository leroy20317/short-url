/**
 * @author: leroy
 * @date: 2024-07-05 16:30
 * @description：page
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { initClient } from '@/utils/redis';
import dayjs from 'dayjs';

export async function GET(request: NextRequest) {
  const key = request.nextUrl.pathname.substring(1);
  if (!key) {
    return new Response('Bad Request', { status: 400 });
  }

  const redis = await initClient();
  const handleUrl: { key: string; original: string; expired: string; clicks: number } = JSON.parse(
    (await redis?.hGet('short-urls', key)) || '{}',
  );

  const { original, expired } = handleUrl;
  // Account for bloom filter false positives
  if (!original) {
    return new Response('No Redirect', { status: 404 });
  }
  if (expired && dayjs(expired) <= dayjs()) {
    return new Response('Url Expired', { status: 410 });
  }
  await redis?.hSet(
    'short-urls',
    key,
    JSON.stringify({
      ...handleUrl,
      clicks: handleUrl.clicks + 1,
    }),
  );

  // Return the redirect entry
  return NextResponse.rewrite(original);
}
