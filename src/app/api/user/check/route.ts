/**
 * @Author: leroy
 * @Date: 2024-07-03 16:02:00
 * @LastEditTime: 2025-03-10 10:32:10
 * @Description: 用户校验
 */
import { cookies } from 'next/headers';
import { verifyToken } from '@/utils/util';
const jwtSecret = process.env.JWT_SECRET || '';
const adminUser = process.env.ADMIN_USER || '';

export const dynamic = 'force-dynamic';
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value || '';
  const decoded = await verifyToken(token, jwtSecret);
  if (!decoded) {
    // token 校验错误
    return Response.json({ status: 'error' });
  }
  const [username, password] = adminUser.split(':');

  const pass = decoded[username];
  if (pass && pass !== password) {
    // 密码校验错误
    return Response.json({ status: 'error' });
  }
  return Response.json({ status: 'success' });
}
