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
    Year: string;
}

export default function InternalApplicationDataPage() {
    const [scholarships, setScholarships] = useState<ScholarshipData[]>([]);
    const [filteredScholarships, setFilteredScholarships] = useState<ScholarshipData[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>(""); // State for search input
    const [currentPage, setCurrentPage] = useState<number>(1); // State for current page
    const scholarshipsPerPage = 10; // Number of scholarships per page
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
                const scholarshipsWithTypeID1 = response.data.filter((scholarship: any) => scholarship.TypeID === 1);
                setScholarships(scholarshipsWithTypeID1);
                setFilteredScholarships(scholarshipsWithTypeID1); // Set filtered scholarships initially
            } catch (error) {
                console.error("Failed to fetch scholarships", error);
            }
        };

        fetchScholarships();
    }, []);

    const handleRowClick = (scholarshipId: string) => {
        router.push(`/page/internal-application-data/scholarship-details/${scholarshipId}`);
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

    if (!scholarships.length) {
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
                        <h2 className="text-2xl font-semibold mb-6">ข้อมูลการสมัครทุนภายในมหาวิทยาลัย</h2>

                        {/* Search input */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="ค้นหาทุนการศึกษา..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>

                        {/* Scholarship table */}
                        <table className="w-full table-auto border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-300 p-2">ลำดับที่</th>
                                    <th className="border border-gray-300 p-2">ชื่อทุนการศึกษา</th>
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
