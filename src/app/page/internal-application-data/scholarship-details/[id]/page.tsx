'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import HeaderHome from '@/app/components/headerHome/headerHome';
import AdminHeader from '@/app/components/headerAdmin/headerAdmin';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import Footer from '@/app/components/footer/footer';
import ApiApplicationInternalServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationInternalServices';

interface StudentData {
    StudentID: string;
    FirstName: string;
    LastName: string;
    Year_Entry: number | null; // Allow null for safety
    Course: string;
}

interface Scholarship {
    ScholarshipId: string;  // Add ScholarshipId field
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
    const [scholarshipName, setScholarshipName] = useState<string>(''); // State to hold the scholarship name
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
                    const response = await ApiApplicationInternalServices.getStudentsByScholarshipId(scholarshipId);

                    // Log the entire response to inspect the structure
                    console.log('API Response:', response);




                    if (response && response.length > 0) {
                        setApplications(response);



                        // Log specific parts of the response to check structure
                        console.log('First application data:', response[0]);

                        const scholarshipname = response[0].scholarship?.ScholarshipName || 'Unknown';
                        console.log('Scholarship Name:', scholarshipname);

                        // Extract and store the scholarship name in state
                        setScholarshipName(scholarshipname);
                    } else {
                        console.warn('No data found in response');
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
        router.push(`/page/internal-application-data/user-details/${scholarshipId}?scholarshipId=${studentId}`);
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
                    {/* Display Scholarship Name */}
                    <h2 className="text-2xl font-semibold mb-6 ">
                        รายชื่อนิสิต{scholarshipName || 'No Scholarship Name Available'}
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
                            {applications.map((app, index) => {
                                const student = app.student;

                                // Ensure the ID is a string by checking if it is an array
                                const scholarshipId = Array.isArray(id) ? id[0] : id;

                                const yearDifference = student?.Year_Entry
                                    ? new Date().getFullYear() - student.Year_Entry
                                    : 'N/A';

                                return (
                                    <tr
                                        key={`${student.StudentID}-${index}`} // Use a combination of StudentID and index to ensure uniqueness
                                        className="hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            // Log the student ID to check if it's correctly retrieved
                                            console.log('StudentID:', student.StudentID);

                                            // Log the scholarship ID to check if it's correctly retrieved
                                            console.log('ScholarshipId:', scholarshipId);

                                            if (scholarshipId) {
                                                // Log before triggering handleRowClick to ensure the values are correct
                                                console.log('Calling handleRowClick with:', student.StudentID, scholarshipId);
                                                handleRowClick(student.StudentID, scholarshipId); // Only pass if ScholarshipId exists
                                            } else {
                                                console.warn('ScholarshipId is undefined');
                                            }
                                        }}
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




                        </table>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
