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
  const data = await request.json();
  const redis = await initClient();
  const shortUrlsStr = await redis?.get('short-urls');
  const urls: Record<string, string | number>[] = shortUrlsStr ? JSON.parse(shortUrlsStr) : [];
  const i = urls.findIndex((ele) => ele.key === data.key);
  switch (data.type) {
    case 'delete':
      // 删除
      if (i > -1) {
        urls.splice(i, 1);
      } else {
        return Response.json({
          status: 'error',
          message: '操作失败，未找到数据！',
        });
      }
      break;
    case 'edit':
      // 修改
      if (i > -1) {
        urls[i] = {
          ...urls[i],
          original: data.original,
          expired: data.expired,
          update: dayjs().format('YYYY-MM-DD HH:mm'),
        };
      } else {
        return Response.json({
          status: 'error',
          message: '操作失败，未找到数据！',
        });
      }
      break;
    case 'add':
      // 新增
      if (i > -1) {
        //找到历史，更新数据
        urls[i] = {
          ...urls[i],
          original: data.original,
          expired: data.expired,
          update: dayjs().format('YYYY-MM-DD HH:mm'),
        };
      } else {
        urls.push({
          key: data.key,
          short: data.short,
          original: data.original,
          expired: data.expired,
          update: dayjs().format('YYYY-MM-DD HH:mm'),
          clicks: 0,
        });
      }
      break;
  }
  await redis?.set('short-urls', JSON.stringify(urls));

  return Response.json({
    status: 'success',
  });
}
