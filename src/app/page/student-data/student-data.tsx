'use client';

import { useEffect, useState } from "react";
import HeaderHome from "@/app/components/headerHome/headerHome";
import AdminHeader from "@/app/components/headerAdmin/headerAdmin";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import Footer from "@/app/components/footer/footer";
import { useRouter } from "next/navigation";
import ApiStudentServices from "@/app/services/students/ApiStudent";

interface StudentData {
    StudentID: string;
    FirstName: string;
    LastName: string;
    Year_Entry: number;
    Course: string;
}

export default function StudentDataPage() {
    const [students, setStudents] = useState<StudentData[]>([]);
    const [length, setlength] = useState<string>('');
    const [loading, setLoading] = useState(true);  // Loading state
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
        const fetchStudents = async () => {
            try {
                const response = await ApiStudentServices.getAllStudents();
                console.log("Full API response:", response); // Check full API response
                setStudents(response);
                const  length = response.length
                setlength(length)
                 
            } catch (error) {
                console.error("Failed to fetch students", error);
            } finally {
                setLoading(false);  // Stop loading after data is fetched
            }
        };

        fetchStudents();
    }, []);

    const handleViewDetails = (studentId: string) => {
        router.push(`/page/student-data/${studentId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div>
                <p className="ml-4 text-gray-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <HeaderHome />
            <AdminHeader />
            <div className="flex flex-row">
                <div className="bg-white w-1/8 p-4">
                    <Sidebar />
                </div>
                <div className="bg-white  flex-1 w-7/8">
                    <div className="bg-white rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-6">ข้อมูลนักศึกษา</h2>
                        <h2>จำนวนนิสิตทั้งหมด {length} </h2>
                        <table className="w-full table-auto border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-300 p-2">ลำดับที่</th>
                                    <th className="border border-gray-300 p-2">ชื่อ-สกุล</th>
                                    <th className="border border-gray-300 p-2">ชั้นปี</th>
                                    <th className="border border-gray-300 p-2">สาขา</th>
                                    <th className="border border-gray-300 p-2">การดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => (
                                    <tr key={student.StudentID} className="hover:bg-gray-100">
                                        <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                                        <td className="border border-gray-300 p-2">{student.FirstName} {student.LastName}</td>
                                        <td className="border border-gray-300 p-2 text-center">
                                            {new Date().getFullYear() - student.Year_Entry }
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center">{student.Course}</td>
                                        <td className="border border-gray-300 p-2 text-center">
                                            <button
                                                onClick={() => handleViewDetails(student.StudentID)}
                                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                            >
                                                ดูรายละเอียด
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
