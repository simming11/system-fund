'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/header/Header';
import Footer from '@/app/components/footer/footer';
import ApiApplicationInternalServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationInternalServices';
import ApiApplicationExternalServices from '@/app/services/ApiApplicationExternalServices/ApiApplicationExternalServices';
import HeaderHome from '@/app/components/headerHome/headerHome';
// Import FontAwesome for icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons'; // Import the eye icon

interface Application {
  ApplicationID?: string; // Internal Application ID
  Application_EtID?: string; // External Application ID
  Status: string;
  scholarship?: {
    ScholarshipName: string;
  };
}

export default function SubmissionHistoryPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const studentId = localStorage.getItem('UserID');

        if (studentId) {
          const internalResponse = await ApiApplicationInternalServices.showByStudentId(studentId);
          const externalResponse = await ApiApplicationExternalServices.showByStudent(studentId);
          
          const combinedApplications = [
            ...(Array.isArray(internalResponse) ? internalResponse : [internalResponse]),
            ...(Array.isArray(externalResponse) ? externalResponse : [externalResponse]),
          ];

          setApplications(combinedApplications);
          console.log('Combined Applications:', combinedApplications);
        } else {
          console.error('StudentID not found in localStorage');
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    fetchApplications();
  }, []);

  const handleView = (applicationId: string, isExternal: boolean) => {
    if (isExternal) {
      // Navigate to view-only page for external applications
      router.push(`/page/application/viewApplicationExternal/${applicationId}`);
    } else {
      // Navigate to view-only page for internal applications
      router.push(`/page/application/viewApplicationInternal/${applicationId}`);
    }
  };

  const handleEdit = (applicationId: string) => {
    // Navigate to an edit page for the application
    router.push(`/page/application/editApplication/${applicationId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderHome />
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">ประวัติการสมัคร</h1>
        <div className="bg-white  rounded-lg p-6">
          {applications.length > 0 ? (
            <table className="min-w-full border-collapse border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 border border-gray-200">ชื่อทุน</th>
                  <th className="px-4 py-2 border border-gray-200">สถานะ</th>
                  <th className="px-4 py-2 border border-gray-200">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.ApplicationID || application.Application_EtID}>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      {application.scholarship?.ScholarshipName || "N/A"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      {/* Show status of the application */}
                      {application.Status === "ได้รับทุน" ? (
                        <span>ได้รับทุน</span>
                      ) : application.Status === "ไม่ได้รับทุน" ? (
                        <span>ไม่ได้รับทุน</span>
                      ) : (
                        application.Status || "บันทึกแล้ว"
                      )}
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      {/* Handle view and edit actions based on internal or external application */}
                      {application.Status === "ได้รับทุน" || application.Status === "ไม่ได้รับทุน" ? (
                        <button
                          onClick={() => handleView(application.ApplicationID || application.Application_EtID!, !!application.Application_EtID)}
                          className="bg-gray-200 text-gray-500 px-4 py-2 rounded"
                          title="View Application"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      ) : (
                        <>
                          {application.Status === "บันทึกแล้ว" ? (
                            <button
                              onClick={() => handleEdit(application.ApplicationID || application.Application_EtID!)}
                              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                              แก้ไข
                            </button>
                          ) : (
                            <button
                              onClick={() => handleView(application.ApplicationID || application.Application_EtID!, !!application.Application_EtID)}
                              className="bg-gray-200 text-gray-500 px-4 py-2 rounded"
                              title="View Application"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>ไม่มีข้อมูลประวัติการสมัครทุน</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
