/*
 * @Author: leroy
 * @Date: 2024-07-03 14:00:56
 * @LastEditTime: 2025-04-03 09:40:35
 * @Description: Home Page
 */
'use client';
import Login from '@/components/Login';
import Main from '@/components/Main';
import { Spin } from 'antd';
import axios from 'axios';
import { useRequest } from 'ahooks';
import { useState } from 'react';

async function checkLogin() {
  const res = await axios.get(`/api/user/check`, { withCredentials: true });
  return res.data.status === 'success';
}
const Home = () => {
  const [loading, setLoading] = useState(true);
  const { data: isLogin } = useRequest(checkLogin, {
    onSuccess: () => {
      setLoading(false);
    },
  });
  if (loading) {
    return <Spin fullscreen size="large" />;
  }
  if (isLogin) {
    return <Main />;
  }
  return <Login />;
};

export default Home;
