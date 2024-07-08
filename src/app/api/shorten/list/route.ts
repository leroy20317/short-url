/**
 * @author: leroy
 * @date: 2024-07-04 17:20
 * @description：route
 */

import { initClient } from '@/utils/redis';
import { cookies } from 'next/headers';
import axios from 'axios';

const verify = async () => {
  const cookieStore = cookies();
  if (!cookieStore.get('token')) {
    return false;
  }
  const baseUrl = process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:5600';
  const res = await axios.get(`${baseUrl}/api/user/check`, {
    headers: { Cookie: cookieStore.toString() },
  });
  return res.data.status === 'success';
};

export const dynamic = 'force-dynamic';
export async function GET() {
  const isLogin = await verify();
  if (!isLogin) {
    return new Response(null, {
      status: 401,
    });
  }
  const redis = await initClient();
  const shortUrlsStr = await redis?.get('short-urls');
  const urls: Record<string, string | number>[] = shortUrlsStr ? JSON.parse(shortUrlsStr) : [];
  return Response.json({
    status: 'success',
    data: urls,
  });
}
