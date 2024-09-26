'use client';
import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from "next/navigation";
import HeaderHome from '@/app/components/headerHome/headerHome';
import AdminHeader from '@/app/components/headerAdmin/headerAdmin';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import Footer from '@/app/components/footer/footer';
import ApiApplicationInternalServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationInternalServices';
import ApiApplicationFileServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationFileServices';
import ApiApplicationExternalServices from '@/app/services/ApiApplicationExternalServices/ApiApplicationExternalServices';

interface StudentData {
    StudentID: string;
    FirstName: string;
    LastName: string;
    Year_Entry: number | null;
    Course: string;
}

interface Scholarship {
    ScholarshipName: string;
}

interface ApplicationFilesData {
    FilesID: string;
    DocumentName: string;
    DocumentType: string;
    FilePath: string | File;
}

interface Application {
    ApplicationID: string
    Scholarship: Scholarship;
    student: StudentData;
    application_files: ApplicationFilesData[];
}

export default function StudentExternalDetailsPage() {
    const router = useRouter();
    const { id } = useParams();
    const studentId: string = Array.isArray(id) ? id[0] : id;
    const searchParams = new URLSearchParams(window.location.search);

    // Extract the `scholarshipId` from the query parameters
    const scholarshipId = searchParams.get('scholarshipId');

    const [application, setApplication] = useState<Application | null>(null);
    const [scholarshipName, setScholarshipName] = useState<string>('');
    const [applicationFilesData, setApplicationFilesData] = useState<ApplicationFilesData[]>([]);
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
    const handleDownloadFile = async (fileId: string, fileName: string) => {
        try {
            await ApiApplicationFileServices.downloadFile(fileId, fileName);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            if (application?.ApplicationID) {
                await ApiApplicationInternalServices.generateApplicationPdf(application.ApplicationID);
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    useEffect(() => {
        const fetchStudentApplicationDetails = async () => {
            try {
                if (scholarshipId && studentId) {
                    console.log('Fetching data for Student ID:', studentId, 'and Scholarship ID:', scholarshipId);
                    const response = await ApiApplicationExternalServices.getStudentByScholarshipIdAndStudentId(scholarshipId, studentId);
                    console.log('API Response:', response);

                    setApplication(response);

                    if (response) {
                        const scholarshipname = response?.scholarship?.ScholarshipName || 'No Scholarship Name Available';
                        setScholarshipName(scholarshipname);

                        const filesData = response?.application_files || [];
                        setApplicationFilesData(filesData);
                    } else {
                        console.warn('No data found in response');
                    }
                } else {
                    console.warn('ScholarshipID or StudentID is missing');
                }
            } catch (error) {
                console.error('Error fetching student application details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentApplicationDetails();
    }, [studentId, scholarshipId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div>
                <p className="ml-4 text-gray-600">Loading...</p>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-100">
                <HeaderHome />
                <AdminHeader />
                <div className="flex flex-row">
                    <div className="bg-white w-1/8 p-4">
                        <Sidebar />
                    </div>
                    <p className="text-gray-600">Scholarship not found or no students available.</p>
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
                    <h2 className="text-2xl font-semibold mb-6">{scholarshipName || 'No Scholarship Name Available'}</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-300 p-2">ชื่อ-สกุล</th>
                                    <th className="border border-gray-300 p-2">ชั้นปี</th>
                                    <th className="border border-gray-300 p-2">สาขา</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-gray-100">
                                    <td className="border border-gray-300 p-2 text-center">
                                        {application.student?.FirstName} {application.student?.LastName}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-center">
                                        {application.student?.Year_Entry
                                            ? (() => {
                                                const currentYear = new Date().getFullYear();
                                                const entryYear = application.student.Year_Entry;

                                                // กำหนดปีที่เข้าสู่ระบบไทย (เช่น 2567 = ปี 1)
                                                const yearDifference = currentYear - (entryYear - 543); // ลบ 543 เพื่อเปลี่ยนจาก พ.ศ. เป็น ค.ศ.

                                                if (yearDifference === 0) return 'ปี 1';
                                                if (yearDifference === 1) return 'ปี 2';
                                                if (yearDifference === 2) return 'ปี 3';
                                                if (yearDifference === 3) return 'ปี 4';
                                                if (yearDifference === 4) return 'ปี 5';

                                                return 'จบการศึกษาแล้ว'; // กรณีปีมากกว่า 4 ปี
                                            })()
                                            : 'N/A'}
                                    </td>

                                    <td className="border border-gray-300 p-2 text-center">{application.student?.Course}</td>
                                </tr>
                            </tbody>
                        </table>

                        {applicationFilesData.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold mb-1">เอกสารอื่นๆ:</h3>
                                <ul className="list-inside text-gray-600">
                                    {applicationFilesData.map((file, index) => (
                                        <li key={index}>
                                            <a
                                                onClick={() => handleDownloadFile(file.FilesID, typeof file.FilePath === 'string' ? file.FilePath.split('/').pop()! : '')}
                                                className="text-blue-500 underline cursor-pointer"
                                            >
                                                {typeof file.FilePath === 'string' ? file.FilePath.split('/').pop() : 'File'}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
