/**
 * @Author: leroy
 * @Date: 2024-07-03 16:02:00
 * @LastEditTime: 2025-03-10 10:32:30
 * @Description: 用户登录
 */
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';
const jwtSecret = process.env.JWT_SECRET || '';
const adminUser = process.env.ADMIN_USER || '';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const { username, password } = await request.json();
  const [name, pass] = adminUser.split(':');
  if (name && name === username && pass === password) {
    const token = jwt.sign({ [username]: password }, jwtSecret, { expiresIn: 86400 });
    return new Response(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: { 'Set-Cookie': `token=${token};path=/;max-age=86400;HttpOnly` },
    });
  }
  // 账号密码校验错误
  cookieStore.set('token', '', { maxAge: 0 });
  return new Response(null, {
    status: 401,
  });
}
