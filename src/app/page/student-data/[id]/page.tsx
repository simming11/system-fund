'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ApiStudentServices from "@/app/services/students/ApiStudent";
import ApiApplicationInternalServices from "@/app/services/ApiApplicationInternalServices/ApiApplicationInternalServices";
import ApiApplicationExternalServices from "@/app/services/ApiApplicationExternalServices/ApiApplicationExternalServices";
import HeaderHome from "@/app/components/headerHome/headerHome";
import Footer from "@/app/components/footer/footer";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import AdminHeader from "@/app/components/headerAdmin/headerAdmin";

interface ScholarshipHistory {
    ScholarshipName: string;
    Result: string;
}

interface StudentData {
    StudentID: string;
    FirstName: string;
    LastName: string;
    Year_Entry: number;
    Course: string;
    scholarshipHistory?: ScholarshipHistory[];
}


export default function StudentDetailsPage() {
    const [loading, setLoading] = useState(true); // Loading state
    const [student, setStudent] = useState<StudentData | null>(null);
    const { id } = useParams();
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
        const fetchStudentDetails = async () => {
            try {
                const studentId = Array.isArray(id) ? id[0] : id;

                // Fetch student details
                const response = await ApiStudentServices.getStudent(studentId);
                const studentData = response.data;

                // Fetch internal and external applications
                const internalResponse = await ApiApplicationInternalServices.showByStudentId(studentId);
                const externalResponse = await ApiApplicationExternalServices.showByStudent(studentId);

                const combinedApplications = [
                    ...(Array.isArray(internalResponse) ? internalResponse : [internalResponse]),
                    ...(Array.isArray(externalResponse) ? externalResponse : [externalResponse]),
                ];

                // Map applications to scholarship history
                const scholarshipHistory = combinedApplications.map(application => ({
                    ScholarshipName: application.scholarship?.ScholarshipName || "N/A",
                    Result: application.Status || "N/A"
                }));

                // Update student data with scholarship history
                setStudent({
                    ...studentData,
                    scholarshipHistory
                });
            } catch (error) {
                console.error("Failed to fetch student details or applications", error);
                router.push('/error'); // Redirect to an error page if needed
            } finally {
                setLoading(false); // Stop loading once the fetch is complete
            }
        };

        fetchStudentDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div>
                <p className="ml-4 text-gray-600">Loading...</p>
            </div>
        );
    }

    if (!student) {
        return <div>Error loading student data</div>;
    }

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

    return (
        <div className="min-h-screen flex flex-col ">
            <HeaderHome />
            <AdminHeader />
            <div className="flex flex-row">
                <div className="bg-white w-1/8 p-4">
                    <Sidebar />
                </div>
                <div className="bg-white flex-1 container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-6">รายละเอียดนิสิต</h1>
                    <div className="bg-white  rounded-lg p-6">
                        <p className="mb-4">
                            <strong>ชื่อ-สกุล:</strong> {student.FirstName} {student.LastName}
                        </p>
                        <p className="mb-4">
                            <strong>ชั้นปี:</strong> {calculateAcademicYear(student?.Year_Entry)}
                        </p>
                        <p className="mb-4">
                            <strong>สาขา:</strong> {student.Course}
                        </p>
                        <p className="mb-4">
                            <strong>ประวัติการสมัครทุน:</strong>
                        </p>
                        {student.scholarshipHistory && student.scholarshipHistory.length > 0 ? (
                            student.scholarshipHistory.map((scholarship, index) => (
                                <div key={index} className="mb-10 pl-6"> {/* Added 'pl-6' for padding to the left */}
                                    <span className="font-semibold">ชื่อทุน :</span> {scholarship.ScholarshipName} &nbsp;
                                    <span className="font-semibold">ผลประกาศ :</span> {scholarship.Result}
                                </div>
                            ))
                        ) : (
                            <p>ไม่มีข้อมูลประวัติการสมัครทุน</p>
                        )}

                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
