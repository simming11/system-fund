'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import HeaderHome from '@/app/components/headerHome/headerHome';
import Footer from '@/app/components/footer/footer';
import Header from '@/app/components/header/Header';
import ApiApplicationInternalServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationInternalServices';
import ApiApplicationExternalServices from '@/app/services/ApiApplicationExternalServices/ApiApplicationExternalServices';
import ApiServiceScholarships from '@/app/services/scholarships/ApiScholarShips';

interface StudentData {
    StudentID: string;
    FirstName: string;
    LastName: string;
    Status: string;
}

interface Scholarship {
    ScholarshipID: string;
    ScholarshipName: string;
    AnnouncementFile: string;
}

interface Application {
    Scholarship: Scholarship;
    student: StudentData;
    Status: string;
}

export default function ResultsAnnouncementPage() {
    const router = useRouter();
    const { id } = useParams();
    const [applications, setApplications] = useState<Application[]>([]);
    const [scholarshipName, setScholarshipName] = useState<string>('');
    const [scholarship, setScholarship] = useState<Scholarship | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasApprovedApplications, setHasApprovedApplications] = useState(false);

    useEffect(() => {
        const fetchScholarshipDetails = async () => {
            try {
                const scholarshipId = Array.isArray(id) ? id[0] : id;
                if (scholarshipId) {
                    console.log(`Fetching data for ScholarshipID: ${scholarshipId}`);
                    let response = await ApiApplicationInternalServices.getStudentsByScholarshipId(scholarshipId);

                    if (!response || response.length === 0) {
                        console.log('No data found in Internal API, fetching from External API.');
                        response = await ApiApplicationExternalServices.getStudentsByScholarshipId(scholarshipId);
                    }

                    if (response && response.length > 0) {
                        console.log('All fetched applications:', response);
                        const filteredApplications = response.filter((app: Application) => app.Status === 'ได้รับทุน');

                        console.log('Filtered applications with status "อนุมัติ":', filteredApplications);
                        setApplications(filteredApplications);

                        if (filteredApplications.length) {
                            setHasApprovedApplications(true);
                        }

                        const scholarshipname = response[0].scholarship.ScholarshipName || 'Unknown';
                        console.log(scholarshipname);

                        setScholarshipName(scholarshipname);
                        setScholarship(response[0].scholarship); // Set scholarship data
                    } else {
                        console.warn('No data found from both APIs.');
                    }
                } else {
                    console.warn('No ScholarshipID found.');
                }
            } catch (error) {
                console.error("Failed to fetch scholarship details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchScholarshipDetails();
    }, [id]);


    const handleDownload = async () => {
        try {
            if (scholarship) {
                const response = await ApiServiceScholarships.downloadAnnouncementFile(scholarship.ScholarshipID);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;

                const contentDisposition = response.headers['content-disposition'];
                let fileName = 'file.pdf';
                if (contentDisposition) {
                    const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
                    if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1];
                }

                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Failed to download file:', error);
        }
    };

    const handleBackClick = () => {
        router.back(); // Navigate back to the previous page
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
        <div className="bg-white min-h-screen flex flex-col bg-gray-100">
            <HeaderHome />
            <Header />
            <div className="flex flex-col items-center p-6">
                <h2 className="text-3xl font-semibold text-blue-700 mb-4">ประกาศผลทุนการศึกษา</h2>
                <div className=" bg-gray-50 shadow-md rounded-lg p-6 w-full max-w-3xl">
                    <h3 className="text-lg font-semibold mb-4">{scholarshipName}</h3>

                    {hasApprovedApplications ? (
                        <>
                            <p className="mb-4">ขอแสดงความยินดีกับนิสิตที่ได้รับทุนดังต่อไปนี้:</p>
                            <ul className="list-disc list-inside space-y-2">
                                {applications.map((app, index) => (
                                    <li key={index} className="text-gray-700">
                                        {app.student.FirstName} {app.student.LastName}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p className="text-gray-600">ยังไม่ประกาศ</p> // Message for no approved applications
                    )}

                    <div className="mt-4">
                        {hasApprovedApplications && scholarship?.AnnouncementFile && (
                            <div className="mt-4">
                                <p className="text-gray-500 text-sm">ดาวน์โหลดประกาศผล:</p>
                                <a
                                    onClick={handleDownload}
                                    className="text-blue-500 underline ml-2 cursor-pointer"
                                >
                                    {scholarship.AnnouncementFile.split('/').pop()}
                                </a>
                            </div>
                        )}

                    </div>
                </div>

                <button
                    onClick={handleBackClick}
                    className="mt-6 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                </button>
            </div>

        </div>
    );
}
