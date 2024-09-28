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
    Year: string;
    AnnouncementFile:string
}

export default function AnnouncementOfScholarships() {
    const [scholarships, setScholarships] = useState<ScholarshipData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentYear, setCurrentYear] = useState<string>(''); // Store as string for easier comparison
    const [availableYears, setAvailableYears] = useState<string[]>([]); // List of available years
    const router = useRouter();

    useEffect(() => {
        // Calculate current year in Buddhist calendar and set as default
        const currentYearInBuddhistCalendar = (new Date().getFullYear() + 543).toString();
        setCurrentYear(currentYearInBuddhistCalendar);
    }, []);

    useEffect(() => {
        const fetchScholarships = async () => {
            try {
                const response = await ApiServiceScholarships.getAllScholarships();
                
                // Explicitly type the response data
                const scholarshipsData: ScholarshipData[] = response.data;
    
                // Extract unique years from the scholarships data
                const years = [...new Set(scholarshipsData.map((scholarship) => scholarship.Year))];
    
                // Type `years` as a string array
                setAvailableYears(years.sort().reverse() as string[]); // Sort years in descending order
                setScholarships(scholarshipsData);
    
                console.log(scholarshipsData);
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

    const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentYear(event.target.value); // Update the selected year
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div>
                <p className="ml-4 text-gray-600">Loading...</p>
            </div>
        );
    }

 // Filter scholarships based on the selected year and presence of AnnouncementFile
 const filteredScholarships = scholarships.filter(
    (scholarship) => scholarship.Year == currentYear && scholarship.AnnouncementFile // Check for AnnouncementFile
);

    return (
        <div className="bg-white min-h-screen flex flex-col bg-gray-100">
            <HeaderHome />
            <Header />
            <div className="bg-white flex flex-col flex-1 p-6 bg-gray-100 items-center">
                <h2 className="text-3xl font-semibold text-blue-700 mb-4">
                    ประกาศผลทุนการศึกษา ปี {currentYear}
                </h2>

                {/* Dropdown for selecting year */}
                <div className="mb-4">
                    <label htmlFor="year-select" className="block mb-2 text-lg font-medium text-gray-700">เลือกปีการศึกษา:</label>
                    <select
                        id="year-select"
                        value={currentYear}
                        onChange={handleYearChange}
                        className="block w-full p-2 border border-gray-300 rounded-lg"
                    >
                        {availableYears.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                {/* List of scholarships for the selected year */}
                <div className="space-y-4 w-full max-w-2xl">
                    {filteredScholarships.map((scholarship) => (
                        <div
                            key={scholarship.ScholarshipID}
                            className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition"
                            onClick={() => handleRowClick(scholarship.ScholarshipID)}
                        >
                            <p className="text-lg font-medium text-gray-900">
                                {scholarship.ScholarshipName} ({scholarship.Year})
                            </p>
                        </div>
                    ))}

                    {/* Display a message if no scholarships are found for the selected year */}
                    {filteredScholarships.length === 0 && (
                        <p className="text-gray-600 text-center">ไม่มีทุนการศึกษาสำหรับปี {currentYear}</p>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
