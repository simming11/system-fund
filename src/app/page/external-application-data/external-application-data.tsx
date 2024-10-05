'use client';

import { useEffect, useState } from "react";
import HeaderHome from "@/app/components/headerHome/headerHome";
import AdminHeader from "@/app/components/headerAdmin/headerAdmin";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import Footer from "@/app/components/footer/footer";
import { useRouter } from "next/navigation";
import ApiServiceScholarships from "@/app/services/scholarships/ApiScholarShips";
import ApiApplicationInternalServices from "@/app/services/ApiApplicationInternalServices/ApiApplicationInternalServices"; // Import the service
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import ApiApplicationExternalServices from "@/app/services/ApiApplicationExternalServices/ApiApplicationExternalServices";
import { HomeIcon } from "@heroicons/react/16/solid";
import ButtonHome from "@/app/components/buttonHome/buttonHome";

interface ScholarshipData {
    ScholarshipID: string;
    ScholarshipName: string;
    Description: string;
    Year: string;
    EndDate: string;
    StudentCount?: number; // Add a field for student count
}

export default function InternalApplicationDataPage() {
    const [scholarships, setScholarships] = useState<ScholarshipData[]>([]);
    const [filteredScholarships, setFilteredScholarships] = useState<ScholarshipData[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>(""); // State for search input
    const [currentPage, setCurrentPage] = useState<number>(1); // State for current page
    const [filterMode, setFilterMode] = useState<string>("all"); // Set default filter mode to "all"
    const [selectedYear, setSelectedYear] = useState<string>("all"); // Set default Year filter to "all"
    const [onlyWaiting, setOnlyWaiting] = useState<boolean>(false); // New state to filter scholarships with waiting students
    const scholarshipsPerPage = 10; // Number of scholarships per page
    const [loading, setLoading] = useState<boolean>(true); // Loading state
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
                
                // Filter only scholarships with TypeID === 1
                const scholarshipsWithTypeID1 = response.data.filter((scholarship: any) => scholarship.TypeID === 2);
                
                // Fetch the student count for each scholarship
                const updatedScholarships = await Promise.all(
                    scholarshipsWithTypeID1.map(async (scholarship: ScholarshipData) => {
                        try {
                            const studentResponse = await ApiApplicationExternalServices.getStudentsByScholarshipId(scholarship.ScholarshipID);
                            const filteredResponse = studentResponse.filter((app: { Status: string }) => app.Status === 'รอประกาศผล');
                            scholarship.StudentCount = filteredResponse.length;
                        } catch (error) {
                            console.error(`Failed to fetch student count for scholarship ID: ${scholarship.ScholarshipID}`, error);
                            scholarship.StudentCount = 0; // Default to 0 if error occurs
                        }
                        return scholarship;
                    })
                );
    
                setScholarships(updatedScholarships);
                setFilteredScholarships(updatedScholarships); // Initially set to all scholarships with TypeID 1
            } catch (error) {
                console.error("Failed to fetch scholarships", error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchScholarships();
    }, []);
    

    // Get the list of unique years from the scholarships data
    const getUniqueYears = () => {
        const years = scholarships.map(scholarship => scholarship.Year);
        return ["all", ...new Set(years)]; // Add "all" option for filtering all years
    };

    // Function to filter scholarships based on EndDate, Year, filterMode, and waiting students filter
    const filterScholarships = () => {
        const currentDate = new Date();

        const filtered = scholarships.filter((scholarship) => {
            const endDate = new Date(scholarship.EndDate);

            // Apply year filter if a specific year is selected
            const yearFilter = selectedYear === "all" || scholarship.Year === selectedYear;

            // Apply status filter based on "open" or "closed"
            const statusFilter = filterMode === "open" 
                ? endDate >= currentDate 
                : filterMode === "closed" 
                ? endDate < currentDate 
                : true;

            // Apply onlyWaiting filter to include scholarships with students waiting for results
            const waitingFilter = onlyWaiting ? scholarship.StudentCount && scholarship.StudentCount > 0 : true;

            return yearFilter && statusFilter && waitingFilter;
        });

        setFilteredScholarships(filtered);
        setCurrentPage(1); // Reset to the first page after filtering
    };

    // Call filterScholarships when the filterMode, selectedYear, or onlyWaiting changes
    useEffect(() => {
        filterScholarships();
    }, [filterMode, selectedYear, onlyWaiting, scholarships]);

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        setSelectedYear(selected);
    };

    const handleFilterModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        setFilterMode(selected);
    };

    const handleOnlyWaitingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOnlyWaiting(e.target.checked); // Set the checkbox state
    };

    const handleRowClick = (scholarshipId: string) => {
        router.push(`/page/external-application-data/scholarship-details/${scholarshipId}`);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value.toLowerCase();
        setSearchTerm(searchValue);

        const filtered = scholarships.filter((scholarship) =>
            scholarship.ScholarshipName.toLowerCase().includes(searchValue)
        );
        setFilteredScholarships(filtered);
        setCurrentPage(1); // Reset to the first page after search
    };

    // Pagination logic
    const indexOfLastScholarship = currentPage * scholarshipsPerPage;
    const indexOfFirstScholarship = indexOfLastScholarship - scholarshipsPerPage;
    const currentScholarships = filteredScholarships.slice(indexOfFirstScholarship, indexOfLastScholarship);

    const totalPages = Math.ceil(filteredScholarships.length / scholarshipsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
                    <ButtonHome/>
                        <h2 className="text-2xl font-semibold mb-6">ข้อมูลการสมัครทุนภายนอกมหาวิทยาลัย</h2>

                        <div className="flex justify-between items-center mb-4 space-x-4">
                            {/* Filter by year */}
                            <select
                                value={selectedYear}
                                onChange={handleYearChange}
                                className="p-2 border border-gray-300 rounded w-1/4"
                            >
                                {getUniqueYears().map((year) => (
                                    <option key={year} value={year}>
                                        {year === "all" ? "ทุนการศึกษาทุกปี" : `ปีการศึกษา ${year}`}
                                    </option>
                                ))}
                            </select>

                            {/* Filter by open, closed, or all */}
                            <select
                                value={filterMode}
                                onChange={handleFilterModeChange}
                                className="p-2 border border-gray-300 rounded w-1/4"
                            >
                                <option value="open">ทุนการศึกษาที่เปิดรับ</option>
                                <option value="closed">ทุนการศึกษาที่ปิดรับ</option>
                                <option value="all">ทุนการศึกษาทั้งหมด</option>
                            </select>

                            {/* Filter for scholarships with students waiting for results */}
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={onlyWaiting}
                                    onChange={handleOnlyWaitingChange}
                                />
                                <span>เฉพาะทุนที่นิสิตรอประกาศผล</span>
                            </label>

                            {/* Search input */}
                            <input
                                type="text"
                                placeholder="ค้นหาทุนการศึกษา..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="p-2 border border-gray-300 rounded w-1/4"
                            />
                        </div>

                        {/* Scholarship table */}
                        <table className="w-full table-auto border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-300 p-2">ลำดับที่</th>
                                    <th className="border border-gray-300 p-2">ชื่อทุนการศึกษา</th>
                                    <th className="border border-gray-300 p-2">นิสิตที่รอประกาศผล</th>
                                    <th className="border border-gray-300 p-2">ดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentScholarships.map((scholarship, index) => (
                                    <tr key={scholarship.ScholarshipID} className="hover:bg-gray-100 cursor-pointer">
                                        <td className="border border-gray-300 p-2 text-center">{indexOfFirstScholarship + index + 1}</td>
                                        <td className="border border-gray-300 p-2 text-center">
                                            {scholarship.ScholarshipName} {scholarship.Year}
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center">
                                            {scholarship.StudentCount} คน
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center">
                                            <button
                                                onClick={() => handleRowClick(scholarship.ScholarshipID)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <FontAwesomeIcon icon={faEye} size="lg" />
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
