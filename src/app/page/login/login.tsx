"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ApiAuthService from '@/app/services/auth/ApiAuth';
import HeaderHome from '@/app/components/headerHome/headerHome';
import Header from '@/app/components/header/Header';
import Swal from 'sweetalert2';
// Define your popup function here
const showPopup = () => {
  Swal.fire({
    title: "<strong>เข้าร่วมกลุ่มนี้เพื่อรับข่าวสาร</strong>",
    imageUrl: '/images/line.jpg', // Use the relative path to the image in the public folder
    imageWidth: 200, // Set the width of the image
    imageHeight: 200, // Set the height of the image
    html: `
     
    `,
    confirmButtonText: `<i class="fa fa-thumbs-up"></i> ตกลง!`,
  });
};


export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string>('');
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
    // ตรวจสอบว่ามีการป้อนค่า identifier และ password หรือไม่
    if (!identifier || !password) {
      setError('กรุณากรอกรหัสนิสิตและรหัสผ่าน');
      return;
    }

    try {
      const response = await ApiAuthService.loginStudent(identifier, password);

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

      Swal.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ",
        showConfirmButton: false,
      });
      sessionStorage.clear(); // Clears all session storage

      router.push('./scholarships/ApplyScholarship');
      showPopup()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError('' + (error.response?.data.message || error.message));
      } else {
        setError('An unknown error occurred during login');
      }
      console.error('', error);
    }
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setIdentifier(value);
    } else {
      setError('รหัสนิสิตต้องเป็นตัวเลขเท่านั้น');
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <HeaderHome />
      <Header />
      <div className="flex flex-grow items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
          <h2 className="text-center text-3xl font-bold mb-10 text-blue-800">เข้าสู่ระบบสำหรับนิสิต</h2> 
          <form className="w-full" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="รหัสนิสิต"
              value={identifier}
              onChange={handleIdentifierChange}
              className="w-full p-3 mb-5 border border-gray-300 rounded text-lg"
            />
            <div className="relative mb-5">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded text-lg" 
              />
              {password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 bg-gray-200 p-2 rounded text-sm" 
                >
                  {showPassword ? 'ซ่อน' : 'แสดง'}
                </button>
              )}
            </div>
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              <label className="text-lg">จำฉันไว้</label>
            </div>
            {error && <p className="text-red-500 mb-4 text-lg">{error}</p>} 
            <button
              onClick={handleLoginStudent}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 text-xl" 
            >
              LOGIN
            </button>
            <p className="text-gray-600 mt-6 text-center text-lg"> 
              สำหรับเจ้าหน้าที่ <a href="./control" target="_blank" className="text-blue-500">คลิกที่นี่</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}


