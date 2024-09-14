"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/app/components/footer/footer';
import Header from '@/app/components/header/Header';
import ApiStudentServices from '@/app/services/students/ApiStudent';

interface User {
  StudentID: number;
  FirstName: string;
  Email: string;
  LastName: string;
  Phone: string;
  PrefixName: string;
  Year_Entry: string;
  DOB: string;
  GPA: string;
  Religion: string;
  Course: string;
}

export default function UserPage() {
  const [userData, setUserData] = useState<User | null>(null); // Initialize with `null` to represent the absence of data at first
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/page/login');
        return;
      }

      const StudentID = localStorage.getItem('UserID');

      if (StudentID) {
        try {
          const studentResponse = await ApiStudentServices.getStudent(StudentID);
          console.log(studentResponse);
          setUserData(studentResponse.data); // Populate the user data here
        } catch (error) {
          console.error('Error fetching user data', error);
          router.push('/page/login');
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="loader"></div>
        <p className="ml-4 text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-4xl bg-white shadow-xl rounded-lg p-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">User Profile</h1>

          {userData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center">
                  <svg
                    className="h-6 w-6 text-indigo-600 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  Personal Information
                </h2>
                <div className="text-gray-800">
                  <p className="mb-3">
                    <strong>Full Name:</strong> {userData.FirstName}
                  </p>
                  <p className="mb-3">
                    <strong>Surname:</strong> {userData.LastName}
                  </p>
                  <p className="mb-3">
                    <strong>Email:</strong> {userData.Email}
                  </p>
                  <p className="mb-3">
                    <strong>Phone:</strong> {userData.Phone}
                  </p>
                  <p className="mb-3">
                    <strong>Date of Birth:</strong> {userData.DOB}
                  </p>
                  <p className="mb-3">
                    <strong>Date of Birth:</strong> {userData.Religion}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-lg text-center text-gray-500">No user data available</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
