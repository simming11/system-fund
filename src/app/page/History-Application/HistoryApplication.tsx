"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/app/components/header/Header';
import Footer from '@/app/components/footer/footer';
import ApiApplicationInternalServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationInternalServices';
import HeaderHome from '@/app/components/headerHome/headerHome';

interface Application {
  ApplicationID: string;
  Status: string;
  AdvisorName: string;
  scholarship: {
    ScholarshipName: string;
  };
  // Add more fields as necessary
}

export default function SubmissionHistoryPage() {
  const [applications, setApplications] = useState<Application[]>([]); // Explicitly type the state
  const router = useRouter();
  const searchParams = useSearchParams(); // Use useSearchParams hook
  const status = searchParams.get('status'); // Get the 'status' query parameter

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const studentId = localStorage.getItem('UserID'); // Get the StudentID from localStorage

        if (studentId) {
          const response = await ApiApplicationInternalServices.showByStudentId(studentId); // Fetch applications based on StudentID
          console.log('API Response:', response); // Log the entire response

          // Check if the response is an array or an object
          if (Array.isArray(response)) {
            setApplications(response); // Directly set state if it's an array
          } else if (response && typeof response === 'object') {
            setApplications([response]); // Wrap the single object in an array
          } else {
            console.warn('Unexpected response format:', response);
            setApplications([]); // Set to an empty array if the response is unexpected
          }

          console.log('Applications being set:', applications);
        } else {
          console.error('StudentID not found in localStorage');
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    fetchApplications();
  }, []); // Empty dependency array to run only on component mount


  const handleEdit = (applicationId: string) => {
    router.push(`/page/application/editApplication/${applicationId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderHome />
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">ประวัติการสมัคร</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          {applications.length > 0 ? ( // Check if applications is not empty
            <table className="min-w-full border-collapse border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 border border-gray-200">ชื่อทุน</th>
                  <th className="px-4 py-2 border border-gray-200">สถานะ</th>
                  <th className="px-4 py-2 border border-gray-200">แก้ไข</th>
                </tr>
              </thead>
              <tbody>
              {applications.map((application) => (
  <tr key={application.ApplicationID}>
    <td className="px-4 py-2 border border-gray-200 text-center">
      {application.scholarship.ScholarshipName || "N/A"}
    </td>
    <td className="px-4 py-2 border border-gray-200 text-center">
      {application.Status || "บันทึกแล้ว"}
    </td>

    <td className="px-4 py-2 border border-gray-200 text-center">
      {application.Status !== "รอประกาศผล" ? (
        <button
          onClick={() => handleEdit(application.ApplicationID)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          แก้ไข
        </button>
      ) : (
        <span className="text-gray-500">ไม่สามารถแก้ไขได้</span>
      )}
    </td>
  </tr>
))}

              </tbody>
            </table>
          ) : (
            <div>No applications found</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
