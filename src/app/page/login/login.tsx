"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ApiAuthService from '@/app/services/auth/ApiAuth';
import ApiService from '@/app/services/scholarships/ApiScholarShips';
import HeaderHome from '@/app/components/headerHome/headerHome';
import Header from '@/app/components/header/Header';
import Sidebar from '@/app/components/Sidebar/Sidebar';

interface User {
  StudentID:  string;
  FirstName:  string;
  LastName:   string;
  Email:      string;
  GPA:        string;
  YearLevel:  string;
  Major:      string;
  updated_at: Date;
  created_at: Date;
}

interface Scholarship {
  StartDate?: Date;
  EndDate?: Date;
  CreatedBy?: string;
  TypeID?: string;
  ScholarshipName?: string;
  UploadFile?: string;
  ImagePath?: string;
  updated_at?: Date;
  created_at?: Date;
  ScholarshipID?: number;
}

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string>('');
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedIdentifier = localStorage.getItem('savedIdentifier');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedIdentifier && savedPassword) {
      setIdentifier(savedIdentifier);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLoginStudent = async () => {
    try {
      const response = await ApiAuthService.loginStudent(identifier, password);
      console.log('Login successful', response.data);

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('UserRole', 'student');
      localStorage.setItem('UserID', user.StudentID?.toString() || '');
      if (rememberMe) {
        localStorage.setItem('savedIdentifier', identifier);
        localStorage.setItem('savedPassword', password);
      } else {
        localStorage.removeItem('savedIdentifier');
        localStorage.removeItem('savedPassword');
      }
      router.push('./scholarships');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError('Login failed: ' + (error.response?.data.message || error.message));
      } else {
        setError('An unknown error occurred during login');
      }
      console.error('Login failed', error);
    }
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setIdentifier(value);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <HeaderHome/>
      <Header />
      <div className="flex flex-grow items-center justify-center">
        <div className="bg-white shadow-md rounded-lg p-8 flex flex-col lg:flex-row items-center justify-center lg:space-x-8">
          <div className="w-full lg:w-1/1 p-4 lg:order-1 lg:mr-8">
            <img src="/images/government-scholarship-icon.png" alt="Scholarship" className="rounded-lg" />
          </div>
          <div className="w-full lg:w-1/1 p-4 lg:order-2 lg:ml-8">
            <h2 className="text-center text-2xl font-bold mb-8 text-blue-800">เข้าสู่ระบบ</h2>
            <form className="w-full" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="รหัสนิสิต"
                value={identifier}
                onChange={handleIdentifierChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
              />
              <div className="relative mb-4">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="รหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 bg-gray-200 p-1 rounded"
                  >
                    {showPassword ? 'ซ่อน' : 'แสดง'}
                  </button>
                )}
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2"
                />
                <label>จำฉันไว้</label>
              </div>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <button
                onClick={handleLoginStudent}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                LOGIN
              </button>
              <p className="text-gray-600 mt-4 text-center">
              สำหรับเจ้าหน้าที่ <a href="./control" target="_blank" className="text-blue-500">คลิกที่นี่</a>
            </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
