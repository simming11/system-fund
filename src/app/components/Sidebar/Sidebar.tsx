"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ApiAuthService from '@/app/services/auth/ApiAuth';
import Swal from 'sweetalert2';  // Import SweetAlert2

const Sidebar = () => {
  const [isScholarshipOpen, setScholarshipOpen] = useState(true);
  const [isApplicationOpen, setApplicationOpen] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [hasUserRole, setUserRole] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false); // State for mobile sidebar toggle
  const sidebarRef = useRef<HTMLDivElement>(null); // Define the type of sidebarRef
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasToken(!!localStorage.getItem('token'));
      setUserRole(!!localStorage.getItem('UserRole'));
    }


    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to confirm logout using SweetAlert
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
          await ApiAuthService.logout();
          if (typeof window !== 'undefined') {
            localStorage.clear();
            router.push('/page/control');
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


  return (

      <div className="flex flex-col h-screen bg-gray-200">
        <div className="lg:hidden p-4 bg-gray shadow-md">
          <button
            className="text-gray-700 hover:text-blue-500"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>
        </div>

        <div
          ref={sidebarRef}
          className={`lg:static lg:w-64 lg:flex lg:flex-col lg:bg-gray-200 lg:rounded-md transition-transform duration-300 ease-in-out fixed inset-y-0 left-0 w-64 p-6 bg-gray-200 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0`}
        >
          <div>
            <h2 className="text-xl font-bold mb-4 hover:text-blue-500 cursor-pointer">
              <Link href="/page/management" legacyBehavior>
                <a>จัดการทุนการศึกษา</a>
              </Link>
            </h2>
            <ul className="space-y-3">
              {/* Sidebar Links */}
              <li>
                <div
                  className="cursor-pointer text-gray-700 hover:text-blue-500 flex justify-between items-center"
                  onClick={() => setScholarshipOpen(!isScholarshipOpen)}
                >
                  <span>จัดการทุนการศึกษา</span>
                  <span>{isScholarshipOpen ? '▾' : '▸'}</span>
                </div>
                {isScholarshipOpen && (
                  <ul className="ml-4 mt-2 space-y-2 text-gray-600">
                    <li>
                      <Link href="/page/scholarships/Manage-internal-scholarships" className="hover:text-blue-500">
                        จัดการทุนการศึกษาภายใน
                      </Link>
                    </li>
                    <li>
                      <Link href="/page/scholarships/Manage-external-scholarships" className="hover:text-blue-500">
                        จัดการทุนการศึกษาภายนอก
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <div
                  className="cursor-pointer text-gray-700 hover:text-blue-500 flex justify-between items-center"
                  onClick={() => setApplicationOpen(!isApplicationOpen)}
                >
                  <span>ข้อมูลการสมัครทุน</span>
                  <span>{isApplicationOpen ? '▾' : '▸'}</span>
                </div>
                {isApplicationOpen && (
                  <ul className="ml-4 mt-2 space-y-2 text-gray-600">
                    <li>
                      <Link href="/page/internal-application-data" className="hover:text-blue-500">
                        ข้อมูลการสมัครทุนภายใน
                      </Link>
                    </li>
                    <li>
                      <Link href="/page/external-application-data" className="hover:text-blue-500">
                        ข้อมูลการสมัครทุนภายนอก
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              {/* Other Links */}
              <li>
                <Link href="/page/scholarship-results-announcement" className="text-gray-700 hover:text-blue-500">
                  ประกาศผลทุนการศึกษา
                </Link>
              </li>
              <li>
                <Link href="/page/student-data" className="text-gray-700 hover:text-blue-500">
                  ข้อมูลนิสิต
                </Link>
              </li>
              <li>
                <Link href="/page/scholarship-summary-report" className="text-gray-700 hover:text-blue-500">
                  รายงานสรุปทุนการศึกษา
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-between mb-20 ">
          {/* Logout Button */}
          <button
            className="w-30 py-2  bg-red-500 text-white rounded-md hover:bg-red-600"
            style={{ marginTop: 'auto' }}
            onClick={handleLogoutClick}
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
  );
};

export default Sidebar;
