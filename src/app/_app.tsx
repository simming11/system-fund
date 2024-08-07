"use client";

import '../globals.css'; // Ensure your custom global styles are also included
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Layout from './layout'; // Ensure the correct path to layout
import NotFound from './error';


function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // const token = localStorage.getItem('token');
    // if (!token && router.pathname !== '/login') {
    //   router.push('/page/login');
    // } else if (token && router.pathname === '/login') {
    //   router.push('/page/scholarships'); // Redirect to the main page if logged in and on the login page
    // }
  }, [router]);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
