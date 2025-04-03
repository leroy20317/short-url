/*
 * @Author: leroy
 * @Date: 2024-07-03 09:25:28
 * @LastEditTime: 2025-04-03 14:39:21
 * @Description: Layout
 */
// import 'antd/dist/reset.css';
import './global.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App } from 'antd';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');

export const metadata = {
  title: '短链系统',
  description: '短链系统',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <App>
            <ConfigProvider locale={zhCN}>{children}</ConfigProvider>
          </App>
        </AntdRegistry>
      </body>
    </html>
  );
}
