/*
 * @Author: leroy
 * @Date: 2024-07-04 17:20:30
 * @LastEditTime: 2025-04-03 14:44:22
 * @Description: 短链列表
 */

import { cookies } from 'next/headers';
import axios from 'axios';
import { initPostgreSqlClient, linksSchema } from '@/utils/postgreSql';

const verify = async () => {
  const cookieStore = await cookies();
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
  const db = await initPostgreSqlClient();
  const links = (await db?.select().from(linksSchema)) || [];
  return Response.json({
    status: 'success',
    data: links.sort((a, b) => a.key.localeCompare(b.key)),
  });
}
