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
  const shortUrlsStr = await redis?.get('short-urls');
  const urls: { key: string; original: string; expired: string; clicks: number }[] = shortUrlsStr
    ? JSON.parse(shortUrlsStr)
    : [];
  // Get the redirect entry from the redirects.json file
  const i = urls.findIndex((ele) => ele.key === key);

  const { original, expired } = urls[i];
  // Account for bloom filter false positives
  if (!original) {
    return new Response('No Redirect', { status: 404 });
  }
  if (expired && dayjs(expired) <= dayjs()) {
    return new Response('Url Expired', { status: 410 });
  }
  urls[i].clicks += 1;

  await redis?.set('short-urls', JSON.stringify(urls));

  // Return the redirect entry
  return NextResponse.redirect(original);
}
