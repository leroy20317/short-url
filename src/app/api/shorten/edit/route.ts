/**
 * @author: leroy
 * @date: 2024-07-04 17:20
 * @description：route
 */

import { cookies } from 'next/headers';
import axios from 'axios';
import { initClient } from '@/utils/redis';
import dayjs from 'dayjs';

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

export async function POST(request: Request) {
  const isLogin = await verify();
  if (!isLogin) {
    return new Response(null, {
      status: 401,
    });
  }
  const { key, type, ...data } = await request.json();
  const redis = await initClient();
  if (type === 'add') {
    await redis?.hSet(
      'short-urls',
      key,
      JSON.stringify({
        original: data.original,
        expired: data.expired,
        update: dayjs().format('YYYY-MM-DD HH:mm'),
        clicks: 0,
      }),
    );
    return Response.json({
      status: 'success',
    });
  }
  const handleStr = await redis?.hGet('short-urls', key);
  if (!handleStr) {
    return Response.json({
      status: 'error',
      message: '操作失败，未找到数据！',
    });
  }
  if (type === 'delete') {
    await redis?.hDel('short-urls', key);
  }
  if (type === 'edit') {
    await redis?.hSet(
      'short-urls',
      key,
      JSON.stringify({
        ...JSON.parse(handleStr),
        original: data.original,
        expired: data.expired,
        update: dayjs().format('YYYY-MM-DD HH:mm'),
      }),
    );
  }

  return Response.json({
    status: 'success',
  });
}
