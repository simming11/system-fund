"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/app/components/footer/footer';
import Header from '@/app/components/header/Header';
import ApiStudentServices from '@/app/services/students/ApiStudent';
import ApiServiceAcademics from '@/app/services/academics/ApiAcademics';

interface User {
  id: number;
  FullName: string;
  email: string;
  Surname: string;
}

interface AcademicData {
  // Define the academic data structure based on your API response
  // For example:
  // course: string;
  // department: string;
  // etc.
}

export default function UserPage() {
  const [userData, setUserData] = useState<User | null>(null);
  const [academicData, setAcademicData] = useState<AcademicData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/page/login');
        return;
      }

      if (typeof window !== 'undefined') {
        const StudentID = localStorage.getItem('UserID');
        const AcademicID = localStorage.getItem('AcademicID');
        const userRole = localStorage.getItem('UserRole');

        if (StudentID) {
          try {
            const studentResponse = await ApiStudentServices.getStudent(Number(StudentID));
            setUserData({ ...studentResponse.data, role: userRole });
            console.log('User data:', studentResponse.data);
          } catch (error) {
            console.error('Error fetching user data', error);
            router.push('/page/login');
          }
        } else if (AcademicID) {
          try {
            const academicResponse = await ApiServiceAcademics.getAcademic(Number(AcademicID));
            setAcademicData({ ...academicResponse.data, role: userRole });
            console.log('Academic data:', academicResponse.data);
          } catch (error) {
            console.error('Error fetching academic data', error);
            router.push('/page/login');
          }
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="loadingContainer">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">User Page</h1>
        {userData ? (
          <div className="bg-white shadow-md rounded p-4 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-2">Welcome, {userData.FullName}</h2>
            <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(userData, null, 2)}</pre>
          </div>
        ) : (
          <p>No user data available</p>
        )}
        {academicData && (
          <div className="bg-white shadow-md rounded p-4 w-full max-w-md mt-4">
            <h2 className="text-xl font-semibold mb-2">Academic Details</h2>
            <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(academicData, null, 2)}</pre>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
