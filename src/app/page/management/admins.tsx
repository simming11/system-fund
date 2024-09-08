"use client";
import { useEffect } from 'react';
import Footer from '@/app/components/footer/footer';
import HeaderHome from '@/app/components/headerHome/headerHome';
import AdminHeader from '@/app/components/headerAdmin/headerAdmin';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const Role = localStorage.getItem('UserRole');

      if (!token || Role?.trim().toLowerCase() !== 'admin') {
        console.error('Unauthorized access or missing token. Redirecting to login.');
        router.push('/page/control');
      }
    }
  }, [router]);

  return (
    <div className="max-h-screen flex flex-col bg-gray-100">
     <div className=''>
     <HeaderHome />
     <AdminHeader />
     </div>
      <div className="flex flex-row">
        <div className="bg-white w-1/8 p-4">
          <Sidebar />
        </div>
        <div className="bg-white flex-1 w-1/8 p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold">จัดการทุนการศึกษา</h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-full">
            <Link href="/page/scholarships/Manage-internal-scholarships">
              <div className="rounded-lg p-2 cursor-pointer hover:scale-105 transform transition duration-400 ease-in-out">
                <Image
                  src="/images/internal-scholarship.png"
                  alt="Internal Scholarship"
                  width={150}
                  height={150}
                  className="mx-auto rounded-lg"  // Apply rounded corners to the image
                />
                <h3 className="text-md font-semibold text-center mt-2">จัดการทุนการศึกษาภายใน</h3>
              </div>
            </Link>
            <Link href="/page/scholarships/Manage-external-scholarships">
              <div className="rounded-lg p-2 cursor-pointer hover:scale-105 transform transition duration-400 ease-in-out">
                <Image
                  src="/images/external-scholarship.png"
                  alt="External Scholarship"
                  width={150}
                  height={150}
                  className="mx-auto rounded-lg"  // Apply rounded corners to the image
                />
                <h3 className="text-md font-semibold text-center mt-2">จัดการทุนการศึกษาภายนอก</h3>
              </div>
            </Link>
            <Link href="/scholarship-results-announcement">
              <div className="rounded-lg p-2 cursor-pointer hover:scale-105 transform transition duration-400 ease-in-out">
                <Image
                  src="/images/results.png"
                  alt="Scholarship Results"
                  width={150}
                  height={150}
                  className="mx-auto rounded-lg"  // Apply rounded corners to the image
                />
                <h3 className="text-md font-semibold text-center mt-2">ประกาศผลทุนการศึกษา</h3>
              </div>
            </Link>
            <Link href="/student-data">
              <div className="rounded-lg p-2 cursor-pointer hover:scale-105 transform transition duration-400 ease-in-out">
                <Image
                  src="/images/student-data.png"
                  alt="Student Data"
                  width={150}
                  height={150}
                  className="mx-auto rounded-lg"  // Apply rounded corners to the image
                />
                <h3 className="text-md font-semibold text-center mt-2">ข้อมูลนิสิต</h3>
              </div>
            </Link>
            <Link href="/scholarship-summary-report">
              <div className="rounded-lg p-2 cursor-pointer hover:scale-105 transform transition duration-400 ease-in-out">
                <Image
                  src="/images/report.png"
                  alt="Scholarship Report"
                  width={150}
                  height={150}
                  className="mx-auto rounded-lg"  // Apply rounded corners to the image
                />
                <h3 className="text-md font-semibold text-center mt-2">รายงานสรุปทุนการศึกษา</h3>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
