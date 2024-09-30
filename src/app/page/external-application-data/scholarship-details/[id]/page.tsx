'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import HeaderHome from '@/app/components/headerHome/headerHome';
import AdminHeader from '@/app/components/headerAdmin/headerAdmin';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import Footer from '@/app/components/footer/footer';
import ApiApplicationInternalServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationInternalServices';
import ApiApplicationExternalServices from '@/app/services/ApiApplicationExternalServices/ApiApplicationExternalServices';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesomeIcon
import { faEye } from "@fortawesome/free-solid-svg-icons"; // Import the eye icon

interface StudentData {
    StudentID: string;
    FirstName: string;
    LastName: string;
    Year_Entry: number | null;
    Course: string;
}

interface Scholarship {
    ScholarshipId: string;
    ScholarshipName: string;
}

interface Application {
    Scholarship: Scholarship;
    student: StudentData;
}

export default function ScholarshipInternalDetailsPage() {
    const router = useRouter();
    const { id } = useParams(); // Ensure id is a string

    const [applications, setApplications] = useState<Application[]>([]);
    const [scholarshipName, setScholarshipName] = useState<string>(''); 
    const [loading, setLoading] = useState(true);

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
        const fetchScholarshipDetails = async () => {
            try {
                const scholarshipId = Array.isArray(id) ? id[0] : id;
                if (scholarshipId) {
                    const response = await ApiApplicationExternalServices.getStudentsByScholarshipId(scholarshipId);
                  
    
                    // กรองข้อมูลตาม Status ที่ต้องการ
                    const filteredResponse = response.filter((app: { Status: string; }) => app.Status === 'รอประกาศผล');
    
                    if (filteredResponse && filteredResponse.length > 0) {
                        setApplications(filteredResponse);
                        const scholarshipname = filteredResponse[0].scholarship.ScholarshipName || 'Unknown';
                     
                        
                        setScholarshipName(scholarshipname);
                    } else {
                        console.warn('No data found with status "รอประกาศผล".');
                    }
                }
            } catch (error) {
                console.error("Failed to fetch scholarship details", error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchScholarshipDetails();
    }, [id]);
    

    const handleRowClick = (scholarshipId: string, studentId: string) => {
        router.push(`/page/external-application-data/user-details/${scholarshipId}?scholarshipId=${studentId}`);
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

    if (!applications || applications.length === 0) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-100">
                            <HeaderHome />
                            <AdminHeader />
                            <div className="flex flex-row">
                            <div className="bg-white w-1/8 p-4">
                    <Sidebar />
                </div>
                <p className="text-gray-600">ไม่มีข้อมูล</p>
                            </div>
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
                <div className="bg-white flex-1 w-7/8 p-6">
                    <h2 className="text-2xl font-semibold mb-6">
                        รายชื่อนิสิต {scholarshipName || 'No Scholarship Name Available'}
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-300 p-2">ลำดับที่</th>
                                    <th className="border border-gray-300 p-2"> รหัสนิสิต </th>
                                    <th className="border border-gray-300 p-2">ชื่อ-สกุล</th>
                                    <th className="border border-gray-300 p-2">ชั้นปี</th>
                                    <th className="border border-gray-300 p-2">สาขา</th>
                                    <th className="border border-gray-300 p-2">ดูรายละเอียด</th> {/* New column for eye icon */}
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app, index) => {
                                    const student = app.student;
                                    const scholarshipId = Array.isArray(id) ? id[0] : id;

                                    return (
                                        <tr key={`${student.StudentID}-${index}`} className="hover:bg-gray-100">
                                            <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                                            <td className="border border-gray-300 p-2  text-center">
                                               {student?.StudentID}
                                            </td>
                                            <td className="border border-gray-300 p-2  text-center">
                                                {student?.FirstName} {student?.LastName}
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                {calculateAcademicYear(student?.Year_Entry)}
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center">{student?.Course}</td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                {/* Eye Icon to trigger row click */}
                                                <FontAwesomeIcon
                                                    icon={faEye}
                                                    className="text-blue-500 cursor-pointer"
                                                    onClick={() => handleRowClick(student.StudentID, scholarshipId)}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
