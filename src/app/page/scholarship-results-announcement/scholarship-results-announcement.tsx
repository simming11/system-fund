'use client';

import { useEffect, useState } from "react";
import HeaderHome from "@/app/components/headerHome/headerHome";
import AdminHeader from "@/app/components/headerAdmin/headerAdmin";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import Footer from "@/app/components/footer/footer";
import { useRouter } from "next/navigation";
import ApiServiceScholarships from "@/app/services/scholarships/ApiScholarShips";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

interface ScholarshipData {
    ScholarshipID: string;
    ScholarshipName: string;
    Description: string;
    AnnouncementFile?: string | null; // Optional, as it may not exist
}


export default function ApplicationDataPage() {
    const [scholarships, setScholarships] = useState<ScholarshipData[]>([]);
    const [loading, setLoading] = useState(true);
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
                const scholarshipsWithTypeID1 = response.data
                setScholarships(scholarshipsWithTypeID1);
                console.log(scholarshipsWithTypeID1);

            } catch (error) {
                console.error("Failed to fetch scholarships", error);
            } finally {
                setLoading(false);
            }
        };

        fetchScholarships();
    }, []);

    const handleRowClick = (scholarshipId: string) => {
        // Navigate to the details page of the selected scholarship
        router.push(`/page/scholarship-results-announcement/${scholarshipId}`);
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
                        <h2 className="text-2xl font-semibold mb-6">ประกาศทุนการศึกษา</h2>
                        <table className="w-full table-auto border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-300 p-2">ชื่อทุนการศึกษา</th>
                                    <th className="border border-gray-300 p-2">สถานะ</th>
                                    <th className="border border-gray-300 p-2">รายละเอียด</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scholarships.map((scholarship) => (
                                    <tr key={scholarship.ScholarshipID} className="hover:bg-gray-100 cursor-pointer">
                                        <td className="border border-gray-300 p-2 text-center">{scholarship.ScholarshipName}</td>
                                        <td className="border border-gray-300 p-2 text-center">
                                            {scholarship.AnnouncementFile ? "ประกาศแล้ว" : "ยังไม่ประกาศ"}
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center">
                                            <button
                                                onClick={() => {
                                                    if (!scholarship.AnnouncementFile) {
                                                        handleRowClick(scholarship.ScholarshipID);
                                                    }
                                                }}
                                                className={`text-blue-500 hover:text-blue-700 ${scholarship.AnnouncementFile ? 'cursor-not-allowed opacity-50' : ''}`}
                                                disabled={!!scholarship.AnnouncementFile} // Convert to boolean to avoid error
                                            >
                                                <FontAwesomeIcon icon={faEye} size="lg" />
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
