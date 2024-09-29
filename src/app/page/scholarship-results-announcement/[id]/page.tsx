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
}

interface Application {
    Scholarship: Scholarship;
    student: StudentData;
}

interface ApplicationINEX {
    Application_EtID?: string;      // External Application ID (optional)
    ApplicationID?: string;        // Internal Application ID (optional)
    ScholarshipID: string;         // ID of the scholarship
    Status: string;                // Status of the application
    AdvisorName?: string;          // Name of the student's advisor (for internal applications)
    ApplicationDate?: string;      // Application date (for internal applications)
    GPAYear1?: number;             // GPA for the first year (for internal applications)
    GPAYear2?: number;             // GPA for the second year (for internal applications)
    GPAYear3?: number;             // GPA for the third year (for internal applications)
    MonthlyExpenses?: number;      // Monthly expenses of the student (for internal applications)
    MonthlyIncome?: number;        // Monthly income of the student (for internal applications)
    NumberOfBrothers?: number;     // Number of brothers (for internal applications)
    NumberOfSisters?: number;      // Number of sisters (for internal applications)
    NumberOfSiblings?: number;     // Total number of siblings (for internal applications)
    StudentID?: string;            // ID of the student (for internal applications)
}

export default function ScholarshipResultsAnnouncementPage() {
    const router = useRouter();
    const { id } = useParams();

    const [applications, setApplications] = useState<Application[]>([]);
    const [scholarshipName, setScholarshipName] = useState<string>('');
    const [ApplicationINEX, setApplicationsINEX] = useState<ApplicationINEX[]>([]);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const AcademicID = localStorage.getItem('AcademicID') ?? ''; // ใช้ empty string ถ้า AcademicID เป็น null
    const [lineToken, setLineToken] = useState<string | null>(null); // Store LineToken in state
    const [fileError, setFileError] = useState<string | null>(null); // To show file validation errors
    const [formError, setFormError] = useState<string | null>(null); // General form error
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
            if (!AcademicID) {
                throw new Error('AcademicID is missing');
            }
            const response = await ApiLineNotifyServices.getLineNotifiesByAcademicID(AcademicID); // Call API

            if (response.length > 0) {
                // Extract client_secret, notify_client_id, and LineToken from the response
                const { client_secret, notify_client_id, LineToken } = response[0];

                // Store LineToken in state
                setLineToken(response[0].LineToken);
            }

        } catch (error) {
            console.error('Error fetching line notifies:', error);
        }
    };
    useEffect(() => {
        fetchLineNotifies()
        const fetchScholarshipDetails = async () => {
            try {
                const scholarshipId = Array.isArray(id) ? id[0] : id;
                if (scholarshipId) {
                    // Log the start of the internal API call

                    // Try fetching from internal API first
                    let response = await ApiApplicationInternalServices.getStudentsByScholarshipId(scholarshipId);

                    // Log the response from internal API

                    // If no data found from internal API, fallback to external API
                    if (!response || response.length === 0) {

                        // Fetch from external API
                        response = await ApiApplicationExternalServices.getStudentsByScholarshipId(scholarshipId);

                        // Log the response from external API
                    }

                    // Check if any data has been found from either API
                    if (response && response.length > 0) {
                        setApplications(response);
                        setApplicationsINEX(response)
                        // Log specific parts of the response to check structure

                        const scholarshipname = response[0].scholarship?.ScholarshipName || 'Unknown';

                        // Extract and store the scholarship name in state
                        setScholarshipName(scholarshipname);
                    } else {
                        console.warn('No data found from both APIs.');
                    }
                } else {
                    console.warn('No ScholarshipID found.');
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
        const updatedApplications = [...ApplicationINEX]; // Create a copy of ApplicationINEX array
        updatedApplications[index].Status = event.target.value; // Update the Status field of the selected application
        setApplicationsINEX(updatedApplications); // Update the state with the modified array

        // Log the updated status
    };


    // Handle file change
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] || null;
        const maxFileSize = 20 * 1024 * 1024; // Max file size 20 MB

        if (selectedFile) {
            if (selectedFile.size > maxFileSize) {
                setFileError('ขนาดไฟล์เกิน 20 MB กรุณาเลือกไฟล์ที่มีขนาดเล็กกว่า 20 MB');
                setFile(null); // Clear file if invalid
            } else if (selectedFile.type !== 'application/pdf') {
                setFileError('กรุณาอัพโหลดเฉพาะไฟล์ PDF');
                setFile(null); // Clear file if invalid
            } else {
                setFileError(null); // Clear any previous errors if the file is valid
                setFile(selectedFile); // Set valid file
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
        // Reset form and file errors
        setFormError(null);

        // Validate file upload
        if (!file) {
            setFileError('กรุณาอัพโหลดไฟล์เอกสาร');
            return; // Prevent submission if no file is uploaded
        }

        try {

            if (!ApplicationINEX || ApplicationINEX.length === 0) {

                return;
            }

            // Ensure scholarshipId is a string
            const scholarshipId = Array.isArray(id) ? id[0] : id; // Use 'id' from useParams()

            const tasks: Promise<any>[] = ApplicationINEX.map(async (application, index) => {
                try {
                    const {
                        ApplicationID,
                        Application_EtID,
                        Status,
                        AdvisorName,
                        ApplicationDate,
                        GPAYear1,
                        GPAYear2,
                        GPAYear3,
                        MonthlyExpenses,
                        MonthlyIncome,
                        NumberOfBrothers,
                        NumberOfSiblings,
                        NumberOfSisters,
                        ScholarshipID,
                        StudentID
                    } = application;



                    if (ApplicationID) {
                        const internalPayload = {
                            Status,
                            AdvisorName,
                            ApplicationDate,
                            GPAYear1,
                            GPAYear2,
                            GPAYear3,
                            MonthlyExpenses,
                            MonthlyIncome,
                            NumberOfBrothers,
                            NumberOfSiblings,
                            NumberOfSisters,
                            ScholarshipID,
                            StudentID,
                        };

                        const response = await ApiApplicationUpdateInternalServices.updateApplication(ApplicationID, internalPayload);

                        return response;

                    } else if (Application_EtID) {
                        const externalPayload = {
                            Status,
                        };

                        const response = await ApiApplicationExternalServices.updateApplication(Application_EtID, externalPayload);

                        return response;
                    } else {
                        console.warn(`No valid ID found for application: ${JSON.stringify(application, null, 2)}`);
                        return null;
                    }
                } catch (error) {
                    console.error(`Error processing application:`, error);
                }
            });

            const results = await Promise.all(tasks.filter(task => task));
        

            // Check if a file was selected and upload it
            if (file) {
                const fileUploadResponse = await ApiUpdateServiceScholarships.updateAnnouncementFile(scholarshipId, file);
                
            }


            // Send Line Notify message after updating applications
            if (lineToken) {
                const message = `ประกาศผลทุนการศึกษา \nคลิกเพื่อดูรายละเอียด: ${URL}/page/results-announcement/${scholarshipId}`;
                await ApiLineNotifyServices.sendLineNotify(message, lineToken);  // ส่ง lineToken และข้อความ
            } else {
                console.error("LINE Notify token is null");
            }

            // Redirect to the announcement page
            router.push(`/page/scholarship-results-announcement`);
        } catch (error) {
            console.error('Error in handleSubmit:', error);
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

    if (!applications || applications.length === 0) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-100">
                <HeaderHome />
                <AdminHeader />
                <div className="flex flex-row">
                    <div className="bg-white w-1/8 p-4">
                        <Sidebar />
                    </div>
                    <p className="text-gray-600">ไม่มีข้อมูลการสมัคร</p>
                </div>
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
                    <h2 className="text-2xl font-semibold mb-6">
                        ผลประกาศทุนการศึกษา: {scholarshipName || 'No Scholarship Name Available'}
                    </h2>

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
                                    const academicYear = calculateAcademicYear(student?.Year_Entry); // Use the function to calculate academic year

                                    return (
                                        <tr key={`${student.StudentID}-${index}`} className="hover:bg-gray-100">
                                            <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                                            <td className="border border-gray-300 p-2">{student.FirstName} {student.LastName}</td>
                                            <td className="border border-gray-300 p-2 text-center">{academicYear}</td> {/* Updated */}
                                            <td className="border border-gray-300 p-2 text-center">{student.Course}</td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                <select
                                                    value={ApplicationINEX[index].Status || "เลือก"}
                                                    onChange={(e) => handleStatusChange(index, e)}
                                                    className="p-2 border border-gray-300 rounded">
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

                    {/* File upload input */}
                    <div className="mt-6">
                        <label htmlFor="fileUpload" className="block text-gray-700 mb-2">ไฟล์เอกสาร</label>
                        <input
                            type="file"
                            id="fileUpload"
                            onChange={handleFileChange}
                            className="border border-gray-300 p-2 rounded"
                            accept=".pdf" // Allow only PDF files
                        />
                        {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
                    </div>


                    <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 mt-4 rounded hover:bg-green-600">
                        SUBMIT
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
}
