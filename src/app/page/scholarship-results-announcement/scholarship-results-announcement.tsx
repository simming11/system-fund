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
  AnnouncementFile?: string | null;
  StartDate: string;
  EndDate: string;
  Year: string;
}

export default function ApplicationDataPage() {
  const [scholarships, setScholarships] = useState<ScholarshipData[]>([]);
  const [filteredScholarships, setFilteredScholarships] = useState<ScholarshipData[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>(''); // Search term state
  const [currentPage, setCurrentPage] = useState<number>(1); // Current page state
  const scholarshipsPerPage = 10; // Scholarships per page
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
        const scholarshipsWithTypeID1: ScholarshipData[] = response.data;
        setScholarships(scholarshipsWithTypeID1);
        setFilteredScholarships(scholarshipsWithTypeID1);

        const years = [...new Set(scholarshipsWithTypeID1.map((scholarship: ScholarshipData) => scholarship.Year))];
        setAvailableYears(years.sort().reverse());
      } catch (error) {
        console.error("Failed to fetch scholarships", error);
      }
    };

    fetchScholarships();
  }, []);

  const handleRowClick = (scholarshipId: string) => {
    router.push(`/page/scholarship-results-announcement/${scholarshipId}`);
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    setSelectedYear(selected);

    if (selected === "") {
      setFilteredScholarships(scholarships);
    } else {
      const filtered = scholarships.filter(scholarship => scholarship.Year == selected);
      setFilteredScholarships(filtered);
      setCurrentPage(1);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filtered = scholarships.filter(scholarship =>
      scholarship.ScholarshipName.toLowerCase().includes(searchValue)
    );
    setFilteredScholarships(filtered);
    setCurrentPage(1); // Reset to the first page after search
  };

  const canAnnounce = (endDate: string): boolean => {
    const currentDate = new Date();
    const end = new Date(endDate);
    return currentDate >= end;
  };

  // Pagination logic
  const indexOfLastScholarship = currentPage * scholarshipsPerPage;
  const indexOfFirstScholarship = indexOfLastScholarship - scholarshipsPerPage;
  const currentScholarships = filteredScholarships.slice(indexOfFirstScholarship, indexOfLastScholarship);

  const totalPages = Math.ceil(filteredScholarships.length / scholarshipsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <HeaderHome />
      <AdminHeader />
      <div className="flex flex-row">
        <div className="bg-white w-1/8 p-4">
          <Sidebar />
        </div>
        <div className="bg-white flex-1 w-7/8 p-6">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">ประกาศทุนการศึกษา</h2>

{/* Dropdown and Search input on the same row */}
<div className="mb-4 flex items-center space-x-4">
  {/* Dropdown for selecting year */}
  <div className="flex-shrink-0">
    <label htmlFor="year" className="block text-gray-700 mb-2">เลือกปีการศึกษา:</label>
    <select
      id="year"
      value={selectedYear}
      onChange={handleYearChange}
      className="border border-gray-300 p-2 rounded"
    >
      <option value="">ทั้งหมด</option>
      {availableYears.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  </div>

  {/* Search input */}
  <div className="flex-1">
    <label htmlFor="search" className="block text-gray-700 mb-2">ค้นหาทุนการศึกษา:</label>
    <input
      id="search"
      type="text"
      placeholder="ค้นหาทุนการศึกษา..."
      value={searchTerm}
      onChange={handleSearch}
      className="w-full p-2 border border-gray-300 rounded"
    />
  </div>
</div>

            {/* Scholarship table */}
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-2">ลำดับที่</th>
                  <th className="border border-gray-300 p-2">ชื่อทุนการศึกษา</th>
                  <th className="border border-gray-300 p-2">สถานะ</th>
                  <th className="border border-gray-300 p-2">รายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                {currentScholarships
                  .sort((a, b) => (a.AnnouncementFile ? 1 : -1))
                  .map((scholarship, index) => (
                    <tr key={scholarship.ScholarshipID} className="hover:bg-gray-100 cursor-pointer">
                      <td className="border border-gray-300 p-2 text-center">{indexOfFirstScholarship + index + 1}</td>
                      <td className="border border-gray-300 p-2 text-center">
                        {scholarship.ScholarshipName} ปีการศึกษา {scholarship.Year}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {scholarship.AnnouncementFile ? "ประกาศผลแล้ว" : "ยังไม่ประกาศผล"}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {!canAnnounce(scholarship.EndDate) ? (
                          <span className="text-red-500">ไม่สามารถประกาศผลได้เนื่องจากยังไม่ปิดรับสมัคร</span>
                        ) : (
                          <button
                            onClick={() => {
                              if (!scholarship.AnnouncementFile) {
                                handleRowClick(scholarship.ScholarshipID);
                              }
                            }}
                            className={`text-blue-500 hover:text-blue-700 ${scholarship.AnnouncementFile ? 'cursor-not-allowed opacity-50' : ''}`}
                            disabled={!!scholarship.AnnouncementFile}
                          >
                            <FontAwesomeIcon icon={faEye} size="lg" />
                          </button>
                        )}
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
