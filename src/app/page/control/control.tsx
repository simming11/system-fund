"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ApiAuthService from '@/app/services/auth/ApiAuth';
import HeaderHome from '@/app/components/headerHome/headerHome';
import Header from '@/app/components/header/Header';
import Swal from 'sweetalert2';

export default function LoginControlPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();
  useEffect(() => {
    const userRole = localStorage.getItem('UserRole');
    
    // ถ้า UserRole เป็น admin จะไม่สามารถเข้าหน้าควบคุมได้
    if (userRole && userRole.trim().toLowerCase() === 'admin') {
      router.push('/page/management'); // Redirect ไปยังหน้าที่เหมาะสม
    }
  }, [router]);
  
  
  useEffect(() => {
    const savedIdentifier = localStorage.getItem('savedIdentifier');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedIdentifier && savedPassword) {
      setIdentifier(savedIdentifier);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLoginAcademic = async () => {
    // ตรวจสอบว่ามีการกรอก identifier และ password หรือไม่
    if (!identifier || !password) {
      setError('กรุณากรอกรหัสผู้ดูแลและรหัสผ่าน');
      return; // หยุดการทำงานถ้าไม่มีการกรอกข้อมูล
    }
  
    try {
      const response = await ApiAuthService.loginAcademic(identifier, password);
     
  
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('UserRole', 'admin');
      localStorage.setItem('AcademicID', user.AcademicID?.toString() || '');
      localStorage.setItem('Username', user.Username || '');
  
      if (rememberMe) {
        localStorage.setItem('savedIdentifier', identifier);
        localStorage.setItem('savedPassword', password);
      } else {
        localStorage.removeItem('savedIdentifier');
        localStorage.removeItem('savedPassword');
      }
  
      Swal.fire({
        icon: 'success',
        title: 'เข้าสู่ระบบสำเร็จ',
        showConfirmButton: false,
        timer: 1000,
      });
  
      sessionStorage.clear(); // Clears all session storage
      router.push('./management');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError('' + (error.response?.data.message || error.message));
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
    <HeaderHome />
    <Header />
    <div className="flex flex-grow items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-center text-2xl font-bold mb-8 text-blue-800">
          เข้าสู่ระบบสำหรับเจ้าหน้าที่
        </h2>
        <form className="w-full" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="รหัสผู้ดูแล"
            value={identifier}
            onChange={handleIdentifierChange}
            className="w-full p-3 mb-4 border border-gray-300 rounded"
          />
          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
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
  
          {/* แสดงข้อความข้อผิดพลาดแบบสวยงาม */}
          {error && (
            <div className="  text-red-700 px-4 py-3  relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
  
          <button
            onClick={handleLoginAcademic}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  </div>
  
  );
}
