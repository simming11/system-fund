"use client"
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ApiService from '@/app/services/auth/ApiAuth';
import { BellIcon, UserIcon, MegaphoneIcon } from '@heroicons/react/16/solid';
import ApiStudentServices from '@/app/services/students/ApiStudent';
import ApiServiceAcademics from '@/app/services/academics/ApiAcademics';

interface User {
  StudentID?: string;
  FirstName?: string;
  LastName?: string;
  Surname?: string;
  Email?: string;
  role?: string;
}

interface AcademicData {
  AcademicID?: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  role?: string;
}

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [academicData, setAcademicData] = useState<AcademicData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isApplyDropdownOpen, setIsApplyDropdownOpen] = useState(false); // State for application dropdown
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const dropdownRef = useRef<HTMLDivElement>(null);
  const applyDropdownRef = useRef<HTMLDivElement>(null); // Ref for application dropdown
  const mobileMenuRef = useRef<HTMLDivElement>(null); // Ref for mobile menu
  const router = useRouter();
  const [userData, setUserData] = useState<string | null>(null);
  const [AcademicID, setAcademicID] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserData(localStorage.getItem('UserID'));
      setAcademicID(localStorage.getItem('AcademicID'));
      setUserRole(localStorage.getItem('UserRole'));
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');

        if (token && userRole) {
          setHasToken(true);
          if (userRole === 'student' && userData) {
            try {
              const response = await ApiStudentServices.getStudent(Number(userData));
              setUser({ ...response.data, role: 'student' });
              console.log('User data:', response.data);
            } catch (error) {
              console.error('Error fetching user data', error);
            }
          } else if (userRole === 'admin' && AcademicID) {
            try {
              const academicResponse = await ApiServiceAcademics.getAcademic(Number(AcademicID));
              setAcademicData({ ...academicResponse.data, role: 'admin' });
              console.log('Academic data:', academicResponse.data);
            } catch (error) {
              console.error('Error fetching academic data', error);
            }
          }
        }
      }
    };

    fetchUserData();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (applyDropdownRef.current && !applyDropdownRef.current.contains(event.target as Node)) {
        setIsApplyDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userData, AcademicID, userRole]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleApplyDropdown = () => {
    setIsApplyDropdownOpen(!isApplyDropdownOpen);
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
      setHasToken(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleLineNotifyAuth = () => {
    const clientId = 'YOUR_LINE_NOTIFY_CLIENT_ID';
    const redirectUri = 'http://localhost:3000/page/application/create';
    const lineNotifyUrl = `https://notify-bot.line.me/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=notify&state=xyz`;
    window.location.href = lineNotifyUrl;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center relative">
      <div className="flex items-center">
        <img src="/path-to-your-logo.png" alt="Logo" className="h-10 mr-4" />
        <nav className="hidden md:flex space-x-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">HOME</Link>
          <div className="relative" ref={applyDropdownRef}>
            <button onClick={toggleApplyDropdown} className="text-gray-600 hover:text-gray-900">
              ทุนการศึกษา
              <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            {isApplyDropdownOpen && (
              <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20">
                <Link href="/page/scholarships" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">ทุนการศึกษา</Link>
              </div>
            )}
          </div>
          <div className="relative" ref={applyDropdownRef}>
            <button onClick={toggleApplyDropdown} className="text-gray-600 hover:text-gray-900">
              สมัครทุนการศึกษา
              <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            {isApplyDropdownOpen && (
              <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20">
                <Link href="/page/scholarships" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">สมัครทุนการศึกษา</Link>
              </div>
            )}
          </div>
          <Link href="/page/scholarships" className="text-gray-600 hover:text-gray-900">ประกาศทุนการศึกษา</Link>
          <Link href="/page/contact" className="text-gray-600 hover:text-gray-900">ติดต่อเรา</Link>
        </nav>
      </div>
      <div className="flex items-center space-x-4 relative">
        {user ? (
          <>
            {user.role === 'student' && (
              <Link href="/page/scholarships" className="text-gray-600 hover:text-gray-900">เพิ่มใบสมัคร</Link>
            )}
            <div className="flex items-center space-x-2 cursor-pointer relative" onClick={toggleDropdown}>
              <UserIcon className="h-8 text-gray-700" />
              <span className="text-gray-700">{user.FirstName} {user.LastName}</span>
              <svg className="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            {isDropdownOpen && (
              <div ref={dropdownRef} className="absolute right-0 mt-2 w-56 bg-white border border-red-200 rounded-lg shadow-lg py-2 z-20">
                <Link href="/page/info" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">แก้ไขข้อมูลส่วนตัว</Link>
                <button onClick={handleLogoutClick} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">ออกจากระบบ</button>
              </div>
            )}
          </>
        ) : academicData ? (
          <>
            <div className="flex items-center space-x-2 cursor-pointer relative" onClick={toggleDropdown}>
              <UserIcon className="h-8 text-gray-700" />
              <span className="text-gray-700">{academicData.FirstName} {academicData.LastName}</span>
              <svg className="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            {isDropdownOpen && (
              <div ref={dropdownRef} className="absolute right-0 mt-2 w-56 bg-white border border-red-200 rounded-lg shadow-lg py-2 z-20">
                <Link href="/page/info" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">แก้ไขข้อมูลส่วนตัว</Link>
                <button onClick={handleLogoutClick} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">ออกจากระบบ</button>
              </div>
            )}
          </>
        ) : (
          <div className="flex space-x-4">
            <Link href="/page/login" className="text-gray-600 hover:text-gray-900">Login</Link>
            <Link href="/page/register" className="text-gray-600 hover:text-gray-900">Register</Link>
          </div>
        )}
      </div>
      <div className="md:hidden">
        <button className="text-gray-700 focus:outline-none" onClick={toggleMobileMenu}>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        {isMobileMenuOpen && (
          <div ref={mobileMenuRef} className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20">
            <Link href="/" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">HOME</Link>
            <Link href="/page/scholarships" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">ทุนการศึกษา</Link>
            <Link href="/page/scholarships" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">สมัครทุนการศึกษา</Link>
            <Link href="/page/scholarships" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">ประกาศทุนการศึกษา</Link>
            <Link href="/page/contact" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">ติดต่อเรา</Link>
            {user && (
              <Link href="/page/scholarships" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">เพิ่มใบสมัคร</Link>
            )}
            {user || academicData ? (
              <>
                <Link href="/page/info" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">แก้ไขข้อมูลส่วนตัว</Link>
                <button onClick={handleLogoutClick} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">ออกจากระบบ</button>
              </>
            ) : (
              <>
                <Link href="/page/login" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Login</Link>
                <Link href="/page/register" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Register</Link>
              </>
            )}
          </div>
        )}
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
