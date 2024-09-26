"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Ensure correct import path for useRouter/
import Link from 'next/link';
import NotFound from './error';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // const token = localStorage.getItem('token');
    // if (!token) {
    //   router.push('/page/login'); // Redirect to login if not logged in
    // } else {
    //   router.push('/page/scholarships'); // Redirect to main if logged in
    // }
    router.push('/page/scholarships/ApplyScholarship'); // Redirect to main if logged in
  }, [router]);
  if (loading) {
    return (
      <div className="loadingContainer">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    ); // Display loading indicator while checking authentication
  }

  return null;
}
