'use client';

import { useEffect, useState } from "react";
import HeaderHome from "@/app/components/headerHome/headerHome";
import AdminHeader from "@/app/components/headerAdmin/headerAdmin";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import Footer from "@/app/components/footer/footer";
import { useRouter } from "next/navigation";
import ApiServiceScholarships from "@/app/services/scholarships/ApiScholarShips";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Swal from "sweetalert2";

dayjs.extend(utc);
dayjs.extend(timezone);

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

    useEffect(() => {
        const fetchScholarships = async () => {
            try {
                const response = await ApiServiceScholarships.getAllScholarships();
                console.log("Full API response:", response.data); // Check full API response
                const typeTwoScholarships = response.data.filter((scholarship: { TypeID: number; }) => scholarship.TypeID === 2);
                console.log("Filtered scholarships (TypeID 1):", typeTwoScholarships); // Log filtered data
                setScholarships(typeTwoScholarships);
            } catch (error) {
                console.error("Failed to fetch scholarships", error);
            }
        };

        fetchScholarships();
    }, []);

    const handleEdit = (id: number) => {
        router.push(`/page/scholarships/Manage-internal-scholarships/Edit?id=${id}`);
    };

    const handleDelete = async (id: number) => {
        Swal.fire({
            title: 'ต้องการลบข้อมูลหรือไม่?',
            text: "",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ใช่',
            cancelButtonText: 'ไม่',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await ApiServiceScholarships.deleteScholarship(id);
                    Swal.fire({
                        title: "Deleted!",
                        text: "Scholarship has been deleted.",
                        icon: "success",
                        timer: 2000,
                    });
                    // Optionally, refresh the list of scholarships after deletion
                    setScholarships(prevScholarships => prevScholarships.filter(scholarship => scholarship.ScholarshipID !== id));
                } catch (error) {
                    Swal.fire({
                        title: "Failed!",
                        text: "ลบข้อมูลเรียบร้อย.",
                        icon: "error",
                    });
                    console.error("Failed to delete scholarship:", error);
                }
            }
        });
    };

    const isScholarshipOpen = (startDate: Date, endDate: Date): boolean => {
        const now = dayjs().tz('Asia/Bangkok');
        const start = dayjs(startDate).tz('Asia/Bangkok');
        const end = dayjs(endDate).tz('Asia/Bangkok');

        return now.isAfter(start) && now.isBefore(end);
    };

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
                        <h2 className="text-2xl font-semibold mb-6">จัดการทุนการศึกษาภายนอกมหาวิทยาลัย</h2>
                        <button
                            onClick={() => router.push('Manage-external-scholarships/create')}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-6"
                        >
                            + เพิ่ม
                        </button>
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
                                {scholarships.map((scholarship, index) => (
                                    <tr key={scholarship.ScholarshipID} className="hover:bg-gray-100">
                                        <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                                        <td className="border border-gray-300 p-2">{scholarship.ScholarshipName}</td>
                                        <td className="border border-gray-300 p-2">
                                            {scholarship.courses.map(course => course.CourseName).join(', ')}
                                            ชั้นปี: {scholarship.YearLevel} เกรด: {scholarship.Minimum_GPA}
                                            <br />
                                            คุณสมบัติ: {scholarship.qualifications.map(qualification => qualification.QualificationText).join(', ')}
                                            <br />
                                            เอกสารประกอบการขอทุน: {scholarship.documents.map(document => document.DocumentText).join(', ')}
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center">
                                            {isScholarshipOpen(scholarship.StartDate, scholarship.EndDate) ? 'เปิดรับอยู่' : 'ปิดรับแล้ว'}
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center">
                                            <button onClick={() => handleEdit(scholarship.ScholarshipID)} className="mr-2">
                                                ✏️
                                            </button>
                                            <button onClick={() => handleDelete(scholarship.ScholarshipID)}>
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
