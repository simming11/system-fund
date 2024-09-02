"use client";
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ApiService from '@/app/services/auth/ApiAuth';
import { UserIcon } from '@heroicons/react/16/solid';
import ApiStudentServices from '@/app/services/students/ApiStudent';

interface User {
  StudentID?: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  role?: string;
}

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [userData, setUserData] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserData(localStorage.getItem('UserID'));
      setUserRole(localStorage.getItem('UserRole'));
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token && userRole === 'student' && userData) {
          try {
            const response = await ApiStudentServices.getStudent(Number(userData));
            setUser({ ...response.data, role: 'student' });
          } catch (error) {
            console.error('Error fetching user data', error);
          }
        }
      }
    };

    fetchUserData();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userData, userRole]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await ApiService.logout();
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      router.push('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center relative">
      <div className="flex items-center">
        <img src="/images/TsuMove.png" alt="Logo" className="h-10 mr-4" />
        <nav className="hidden md:flex space-x-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">HOME</Link>
          <Link href="/page/scholarships" className="text-gray-600 hover:text-gray-900">ทุนการศึกษา</Link>
          <Link href="/page/contact" className="text-gray-600 hover:text-gray-900">ติดต่อเรา</Link>
        </nav>
      </div>
      <div className="flex items-center space-x-4 relative">
        {user ? (
          <>
            <div className="flex items-center space-x-1 cursor-pointer" onClick={toggleDropdown}>
              <UserIcon className="h-6 text-gray-700" />
              <span className="text-gray-700 text-sm">{user.FirstName} {user.LastName}</span>
              <svg className="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            {isDropdownOpen && (
              <div ref={dropdownRef} className="absolute right-0 mt-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 w-40">
                <Link href="/page/info" className="block px-4 py-2 text-gray-800 text-sm hover:bg-gray-100">ข้อมูลส่วนตัว</Link>
                <Link href="/page/History-Application" className="block px-4 py-2 text-gray-800 text-sm hover:bg-gray-100">ประวัติการสมัคร</Link>
                <button onClick={handleLogoutClick} className="block w-full text-left px-4 py-2 text-gray-800 text-sm hover:bg-gray-100">ออกจากระบบ</button>
              </div>
            )}
          </>
        ) : (
          <>
            <Link href="/page/login" className="text-gray-600 hover:text-gray-900">เข้าสู่ระบบ</Link>
            <Link href="/page/register" className="text-gray-600 hover:text-gray-900">ลงทะเบียน</Link>
          </>
        )}
      </div>
      <div className="md:hidden">
        <button className="text-gray-700 focus:outline-none" onClick={toggleDropdown}>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center z-30">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-6 rounded-lg shadow-lg z-40">
            <h2 className="text-xl font-semibold mb-4">ต้องการออกจากระบบหรือไม่</h2>
            <div className="flex justify-end space-x-4">
              <button onClick={cancelLogout} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">ยกเลิก</button>
              <button onClick={confirmLogout} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
