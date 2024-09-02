import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ApiService from '@/app/services/auth/ApiAuth';
import ApiServiceAcademics from '@/app/services/academics/ApiAcademics';

interface AcademicData {
  AcademicID?: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  role?: string;
}

const AdminHeader: React.FC = () => {
  const [academicData, setAcademicData] = useState<AcademicData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure this runs only on the client side
    if (typeof window !== 'undefined') {
      setIsClient(true);
    }

    const AcademicID = localStorage.getItem('AcademicID');
    localStorage.getItem('UserRole');

    if (AcademicID) {
      const fetchAdminData = async () => {
        try {
          const academicResponse = await ApiServiceAcademics.getAcademic(Number(AcademicID));
          setAcademicData({ ...academicResponse.data, role: 'admin' });
        } catch (error) {
          console.error('Error fetching academic data:', error);
        }
      };

      fetchAdminData();
    }

    const handleClickOutside = (event: Event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleLogoutClick = async () => {
    try {
      await ApiService.logout();
      localStorage.clear();
      if (isClient) {
        const router = useRouter();
        router.push('/');
      }
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="bg-white p-2 flex justify-between items-center ">
      <div className="flex items-center">
      </div>
      <div className="flex items-center space-x-6">
  {academicData && (
    <div className="bg-yellow-400 flex items-center space-x-4 relative overflow-visible  px-4 py-2"> {/* Rounded corners, yellow background, padding */}
      <span className="text-black whitespace-nowrap">{academicData.FirstName} {academicData.LastName}</span> {/* Black text color */}
    </div>
  )}
</div>


    </div>
  );
};

export default AdminHeader;
