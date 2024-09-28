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
    const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [studentsPerPage] = useState<number>(8); // Students per page
    const [loading, setLoading] = useState(true); // Loading state
    const [length, setLength] = useState<number>(0);
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
                setStudents(response);
                setFilteredStudents(response); // Initialize filtered students
                setLength(response.length);
            } catch (error) {
                console.error("Failed to fetch students", error);
            } finally {
                setLoading(false); // Stop loading after data is fetched
            }
        };

        fetchStudents();
    }, []);

    // Handle search input change
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value;
        setSearchTerm(searchValue);

        const filtered = students.filter((student) =>
            `${student.FirstName} ${student.LastName}`.toLowerCase().includes(searchValue.toLowerCase())
        );
        setFilteredStudents(filtered);
        setCurrentPage(1); // Reset to the first page after search
    };

    // Pagination calculation
    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

    // Handle page change
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

    const handleViewDetails = (studentId: string) => {
        router.push(`/page/student-data/${studentId}`);
    };

    const calculateAcademicYear = (yearEntry: number | null) => {
        if (yearEntry === null) return 'N/A';
        const currentYear = new Date().getFullYear();
        const entryYear = yearEntry - 543; // Convert from Thai year to Gregorian year
        const yearDifference = currentYear - entryYear;

        if (yearDifference === 0) return 'ปี 1';
        if (yearDifference === 1) return 'ปี 2';
        if (yearDifference === 2) return 'ปี 3';
        if (yearDifference === 3) return 'ปี 4';
        if (yearDifference === 4) return 'ปี 5';

        return 'จบการศึกษาแล้ว'; // For years more than 4
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
                <div className="bg-white flex-1 w-7/8">
                    <div className="bg-white rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-6">ข้อมูลนักศึกษา</h2>
                        <h2>จำนวนนิสิตทั้งหมด {length} </h2>

                        {/* Search input */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="ค้นหานิสิต..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>

                        {/* Student table */}
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
                                {currentStudents.map((student, index) => (
                                    <tr key={student.StudentID} className="hover:bg-gray-100">
                                        <td className="border border-gray-300 p-2 text-center">{indexOfFirstStudent + index + 1}</td>
                                        <td className="border border-gray-300 p-2">{student.FirstName} {student.LastName}</td>
                                        <td className="border border-gray-300 p-2 text-center">{calculateAcademicYear(student?.Year_Entry)}</td>
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

                        {/* Pagination */}
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
