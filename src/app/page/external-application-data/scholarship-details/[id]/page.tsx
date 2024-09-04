'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import HeaderHome from '@/app/components/headerHome/headerHome';
import AdminHeader from '@/app/components/headerAdmin/headerAdmin';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import Footer from '@/app/components/footer/footer';
import ApiApplicationExternalServices from '@/app/services/ApiApplicationExternalServices/ApiApplicationExternalServices';

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

export default function ScholarshipExternalDetailsPage() {
    const router = useRouter();
    const { id } = useParams();

    const [applications, setApplications] = useState<Application[]>([]);
    const [scholarshipName, setScholarshipName] = useState<string>(''); 
    const [loading, setLoading] = useState(true);

    // Ensure the user is authenticated
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

    // Fetch Scholarship details and associated students
    useEffect(() => {
        const fetchScholarshipDetails = async () => {
            try {
                const scholarshipId = Array.isArray(id) ? id[0] : id;
                if (scholarshipId) {
                    const response = await ApiApplicationExternalServices.getStudentsByScholarshipId(scholarshipId);
                    console.log(`API Response:`, response);  // Log the API response
                    setApplications(response);
                    if (response.length > 0) {
                        setScholarshipName(response[0].Scholarship.ScholarshipName);
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

    const handleRowClick = (studentId: string, scholarshipId: string) => {
        router.push(`/page/external-application-data/user-details/${studentId}?scholarshipId=${scholarshipId}`);
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
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">Scholarship not found or no students available.</p>
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
                                    <th className="border border-gray-300 p-2">ชื่อ-สกุล</th>
                                    <th className="border border-gray-300 p-2">ชั้นปี</th>
                                    <th className="border border-gray-300 p-2">สาขา</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app, index) => {
                                    const student = app.student;
                                    const scholarshipId = Array.isArray(id) ? id[0] : id;

                                    const yearDifference = student?.Year_Entry
                                        ? new Date().getFullYear() - student.Year_Entry
                                        : 'N/A';

                                    return (
                                        <tr
                                            key={`${student.StudentID}-${index}`}
                                            className="hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleRowClick(student.StudentID, scholarshipId)}
                                        >
                                            <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                                            <td className="border border-gray-300 p-2">
                                                {student?.FirstName} {student?.LastName}
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                {isNaN(yearDifference as any) ? 'N/A' : yearDifference}
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center">{student?.Course}</td>
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
