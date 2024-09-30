"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';  // Ensure axios is imported
import ApiService from '@/app/services/auth/ApiAuth';
import ApiServiceAcademics from '@/app/services/academics/ApiAcademics';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

interface AcademicData {
  AcademicID?: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  role?: string;
}


const AdminHeader: React.FC = () => {
  const [academicData, setAcademicData] = useState<AcademicData | null>(null);
  const [isMounted, setIsMounted] = useState(false); // Ensure component is mounted
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true); // Set mounted to true when the component is mounted
  }, []);

  useEffect(() => {
    if (isMounted) {
      const AcademicID = localStorage.getItem('AcademicID');
      if (AcademicID) {
        const fetchAdminData = async () => {
          try {
            const academicResponse = await ApiServiceAcademics.getAcademic(Number(AcademicID));
            setAcademicData({ ...academicResponse.data, role: 'admin' });
          } catch (error) {
            console.error('Error fetching academic data:', error);

            // ลบ localStorage และ sessionStorage เมื่อเกิดข้อผิดพลาด
            localStorage.clear();
            sessionStorage.clear();
            // ใช้ SweetAlert2 เพื่อแสดงการแจ้งเตือน
            Swal.fire({
              icon: 'warning',
              title: 'เซสชันหมดอายุ',
              text: 'กรุณาเข้าสู่ระบบใหม่',
              confirmButtonText: 'ตกลง',
              timer: 5000, // ตั้งเวลา 5 วินาที (5000 มิลลิวินาที)
              timerProgressBar: true, // แสดงแถบความคืบหน้า
            }).then(() => {
              // เปลี่ยนเส้นทางไปยังหน้า /page/control หลังจากกดตกลง
              router.push('/page/control');
            }).catch(() => {
              // Handle case where timer runs out and no user interaction
              router.push('/page/control');
            });

          }
        };
        fetchAdminData();
      }
    }
  }, [isMounted, router]);



  return (
    <div className="bg-white p-2 flex justify-between items-center">
      <div className="flex items-center">

      </div>
      <div className="flex items-center space-x-6">
        {academicData && (
          <div className="bg-yellow-400 flex items-center space-x-4 relative overflow-visible px-4 py-2">
            <span className="text-black whitespace-nowrap">{academicData.FirstName} {academicData.LastName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHeader;
