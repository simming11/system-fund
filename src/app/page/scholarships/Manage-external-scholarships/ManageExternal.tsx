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
import axios from "axios";
import { HomeIcon } from "@heroicons/react/16/solid";
import ButtonHome from "@/app/components/buttonHome/buttonHome";

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

export default function ManageExternalScholarshipsPage() {
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

  // Fetch all scholarships function with sorting
  const fetchScholarships = async () => {
    try {
      const response = await ApiServiceScholarships.getAllScholarships();
      const typeOneScholarships = response.data
        .filter((scholarship: Scholarship) => scholarship.TypeID === 2)
        .sort((a: Scholarship, b: Scholarship) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // Sort by created_at descending
      setScholarships(typeOneScholarships);
      setFilteredScholarships(typeOneScholarships); // Initialize filtered scholarships
    } catch (error) {
      console.error("Failed to fetch scholarships", error);
    }
  };

  // Use fetchScholarships in useEffect to load initially
  useEffect(() => {
    fetchScholarships();
  }, []);


  const handleEdit = (id: number) => {
    router.push(`/page/scholarships/Manage-external-scholarships/Edit?id=${id}`);
  };


  const handleClone = async (id: number) => {
    // Show a confirmation dialog before proceeding
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการคัดลอกทุนการศึกษานี้ใช่หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, คัดลอกเลย!',
      cancelButtonText: 'ยกเลิก',
    });

    // If the user confirms, proceed with the clone operation
    if (result.isConfirmed) {
      try {
        const response = await ApiServiceScholarships.cloneScholarship(id);

        // Success SweetAlert
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'คัดลอกทุนการศึกษาเรียบร้อยแล้ว!',
          confirmButtonText: 'OK',
        });

        // After cloning, refetch the scholarships to update the table
        await fetchScholarships(); // Call the function to update the table
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          // SweetAlert for Axios error
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: `Error cloning scholarship: ${error.response?.data?.error || error.message}`,
            confirmButtonText: 'OK',
          });
        } else {
          // SweetAlert for non-Axios errors
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: `Error cloning scholarship: ${String(error)}`,
            confirmButtonText: 'OK',
          });
        }
      }
    } else {
      // If the user cancels, you can log or take any necessary actions here
      console.log("Cloning canceled by user");
    }
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
          <ButtonHome/>
            <h2 className="text-2xl font-semibold mb-6">จัดการทุนการศึกษาที่มาจากภายนอก</h2>
            <div className="mb-4 flex items-center justify-between space-x-4">
              {/* Add Button */}
              <button
                onClick={() => router.push('Manage-external-scholarships/create')}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                + เพิ่ม
              </button>

              {/* Search input */}
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
                    <td className="border border-gray-300 p-2 text-center">{scholarship.ScholarshipName}</td>
                    <td className="border border-gray-300 p-2 ">
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
                      <button onClick={() => handleClone(scholarship.ScholarshipID)} className="mr-2">🔁 คัดลอก</button>
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
