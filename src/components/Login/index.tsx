/*
 * @Author: leroy
 * @Date: 2024-07-03 15:24:56
 * @LastEditTime: 2025-04-02 17:17:23
 * @Description:
 */
'use client';
import { App, Button, Form, Input } from 'antd';
import { LockOutlined, UserOutlined, LinkOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import axios from 'axios';

const Login = () => {
  const { message } = App.useApp();
  const { runAsync } = useRequest((data) => axios.post('/api/user/login', data), {
    manual: true,
    onSuccess: (res) => {
      if (res.data.status === 'success') {
        window.location.reload();
        return;
      }
      message.error('账号或密码错误！');
    },
  });
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all hover:scale-105">
        {/* 添加短链系统标题 */}
        <div className="flex justify-center items-center mb-6">
          <LinkOutlined className="text-3xl text-indigo-600 mr-2" />
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 mb-0">
            短链系统
          </h1>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">欢迎回来</h2>
          <p className="text-gray-500 mt-2">请登录您的账户</p>
        </div>

        <Form<{ username: string; password: string }>
          name="login"
          className="login-form"
          onFinish={runAsync}
          size="large"
        >
          <Form.Item name="username" rules={[{ required: true, message: '请输入您的用户名!' }]}>
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="用户名"
              className="rounded-lg py-2"
            />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: '请输入您的密码!' }]}>
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="密码"
              className="rounded-lg py-2"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 border-0 rounded-lg h-12 hover:from-blue-600 hover:to-indigo-700"
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
