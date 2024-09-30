'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import HeaderHome from '@/app/components/headerHome/headerHome';
import AdminHeader from '@/app/components/headerAdmin/headerAdmin';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import Footer from '@/app/components/footer/footer';
import ApiApplicationInternalServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationInternalServices';
import ApiApplicationExternalServices from '@/app/services/ApiApplicationExternalServices/ApiApplicationExternalServices';
import ApiApplicationUpdateInternalServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationUpdateInternal';
import ApiUpdateServiceScholarships from '@/app/services/scholarships/updateScholarships';
import ApiLineNotifyServices from '@/app/services/line-notifies/line';
import Swal from 'sweetalert2';
const URL = `${process.env.NEXT_PUBLIC_API_Forned}`;

interface StudentData {
    StudentID: string;
    FirstName: string;
    LastName: string;
    Year_Entry: number | null;
    Course: string;
    Status: string;
}

interface Scholarship {
    ScholarshipId: string;
    ScholarshipName: string;
    AnnouncementFile?: string | null;  // Announcement file field
}

interface Application {
    Scholarship: Scholarship;
    student: StudentData;
}

interface ApplicationINEX {
    Application_EtID?: string;
    ApplicationID?: string;
    ScholarshipID: string;
    Status: string;
    AdvisorName?: string;
    ApplicationDate?: string;
    GPAYear1?: number;
    GPAYear2?: number;
    GPAYear3?: number;
    MonthlyExpenses?: number;
    MonthlyIncome?: number;
    NumberOfBrothers?: number;
    NumberOfSiblings?: number;
    NumberOfSisters?: number;
    StudentID?: string;
}

export default function ScholarshipResultsAnnouncementPage() {
    const router = useRouter();
    const { id } = useParams();
    
    const [applications, setApplications] = useState<Application[]>([]);
    const [scholarshipName, setScholarshipName] = useState<string>('');
    const [announcementFile, setAnnouncementFile] = useState<string | null>(null); // State for the announcement file
    const [ApplicationINEX, setApplicationsINEX] = useState<ApplicationINEX[]>([]);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [lineToken, setLineToken] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const AcademicID = localStorage.getItem('AcademicID') ?? '';

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

    const fetchLineNotifies = async () => {
        try {
            const response = await ApiLineNotifyServices.getLineNotifiesByAcademicID(AcademicID);
            if (response.length > 0) {
                setLineToken(response[0].LineToken);
            }
        } catch (error) {
            console.error('Error fetching line notifies:', error);
        }
    };

    useEffect(() => {
        fetchLineNotifies();
        const fetchScholarshipDetails = async () => {
            try {
                const scholarshipId = Array.isArray(id) ? id[0] : id;
                if (scholarshipId) {
                    let response = await ApiApplicationInternalServices.getStudentsByScholarshipId(scholarshipId);
                    if (!response || response.length === 0) {
                        response = await ApiApplicationExternalServices.getStudentsByScholarshipId(scholarshipId);
                    }
                    if (response && response.length > 0) {
                        setApplications(response);
                        setApplicationsINEX(response);
                        const scholarshipname = response[0].scholarship?.ScholarshipName || 'Unknown';
                        setScholarshipName(scholarshipname);
                        setAnnouncementFile(response[0].scholarship?.AnnouncementFile || null); // Set the announcement file state
                    }
                }
            } catch (error) {
                console.error("Failed to fetch scholarship details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchScholarshipDetails();
    }, [id]);

    // Handle status change
    const handleStatusChange = (index: number, event: React.ChangeEvent<HTMLSelectElement>) => {
        const updatedApplications = [...ApplicationINEX];
        updatedApplications[index].Status = event.target.value;
        setApplicationsINEX(updatedApplications);
    };

    // Handle file change
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] || null;
        const maxFileSize = 20 * 1024 * 1024;

        if (selectedFile) {
            if (selectedFile.size > maxFileSize) {
                setFileError('ขนาดไฟล์เกิน 20 MB กรุณาเลือกไฟล์ที่มีขนาดเล็กกว่า 20 MB');
                setFile(null);
            } else if (selectedFile.type !== 'application/pdf') {
                setFileError('กรุณาอัพโหลดเฉพาะไฟล์ PDF');
                setFile(null);
            } else {
                setFileError(null);
                setFile(selectedFile);
            }
        }
    };

    const calculateAcademicYear = (yearEntry: number | null) => {
        if (yearEntry === null) return 'N/A';
        const currentYear = new Date().getFullYear();
        const entryYear = yearEntry - 543; // Convert from Thai year to Gregorian year
        const yearDifference = currentYear - entryYear;

        if (yearDifference === 0) return 'ปี 1';
        if (yearDifference === 1) return 'ปี 2';
        if (yearDifference === 2) return 'ปี 3';
        if (yearDifference === 3) return 'ปี 4';
        if (yearDifference === 4) return 'ปี 5';

        return 'จบการศึกษาแล้ว'; // For years more than 4
    };

    const handleSubmit = async () => {
        if (!file && !announcementFile) {
            setFileError('กรุณาอัพโหลดไฟล์เอกสาร');
            return;
        }
    
        try {
            const scholarshipId = Array.isArray(id) ? id[0] : id;
    
            // Log the scholarshipId
            console.log("Scholarship ID:", scholarshipId);
    
            // Update each application's status
            const tasks: Promise<any>[] = ApplicationINEX.map(async (application) => {
                const {
                    ApplicationID,
                    Application_EtID,
                    Status,
                    StudentID,
                    ScholarshipID,
                    AdvisorName,
                    ApplicationDate,
                    GPAYear1,
                    GPAYear2,
                    GPAYear3,
                    MonthlyExpenses,
                    MonthlyIncome,
                    NumberOfBrothers,
                    NumberOfSiblings,
                    NumberOfSisters
                } = application;
    
                // Ensure required fields are passed in the payload and `ScholarshipID` is a string
                const payload = {
                    Status,
                    StudentID: StudentID || "",
                    ScholarshipID: String(ScholarshipID),  // Ensure ScholarshipID is a string
                    AdvisorName: AdvisorName || "",  // Ensure AdvisorName is included
                    ApplicationDate: ApplicationDate || "",  // Ensure ApplicationDate is included
                    GPAYear1: GPAYear1 || 0,  // Ensure GPAYear1 is included
                    GPAYear2: GPAYear2 || 0,  // Ensure GPAYear2 is included
                    GPAYear3: GPAYear3 || 0,  // Ensure GPAYear3 is included
                    MonthlyExpenses: MonthlyExpenses || 0,  // Ensure MonthlyExpenses is included
                    MonthlyIncome: MonthlyIncome || 0,  // Ensure MonthlyIncome is included
                    NumberOfBrothers: NumberOfBrothers || 0,  // Ensure NumberOfBrothers is included
                    NumberOfSiblings: NumberOfSiblings || 0,  // Ensure NumberOfSiblings is included
                    NumberOfSisters: NumberOfSisters || 0  // Ensure NumberOfSisters is included
                };
    
                // Log the payload for each application
                console.log("Payload for application:", payload);
    
                // Update only the Status (and other required fields) for internal applications
                if (ApplicationID) {
                    console.log("Updating internal application:", ApplicationID);
                    const result = await ApiApplicationUpdateInternalServices.updateApplication(ApplicationID, payload);
                    console.log("Internal application update result:", result);
                    return result;
                }
    
                // Update only the Status (and other required fields) for external applications
                else if (Application_EtID) {
                    console.log("Updating external application:", Application_EtID);
                    const result = await ApiApplicationExternalServices.updateApplication(Application_EtID, payload);
                    console.log("External application update result:", result);
                    return result;
                }
            });
    
            await Promise.all(tasks);
    
            // Upload the announcement file if needed
            if (file && !announcementFile) {
                console.log("Uploading announcement file...");
                const result = await ApiUpdateServiceScholarships.updateAnnouncementFile(scholarshipId, file);
                console.log("Announcement file upload result:", result);
            }
    
            // Send Line Notify message if there's a token available
            if (lineToken) {
                const message = `ประกาศผลทุนการศึกษา \nคลิกเพื่อดูรายละเอียด: ${URL}/page/results-announcement/${scholarshipId}`;
                console.log("Sending Line Notify message:", message);
                const result = await ApiLineNotifyServices.sendLineNotify(message, lineToken);
                console.log("Line Notify result:", result);
            }
    
            // Success notification
            Swal.fire({
                icon: 'success',
                title: 'ประกาศผลสำเร็จ',
                text: 'ประกาศผลทุนการศึกษาเรียบร้อยแล้ว',
                confirmButtonText: 'ตกลง'
            }).then(() => {
                // Redirect to the results announcement page
                console.log("Redirecting to results announcement page...");
                router.push(`/page/scholarship-results-announcement`);
            });
    
        } catch (error) {
            console.error('Error in handleSubmit:', error);
    
            // Error notification
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถประกาศผลได้ กรุณาลองอีกครั้ง',
                confirmButtonText: 'ตกลง'
            });
        }
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
                    <h2 className="text-2xl font-semibold mb-6">ผลประกาศทุนการศึกษา: {scholarshipName}</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-300 p-2">ลำดับที่</th>
                                    <th className="border border-gray-300 p-2">ชื่อ-สกุล</th>
                                    <th className="border border-gray-300 p-2">ชั้นปี</th>
                                    <th className="border border-gray-300 p-2">สาขา</th>
                                    <th className="border border-gray-300 p-2">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app, index) => {
                                    const student = app.student;
                                    const academicYear = calculateAcademicYear(student?.Year_Entry);

                                    return (
                                        <tr key={`${student.StudentID}-${index}`} className="hover:bg-gray-100">
                                            <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                                            <td className="border border-gray-300 p-2">{student.FirstName} {student.LastName}</td>
                                            <td className="border border-gray-300 p-2 text-center">{academicYear}</td>
                                            <td className="border border-gray-300 p-2 text-center">{student.Course}</td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                <select
                                                    value={ApplicationINEX[index].Status || "เลือก"}
                                                    onChange={(e) => handleStatusChange(index, e)}
                                                    className="p-2 border border-gray-300 rounded"
                                                    disabled={!!announcementFile} // Disable if there is an announcement file
                                                >
                                                    <option value="">เลือก</option>
                                                    <option value="ได้รับทุน">ได้รับทุน</option>
                                                    <option value="ไม่ได้รับทุน">ไม่ได้รับทุน</option>
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {!announcementFile && (  // Show file upload only if there's no announcement file
                        <div className="mt-6">
                            <label htmlFor="fileUpload" className="block text-gray-700 mb-2">ไฟล์เอกสาร</label>
                            <input
                                type="file"
                                id="fileUpload"
                                onChange={handleFileChange}
                                className="border border-gray-300 p-2 rounded"
                                accept=".pdf"
                            />
                            {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
                        </div>
                    )}

{/* ตรวจสอบว่ามี announcementFile หรือไม่ */}
{announcementFile ? (
  // ถ้ามี announcementFile ให้แสดงปุ่มย้อนกลับ
  <button
    onClick={() => router.back()} // ฟังก์ชันย้อนกลับไปหน้าก่อนหน้า
    className="bg-gray-500 text-white px-4 py-2 mt-4 rounded hover:bg-gray-600"
  >
    ย้อนกลับ
  </button>
) : (
  // ถ้าไม่มี announcementFile ให้แสดงปุ่มส่งผลการประกาศ
  <button
    onClick={handleSubmit} // ฟังก์ชันส่งข้อมูล
    className="bg-green-500 text-white px-4 py-2 mt-4 rounded hover:bg-green-600"
  >
    ส่งผลการประกาศ
  </button>
)}


                </div>
            </div>
            <Footer />
        </div>
    );
}
