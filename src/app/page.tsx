'use client';
import Login from '@/components/Login';
import Shorten from '@/components/Shorten';
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
  return (
    <>
      <header className="h-16 bg-gray-900 text-amber-50 px-12 text-lg flex items-center">
        Short Link System
      </header>
      {isLogin ? <Shorten /> : <Login />}
    </>
  );
};

export default Home;
