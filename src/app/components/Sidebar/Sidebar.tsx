"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ApiAuthService from '@/app/services/auth/ApiAuth';

const Sidebar = () => {
  const [isScholarshipOpen, setScholarshipOpen] = useState(true);
  const [isApplicationOpen, setApplicationOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Modal for logout confirmation
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
      // Check if the sidebarRef.current exists and if the click was outside the sidebar
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to confirm logout
  const confirmLogout = async () => {
    try {
      await ApiAuthService.logout();
      if (typeof window !== 'undefined') {
        localStorage.clear();
        router.push('/page/control');
      }
      setHasToken(false);
      setShowLogoutModal(false); // Close modal after logout
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Cancel the logout action and close the modal
  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Show the logout modal when logout button is clicked
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  return (
    <div className=" ">
      <div className="flex flex-col h-screen">

        <div className="lg:hidden p-4 bg-white shadow-md">
          <button
            className="text-gray-700 hover:text-blue-500"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>
        </div>

        <div
          ref={sidebarRef}
          className={`lg:static lg:w-64 lg:flex lg:flex-col lg:bg-white  lg:rounded-md transition-transform duration-300 ease-in-out fixed inset-y-0 left-0 w-64 p-6 bg-white  z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0`}
        >
          <div>
            <h2 className="text-xl font-bold mb-4">จัดการทุนการศึกษา</h2>
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
              <li>
                <Link href="/page/notify" className="text-gray-700 hover:text-blue-500">
                  Notify
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-between h-60 ">
          {/* Logout Button */}
          <button
            className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            style={{ marginTop: 'auto' }}
            onClick={handleLogoutClick}
          >
            ออกจากระบบ
          </button>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
            <div className="bg-white p-6 rounded-md shadow-md text-center">
              <h2 className="text-lg font-semibold mb-4">ยืนยันการออกจากระบบ?</h2>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  ยืนยัน
                </button>
                <button
                  onClick={cancelLogout}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
