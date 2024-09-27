"use client";
import { useRouter } from 'next/navigation';
import Header from '@/app/components/header/Header';
import Footer from '@/app/components/footer/footer';
import ApiStudentServices from '@/app/services/students/ApiStudent';
import ApiApplicationUpdateInternalServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationUpdateInternal';
import { useEffect, useState } from 'react';


// Interfaces
interface Students {
    StudentID: string;
    PrefixName: string;
    Course: string;
    Year_Entry: string;
    DOB: string;
}

interface Address {
    ApplicationID: string;
    AddressLine: string;
    Subdistrict: string;
    province: string;
    District: string;
    PostalCode: string;
    Type: string;
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
    addresses: Address[];
    activities: ActivitiesData[];
    scholarship_histories: ScholarshipHistoryData[];
    work_experiences: WorkExperiencesData[];
    siblings: SiblingsData[];
    application_files: ApplicationFilesData[];
    guardians: GuardiansData[];
}

interface GuardiansData {
    ApplicationID: string;
    FirstName: string;
    PrefixName: string;
    LastName: string;
    Type: string;
    Occupation: string;
    Income: number;
    Age: number;
    Status: string;
    Workplace: string;
    Phone: string;
}

interface SiblingsData {
    ApplicationID: string;
    PrefixName: string;
    Fname: string;
    Lname: string;
    Occupation: string;
    EducationLevel: string;
    Income: number;
    Status: string;
}

interface ActivitiesData {
    ApplicationID: string;
    AcademicYear: string;
    ActivityName: string;
    Position: string;
}

interface ScholarshipHistoryData {
    ApplicationID: string;
    ScholarshipName: string;
    AmountReceived: number;
    AcademicYear: string;
}

interface WorkExperiencesData {
    ApplicationID: string;
    Name: string;
    JobType: string;
    Duration: string;
    Earnings: number;
}

interface ApplicationFilesData {
    FileName: string;
    ApplicationID: string;
    DocumentName: string;
    DocumentType: string;
    FilePath: string | File;
    ExistingFilePath?: string; // เพิ่ม ExistingFilePath (อาจจะไม่มีในบางกรณี)
    error?: string; // Add this property to handle errors
}

interface CurrentAddressData extends Address { }

interface PageProps {
    params: {
        id: string
    }
}


export default function ViewApplicationInternalPage({ params }: PageProps) {
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

    const [applicationData, setApplicationData] = useState<ApplicationInternalData>({
        StudentID: idStudent || '',
        ScholarshipID: '',
        ApplicationDate: '',
        Status: 'รออนุมัติ',
        MonthlyIncome: 1,
        MonthlyExpenses: 1,
        NumberOfSisters: 0,
        NumberOfBrothers: 0,
        NumberOfSiblings: 0,  // Ensure this is initialized
        GPAYear1: 1,
        GPAYear2: 1,
        GPAYear3: 1,
        AdvisorName: '',
        addresses: [], // Initialize as empty array
        activities: [], // Fix: Add empty array for activities
        guardians: [], // Initialize as empty array
        scholarship_histories: [], // Initialize as empty array
        work_experiences: [], // Initialize as empty array
        siblings: [], // Initialize as empty array
        application_files: [] // Initialize as empty array
    });




    const [addressData, setAddressData] = useState<Address>({
        ApplicationID: id,
        AddressLine: '',
        Subdistrict: '',
        province: '',
        District: '',
        PostalCode: '',
        Type: 'ที่อยู่ตามบัตรประชาชน',
    });

    const [currentAddressData, setCurrentAddressData] = useState<CurrentAddressData>({
        ApplicationID: id,
        AddressLine: '',
        Subdistrict: '',
        province: '',
        District: '',
        PostalCode: '',
        Type: 'ที่อยู่ปัจจุบัน',
    });

    const [fatherData, setFatherData] = useState<GuardiansData>({
        ApplicationID: id || '',
        FirstName: '',
        LastName: '',
        PrefixName: '',
        Type: 'พ่อ',
        Occupation: '',
        Income: 0,
        Age: 0,
        Status: '',
        Workplace: '',
        Phone: '',
    });

    const [motherData, setMotherData] = useState<GuardiansData>({
        ApplicationID: id || '',
        FirstName: '',
        LastName: '',
        PrefixName: '',
        Type: 'แม่',
        Occupation: '',
        Income: 0,
        Age: 0,
        Status: '',
        Workplace: '',
        Phone: '',
    });

    const [caretakerData, setCaretakerData] = useState<GuardiansData>({
        ApplicationID: id || '',
        PrefixName: '',
        FirstName: '',
        LastName: '',
        Age: 0,
        Status: '',
        Phone: '',
        Occupation: '',
        Income: 0,
        Type: '',
        Workplace: '',
    });

    const [siblingData, setSiblingData] = useState<SiblingsData>({
        ApplicationID: '',
        PrefixName: '',
        Fname: '',
        Lname: '',
        Occupation: '',
        EducationLevel: '',
        Income: 0,
        Status: '',
    });


    const [activities, setActivities] = useState<ActivitiesData[]>([
        { AcademicYear: '', ActivityName: '', Position: '', ApplicationID: '' },
    ]);

    const [scholarship_histories, setScholarshipHistory] = useState<ScholarshipHistoryData[]>([
        { ApplicationID: '', ScholarshipName: '', AmountReceived: 0, AcademicYear: '' },
    ]);

    const [work_experiences, setWorkExperiences] = useState<WorkExperiencesData[]>([
        { ApplicationID: '', Name: '', JobType: '', Duration: '', Earnings: 0 },
    ]);

    const [application_files, setApplicationFiles] = useState<ApplicationFilesData[]>([
        { ApplicationID: '', DocumentName: '', DocumentType: '', FilePath: '', FileName: '' },
    ]);

    const [error, setError] = useState('');
    const [userData, setUserData] = useState<any>(null);
    const [provinces, setProvinces] = useState<{ id: number; name: string }[]>([]);




    const [siblingsData, setSiblingsData] = useState<SiblingsData[]>([]);


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
                console.log('Fetched applicationID:', id);
                setLoading(true);
                const response = await ApiApplicationUpdateInternalServices.getApplicationById(id);
                setApplicationData(response);

                const addresses: Address[] = response.addresses || [];
                const idCardAddress = addresses.find((address) => address.Type === "ที่อยู่ตามบัตรประชาชน");
                const currentAddress = addresses.find((address) => address.Type === "ที่อยู่ปัจจุบัน");

                if (idCardAddress) {
                    setAddressData(idCardAddress);

                }

                if (currentAddress) {
                    setCurrentAddressData(currentAddress);

                }

                const guardians: GuardiansData[] = response.guardians || [];
                const defaultGuardianData = {
                    ApplicationID: id || '',
                    FirstName: '',
                    LastName: '',
                    PrefixName: '',
                    Type: '',
                    Occupation: '',
                    Income: 0,
                    Age: 0,
                    Status: '',
                    Workplace: '',
                    Phone: '',
                };
                const father = guardians.find((guardian) => guardian.Type === 'พ่อ') || { ...defaultGuardianData, Type: 'พ่อ' };
                const mother = guardians.find((guardian) => guardian.Type === 'แม่') || { ...defaultGuardianData, Type: 'แม่' };
                const caretaker = guardians.find((guardian) => guardian.Type !== 'พ่อ' && guardian.Type !== 'แม่') || { ...defaultGuardianData, Type: '' };

                setFatherData(father);
                setMotherData(mother);
                setCaretakerData(caretaker);



                setActivities(response.activities || []);
                setScholarshipHistory(response.scholarship_histories || []);
                setWorkExperiences(response.work_experiences || []);
                setSiblingsData(response.siblings || []);
                setApplicationFiles(response.application_files || []);
            } catch (err) {
                console.error('Error fetching application data:', err);
                setError('Error fetching application data. Please try again.');
            } finally {
                setLoading(false);
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

                            <div className="mb-3 grid sm:grid-cols-1 md:grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-2">

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
                            <div className="mb-3 grid sm:grid-cols-1 md:grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-2">
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
                                        value={applicationData.StudentID}

                                        disabled
                                        className="w-full p-3 border border-gray-300 rounded"
                                    />
                                </div>
                            </div>
                            <div className="mb-3 grid sm:grid-cols-1 md:grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-2">
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
                            <div className="text-gray-700 mb-1 mt-5">ที่อยู่ตามบัตรประชาชน</div>
                            <div className="mb-3 grid sm:grid-cols-1 md:grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-2">
                                <div>
                                    <label htmlFor="AddressLine" className="block text-gray-700 mb-2">
                                        เลขที่
                                    </label>
                                    <input
                                        type="text"
                                        id="AddressLine"
                                        name="AddressLine"
                                        value={addressData.AddressLine || ""}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label htmlFor="province" className="block text-gray-700 mb-2">
                                        จังหวัด
                                    </label>
                                    <input
                                        type="text"
                                        id="province"
                                        name="province"
                                        value={addressData.province || ""}
                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled // ทำให้เป็น read-only เพื่อให้ไม่สามารถแก้ไขข้อมูลได้
                                    />

                                </div>
                                <div>
                                    <label htmlFor="District" className="block text-gray-700 mb-2">
                                        อำเภอ
                                    </label>
                                    <input
                                        id="District"
                                        name="District"
                                        value={addressData.District || ""}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />

                                </div>
                                <div>
                                    <label htmlFor="Subdistrict" className="block text-gray-700 mb-2">
                                        ตำบล
                                    </label>
                                    <input
                                        id="Subdistrict"
                                        name="Subdistrict"
                                        value={addressData.Subdistrict || ""}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label htmlFor="PostalCode" className="block text-gray-700 mb-2">
                                        รหัสไปรษณีย์
                                    </label>
                                    <input
                                        type="text"
                                        id="PostalCode"
                                        name="PostalCode"
                                        value={addressData.PostalCode || ""}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="mb-4 grid grid-cols-1 sm:grid-cols- gap-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-gray-700">
                                        ที่อยู่ปัจจุบัน
                                    </div>
                                </div>
                                <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                        <label htmlFor="AddressLine" className="block text-gray-700 mb-2">
                                            เลขที่
                                        </label>
                                        <input
                                            type="text"
                                            id="AddressLine"
                                            name="AddressLine"
                                            value={currentAddressData.AddressLine || ""}

                                            className="w-full p-3 border border-gray-300 rounded"
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="province" className="block text-gray-700 mb-2">
                                            จังหวัด
                                        </label>
                                        <input
                                            id="province"
                                            name="province"
                                            value={currentAddressData.province || ""}

                                            className="w-full p-3 border border-gray-300 rounded"
                                            disabled
                                        />

                                    </div>
                                    <div>
                                        <label htmlFor="District" className="block text-gray-700 mb-2">
                                            อำเภอ
                                        </label>
                                        <input
                                            id="District"
                                            name="District"
                                            value={currentAddressData.District || ""}

                                            className="w-full p-3 border border-gray-300 rounded"
                                            disabled
                                        />

                                    </div>
                                    <div>
                                        <label htmlFor="Subdistrict" className="block text-gray-700 mb-2">
                                            ตำบล
                                        </label>
                                        <input
                                            id="Subdistrict"
                                            name="Subdistrict"
                                            value={currentAddressData.Subdistrict || ""}

                                            className="w-full p-3 border border-gray-300 rounded"
                                            disabled
                                        />

                                    </div>
                                    <div>
                                        <label htmlFor="PostalCode" className="block text-gray-700 mb-2">
                                            รหัสไปรษณีย์
                                        </label>
                                        <input
                                            type="text"
                                            id="PostalCode"
                                            name="PostalCode"
                                            value={currentAddressData.PostalCode || ""}

                                            className="w-full p-3 border border-gray-300 rounded"
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-end">
                                <div className="flex-1">
                                    <label htmlFor="MonthlyIncome" className="block text-gray-700 mb-2">
                                        รายได้ของนิสิตเดือนละ
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            id="MonthlyIncome"
                                            name="MonthlyIncome"
                                            value={applicationData.MonthlyIncome}

                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            className="w-80 p-3 border border-gray-300 rounded"
                                            disabled
                                        />
                                        <span className="ml-2">บาท</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="MonthlyExpenses" className="block text-gray-700 mb-2">
                                        รายจ่ายของนิสิตเดือนละ
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            id="MonthlyExpenses"
                                            name="MonthlyExpenses"
                                            value={applicationData.MonthlyExpenses}

                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            className="w-80 p-3 border border-gray-300 rounded"
                                            disabled
                                        />
                                        <span className="ml-2">บาท</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="">
                        {/* Father's Information */}
                        <div className="mb-3 grid sm:grid-cols-1 md:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                            <div>
                                <label htmlFor="FatherPrefixName" className="block text-gray-700 mb-2">
                                    คำนำหน้า
                                </label>
                                <input
                                    id="FatherPrefixName"
                                    name="PrefixName"
                                    value={fatherData.PrefixName || ""}
                                    className="w-30 p-3 border border-gray-300 rounded"
                                    disabled // Disabled to make the field non-editable
                                />

                            </div>
                            <div className="">
                                <label htmlFor="FatherFirstName" className="block text-gray-700 mb-2">
                                    บิดาชื่อ
                                </label>
                                <input
                                    type="text"
                                    id="FatherFirstName"
                                    name="FirstName"
                                    value={fatherData.FirstName}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled // Disabled to make the field non-editable
                                />
                            </div>
                            <div className="">
                                <label htmlFor="FatherLastName" className="block text-gray-700 mb-2">
                                    นามสกุล
                                </label>
                                <input
                                    type="text"
                                    id="FatherLastName"
                                    name="LastName"
                                    value={fatherData.LastName}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled // Disabled to make the field non-editable
                                />
                            </div>
                            <div className="">
                                <label htmlFor="FatherAge" className="block text-gray-700 mb-2">
                                    อายุ
                                </label>
                                <input
                                    type="number"
                                    id="FatherAge"
                                    name="Age"
                                    value={fatherData.Age}
                                    className="w-20 p-3 border border-gray-300 rounded"
                                    disabled // Disabled to make the field non-editable
                                />
                            </div>
                            <div>
                                <label htmlFor="FatherStatusAlive" className="block text-gray-700 mb-2">
                                    สถานภาพ (พ่อ)
                                </label>
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="FatherStatusAlive"
                                        name="FatherStatus"
                                        value="มีชีวิต"
                                        checked={fatherData.Status === 'มีชีวิต'}
                                        className="mr-2"
                                        disabled // Disabled to make the field non-editable
                                    />{' '}
                                    มีชีวิต
                                    <input
                                        type="radio"
                                        id="FatherStatusDeceased"
                                        name="FatherStatus"
                                        value="ไม่มีชีวิต"
                                        checked={fatherData.Status === 'ไม่มีชีวิต'}
                                        className="ml-4 mr-2"
                                        disabled // Disabled to make the field non-editable
                                    />{' '}
                                    ไม่มีชีวิต
                                </div>
                            </div>

                            <div className="">
                                <label htmlFor="FatherPhone" className="block text-gray-700 mb-2">
                                    เบอร์โทร
                                </label>
                                <input
                                    type="text"
                                    id="FatherPhone"
                                    name="Phone"
                                    value={fatherData.Phone}
                                    className="w-70 p-3 border border-gray-300 rounded"
                                    disabled // Disabled to make the field non-editable
                                />
                            </div>
                            <div className="">
                                <label htmlFor="FatherOccupation" className="block text-gray-700 mb-2">
                                    อาชีพ
                                </label>
                                <input
                                    type="text"
                                    id="FatherOccupation"
                                    name="Occupation"
                                    value={fatherData.Occupation}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled // Disabled to make the field non-editable
                                />
                            </div>
                            <div className="">
                                <label htmlFor="FatherIncome" className="block text-gray-700 mb-2">
                                    รายได้ต่อเดือน
                                </label>
                                <input
                                    type="number"
                                    id="FatherIncome"
                                    name="Income"
                                    value={fatherData.Income}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled // Disabled to make the field non-editable
                                />
                            </div>
                            <div className="">
                                <label htmlFor="FatherWorkplace" className="block text-gray-700 mb-2">
                                    สถานที่ทำงาน
                                </label>
                                <input
                                    type="text"
                                    id="FatherWorkplace"
                                    name="Workplace"
                                    value={fatherData.Workplace}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled // Disabled to make the field non-editable
                                />
                            </div>
                        </div>

                        {/* Mother's Information */}
                        <div className="mb-10 grid sm:grid-cols-1 md:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                            <div>
                                <label htmlFor="MotherPrefixName" className="block text-gray-700 mb-2">
                                    คำนำหน้า
                                </label>
                                <input
                                    id="MotherPrefixName"
                                    name="PrefixName"
                                    value={motherData.PrefixName || ""}
                                    className="w-30 p-3 border border-gray-300 rounded"
                                    disabled // Disabled to make the field non-editable
                                />

                            </div>

                            <div className="">
                                <label htmlFor="MotherFirstName" className="block text-gray-700 mb-2">
                                    มารดาชื่อ
                                </label>
                                <input
                                    type="text"
                                    id="MotherFirstName"
                                    name="FirstName"
                                    value={motherData.FirstName}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled // Disabled to make the field non-editable
                                />
                            </div>
                            <div className="">
                                <label htmlFor="MotherLastName" className="block text-gray-700 mb-2">
                                    นามสกุล
                                </label>
                                <input
                                    type="text"
                                    id="MotherLastName"
                                    name="LastName"
                                    value={motherData.LastName}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled // Disabled to make the field non-editable
                                />
                            </div>
                            <div className="">
                                <label htmlFor="MotherAge" className="block text-gray-700 mb-2">
                                    อายุ
                                </label>
                                <input
                                    type="number"
                                    id="MotherAge"
                                    name="Age"
                                    value={motherData.Age}
                                    className="w-20 p-3 border border-gray-300 rounded"
                                    disabled // Disabled to make the field non-editable
                                />
                            </div>
                            <div>
                                <label htmlFor="MotherStatusAlive" className="block text-gray-700 mb-2">
                                    สถานภาพ (แม่)
                                </label>
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="MotherStatusAlive"
                                        name="MotherStatus"
                                        value="มีชีวิต"
                                        checked={motherData.Status === 'มีชีวิต'}
                                        className="mr-2"
                                        disabled // Disabled to make the field non-editable
                                    />{' '}
                                    มีชีวิต
                                    <input
                                        type="radio"
                                        id="MotherStatusDeceased"
                                        name="MotherStatus"
                                        value="ไม่มีชีวิต"
                                        checked={motherData.Status === 'ไม่มีชีวิต'}
                                        className="ml-4 mr-2"
                                        disabled // Disabled to make the field non-editable
                                    />{' '}
                                    ไม่มีชีวิต
                                </div>
                            </div>

                            <div className="">
                                <label htmlFor="MotherPhone" className="block text-gray-700 mb-2">
                                    เบอร์โทร
                                </label>
                                <input
                                    type="text"
                                    id="MotherPhone"
                                    name="Phone"
                                    value={motherData.Phone}
                                    className="w-70 p-3 border border-gray-300 rounded"
                                    disabled // Disabled to make the field non-editable
                                />
                            </div>
                            <div className="">
                                <label htmlFor="MotherOccupation" className="block text-gray-700 mb-2">
                                    อาชีพ
                                </label>
                                <input
                                    type="text"
                                    id="MotherOccupation"
                                    name="Occupation"
                                    value={motherData.Occupation}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled // Disabled to make the field non-editable
                                />
                            </div>
                            <div className="">
                                <label htmlFor="MotherIncome" className="block text-gray-700 mb-2">
                                    รายได้ต่อเดือน
                                </label>
                                <input
                                    type="number"
                                    id="MotherIncome"
                                    name="Income"
                                    value={motherData.Income}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled // Disabled to make the field non-editable
                                />
                            </div>
                            <div className="">
                                <label htmlFor="MotherWorkplace" className="block text-gray-700 mb-2">
                                    สถานที่ทำงาน
                                </label>
                                <input
                                    type="text"
                                    id="MotherWorkplace"
                                    name="Workplace"
                                    value={motherData.Workplace}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled // Disabled to make the field non-editable
                                />
                            </div>
                        </div>

                  

                        {/* Sibling Information */}
                        <div className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-6">
                            <div className="">
                                <label htmlFor="NumberOfSiblings" className="block text-gray-700 mb-2">จำนวนพี่น้อง</label>
                                <input
                                    type="number"
                                    id="NumberOfSiblings"
                                    name="NumberOfSiblings"
                                    value={applicationData.NumberOfSiblings}

                                    className="w-50 p-3 border border-gray-300 rounded"
                                    min={applicationData.NumberOfSiblings || 0} // กำหนดค่า min ให้เป็นค่าเริ่มต้นหรือ 2
                                    disabled // Disabled to make the field non-editable
                                />
                            </div>



                            <div className="">
                                <label htmlFor="NumberOfBrothers" className="block text-gray-700 mb-2">
                                    จำนวนพี่น้องชาย
                                </label>
                                <input
                                    type="number"
                                    id="NumberOfBrothers"
                                    name="NumberOfBrothers"
                                    value={applicationData.NumberOfBrothers}

                                    className="w-50 p-3 border border-gray-300 rounded"
                                    disabled // Disabled to make the field non-editable
                                />
                            </div>
                            <div className="">
                                <label htmlFor="NumberOfSisters" className="block text-gray-700 mb-2">
                                    จำนวนพี่น้องหญิง
                                </label>
                                <input
                                    type="number"
                                    id="NumberOfSisters"
                                    name="NumberOfSisters"
                                    value={applicationData.NumberOfSisters}

                                    className="w-50 p-3 border border-gray-300 rounded"
                                    disabled // Disabled to make the field non-editable
                                />
                            </div>
                        </div>


                        {siblingsData.map((sibling, index) => (
                            <div key={index} className="mb-4 grid grid-cols-1 sm:grid-cols-8 gap-6">
                                <div>
                                    <label htmlFor={`PrefixName-${index}`} className="block text-gray-700 mb-2">คำนำหน้า</label>
                                    <input
                                        id={`PrefixName-${index}`}
                                        name="PrefixName"
                                        value={sibling.PrefixName}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />

                                </div>
                                <div>
                                    <label htmlFor={`Fname-${index}`} className="block text-gray-700 mb-2">ชื่อ</label>
                                    <input
                                        type="text"
                                        id={`Fname-${index}`}
                                        name="Fname"
                                        value={sibling.Fname}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`Lname-${index}`} className="block text-gray-700 mb-2">นามสกุล</label>
                                    <input
                                        type="text"
                                        id={`Lname-${index}`}
                                        name="Lname"
                                        value={sibling.Lname}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`Occupation-${index}`} className="block text-gray-700 mb-2">อาชีพ</label>
                                    <input
                                        type="text"
                                        id={`Occupation-${index}`}
                                        name="Occupation"
                                        value={sibling.Occupation}

                                        className="w-full p-3 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`EducationLevel-${index}`} className="block text-gray-700 mb-2">ระดับการศึกษา</label>
                                    <input
                                        id={`EducationLevel-${index}`}
                                        name="EducationLevel"
                                        value={sibling.EducationLevel}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />

                                </div>

                                <div>
                                    <label htmlFor={`Income-${index}`} className="block text-gray-700 mb-2">รายได้</label>
                                    <input
                                        type="number"
                                        id={`Income-${index}`}
                                        name="Income"
                                        value={sibling.Income}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`Status-${index}`} className="block text-gray-700 mb-2">สถานะ</label>
                                    <input
                                        id={`Status-${index}`}
                                        name="Status"
                                        value={sibling.Status}

                                        className="w-30 p-3 border border-gray-300 rounded"
                                        disabled

                                    />

                                </div>

                            </div>
                        ))}
                    </div>
                );


            case 3:
                return (
                    <div>
                        <div className="space-y-4">
                            <div className="mb-1 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                                <div className="text-center font-semibold">
                                    ปริญาตรีปีที่ 1
                                </div>
                                <div className="text-center font-semibold">
                                    ปริญาตรีปีที่ 2
                                </div>
                                <div className="text-center font-semibold">
                                    ปริญาตรีปีที่ 3
                                </div>
                            </div>

                            <div className="mb-1 grid grid-cols-1 sm:grid-cols-6 gap-4 items-center">
                                <div className="col-span-2">
                                    <label htmlFor="GPAYear1" className="block text-gray-700 mb-2">
                                        เกรดเฉลี่ย
                                    </label>
                                    <input
                                        type="number"
                                        id="GPAYear1"
                                        name="GPAYear1"
                                        value={applicationData.GPAYear1}

                                        inputMode="numeric"
                                        pattern="[1-9]*[0.0]"
                                        className="w-3/4 p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label htmlFor="GPAYear2" className="block text-gray-700 mb-2">
                                        เกรดเฉลี่ย
                                    </label>
                                    <input
                                        type="number"
                                        id="GPAYear2"
                                        name="GPAYear2"
                                        value={applicationData.GPAYear2}

                                        inputMode="numeric"
                                        pattern="[1-9]*[0.0]"
                                        className="w-3/4 p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label htmlFor="GPAYear3" className="block text-gray-700 mb-2">
                                        เกรดเฉลี่ย
                                    </label>
                                    <input
                                        type="number"
                                        id="GPAYear3"
                                        name="GPAYear3"
                                        value={applicationData.GPAYear3}

                                        inputMode="numeric"
                                        pattern="[1-9]*[0.0]"
                                        className="w-3/4 p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>


                            </div>

                            <div className="mb-1 grid grid-cols-1 sm:grid-cols-6 gap-4 items-center">
                                <div className="col-span-3">
                                    <label htmlFor="AdvisorName" className="block text-gray-700 mb-2">
                                        อาจารย์ที่ปรึกษา
                                    </label>
                                    <input
                                        type="text"
                                        id="AdvisorName"
                                        name="AdvisorName"
                                        value={applicationData.AdvisorName}

                                        className="w-3/4 p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='mt-10 '>
                            <h3 className="text-gray-700 font-semibold">กิจกรรมเสริมหลักสูตร</h3>
                            {activities.map((activity, index) => (
                                <div key={index} className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-6">
                                    <div>
                                        <label htmlFor={`AcademicYear-${index}`} className="block text-gray-700 mb-2">ปีการศึกษา</label>
                                        <input
                                            id={`AcademicYear-${index}`}
                                            name="AcademicYear"
                                            value={activity.AcademicYear}

                                            className="w-full p-3 border border-gray-300 rounded"
                                            disabled
                                        />

                                    </div>

                                    <div>
                                        <label htmlFor={`ActivityName-${index}`} className="block text-gray-700 mb-2">กิจกรรม</label>
                                        <input
                                            type="text"
                                            id={`ActivityName-${index}`}
                                            name="ActivityName"
                                            value={activity.ActivityName}

                                            className="w-full p-3 border border-gray-300 rounded"
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor={`Position-${index}`} className="block text-gray-700 mb-2">ตำแหน่ง</label>
                                        <input
                                            type="text"
                                            id={`Position-${index}`}
                                            name="Position"
                                            value={activity.Position}

                                            className="w-full p-3 border border-gray-300 rounded"
                                            disabled
                                        />
                                    </div>

                                </div>
                            ))}

                        </div>

                    </div>
                );

            case 4:
                return (
                    <div>
                        <div >

                            <h1>
                                ประวัติเคยได้รับทุน
                            </h1>
                            {scholarship_histories.map((scholarship, index) => (
                                <div key={index} className="mb-4 mt-2 grid grid-cols-1 sm:grid-cols-5 gap-6">
                                    <div>
                                        <label htmlFor={`ScholarshipName-${index}`} className="block text-gray-700 mb-2">ชื่อทุนที่ได้รับ</label>
                                        <input
                                            type="text"
                                            id={`ScholarshipName-${index}`}
                                            name="ScholarshipName"
                                            value={scholarship.ScholarshipName || ''}

                                            className="w-full p-3 border border-gray-300 rounded"
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor={`AcademicYear-${index}`} className="block text-gray-700 mb-2">ปีการศึกษา</label>
                                        <input
                                            id={`AcademicYear-${index}`}
                                            name="AcademicYear"
                                            value={scholarship.AcademicYear || ''}

                                            className="w-full p-3 border border-gray-300 rounded"
                                            disabled
                                        />

                                    </div>
                                    <div>
                                        <label htmlFor={`AmountReceived-${index}`} className="block text-gray-700 mb-2">จำนวนเงินทุน (บาท/ปี)</label>
                                        <input
                                            type="number"
                                            id={`AmountReceived-${index}`}
                                            name="AmountReceived"
                                            value={scholarship.AmountReceived !== null ? scholarship.AmountReceived : 0}

                                            className="w-full p-3 border border-gray-300 rounded"
                                            disabled
                                        />
                                    </div>

                                </div>
                            ))}

                        </div>

                        <h2>
                            ประวัติการทำงานเพื่อหารายได้พิเศษ
                        </h2>
                        {work_experiences.map((experience, index) => (
                            <div key={index} className="mb-4 grid grid-cols-1 sm:grid-cols-5 gap-6">
                                <div>
                                    <label htmlFor={`Name-${index}`} className="block text-gray-700 mb-2">ชื่อบริษัทผู้จ้าง</label>
                                    <input
                                        type="text"
                                        id={`Name-${index}`}
                                        name="Name"
                                        value={experience.Name || ''}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`JobType-${index}`} className="block text-gray-700 mb-2">ลักษณะงาน</label>
                                    <input
                                        type="text"
                                        id={`JobType-${index}`}
                                        name="JobType"
                                        value={experience.JobType || ''}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`Duration-${index}`} className="block text-gray-700 mb-2">ระยะเวลา</label>
                                    <input
                                        type="text"
                                        id={`Duration-${index}`}
                                        name="Duration"
                                        value={experience.Duration || ''}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`Earnings-${index}`} className="block text-gray-700 mb-2">รายได้</label>
                                    <input
                                        type="number"
                                        id={`Earnings-${index}`}
                                        name="Earnings"
                                        value={experience.Earnings !== null ? experience.Earnings : 0}

                                        className="w-full p-3 border border-gray-300 rounded"
                                        disabled
                                    />
                                </div>

                            </div>
                        ))}


                    </div>

                );

            case 5:
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
                                className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 2 ? 'border-blue-600' : 'border-gray-500'
                                    }`}
                            >
                                2
                            </span>
                            <span className="ml-2 hidden sm:inline">ประวัติครอบครัว</span>
                        </div>
                        <div
                            className={`flex items-center ml-4 sm:ml-8 ${step === 3 ? 'text-blue-600' : 'text-gray-500'
                                }`}
                        >
                            <span
                                className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 3 ? 'border-blue-600' : 'border-gray-500'
                                    }`}
                            >
                                3
                            </span>
                            <span className="ml-2 hidden sm:inline">ประวัติการศึกษา</span>
                        </div>
                        <div
                            className={`flex items-center ml-4 sm:ml-8 ${step === 4 ? 'text-blue-600' : 'text-gray-500'
                                }`}
                        >
                            <span
                                className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 4 ? 'border-blue-600' : 'border-gray-500'
                                    }`}
                            >
                                4
                            </span>
                            <span className="ml-2 hidden sm:inline">ประวัติการรับทุนศึกษา</span>
                        </div>
                        <div
                            className={`flex items-center ml-4 sm:ml-8 ${step === 5 ? 'text-blue-600' : 'text-gray-500'
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
                            {step < 5 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(step < 5 ? step + 1 : step)}
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
