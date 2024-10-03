"use client";
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ApiService from '@/app/services/auth/ApiAuth';
import { UserIcon } from '@heroicons/react/16/solid';
import ApiStudentServices from '@/app/services/students/ApiStudent';
import Swal from 'sweetalert2';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

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
  const [isScholarshipDropdownOpen, setIsScholarshipDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // For mobile menu
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scholarshipDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [userData, setUserData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
        const userRole = localStorage.getItem('UserRole');  // Assuming userRole is stored in localStorage
  
        if (token && userRole === 'student' && userData) {
          try {
            const response = await ApiStudentServices.getStudent(userData);
            setUser({ ...response.data, role: 'student' });
          } catch (error: any) {  // Specify 'any' type for the error
            console.error('Error fetching user data', error);
  
            // ถ้าได้รับรหัส 401 (Unauthorized) ให้แสดงแจ้งเตือนและเปลี่ยนเส้นทางไปหน้า login
            if (error.response?.status === 401) {
              Swal.fire({
                icon: 'error',
                title: 'ไม่ได้รับอนุญาต',
                text: 'เซสชั่นหมดอายุหรือคุณไม่ได้รับอนุญาต.',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'เข้าสู่ระบบอีกครั้ง',
                allowOutsideClick: false,  // ปิดการคลิกนอกปุ่ม
                timer: 5000  // ตั้งเวลา 5 วินาที
              }).then(() => {
                localStorage.clear();  // ลบข้อมูลใน localStorage ทั้งหมด
                sessionStorage.clear();  // ลบข้อมูลใน localStorage ทั้งหมด
                router.push('/page/login');  // เปลี่ยนเส้นทางไปหน้า login
              });
            } else {
              // กรณีที่ไม่ใช่ 401 Unauthorized ก็แสดงข้อความแจ้งเตือนทั่วไป
              Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'เกิดข้อผิดพลาดขณะดึงข้อมูลของผู้ใช้.',
                confirmButtonColor: '#3085d6',
              });
            }
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      }
    };
  
    fetchUserData();
  }, [userData, router]);
  
  

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleScholarshipDropdown = () => {
    setIsScholarshipDropdownOpen(!isScholarshipDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogoutClick = () => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณจะไม่สามารถยกเลิกการกระทำนี้ได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, ออกจากระบบ!",
      cancelButtonText: "ยกเลิก"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await ApiService.logout();
          if (typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();
            router.push('/');
          }
          Swal.fire({
            title: "ออกจากระบบเรียบร้อย!",
            text: "คุณได้ออกจากระบบเรียบร้อยแล้ว.",
            icon: "success"
          });
        } catch (error) {
          console.error('ออกจากระบบล้มเหลว', error);
        }
      }
    });
  };

  if (loading) {
    return (
      <header className="bg-white p-4 flex justify-center items-center fixed w-full">
        <div className="loader border-t-4 border-blue-500 rounded-full w-8 h-8 animate-spin"></div>
      </header>
    );
  }

  return (
    <header className="bg-white  p-4 flex justify-between items-center  fixed relative">
    <div className="flex items-center">
      <img src="/images/sci.png" alt="Logo" className="h-10 mr-4" />
      <nav className="hidden md:flex space-x-4">
        <Link href="/" className="text-gray-600 hover:text-gray-900">HOME</Link>
{user ?(
  <>
  </>
):(
<>
<button
          type="button"
          className="inline-flex justify-center items-center text-gray-600 hover:text-gray-900"
          onClick={toggleScholarshipDropdown}
        >
          ทุนการศึกษา
          <FontAwesomeIcon
            icon={isScholarshipDropdownOpen ? faChevronUp : faChevronDown} // เปลี่ยนไอคอนตามสถานะการเปิดปิด
            className="ml-2" // เพิ่มระยะห่างระหว่างข้อความและไอคอน
          />
        </button>
</>
)}
       


        {isScholarshipDropdownOpen && ( 
          <div ref={scholarshipDropdownRef} className="origin-top-right absolute mt-8 w-50 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <Link href="/page/internal-scholarships" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                ทุนภายในคณะ
              </Link>
              <Link href="/page/external-scholarships" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                ทุนที่มาจากภายนอก
              </Link>
            </div>
          </div>
        )}
        <Link href="/page/results-announcement" className="text-gray-600 hover:text-gray-900">ดูผลประกาศทุนการศึกษา</Link>
        {user && (
      <Link href="/page/History-Application" className="text-gray-600 hover:text-gray-900">ประวัติการสมัคร</Link>
    )}
        <Link href="/page/contact" className="text-gray-600 hover:text-gray-900">ติดต่อเรา</Link>
      </nav>
      <button className="md:hidden" onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>
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
      <div ref={dropdownRef} className="absolute right-0 mt-12 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 w-40">
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

{isMobileMenuOpen && (
<div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg">
  <nav className="flex flex-col space-y-2 p-4">
    <Link href="/" className="text-gray-600 hover:text-gray-900">HOME</Link>

    {user ?(
  <>
  </>
):(
<>
<Link href="/page/internal-scholarships" className="text-gray-600 hover:text-gray-900"> ทุนภายในคณะ</Link>
<Link href="/page/external-scholarships" className="text-gray-600 hover:text-gray-900">ทุนที่มาจากภายนอก</Link>
</>
)}
       

    


      




    


    <Link href="/page/results-announcement" className="text-gray-600 hover:text-gray-900">ประกาศทุนการศึกษา</Link>
    {user && (
      <Link href="/page/History-Application" className="text-gray-600 hover:text-gray-900">ประวัติการสมัคร</Link>
    )}
    <Link href="/page/contact" className="text-gray-600 hover:text-gray-900">ติดต่อเรา</Link>
  </nav>
</div>
)}


    {showLogoutModal && (
      <div className="fixed inset-0 flex items-center justify-center z-30">
        <div className="fixed inset-0 bg-black opacity-50"></div>
        <div className="bg-white p-6 rounded-lg shadow-lg z-40">
          <h2 className="text-xl font-semibold mb-4">ต้องการออกจากระบบหรือไม่</h2>
          <div className="flex justify-end space-x-4">
            <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">ยกเลิก</button>
            <button onClick={handleLogoutClick} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">ยืนยัน</button>
          </div>
        </div>
      </div>
    )}
  </header>
  );
};

export default Header;
