/*
 * @Author: leroy
 * @Date: 2024-07-04 17:20:30
 * @LastEditTime: 2025-04-03 14:44:22
 * @Description: 跳转
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import dayjs from 'dayjs';
import { initPostgreSqlClient, linksSchema } from '@/utils/postgreSql';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const key = request.nextUrl.pathname.substring(1);
  if (!key) {
    return new Response('Bad Request', { status: 400 });
  }

  const db = await initPostgreSqlClient();
  const { original, expired, clicks } =
    (await db?.select().from(linksSchema).where(eq(linksSchema.key, key)))?.[0] || {};

  // Account for bloom filter false positives
  if (!original) {
    return new Response('No Redirect', { status: 404 });
  }
  if (expired && dayjs(expired) <= dayjs()) {
    return new Response('Url Expired', { status: 410 });
  }
  await db
    ?.update(linksSchema)
    .set({
      clicks: (clicks || 0) + 1,
    })
    .where(eq(linksSchema.key, key));

  // Return the redirect entry
  return NextResponse.redirect(original);
}
