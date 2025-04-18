/*
 * @Author: leroy
 * @Date: 2025-04-18 10:59:27
 * @LastEditTime: 2025-04-18 11:12:07
 * @Description: 健康检查
 */
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
