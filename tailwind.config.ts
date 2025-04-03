/*
 * @Author: leroy
 * @Date: 2024-07-03 09:19:34
 * @LastEditTime: 2025-04-02 16:27:03
 * @Description:
 */
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {},
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
} satisfies Config;
