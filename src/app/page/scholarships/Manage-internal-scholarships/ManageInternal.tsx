'use client';

import React, { useEffect, useState } from "react";
import HeaderHome from "@/app/components/headerHome/headerHome";
import AdminHeader from "@/app/components/headerAdmin/headerAdmin";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import Footer from "@/app/components/footer/footer";
import { useRouter } from "next/navigation";
import ApiServiceScholarships from "@/app/services/scholarships/ApiScholarShips";
import Swal from "sweetalert2";
import ApiUpdateServiceScholarships from "@/app/services/scholarships/updateScholarships";

interface Scholarship {
  StartDate: Date;
  EndDate: Date;
  CreatedBy: string;
  TypeID: number;
  ScholarshipName: string;
  YearLevel: string;
  updated_at: Date;
  created_at: Date;
  Minimum_GPA: string;
  Year: number;
  ScholarshipID: number;
  courses: Course[];
  documents: Document[];
  qualifications: Qualification[];
  type: { TypeID: number; TypeName: string };
  creator: { AcademicID: string };
  status: string;
}

interface Course {
  ScholarshipID: number;
  CourseID: number;
  CourseName: string;
}

interface Document {
  ScholarshipID: number;
  DocumentID: number;
  DocumentText: string;
}

interface Qualification {
  ScholarshipID: number;
  QualificationID: number;
  QualificationText: string;
}

export default function ManageInternalScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scholarshipsPerPage] = useState<number>(5); // Scholarships per page
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const Role = localStorage.getItem('UserRole');

      if (!token || Role?.trim().toLowerCase() !== 'admin') {
        console.error('Unauthorized access or missing token. Redirecting to login.');
        router.push('/page/control');
      }
    }
  }, [router]);
  // Fetch scholarships from API
  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const response = await ApiServiceScholarships.getAllScholarships();
        const typeOneScholarships = response.data.filter((scholarship: Scholarship) => scholarship.TypeID === 1);
        setScholarships(typeOneScholarships);
        setFilteredScholarships(typeOneScholarships); // Initialize filtered scholarships
      } catch (error) {
        console.error("Failed to fetch scholarships", error);
      }
    };

    fetchScholarships();
    
  }, []);

  const handleEdit = (id: number) => {
    router.push(`/page/scholarships/Manage-internal-scholarships/Edit?id=${id}`);
};
const handleHide = async (id: string) => {
  Swal.fire({
    title: 'ต้องการซ่อนข้อมูลหรือไม่?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ใช่',
    cancelButtonText: 'ไม่',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await ApiUpdateServiceScholarships.updateScholarship(id, { status: 'hidden' });
        Swal.fire('ซ่อนแล้ว!', '', 'success');
        
        // Update both scholarships and filteredScholarships states
        setScholarships(prevScholarships =>
          prevScholarships.map(scholarship =>
            scholarship.ScholarshipID === Number(id) ? { ...scholarship, status: 'hidden' } : scholarship
          )
        );
        setFilteredScholarships(prevFiltered =>
          prevFiltered.map(scholarship =>
            scholarship.ScholarshipID === Number(id) ? { ...scholarship, status: 'hidden' } : scholarship
          )
        );
      } catch (error) {
        Swal.fire('ล้มเหลว!', 'ไม่สามารถซ่อนข้อมูลได้', 'error');
      }
    }
  });
};

const handleUnhide = async (id: string) => {
  Swal.fire({
    title: 'ต้องการเลิกซ่อนข้อมูลหรือไม่?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ใช่',
    cancelButtonText: 'ไม่',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await ApiUpdateServiceScholarships.updateScholarship(id, { status: 'active' });
        Swal.fire('เลิกซ่อนแล้ว!', '', 'success');
        
        // Update both scholarships and filteredScholarships states
        setScholarships(prevScholarships =>
          prevScholarships.map(scholarship =>
            scholarship.ScholarshipID === Number(id) ? { ...scholarship, status: 'active' } : scholarship
          )
        );
        setFilteredScholarships(prevFiltered =>
          prevFiltered.map(scholarship =>
            scholarship.ScholarshipID === Number(id) ? { ...scholarship, status: 'active' } : scholarship
          )
        );
      } catch (error) {
        Swal.fire('ล้มเหลว!', 'ไม่สามารถเลิกซ่อนได้', 'error');
      }
    }
  });
};

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);

    const filtered = scholarships.filter((scholarship) =>
      scholarship.ScholarshipName.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredScholarships(filtered);
    setCurrentPage(1); // Reset to the first page
  };

  // Pagination calculation
  const indexOfLastScholarship = currentPage * scholarshipsPerPage;
  const indexOfFirstScholarship = indexOfLastScholarship - scholarshipsPerPage;
  const currentScholarships = filteredScholarships.slice(indexOfFirstScholarship, indexOfLastScholarship);

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredScholarships.length / scholarshipsPerPage);

  // Handle scholarship actions (edit, hide, unhide) same as before...

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <HeaderHome />
      <AdminHeader />
      <div className="flex flex-row">
        <div className="bg-white w-1/8 p-4">
          <Sidebar />
        </div>
        <div className="bg-white shadow-md flex-1 w-1/8">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">จัดการทุนการศึกษาภายในมหาวิทยาลัย</h2>
            <button
              onClick={() => router.push('Manage-internal-scholarships/create')}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-6"
            >
              + เพิ่ม
            </button>

            {/* Search input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="ค้นหาทุนการศึกษา..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            {/* Scholarship table */}
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-2">ลำดับที่</th>
                  <th className="border border-gray-300 p-2">ชื่อทุนการศึกษา</th>
                  <th className="border border-gray-300 p-2">รายละเอียด</th>
                  <th className="border border-gray-300 p-2">สถานะ</th>
                  <th className="border border-gray-300 p-2">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {currentScholarships.map((scholarship, index) => (
                  <tr
                    key={scholarship.ScholarshipID}
                    className={`hover:bg-gray-100 ${scholarship.status === 'hidden' ? 'bg-gray-200 text-gray-500 italic' : ''}`}
                  >
                    <td className="border border-gray-300 p-2 text-center">{indexOfFirstScholarship + index + 1}</td>
                    <td className="border border-gray-300 p-2">{scholarship.ScholarshipName}</td>
                    <td className="border border-gray-300 p-2">
                      ปีการศึกษา: {scholarship.Year} <br />
                      เกรด: {scholarship.Minimum_GPA} <br />
                      ชั้นปี: {scholarship.YearLevel} <br />
                      หลักสูตรที่สมัครได้: {scholarship.courses.map(course => course.CourseName).join(', ')} <br />
                      คุณสมบัติ:
                      {scholarship.qualifications.map((qualification) => qualification.QualificationText)}
                      <br />
                      เอกสารประกอบการขอทุน: {scholarship.documents.map(document => document.DocumentText).join(', ')}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      {scholarship.status === 'hidden' ? (
                        'ซ่อนไว้'
                      ) : new Date(scholarship.EndDate) < new Date() ? (
                        'ปิดรับ'
                      ) : (
                        'เปิดรับอยู่'
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <button onClick={() => handleEdit(scholarship.ScholarshipID)} className="mr-2">✏️</button>
                      {scholarship.status === 'hidden' ? (
                        <button onClick={() => handleUnhide(scholarship.ScholarshipID.toString())} className="mr-2">👁️</button>
                      ) : (
                        <button onClick={() => handleHide(scholarship.ScholarshipID.toString())}>🚫</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination buttons */}
            <div className="mt-4 flex justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={`px-4 py-2 mx-1 border ${currentPage === pageNumber ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'} rounded-lg`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
