"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/app/components/header/Header';
import Footer from '@/app/components/footer/footer';
import ApiStudentServices from '@/app/services/students/ApiStudent';
import ApiApplicationUpdateInternalServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationUpdateInternal';
import { useEffect, useState } from 'react';
import ApiApplicationExternalServices from '@/app/services/ApiApplicationExternalServices/ApiApplicationExternalServices';


// Interfaces
interface Students {
    StudentID: string;
    PrefixName: string;
    Course: string;
    Year_Entry: string;
    DOB: string;
}



interface ApplicationInternalData {
    StudentID: string;
    ScholarshipID: string;
    ApplicationDate: string;
    Status: string;
    MonthlyIncome: number;
    MonthlyExpenses: number;
    NumberOfSiblings: number;
    NumberOfSisters: number;
    NumberOfBrothers: number;
    GPAYear1: number;
    GPAYear2: number;
    GPAYear3: number;
    AdvisorName: string;

}

interface ApplicationExternaldata {
    StudentID: string;
    ScholarshipID: string;
    ApplicationDate: string;
    Status: string;
    application_files: ApplicationFilesData[];
  }
  

interface ApplicationFilesData {
    FileName: string;
    Application_EtID: string;
    DocumentName: string;
    DocumentType: string;
    FilePath: string | File;
    ExistingFilePath?: string; // เพิ่ม ExistingFilePath (อาจจะไม่มีในบางกรณี)
    error?: string; // Add this property to handle errors
}



interface PageProps {
    params: {
        id: string
    }
}


export default function ViewApplicationExternalPage({ params }: PageProps) {
    const router = useRouter();
    const id = params.id;
    const idStudent = localStorage.getItem('UserID');
    const token = localStorage.getItem('token');
    const [loading, setLoading] = useState(false); // Use one global loading state for all data fetching or individual ones if needed

    // State declarations
    const [step, setStep] = useState<number>(1); // ตั้งค่าเริ่มต้นเป็น 1

    const [Students, setStudents] = useState<Students>({
        StudentID: '',
        PrefixName: '',
        Course: '',
        Year_Entry: '',
        DOB: '',
    }); // ตั้งค่าเริ่มต้นเป็นข้อมูลว่างเปล่า

    const [applicationData, setApplicationData] = useState<ApplicationExternaldata>({
        StudentID: idStudent || '',
        ScholarshipID: '',
        ApplicationDate: '',
        Status: 'รออนุมัติ',
        application_files:[]
    });



   






  


    const [application_files, setApplicationFiles] = useState<ApplicationFilesData[]>([
        { Application_EtID: '', DocumentName: '', DocumentType: '', FilePath: '', FileName: '' },
    ]);

    const [error, setError] = useState('');
    const [userData, setUserData] = useState<any>(null);


    useEffect(() => {
        if (!token) {
            router.push('/page/login');
        }

        if (idStudent) {
            const fetchStudentData = async () => {
                setLoading(true); // Show loading spinner
                try {
                    const studentResponse = await ApiStudentServices.getStudent(idStudent);
                    setUserData(studentResponse.data);
                    console.log(studentResponse);
                    
                    setStudents((prevData) => ({
                        ...prevData,
                        PrefixName: studentResponse.data.PrefixName,
                        StudentID: studentResponse.data.StudentID,
                        Course: studentResponse.data.Course,
                        Year_Entry: studentResponse.data.Year_Entry,
                        DOB: studentResponse.data.DOB,
                    }));
                } catch (error) {
                    console.error('Error fetching student data:', error);
                }
            };
            fetchStudentData();
        }
    }, [token, idStudent, router]);

    useEffect(() => {
        const fetchApplicationData = async () => {
            setLoading(true); // Show loading spinner
            try {
                if (!id) {
                    throw new Error('Application ID not found');
                }
    
                console.log('Fetching Application ID:', id);
                const response = await ApiApplicationExternalServices.getApplicationById(id);
    
                // Check if response is valid and contains data
                if (response && response.length > 0) {
                    console.log('Application Data:', response);
    
                    // Assuming response is an array, you can fetch the first element or process accordingly
                    setApplicationData(response[0]); // Update with application data
                    setApplicationFiles(response[0].application_files || []); // Update with application files
                } else {
                    throw new Error('No application data found');
                }
            } catch (err) {
                console.error('Error fetching application data:', err);
                setError('Error fetching application data. Please try again.');
            } finally {
                setLoading(false); // Hide loading spinner once the request completes
            }
        };
    
        fetchApplicationData();
    }, [id]);
    






    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div>
                <p className="ml-4 text-gray-600">Loading...</p>
            </div>
        );
    }




    const calculateAcademicYear = (yearEntry: number | null) => {
        if (yearEntry === null) return 'N/A';
        const currentYear = new Date().getFullYear();
        const entryYear = yearEntry - 543; // Convert from Thai year to Gregorian year
        const yearDifference = currentYear - entryYear;

        if (yearDifference === 0) return '1';
        if (yearDifference === 1) return '2';
        if (yearDifference === 2) return '3';
        if (yearDifference === 3) return '4';
        if (yearDifference === 4) return '5';

        return 'จบการศึกษาแล้ว'; // For years more than 4
    };


    const handleSubmit = async () => {
        router.push(`/page/History-Application`);
    };




    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <div className="">

                            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-5">

                                <div>
                                    <label htmlFor="PrefixName" className="block text-gray-700 mb-2">
                                        คำนำหน้า
                                    </label>
                                    <input
                                        type="text"
                                        id="PrefixName"
                                        name="PrefixName"
                                        value={userData?.PrefixName || ''}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>

                                <div>
                                    <label htmlFor="FirstName" className="block text-gray-700 mb-2">
                                        ชื่อ
                                    </label>
                                    <input
                                        type="text"
                                        id="FirstName"
                                        name="FirstName"
                                        value={userData?.FirstName || ''}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label htmlFor="LastName" className="block text-gray-700 mb-2">
                                        นามสกุล
                                    </label>
                                    <input
                                        type="text"
                                        id="LastName"
                                        name="LastName"
                                        value={userData?.LastName || ''}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div>
                                    <label htmlFor="Course" className="block text-gray-700 mb-2">
                                        สาขาวิชา
                                    </label>
                                    <input
                                        id="Course"
                                        name="Course"
                                        value={userData?.Course || ''}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label htmlFor="Year_Entry" className="block text-gray-700 mb-2">
                                        ชั้นปี
                                    </label>
                                    <input
                                        id="Year_Entry"
                                        name="Year_Entry"
                                        value={userData?.Year_Entry ? calculateAcademicYear(userData.Year_Entry) : 'N/A'}

                                        disabled
                                        className="w-full p-3 border border-gray-300 rounded"

                                    />
                                </div>
                                <div>
                                    <label htmlFor="StudentID" className="block text-gray-700 mb-2">
                                        รหัสนิสิต
                                    </label>
                                    <input
                                        id="StudentID"
                                        name="StudentID"
                                        value={userData?.StudentID}

                                        disabled
                                        className="w-full p-3 border border-gray-300 rounded"
                                    />
                                </div>
                            </div>
                            <div className="mb-4 grid grid-cols-3 sm:grid-cols-3 gap-6">
                                <div>
                                    <label htmlFor="Phone" className="block text-gray-700 mb-2">
                                        เบอร์โทร
                                    </label>
                                    <input
                                        id="Phone"
                                        name="Phone"
                                        value={userData?.Phone || ''}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>

                                <div>
                                    <label htmlFor="Religion" className="block text-gray-700 mb-2">
                                        ศาสนา
                                    </label>
                                    <input
                                        id="Religion"
                                        name="Religion"
                                        value={userData?.Religion || ''}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>

                                <div>
                                    <label htmlFor="DOB" className="block text-gray-700 mb-2">
                                        วันเดือนปีเกิด
                                    </label>
                                    <input
                                        type="date"
                                        id="DOB"
                                        name="DOB"
                                        value={userData?.DOB || ''}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                );


            case 2:
                return (
                    <div>
                        {application_files.map((file, index) => (
                            <div key={index} className="mb-6 grid grid-cols-1 sm:grid-cols-5 gap-6 bg-white p-4 rounded-lg shadow-md">
                                <div className="sm:col-span-1">
                                    <label htmlFor={`DocumentType-${index}`} className="block text-gray-700 font-semibold mb-1">ประเภทไฟล์</label>
                                    <input
                                        id={`DocumentType-${index}`}
                                        name="DocumentType"
                                        value={file.DocumentType}

                                        className="w-full p-3 border border-gray-300 rounded bg-gray-100"
                                        disabled
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor={`DocumentName-${index}`} className="block text-gray-700 font-semibold mb-1">ชื่อเอกสาร</label>
                                    <input
                                        type="text"
                                        id={`DocumentName-${index}`}
                                        name="DocumentName"
                                        value={file.DocumentName}

                                        className="w-full p-3 border border-gray-300 rounded bg-gray-100"
                                        disabled
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor={`FilePath-${index}`} className="block text-gray-700 font-semibold mb-1">ไฟล์ที่อัปโหลด</label>

                                    {/* แสดงชื่อไฟล์ที่เลือกหรือไฟล์เดิมที่มีอยู่ */}
                                    {typeof file.FilePath === 'string' && (
                                        <div className="mt-2 p-3 bg-gray-50 border border-gray-300 rounded">
                                            <p className="text-sm text-gray-600">ไฟล์ที่เลือก: <span className="text-blue-500 font-medium">{file.FilePath.split('/').pop()}</span></p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}


                    </div>
                );


            default:
                return <div>Unknown step</div>;
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 container mx-auto px-4 py-8">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="flex justify-center mb-6">
                        <div className={`flex items-center ${step === 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                            <span
                                className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 1 ? 'border-blue-600' : 'border-gray-500'
                                    }`}
                            >
                                1
                            </span>
                            <span className="ml-2 hidden sm:inline">ประวัติส่วนตัว</span>
                        </div>

                        <div
                            className={`flex items-center ml-4 sm:ml-8 ${step === 2 ? 'text-blue-600' : 'text-gray-500'
                                }`}
                        >
                            <span
                                className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 5 ? 'border-blue-600' : 'border-gray-500'
                                    }`}
                            >
                                5
                            </span>
                            <span className="ml-2 hidden sm:inline">อัพโหลดเอกสาร</span>
                        </div>
                    </div>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        {renderStep()}
                        <div className="flex justify-between mt-6">
                            <button
                                type="button"
                                onClick={() => setStep(step > 1 ? step - 1 : step)}
                                className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${step === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={step === 1}
                            >
                                ย้อนกลับ
                            </button>
                            {step < 2 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(step < 2 ? step + 1 : step)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    ถัดไป
                                </button>
                            )}

                        </div>

                        {step === 5 && (
                            <div className="flex justify-center mt-6 text-center w-full">
                                <button
                                    type="button"  // Ensure this is submit type for form submission
                                    onClick={handleSubmit}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    กลับหน้าเดิม
                                </button>
                            </div>
                        )}

                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}
