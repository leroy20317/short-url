/*
 * @Author: leroy
 * @Date: 2024-07-04 17:20:30
 * @LastEditTime: 2025-04-03 14:48:15
 * @Description: 短链编辑
 */

import { cookies } from 'next/headers';
import axios from 'axios';
import dayjs from 'dayjs';
import { initPostgreSqlClient, linksSchema } from '@/utils/postgreSql';
import { eq } from 'drizzle-orm';

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

export async function POST(request: Request) {
  const isLogin = await verify();
  if (!isLogin) {
    return new Response(null, {
      status: 401,
    });
  }
  const { type, key, ...data } = await request.json();
  const db = await initPostgreSqlClient();
  console.log(type, key, data);
  if (!type) {
    return new Response(null, {
      status: 400,
    });
  }
  if (type === 'add') {
    await db?.insert(linksSchema).values({
      key,
      title: data.title,
      original: data.original,
      expired: data.expired,
      update: dayjs().toDate(),
      clicks: 0,
    });
    return Response.json({
      status: 'success',
    });
  }

  if (type === 'delete') {
    const deleted = await db?.delete(linksSchema).where(eq(linksSchema.key, key)).returning();
    return Response.json(
      deleted?.length
        ? {
            status: 'success',
          }
        : {
            status: 'error',
            message: '操作失败，未找到数据！',
          },
    );
  }
  if (type === 'edit') {
    const result = await db
      ?.update(linksSchema)
      .set({
        // 只更新传入的字段
        original: data.original,
        expired: data.expired ? dayjs(data.expired).toDate() : null,
        title: data.title,
        update: dayjs().toDate(),
      })
      .where(eq(linksSchema.key, key))
      .returning();
    return Response.json(
      result?.length
        ? {
            status: 'success',
          }
        : {
            status: 'error',
            message: '操作失败，未找到数据！',
          },
    );
  }

  return Response.json({
    status: 'success',
  });
}
