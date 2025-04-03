/*
 * @Author: leroy
 * @Date: 2024-07-03 16:11:14
 * @LastEditTime: 2025-04-02 17:44:47
 * @Description: tying.d.ts
 */

  import type { RedisClientType } from 'redis';
import type { drizzle } from 'drizzle-orm/node-postgres';
declare global {
  var redisClient: RedisClientType | null;
  var postgreSqlClient: ReturnType<typeof drizzle> | null;
}
