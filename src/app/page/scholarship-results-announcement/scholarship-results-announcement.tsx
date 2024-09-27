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
    StartDate: string; // Assuming StartDate is a string in Thai Buddhist calendar format
    EndDate: string;   // Assuming EndDate is a string in Thai Buddhist calendar format
    Year: string;
}

export default function ApplicationDataPage() {
    const [scholarships, setScholarships] = useState<ScholarshipData[]>([]); // Define scholarship state with ScholarshipData[]
    const [filteredScholarships, setFilteredScholarships] = useState<ScholarshipData[]>([]); // Same here for filtering
    const [availableYears, setAvailableYears] = useState<string[]>([]); // Expect string[]
    const [selectedYear, setSelectedYear] = useState<string>(''); // State for selected year
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
                const scholarshipsWithTypeID1: ScholarshipData[] = response.data; // Explicitly define the type

                setScholarships(scholarshipsWithTypeID1); // Set scholarships with correct type
                setFilteredScholarships(scholarshipsWithTypeID1); // Initially show all scholarships

                // Extract unique years from the scholarships
                const years = [...new Set(scholarshipsWithTypeID1.map((scholarship: ScholarshipData) => scholarship.Year))];
                setAvailableYears(years.sort().reverse()); // Sort years in descending order

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

    const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = event.target.value;
        setSelectedYear(selected);

        // If "ทั้งหมด" is selected, show all scholarships
        if (selected === "") {
            setFilteredScholarships(scholarships); // Show all scholarships if no year is selected
        } else {
            // Otherwise, filter by the selected year
            const filtered = scholarships.filter(scholarship => scholarship.Year == selected);
            setFilteredScholarships(filtered);
        }
    };

    // Function to check if the current date is after the EndDate
    const canAnnounce = (endDate: string): boolean => {
        const currentDate = new Date();
        const end = new Date(endDate);
        return currentDate >= end; // true if current date is after or equal to EndDate
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
                <div className="bg-white flex-1 w-7/8 p-6">
                    <div className="bg-white rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-6">ประกาศทุนการศึกษา</h2>

                        {/* Dropdown for selecting year */}
                        <div className="mb-4">
                            <label htmlFor="year" className="block text-gray-700 mb-2">เลือกปีการศึกษา:</label>
                            <select
                                id="year"
                                value={selectedYear}
                                onChange={handleYearChange}
                                className="border border-gray-300 p-2 rounded"
                            >
                                <option value="">ทั้งหมด</option> {/* Option to display all years */}
                                {availableYears.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <table className="w-full table-auto border-collapse border border-gray-300">
  <thead>
    <tr className="bg-gray-200">
      <th className="border border-gray-300 p-2">ลำดับที่</th> {/* Add column for row number */}
      <th className="border border-gray-300 p-2">ชื่อทุนการศึกษา</th>
      <th className="border border-gray-300 p-2">สถานะ</th>
      <th className="border border-gray-300 p-2">รายละเอียด</th>
    </tr>
  </thead>
  <tbody>
    {filteredScholarships
      .sort((a, b) => (a.AnnouncementFile ? 1 : -1)) // Sort so that scholarships without AnnouncementFile come first
      .map((scholarship, index) => (
        <tr key={scholarship.ScholarshipID} className="hover:bg-gray-100 cursor-pointer">
          <td className="border border-gray-300 p-2 text-center">{index + 1}</td> {/* Add row number */}
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

                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
