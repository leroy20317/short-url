/*
 * @Author: leroy
 * @Date: 2025-04-02 17:39:15
 * @LastEditTime: 2025-06-27 15:34:04
 * @Description: postgreSql
 */
import { pgTable, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';

export const linksSchema = pgTable('links', {
  // 主键
  id: serial('id').primaryKey(),
  // 标题 可为空
  title: varchar('title', { length: 10 }),
  // 短链
  key: varchar('key', { length: 10 }).notNull().unique(),
  // 原始链接
  original: text('original').notNull(),
  // 过期时间 可为空
  expired: timestamp('expired', { withTimezone: true, mode: 'date' }),
  // 更新时间
  update: timestamp('update', { withTimezone: true, mode: 'date' }).defaultNow(),
  // 点击次数
  clicks: integer('clicks').default(0),
});

export const initPostgreSqlClient = async (): Promise<ReturnType<typeof drizzle> | null> => {
  if (global.postgreSqlClient) return global.postgreSqlClient;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });

  const db = drizzle(pool);

  try {
    // 检查表是否存在
    const tableExists = await db.execute(
      sql`SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'links');`,
    );

    // 如果表不存在则创建
    if (!tableExists.rows[0].exists) {
      await db.execute(sql`
        CREATE TABLE links (
          id SERIAL PRIMARY KEY,
          title VARCHAR(10),
          key VARCHAR(10) NOT NULL UNIQUE,
          original TEXT NOT NULL,
          expired TIMESTAMP WITH TIME ZONE,
          update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          clicks INTEGER DEFAULT 0
        );
      `);
      console.log('Links 表创建成功');
    }

    global.postgreSqlClient = db;

    pool.on('connect', () => {
      console.log('连接池连接成功');
    });

    pool.on('error', (err) => {
      console.error('连接池错误', err);
    });

    return global.postgreSqlClient;
  } catch (error) {
    console.error('初始化数据库时出错:', error);
    await pool.end();
    return null;
  }
};
