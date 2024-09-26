'use client';

import { useEffect, useState } from "react";
import HeaderHome from "@/app/components/headerHome/headerHome";
import AdminHeader from "@/app/components/headerAdmin/headerAdmin";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import Footer from "@/app/components/footer/footer";
import { useRouter } from "next/navigation";
import ApiServiceScholarships from "@/app/services/scholarships/ApiScholarShips";
import Header from "@/app/components/header/Header";

interface ScholarshipData {
    ScholarshipID: string;
    ScholarshipName: string;
    Description: string;
}

export default function AnnouncementOfScholarships() {
    const [scholarships, setScholarships] = useState<ScholarshipData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentYear, setCurrentYear] = useState<number>(0);
    const router = useRouter();

    useEffect(() => {
        // Calculate current year in Buddhist calendar
        const currentYearInBuddhistCalendar = new Date().getFullYear() + 543;
        setCurrentYear(currentYearInBuddhistCalendar);
    }, []);

    useEffect(() => {
        const fetchScholarships = async () => {
            try {
                const response = await ApiServiceScholarships.getAllScholarships();
                const scholarshipsWithTypeID1 = response.data;
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
        router.push(`/page/results-announcement/${scholarshipId}`);
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
            <div className="bg-white flex flex-col flex-1 p-6 bg-gray-100 items-center">
                {/* Add the current Buddhist year (พ.ศ.) dynamically */}
                <h2 className="text-3xl font-semibold text-blue-700 mb-4">
                    ประกาศผลทุนการศึกษา {currentYear}
                </h2>
                <div className="space-y-4 w-full max-w-2xl">
                    {scholarships.map((scholarship) => (
                        <div
                            key={scholarship.ScholarshipID}
                            className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition"
                            onClick={() => handleRowClick(scholarship.ScholarshipID)}
                        >
                            <p className="text-lg font-medium text-gray-900">{scholarship.ScholarshipName}</p>
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
}
