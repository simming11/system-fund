"use client";
import { useRouter } from 'next/navigation';
import Header from '@/app/components/header/Header';
import Footer from '@/app/components/footer/footer';
import ApiStudentServices from '@/app/services/students/ApiStudent';
import ApiServiceLocations from '@/app/services/location/apiLocations';
import ApiApplicationUpdateInternalServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationUpdateInternal';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ApiApplicationCreateInternalServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationCreateInternal';
import ApiApplicationFileServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationFileServices';
import Swal from 'sweetalert2';
import ApiServiceScholarships from '@/app/services/scholarships/ApiScholarShips';

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
    scholarship:scholarship[];
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
    FilePath: string | File | null; // FilePath can be string, File, or null
    ExistingFilePath?: string; // Optional field for existing paths
    error?: string; // Optional error property to handle errors
}

interface scholarship {
    ScholarshipID: string;
    ScholarshipName: string;
   
}

interface CurrentAddressData extends Address { }

interface PageProps {
    params: {
        id: string
    }
}


export default function EditApplicationInternalPage({ params }: PageProps) {
    const router = useRouter();
    const id = params.id;
    const idStudent = localStorage.getItem('UserID');
    const token = localStorage.getItem('token');
    const [loading, setLoading] = useState(false); // Use one global loading state for all data fetching or individual ones if needed
    const [addressErrors, setAddressErrors] = useState<{ [key: string]: string }>({});
    const [currentAddressErrors, setCurrentAddressErrors] = useState<{ [key: string]: string }>({});
    const [applicationErrors, setApplicationErrors] = useState<{ [key: string]: string }>({});

    const [siblingsErrors, setSiblingsErrors] = useState<{
      PrefixName?: string;
      Fname?: string;
      Lname?: string;
      Occupation?: string;
      EducationLevel?: string;
      Income?: string;
      Status?: string;
    }[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({
      MonthlyIncome: '',
      MonthlyExpenses: '',
    });
  
    // State declarations
    const [step, setStep] = useState<number>(() => {
        const savedStep = sessionStorage.getItem('EditStep');
        return savedStep ? Number(savedStep) : 1;
    });

    const [Students, setStudents] = useState<Students>(() => {
        const savedStudents = sessionStorage.getItem('EditStudents');
        return savedStudents ? JSON.parse(savedStudents) : {
            StudentID: '',
            PrefixName: '',
            Course: '',
            Year_Entry: '',
            DOB: '',
        };
    });

    const [applicationData, setApplicationData] = useState<ApplicationInternalData>(() => {
        const savedApplicationData = sessionStorage.getItem('EditApplicationData');
        return savedApplicationData ? JSON.parse(savedApplicationData) : {
            StudentID: idStudent || '',
            ScholarshipID: '',
            ApplicationDate: '',
            Status: 'รออนุมัติ',
            MonthlyIncome: 1,
            MonthlyExpenses: 1,
            NumberOfSisters: "",
            NumberOfBrothers: "",
            NumberOfSiblings: "",  // Ensure this is initialized
            GPAYear1: "",
            GPAYear2: "",
            GPAYear3: "",
            AdvisorName: '',
            addresses: [],
            guardians: [],
            scholarship_histories: [],
            work_experiences: [],
            siblings: [],
            application_files: []
        };
    });


    const [guardianData, setGuardianData] = useState<GuardiansData[]>(() => {
        const savedGuardianData = sessionStorage.getItem('EditGuardianData');
        return savedGuardianData ? JSON.parse(savedGuardianData) : [];
    });

    const [addressData, setAddressData] = useState<Address>(() => {
        const savedAddressData = sessionStorage.getItem('EditAddressData');
        const data = savedAddressData ? JSON.parse(savedAddressData) : {
            ApplicationID: id,
            AddressLine: '',
            Subdistrict: '',
            province: '',
            District: '',
            PostalCode: '',
            Type: 'ที่อยู่ตามบัตรประชาชน',
        };

        return data;
    });

    const [currentAddressData, setCurrentAddressData] = useState<CurrentAddressData>(() => {
        const savedCurrentAddressData = sessionStorage.getItem('EditCurrentAddressData');
        const data = savedCurrentAddressData ? JSON.parse(savedCurrentAddressData) : {
            ApplicationID: id,
            AddressLine: '',
            Subdistrict: '',
            province: '',
            District: '',
            PostalCode: '',
            Type: 'ที่อยู่ปัจจุบัน',
        };

        return data;
    });


    const [fatherData, setFatherData] = useState<GuardiansData>(() => {
        const savedFatherData = sessionStorage.getItem('fatherData');
        return savedFatherData ? JSON.parse(savedFatherData) : {
          ApplicationID: '',
          FirstName: '',
          LastName: '',
          PrefixName: '',
          Type: 'บิดา',
          Occupation: '',
          Income: 0,
          Age: 0,
          Status: '',
          Workplace: '',
          Phone: '',
        };
      });
      const [fatherErrors, setFatherErrors] = useState({
        FirstName: '',
        LastName: '',
        Age: '',
        Occupation: '',
        Income: '',
        Workplace: '',
        Phone: '',
        PrefixName: '',
        Status: ''
      });
      const [motherData, setMotherData] = useState<GuardiansData>(() => {
        const savedMotherData = sessionStorage.getItem('motherData');
        return savedMotherData ? JSON.parse(savedMotherData) : {
          ApplicationID: '',
          FirstName: '',
          LastName: '',
          PrefixName: '',
          Type: 'มารดา',
          Occupation: '',
          Income: 0,
          Age: 0,
          Status: '',
          Workplace: '',
          Phone: '',
        };
      });
      const [motherErrors, setMotherErrors] = useState({
        FirstName: '',
        LastName: '',
        Age: '',
        Occupation: '',
        Income: '',
        Workplace: '',
        Phone: '',
        PrefixName: '',
        Status: ''
      });
      const [caretakerData, setCaretakerData] = useState<GuardiansData>(() => {
        const savedCaretakerData = sessionStorage.getItem('caretakerData');
        return savedCaretakerData ? JSON.parse(savedCaretakerData) : {
          PrefixName: '',
          FirstName: '',
          LastName: '',
          Age: '',
          Status: '',
          Phone: '',
          Occupation: '',
          Income: 0,
          Type: 'ผู้อุปการะ',
          Workplace: '',
        };
      });
      // สร้าง state สำหรับ caretaker errors
      const [caretakerErrors, setCaretakerErrors] = useState({
        PrefixName: '',
        FirstName: '',
        LastName: '',
        Age: '',
        Status: '',
        Phone: '',
        Occupation: '',
        Income: '',
        Workplace: '',
        CaretakerType: '',
      });
    const [siblingData, setSiblingData] = useState<SiblingsData>(() => {
        const savedSiblingData = sessionStorage.getItem('EditSiblingData');
        return savedSiblingData ? JSON.parse(savedSiblingData) : {
            ApplicationID: '',
            PrefixName: '',
            Fname: '',
            Lname: '',
            Occupation: '',
            EducationLevel: '',
            Income: 0,
            Status: '',
        };
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
        {
            ApplicationID: '',
            DocumentType: '',
            DocumentName: '',
            FilePath: null,
            ExistingFilePath: '',
            FileName: '',  // Add FileName property here
            error: ''
        }
    ]);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState<any>(null);
    const [provinces, setProvinces] = useState<{ id: number; name: string }[]>([]);

    const [districtsForIDCard, setDistrictsForIDCard] = useState<{ id: number; name: string }[]>([]);
    const [subdistrictsForIDCard, setSubdistrictsForIDCard] = useState<{ id: number; name: string }[]>([]);
    const [districtsForCurrentAddress, setDistrictsForCurrentAddress] = useState<{ id: number; name: string }[]>([]);
    const [subdistrictsForCurrentAddress, setSubdistrictsForCurrentAddress] = useState<{ id: number; name: string }[]>([]);
    const [scholarshipData, setScholarshipData] = useState<any>(null); // State to store the scholarship data
    const [getscholarshipData, setgetScholarshipData] = useState<any>(null); // State to store the scholarship data
    const [isCaretakerEditing, setIsCaretakerEditing] = useState(false);
    const [isParentEditing, setIsParentEditing] = useState(true);
    const [numberOfSiblings, setNumberOfSiblings] = useState<number>(() => {
        const savedNumberOfSiblings = sessionStorage.getItem('EditNumberOfSiblings');
        return savedNumberOfSiblings ? Number(savedNumberOfSiblings) : applicationData.NumberOfSiblings || 0;
    });

    const [siblingsData, setSiblingsData] = useState<SiblingsData[]>(() => {
        const savedSiblingsData = sessionStorage.getItem('EditSiblingsData');
        return savedSiblingsData ? JSON.parse(savedSiblingsData) : [];
    });

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
                setLoading(true);
                const response = await ApiApplicationUpdateInternalServices.getApplicationById(id);
                setApplicationData(response);
                console.log(response);
                setgetScholarshipData(response.scholarship)
                

                // setgetScholarshipData(response.scholarship.ScholarshipName)
                sessionStorage.setItem('applicationData', JSON.stringify(response));

                const addresses: Address[] = response.addresses || [];
                const idCardAddress = addresses.find((address) => address.Type === "ที่อยู่ตามบัตรประชาชน");
                const currentAddress = addresses.find((address) => address.Type === "ที่อยู่ปัจจุบัน");

                if (idCardAddress) {
                    setAddressData(idCardAddress);
                    sessionStorage.setItem('ShowAddressData', JSON.stringify(idCardAddress));
                }

                if (currentAddress) {
                    setCurrentAddressData(currentAddress);
                    sessionStorage.setItem('ShowCurrentAddressData', JSON.stringify(currentAddress));
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
                const father = guardians.find((guardian) => guardian.Type === 'บิดา') || { ...defaultGuardianData, Type: 'บิดา' };
                const mother = guardians.find((guardian) => guardian.Type === 'มารดา') || { ...defaultGuardianData, Type: 'มารดา' };
                const caretaker = guardians.find((guardian) => guardian.Type !== 'บิดา' && guardian.Type !== 'มารดา') || { ...defaultGuardianData, Type: '' };

                setFatherData(father);
                setMotherData(mother);
                setCaretakerData(caretaker);
                sessionStorage.setItem('ShowFatherData', JSON.stringify(father));
                sessionStorage.setItem('ShowMotherData', JSON.stringify(mother));
                sessionStorage.setItem('ShowCaretakerData', JSON.stringify(caretaker));

                setNumberOfSiblings(response.NumberOfSiblings)

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

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await ApiServiceLocations.getSouthernLocations();
                const provincesData = response.data.map((province: any) => ({
                    id: province.id,
                    name: province.name,
                }));
                setProvinces(provincesData);
            } catch (error) {
                console.error('Error fetching provinces:', error);
            }
        };

        fetchProvinces();
    }, []);

    useEffect(() => {
        // Handle fetching districts and subdistricts for ID Card Address
        if (addressData.province) {
            const fetchDistrictsForIDCard = async () => {
                try {
                    const response = await ApiServiceLocations.getDistricts(addressData.province);
                    if (response.data && Array.isArray(response.data)) {
                        const districtNames = response.data.map((district: { id: number; name: string }) => ({
                            id: district.id,
                            name: district.name,
                        }));
                        setDistrictsForIDCard(districtNames);
                        setSubdistrictsForIDCard([]); // Clear subdistricts when province changes
                    } else {
                        setDistrictsForIDCard([]);
                    }
                } catch (error) {
                    console.error('Error fetching districts:', error);
                    setDistrictsForIDCard([]);
                }
            };

            fetchDistrictsForIDCard();
        } else {
            setDistrictsForIDCard([]);
            setSubdistrictsForIDCard([]);
        }
    }, [addressData.province]);

    useEffect(() => {
        // Handle fetching subdistricts for ID Card Address
        if (addressData.District) {
            const fetchSubdistrictsForIDCard = async () => {
                try {
                    const response = await ApiServiceLocations.getSubdistricts(addressData.District);
                    if (response.data && Array.isArray(response.data)) {
                        const subdistrictNames = response.data.map((subdistrict: { id: number; name: string }) => ({
                            id: subdistrict.id,
                            name: subdistrict.name,
                        }));
                        setSubdistrictsForIDCard(subdistrictNames);
                    } else {
                        setSubdistrictsForIDCard([]);
                    }
                } catch (error) {
                    console.error('Error fetching subdistricts:', error);
                    setSubdistrictsForIDCard([]);
                }
            };

            fetchSubdistrictsForIDCard();
        } else {
            setSubdistrictsForIDCard([]);
        }
    }, [addressData.District]);

    useEffect(() => {
        // Handle fetching districts and subdistricts for Current Address
        if (currentAddressData.province) {
            const fetchDistrictsForCurrentAddress = async () => {
                try {
                    const response = await ApiServiceLocations.getDistricts(currentAddressData.province);
                    if (response.data && Array.isArray(response.data)) {
                        const districtNames = response.data.map((district: { id: number; name: string }) => ({
                            id: district.id,
                            name: district.name,
                        }));
                        setDistrictsForCurrentAddress(districtNames);
                        setSubdistrictsForCurrentAddress([]); // Clear subdistricts when province changes
                    } else {
                        setDistrictsForCurrentAddress([]);
                    }
                } catch (error) {
                    console.error('Error fetching districts:', error);
                    setDistrictsForCurrentAddress([]);
                }
            };

            fetchDistrictsForCurrentAddress();
        } else {
            setDistrictsForCurrentAddress([]);
            setSubdistrictsForCurrentAddress([]);
        }
    }, [currentAddressData.province]);

    useEffect(() => {
        // Handle fetching subdistricts for Current Address
        if (currentAddressData.District) {
            const fetchSubdistrictsForCurrentAddress = async () => {
                try {
                    const response = await ApiServiceLocations.getSubdistricts(currentAddressData.District);
                    if (response.data && Array.isArray(response.data)) {
                        const subdistrictNames = response.data.map((subdistrict: { id: number; name: string }) => ({
                            id: subdistrict.id,
                            name: subdistrict.name,
                        }));
                        setSubdistrictsForCurrentAddress(subdistrictNames);
                    } else {
                        setSubdistrictsForCurrentAddress([]);
                    }
                } catch (error) {
                    console.error('Error fetching subdistricts:', error);
                    setSubdistrictsForCurrentAddress([]);
                }
            };

            fetchSubdistrictsForCurrentAddress();
        } else {
            setSubdistrictsForCurrentAddress([]);
        }
    }, [currentAddressData.District]);


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div>
                <p className="ml-4 text-gray-600">Loading...</p>
            </div>
        );
    }



    const handleChangeApplication = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setApplicationData({
            ...applicationData,
            [name]: name === 'MonthlyIncome' || name === 'MonthlyExpenses' ||
                name === 'NumberOfSiblings' || name === 'NumberOfSisters' ||
                name === 'NumberOfBrothers' || name.startsWith('GPA')
                ? Number(value)
                : value,
        });
    };


    const handleChangeMother = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setMotherData(prevState => ({
            ...prevState,
            [name === 'MotherStatus' ? 'Status' : name]: name === 'Income' || name === 'Age' ? Number(value) : value,
        }));

        setIsCaretakerEditing(false);  // Disable caretaker editing when parent is being edited
        setIsParentEditing(true);  // Enable parent editing
    };

    const handleChangeFather = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFatherData(prevState => ({
            ...prevState,
            [name === 'FatherStatus' ? 'Status' : name]: name === 'Income' || name === 'Age' ? Number(value) : value,
        }));

        setIsCaretakerEditing(false);  // Disable caretaker editing when parent is being edited
        setIsParentEditing(true);  // Enable parent editing
    };

    const handleChangeCaretaker = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setCaretakerData((prevState: any) => ({
            ...prevState,
            [name]: name === 'Income' || name === 'Age' ? Number(value) : value,
        }));

        // Enable caretaker editing and disable parent editing
        setIsCaretakerEditing(true);
        setIsParentEditing(false);

    };

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



    const handleChangeSibling = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setSiblingsData(prevSiblings => {
            const updatedSiblings = [...prevSiblings];
            updatedSiblings[index] = { ...updatedSiblings[index], [name]: value };
            sessionStorage.setItem('siblingsData', JSON.stringify(updatedSiblings));
            return updatedSiblings;
        });
    };

    const handleNumberOfSiblingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setApplicationData(prevState => ({
            ...prevState,
            NumberOfSiblings: value
        }));

        setSiblingsData(prevSiblings => {
            const updatedSiblings = [...prevSiblings];
            if (value > updatedSiblings.length) {
                // Add new empty sibling objects if the new number is greater
                for (let i = updatedSiblings.length; i < value; i++) {
                    updatedSiblings.push({
                        ApplicationID: id || '',
                        PrefixName: '',
                        Fname: '',
                        Lname: '',
                        Occupation: '',
                        EducationLevel: '',
                        Income: 0,
                        Status: '',
                    });
                }
            } else if (value < updatedSiblings.length) {
                // Remove excess sibling objects if the new number is smaller
                updatedSiblings.splice(value);
            }
            sessionStorage.setItem('SetSiblingsData', JSON.stringify(updatedSiblings));
            return updatedSiblings;
        });

        sessionStorage.setItem('SetnumberOfSiblings', value.toString());
        setApplicationData({
            ...applicationData,
            NumberOfSiblings: value, // Update the number of siblings in applicationData
        });
    };



    const removeSibling = (index: number) => {
        setSiblingsData(prevSiblings => {
            const updatedSiblings = prevSiblings.filter((_, i) => i !== index);
            sessionStorage.setItem('RemoveSiblingsData', JSON.stringify(updatedSiblings));
            return updatedSiblings;
        });

        setApplicationData(prevState => ({
            ...prevState,
            NumberOfSiblings: prevState.NumberOfSiblings - 1,
        }));
    };





    const handleChangeAddress = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;


        setAddressData(prevData => {
            const updatedData = {
                ...prevData,
                [name]: value,
            };

            // Log the updated addressData state


            return updatedData;
        });
    };



    const handleChangeCurrentAddress = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Log name and value of the changed field


        setCurrentAddressData(prevData => {
            const updatedData = {
                ...prevData,
                [name]: value,
            };



            return updatedData;
        });
    };

    const handleCopyAddress = () => {
        setCurrentAddressData((prevData) => ({
            ...prevData,
            AddressLine: addressData.AddressLine,
            province: addressData.province,
            District: addressData.District,
            Subdistrict: addressData.Subdistrict,
            PostalCode: addressData.PostalCode,
        }));
    };

    const handleActivityChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newActivities = [...activities];
        newActivities[index] = {
            ...newActivities[index],
            [name]: value,
        };
        setActivities(newActivities);

        // Update the applicationData state with the new activities array
        setApplicationData(prevState => ({
            ...prevState,
            activities: newActivities,
        }));
    };

    const addActivity = () => {
        setActivities([...activities, { AcademicYear: '', ActivityName: '', Position: '', ApplicationID: '' }]);
    };

    const removeActivity = (index: number) => {
        const newActivities = activities.filter((_, i) => i !== index);
        setActivities(newActivities);
    };

    const handleScholarshipChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedScholarshipHistory = [...scholarship_histories];
        updatedScholarshipHistory[index] = {
            ...updatedScholarshipHistory[index],
            [name]: name === 'AmountReceived' ? Number(value) : value || '',
        };
        setScholarshipHistory(updatedScholarshipHistory);
    };

    const addScholarshipHistory = () => {
        setScholarshipHistory([...scholarship_histories
            , { ApplicationID: '', ScholarshipName: '', AmountReceived: 0, AcademicYear: '' }]);
    };

    const removeScholarshipHistory = (index: number) => {
        const updatedScholarshipHistory = scholarship_histories
            .filter((_, i) => i !== index);
        setScholarshipHistory(updatedScholarshipHistory);
    };

    const handleWorkExperienceChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedWorkExperiences = [...work_experiences];
        updatedWorkExperiences[index] = {
            ...updatedWorkExperiences[index],
            [name]: name === 'Earnings' ? Number(value) : value,
        };
        setWorkExperiences(updatedWorkExperiences);
    };

    const addWorkExperience = () => {
        setWorkExperiences([...work_experiences, { ApplicationID: '', Name: '', JobType: '', Duration: '', Earnings: 0 }]);
    };

    const removeWorkExperience = (index: number) => {
        const updatedWorkExperiences = work_experiences.filter((_, i) => i !== index);
        setWorkExperiences(updatedWorkExperiences);
    };

    const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedFiles = [...application_files];
        updatedFiles[index] = {
            ...updatedFiles[index],
            [name]: value,
        };
        setApplicationFiles(updatedFiles);
    };

    const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const updatedFiles = [...application_files];

        if (file) {
            // เก็บไฟล์ใหม่ใน state
            updatedFiles[index].FilePath = file;
        } else {
            // เก็บ path ไฟล์เดิมใน state
            updatedFiles[index].FilePath = updatedFiles[index].ExistingFilePath || updatedFiles[index].FilePath;
            // ใช้ path เดิมหากไม่มี ExistingFilePath
        }

        setApplicationFiles(updatedFiles);
    };


    // Function to add a new file entry
    const addFileEntry = () => {
        setApplicationFiles([
            ...application_files,
            { ApplicationID: '', DocumentName: '', DocumentType: '', FilePath: '', FileName: '' } // Added FileName field
        ]);
    };

    // ฟังก์ชันลบไฟล์
    const removeFileEntry = (index: number) => {
        const updatedFiles = application_files.filter((_, i) => i !== index);
        setApplicationFiles(updatedFiles);

        // Log the updated files array after deletion


        // ส่งข้อมูลไป backend
        const filesDataToSend = JSON.stringify(updatedFiles);

    };

    // Validate all file entries before submission
    const validateFiles = () => {
        const updatedFiles = [...application_files];
        let isValid = true;

        updatedFiles.forEach((file, index) => {
            if (!file.DocumentType || !file.DocumentName || (!file.FilePath && !file.ExistingFilePath)) {
                updatedFiles[index].error = 'กรุณากรอกข้อมูลให้ครบถ้วนและอัปโหลดไฟล์';
                isValid = false;
            } else {
                updatedFiles[index].error = ''; // Clear error if everything is filled
            }
        });

        setApplicationFiles(updatedFiles);
        return isValid;
    };

    const validateApplication = () => {
        const errors: { [key: string]: string } = {};
      
        const academicYear = Number(calculateAcademicYear(userData?.Year_Entry));
      
        if (academicYear >= 1) {
          if (!applicationData.GPAYear1 || applicationData.GPAYear1 < 0 || applicationData.GPAYear1 > 4) {
            errors.GPAYear1 = 'กรุณากรอกเกรดเฉลี่ยปีที่ 1 (0 - 4.00)';
          }
        }
      
        if (academicYear >= 2) {
          if (!applicationData.GPAYear2 || applicationData.GPAYear2 < 0 || applicationData.GPAYear2 > 4) {
            errors.GPAYear2 = 'กรุณากรอกเกรดเฉลี่ยปีที่ 2 (0 - 4.00)';
          }
        }
      
        if (academicYear >= 3) {
          if (!applicationData.GPAYear3 || applicationData.GPAYear3 < 0 || applicationData.GPAYear3 > 4) {
            errors.GPAYear3 = 'กรุณากรอกเกรดเฉลี่ยปีที่ 3 (0 - 4.00)';
          }
        }
      
        if (!applicationData.AdvisorName) {
          errors.AdvisorName = 'กรุณากรอกชื่ออาจารย์ที่ปรึกษา';
        }
      
        setApplicationErrors(errors);
        return Object.keys(errors).length === 0;
      };
      
    
    
    //   const validateSiblingsData = () => {
    //     let isValid = true;
    //     const errors = siblingsData.map((sibling) => {
    //       const siblingErrors = {
    //         PrefixName: sibling.PrefixName ? '' : 'กรุณาเลือกคำนำหน้า',
    //         Fname: sibling.Fname ? '' : 'กรุณากรอกชื่อ',
    //         Lname: sibling.Lname ? '' : 'กรุณากรอกนามสกุล',
    //         Occupation: sibling.Occupation ? '' : 'กรุณากรอกอาชีพ',
    //         EducationLevel: sibling.EducationLevel ? '' : 'กรุณาเลือกระดับการศึกษา',
    //         Income: sibling.Income ? '' : 'กรุณากรอกรายได้',
    //         Status: sibling.Status ? '' : 'กรุณาเลือกสถานะ',
    //       };
    
    //       Object.values(siblingErrors).forEach((error) => {
    //         if (error) {
    //           isValid = false;
    //         }
    //       });
    
    //       return siblingErrors;
    //     });
    
    //     setSiblingsErrors(errors); // Set errors in state
    //     return isValid;
    //   };
    
      const validateApplicationData = () => {
        let isValid = true;
    
        // Set validation errors based on conditions
        const validationErrors = {
          MonthlyIncome: applicationData.MonthlyIncome > 0 ? '' : 'กรุณากรอกรายได้ที่ถูกต้อง',
          MonthlyExpenses: applicationData.MonthlyExpenses > 0 ? '' : 'กรุณากรอกรายจ่ายที่ถูกต้อง',
        };
    
        // Check if any errors exist
        Object.values(validationErrors).forEach((error) => {
          if (error) {
            isValid = false;
          }
        });
    
        setErrors(validationErrors); // Set errors in state to trigger UI updates
        return isValid;
      };

      const validateAddress = () => {
        const errors: { [key: string]: string } = {};
    
        if (!addressData.AddressLine) errors.AddressLine = 'กรุณากรอกเลขที่';
        if (!addressData.province) errors.province = 'กรุณาเลือกจังหวัด';
        if (!addressData.District) errors.District = 'กรุณาเลือกอำเภอ';
        if (!addressData.Subdistrict) errors.Subdistrict = 'กรุณาเลือกตำบล';
        if (!addressData.PostalCode) errors.PostalCode = 'กรุณากรอกรหัสไปรษณีย์';
    
        setAddressErrors(errors);
        return Object.keys(errors).length === 0;
      };
    
      const validateCurrentAddress = () => {
        const errors: { [key: string]: string } = {};
    
        if (!currentAddressData.AddressLine) errors.AddressLine = 'กรุณากรอกเลขที่';
        if (!currentAddressData.province) errors.province = 'กรุณาเลือกจังหวัด';
        if (!currentAddressData.District) errors.District = 'กรุณาเลือกอำเภอ';
        if (!currentAddressData.Subdistrict) errors.Subdistrict = 'กรุณาเลือกตำบล';
        if (!currentAddressData.PostalCode) errors.PostalCode = 'กรุณากรอกรหัสไปรษณีย์';
    
        setCurrentAddressErrors(errors);
        return Object.keys(errors).length === 0;
      };
    
      const handlefatherValidation = () => {
        const errors = {
          PrefixName: '',
          FirstName: '',
          LastName: '',
          Age: '',
          Occupation: '',
          Income: '',
          Workplace: '',
          Phone: '',
          Status: ''
        };
        let isValid = true;
    
        // ตรวจสอบคำนำหน้า (PrefixName)
        if (!fatherData.PrefixName) {
          errors.PrefixName = 'กรุณากรอกคำนำหน้า';
          isValid = false;
        }
    
        // ถ้าเลือก "ไม่ระบุ" ไม่ต้อง validate ฟิลด์อื่น
        if (fatherData.PrefixName === 'ไม่ระบุ') {
          setFatherErrors(errors);
          return true; // return true if PrefixName is "ไม่ระบุ"
        }
    
        // ตรวจสอบชื่อบิดา
        if (!fatherData.FirstName) {
          errors.FirstName = 'กรุณากรอกชื่อบิดา';
          isValid = false;
        }
    
        // ตรวจสอบนามสกุลบิดา
        if (!fatherData.LastName) {
          errors.LastName = 'กรุณากรอกนามสกุล';
          isValid = false;
        }
    
        // ตรวจสอบอายุ
        if (!fatherData.Age || fatherData.Age <= 0 || fatherData.Age > 150) {
          errors.Age = 'กรุณากรอกอายุที่ถูกต้อง';
          isValid = false;
        }
    
        // ตรวจสอบสถานภาพ (บิดา)
        if (!fatherData.Status) {
          errors.Status = 'กรุณาระบุสถานภาพของบิดา';
          isValid = false;
        }
    
        // ถ้าเสียชีวิตแล้ว ไม่ต้อง validate ฟิลด์อื่น
        if (fatherData.Status === 'เสียชีวิตแล้ว') {
          setFatherErrors(errors);
          return isValid;
        }
    
        // ตรวจสอบอาชีพเมื่อยังมีชีวิตอยู่
        if (fatherData.Status === 'ยังมีชีวิตอยู่') {
          if (!fatherData.Occupation) {
            errors.Occupation = 'กรุณากรอกอาชีพ';
            isValid = false;
          }
    
          if (!fatherData.Income) {
            errors.Income = 'กรุณากรอกรายได้ต่อเดือน';
            isValid = false;
          }
    
          if (!fatherData.Workplace) {
            errors.Workplace = 'กรุณากรอกสถานที่ทำงาน';
            isValid = false;
          }
    
          if (!fatherData.Phone || fatherData.Phone.length !== 10) {
            errors.Phone = 'กรุณากรอกเบอร์โทรที่ถูกต้อง';
            isValid = false;
          }
        }
    
        // อัปเดต state ของ errors
        setFatherErrors(errors);
    
        // return true ถ้าไม่มีข้อผิดพลาด หรือ false ถ้ามี
        return isValid;
      };
    
    
    
      const handlemotherValidation = () => {
        const errors = {
          PrefixName: '',
          FirstName: '',
          LastName: '',
          Age: '',
          Occupation: '',
          Income: '',
          Workplace: '',
          Phone: '',
          Status: ''
        };
        let isValid = true;
    
        // If prefix is 'ไม่ระบุ', skip all validations and return
        if (motherData.PrefixName === 'ไม่ระบุ') {
          setMotherErrors(errors);
          return true; // Valid because we're skipping validation
        }
    
        // Validate PrefixName
        if (!motherData.PrefixName) {
          errors.PrefixName = 'กรุณากรอกคำนำหน้า';
          isValid = false;
        }
    
        // Validate FirstName
        if (!motherData.FirstName) {
          errors.FirstName = 'กรุณากรอกชื่อมารดา';
          isValid = false;
        }
    
        // Validate LastName
        if (!motherData.LastName) {
          errors.LastName = 'กรุณากรอกนามสกุล';
          isValid = false;
        }
    
        // Validate Age
        if (!motherData.Age || motherData.Age <= 0 || motherData.Age > 150) {
          errors.Age = 'กรุณากรอกอายุที่ถูกต้อง';
          isValid = false;
        }
    
        // Validate Status
        if (!motherData.Status) {
          errors.Status = 'กรุณาระบุสถานภาพของมารดา';
          isValid = false;
        }
    
        // If deceased, skip further validation
        if (motherData.Status === 'เสียชีวิตแล้ว') {
          setMotherErrors(errors);
          return isValid;
        }
    
        // Validate Occupation, Income, Workplace, Phone if alive
        if (motherData.Status === 'ยังมีชีวิตอยู่') {
          if (!motherData.Occupation) {
            errors.Occupation = 'กรุณากรอกอาชีพ';
            isValid = false;
          }
    
          if (!motherData.Income) {
            errors.Income = 'กรุณากรอกรายได้ต่อเดือน';
            isValid = false;
          }
    
          if (!motherData.Workplace) {
            errors.Workplace = 'กรุณากรอกสถานที่ทำงาน';
            isValid = false;
          }
    
          if (!motherData.Phone || motherData.Phone.length !== 10) {
            errors.Phone = 'กรุณากรอกเบอร์โทรที่ถูกต้อง';
            isValid = false;
          }
        }
    
        // Update state for errors
        setMotherErrors(errors);
        return isValid;
      };
    
      const handleResetCaretakerData = () => {
        setCaretakerData({
          PrefixName: '',
          FirstName: '',
          LastName: '',
          Age: 0, // ค่าเริ่มต้นของ number
          Status: '',
          Phone: '',
          Occupation: '',
          Income: 0, // ค่าเริ่มต้นของ number
          Workplace: '',
        
          ApplicationID: '', // เพิ่มฟิลด์ ApplicationID ตามโครงสร้างของ GuardiansData
          Type: '' // เพิ่มฟิลด์ Type ตามโครงสร้างของ GuardiansData
        });
    
        setCaretakerErrors({
          PrefixName: '',
          FirstName: '',
          LastName: '',
          Age: '',
          Status: '',
          Phone: '',
          Occupation: '',
          Income: '',
          Workplace: '',
          CaretakerType: ''
        });
      };
    
// ฟังก์ชันสำหรับตรวจสอบความถูกต้องของข้อมูลผู้อุปการะ
const validateCaretakerData = () => {
    const errors: any = {};
    let isValid = true;

    // จะทำการ validate เฉพาะเมื่อผู้ใช้กดปุ่มเปิดฟอร์มการกรอกข้อมูล
    if (isCaretakerEditing) {
      if (!caretakerData.PrefixName) {
        errors.PrefixName = 'กรุณาเลือกคำนำหน้า';
        isValid = false;
      }

      if (!caretakerData.FirstName) {
        errors.FirstName = 'กรุณากรอกชื่อ';
        isValid = false;
      }

      if (!caretakerData.LastName) {
        errors.LastName = 'กรุณากรอกนามสกุล';
        isValid = false;
      }

      if (!caretakerData.Age || caretakerData.Age <= 0 || caretakerData.Age > 150) {
        errors.Age = 'กรุณากรอกอายุที่ถูกต้อง';
        isValid = false;
      }

      if (!caretakerData.Status) {
        errors.Status = 'กรุณาระบุสถานภาพ';
        isValid = false;
      }

      if (!caretakerData.Phone || caretakerData.Phone.length !== 10) {
        errors.Phone = 'กรุณากรอกเบอร์โทรที่ถูกต้อง';
        isValid = false;
      }

      if (!caretakerData.Occupation) {
        errors.Occupation = 'กรุณากรอกอาชีพ';
        isValid = false;
      }

      if (!caretakerData.Income) {
        errors.Income = 'กรุณากรอกรายได้ต่อเดือน';
        isValid = false;
      }

      if (!caretakerData.Workplace) {
        errors.Workplace = 'กรุณากรอกสถานที่ทำงาน';
        isValid = false;
      }

      if (!caretakerData.Type) {
        errors.CaretakerType = 'กรุณากรอกความสัมพันธ์';
        isValid = false;
      }

      setCaretakerErrors(errors); // แสดงข้อความแจ้งเตือนข้อผิดพลาด
    }

    return isValid;
  };


    const handleNextStep = () => {
        if (step === 1) {
          if (!validateAddress()) return;
          if (!validateCurrentAddress()) return;
          if (!validateApplicationData()) return;
        }
        if (step === 2) {
        //   if (!validateSiblingsData()) return;
          if (!handlefatherValidation()) return;
          if (!handlemotherValidation()) return;
          if (!validateCaretakerData()) return;
        }
        if (step === 3) {
          if (!validateApplication()) return;
        }
    
        setStep(step < 5 ? step + 1 : step);
      };
    
    // Ensure applicationID is used correctly when saving
    const handleSave = async () => {
        if (!validateFiles()) {
            setError('กรุณากรอกข้อมูลให้ครบถ้วน');
            return; // Prevent submission if validation fails
        }
        try {
            setLoading(true); // Start loading
            if (!id) {
                throw new Error('Application ID not found');
            }

            // Update the application status before saving
            const updatedApplicationData = {
                ...applicationData,
                Status: 'บันทึกแล้ว',  // Update the status as required
            };

            // Validate that all required fields have values
            const requiredFields = [
                'StudentID',
                'ScholarshipID',
                'Status',
                'MonthlyIncome',
                'MonthlyExpenses',
                'NumberOfSiblings',
                'NumberOfSisters',
                'NumberOfBrothers',
                'GPAYear1',
                'GPAYear2',
                'GPAYear3',
                'AdvisorName'
            ];

            for (const field of requiredFields) {
                if (updatedApplicationData[field as keyof ApplicationInternalData] === undefined || updatedApplicationData[field as keyof ApplicationInternalData] === null) {
                    throw new Error(`The ${field} field is required.`);
                }
            }



            // Create JSON payload for application data
            const payload = {
                ApplicationID: id,
                StudentID: updatedApplicationData.StudentID,
                ScholarshipID: updatedApplicationData.ScholarshipID,
                ApplicationDate: updatedApplicationData.ApplicationDate,
                Status: updatedApplicationData.Status,
                MonthlyIncome: updatedApplicationData.MonthlyIncome,
                MonthlyExpenses: updatedApplicationData.MonthlyExpenses,
                NumberOfSiblings: updatedApplicationData.NumberOfSiblings,
                NumberOfSisters: updatedApplicationData.NumberOfSisters,
                NumberOfBrothers: updatedApplicationData.NumberOfBrothers,
                GPAYear1: updatedApplicationData.GPAYear1,
                GPAYear2: updatedApplicationData.GPAYear2,
                GPAYear3: updatedApplicationData.GPAYear3,
                AdvisorName: updatedApplicationData.AdvisorName,
            };



            // Send the JSON payload to the API to update application data
            await ApiApplicationUpdateInternalServices.updateApplication(id, payload);

            // Handle address data update
            if (addressData.ApplicationID) {


                if (
                    !addressData.AddressLine ||
                    !addressData.District ||
                    !addressData.PostalCode ||
                    !addressData.Subdistrict ||
                    !addressData.province ||
                    !addressData.Type
                ) {
                    throw new Error('Missing required fields in addressData');
                }

                addressData.Type = 'ที่อยู่ตามบัตรประชาชน';

                const primaryAddressPayload = [
                    {
                        AddressLine: addressData.AddressLine,
                        Subdistrict: addressData.Subdistrict,
                        province: addressData.province,
                        District: addressData.District,
                        PostalCode: addressData.PostalCode,
                        Type: addressData.Type,
                        ApplicationID: addressData.ApplicationID,
                    }
                ];



                if (currentAddressData.ApplicationID) {


                    if (
                        !currentAddressData.AddressLine ||
                        !currentAddressData.District ||
                        !currentAddressData.PostalCode ||
                        !currentAddressData.Subdistrict ||
                        !currentAddressData.province ||
                        !currentAddressData.Type
                    ) {
                        throw new Error('Missing required fields in currentAddressData');
                    }

                    currentAddressData.Type = 'ที่อยู่ปัจจุบัน';

                    const currentAddressPayload = [
                        {
                            AddressLine: currentAddressData.AddressLine,
                            Subdistrict: currentAddressData.Subdistrict,
                            province: currentAddressData.province,
                            District: currentAddressData.District,
                            PostalCode: currentAddressData.PostalCode,
                            Type: currentAddressData.Type,
                            ApplicationID: currentAddressData.ApplicationID,
                        }
                    ];



                    const result = await ApiApplicationUpdateInternalServices.updateAddressesByApplicationID(
                        currentAddressData.ApplicationID,
                        primaryAddressPayload,
                        currentAddressPayload
                    );


                }
            }

            // Handle guardians data update
            const guardiansPayload = [fatherData, motherData, caretakerData].filter(guardian => guardian.FirstName || guardian.LastName);


            if (guardiansPayload.length > 0) {
                await ApiApplicationUpdateInternalServices.updateGuardiansByApplicationID(id, guardiansPayload);

            }

            // Handle siblings data update
            const siblingsPayload = siblingsData.filter(
                (sibling) => sibling.Fname || sibling.Lname || sibling.Occupation || sibling.EducationLevel || sibling.Income || sibling.Status
            );



            try {
                const response = await ApiApplicationUpdateInternalServices.updateSiblingsByApplicationID(id, siblingsPayload);

            } catch (error) {
                console.error('Error updating siblings data:', error);
            }

            // Handle activities data update
            const activitiesPayload = activities.filter(
                (activity) => activity.ActivityName || activity.AcademicYear || activity.Position
            );



            try {
                const response = await ApiApplicationUpdateInternalServices.updateActivitiesByApplicationID(id, activitiesPayload);

            } catch (error) {
                console.error('Error updating activities data:', error);
            }

            // Handle scholarship histories update
            const scholarshipHistoriesPayload = scholarship_histories.filter(
                (history) => history.ScholarshipName || history.AcademicYear || history.AmountReceived
            );



            try {
                const response = await ApiApplicationUpdateInternalServices.updateScholarshipHistory(id, scholarshipHistoriesPayload);

            } catch (error) {
                console.error('Error updating scholarship histories data:', error);
            }

            // Handle work experiences update
            const workExperiencesPayload = work_experiences.filter(
                (exp) => exp.Name || exp.JobType || exp.Duration || exp.Earnings
            );


            try {
                const response = await ApiApplicationUpdateInternalServices.updateWorkExperience(id, workExperiencesPayload);

            } catch (error) {
                console.error('Error updating work experiences data:', error);
            }

            const ApplicationID = id;

            // Create FormData object
            const formData = new FormData();

            application_files.forEach((fileData, index) => {
                formData.append(`application_files[${index}][DocumentName]`, fileData.DocumentName || '');
                formData.append(`application_files[${index}][DocumentType]`, fileData.DocumentType || '');
                formData.append(`application_files[${index}][ApplicationID]`, fileData.ApplicationID || '');

                // If it's a new file, append it
                if (fileData.FilePath instanceof File) {
                    formData.append(`application_files[${index}][FilePath]`, fileData.FilePath); // Upload the new file
                } else if (fileData.FilePath) {
                    // Append existing file path if no new file was uploaded
                    formData.append(`application_files[${index}][ExistingFilePath]`, fileData.FilePath); // Send existing file path
                }
            });

            // Log the content of the FormData for debugging
            for (let pair of formData.entries()) {

            }

            // Update the files using the FormData method
            ApiApplicationFileServices.updateApplicationFiles(ApplicationID, formData)
                .then(response => {

                })
                .catch(error => {
                    console.error('Error updating files:', error.response?.data || error.message);
                });







            // Log other application update status


            // Clear sessionStorage after successful save
            sessionStorage.removeItem('EditStep');
            sessionStorage.removeItem('EditStudents');
            sessionStorage.removeItem('EditApplicationData');
            sessionStorage.removeItem('EditGuardianData');
            sessionStorage.removeItem('EditAddressData');
            sessionStorage.removeItem('EditCurrentAddressData');
            sessionStorage.removeItem('EditFatherData');
            sessionStorage.removeItem('EditMotherData');
            sessionStorage.removeItem('EditCaretakerData');
            sessionStorage.removeItem('EditSiblingData');
            sessionStorage.removeItem('EditNumberOfSiblings');
            sessionStorage.removeItem('EditSiblingsData');
            sessionStorage.clear();
            Swal.fire({
                icon: "success",
                title: "บันทึกเรียบร้อย",
                showConfirmButton: false,
                timer: 1500
            });
            // Redirect to history page
            router.push(`/page/History-Application`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('API Error Response:', error.response?.data.errors);
                setError('Validation error: ' + error.response?.data.message);
            } else {
                console.error('Unknown Error:', error);
                setError('Error updating application. Please check the form fields and try again.');
            }
        }
    };
    const handleSubmit = async () => {
        if (!validateFiles()) {
            setError('กรุณากรอกข้อมูลให้ครบถ้วน');
            return; // Prevent submission if validation fails
        }
        // Show confirmation dialog
        Swal.fire({
            title: "คุณแน่ใจหรือไม่?",
            text: "คุณจะไม่สามารถแก้ไขข้อมูลหลังจากการส่งได้!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "ใช่, ส่งข้อมูล!",
            cancelButtonText: "ยกเลิก"
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Proceed with submission
                setLoading(true); // Optionally, set loading state to disable the form or show a spinner
                try {
                    setLoading(true); // Start loading
                    if (!id) {
                        throw new Error('Application ID not found');
                    }

                    // Update the application status before saving
                    const updatedApplicationData = {
                        ...applicationData,
                        Status: 'รอประกาศผล',  // Update the status as required
                    };

                    // Validate that all required fields have values
                    const requiredFields = [
                        'StudentID',
                        'ScholarshipID',
                        'Status',
                        'MonthlyIncome',
                        'MonthlyExpenses',
                        'NumberOfSiblings',
                        'NumberOfSisters',
                        'NumberOfBrothers',
                        'GPAYear1',
                        'GPAYear2',
                        'GPAYear3',
                        'AdvisorName'
                    ];

                    for (const field of requiredFields) {
                        if (updatedApplicationData[field as keyof ApplicationInternalData] === undefined || updatedApplicationData[field as keyof ApplicationInternalData] === null) {
                            throw new Error(`The ${field} field is required.`);
                        }
                    }

                    // Log application data to ensure everything is correctly set


                    // Create JSON payload for application data
                    const payload = {
                        ApplicationID: id,
                        StudentID: updatedApplicationData.StudentID,
                        ScholarshipID: updatedApplicationData.ScholarshipID,
                        ApplicationDate: updatedApplicationData.ApplicationDate,
                        Status: updatedApplicationData.Status,
                        MonthlyIncome: updatedApplicationData.MonthlyIncome,
                        MonthlyExpenses: updatedApplicationData.MonthlyExpenses,
                        NumberOfSiblings: updatedApplicationData.NumberOfSiblings,
                        NumberOfSisters: updatedApplicationData.NumberOfSisters,
                        NumberOfBrothers: updatedApplicationData.NumberOfBrothers,
                        GPAYear1: updatedApplicationData.GPAYear1,
                        GPAYear2: updatedApplicationData.GPAYear2,
                        GPAYear3: updatedApplicationData.GPAYear3,
                        AdvisorName: updatedApplicationData.AdvisorName,
                    };



                    // Send the JSON payload to the API to update application data
                    await ApiApplicationUpdateInternalServices.updateApplication(id, payload);

                    // Handle address data update
                    if (addressData.ApplicationID) {


                        if (
                            !addressData.AddressLine ||
                            !addressData.District ||
                            !addressData.PostalCode ||
                            !addressData.Subdistrict ||
                            !addressData.province ||
                            !addressData.Type
                        ) {
                            throw new Error('Missing required fields in addressData');
                        }

                        addressData.Type = 'ที่อยู่ตามบัตรประชาชน';

                        const primaryAddressPayload = [
                            {
                                AddressLine: addressData.AddressLine,
                                Subdistrict: addressData.Subdistrict,
                                province: addressData.province,
                                District: addressData.District,
                                PostalCode: addressData.PostalCode,
                                Type: addressData.Type,
                                ApplicationID: addressData.ApplicationID,
                            }
                        ];



                        if (currentAddressData.ApplicationID) {
                            if (
                                !currentAddressData.AddressLine ||
                                !currentAddressData.District ||
                                !currentAddressData.PostalCode ||
                                !currentAddressData.Subdistrict ||
                                !currentAddressData.province ||
                                !currentAddressData.Type
                            ) {
                                throw new Error('Missing required fields in currentAddressData');
                            }

                            currentAddressData.Type = 'ที่อยู่ปัจจุบัน';

                            const currentAddressPayload = [
                                {
                                    AddressLine: currentAddressData.AddressLine,
                                    Subdistrict: currentAddressData.Subdistrict,
                                    province: currentAddressData.province,
                                    District: currentAddressData.District,
                                    PostalCode: currentAddressData.PostalCode,
                                    Type: currentAddressData.Type,
                                    ApplicationID: currentAddressData.ApplicationID,
                                }
                            ];



                            const result = await ApiApplicationUpdateInternalServices.updateAddressesByApplicationID(
                                currentAddressData.ApplicationID,
                                primaryAddressPayload,
                                currentAddressPayload
                            );


                        }
                    }

                    // Handle guardians data update
                    const guardiansPayload = [fatherData, motherData].filter(guardian => guardian.FirstName || guardian.LastName);


                    if (guardiansPayload.length > 0) {
                        await ApiApplicationUpdateInternalServices.updateGuardiansByApplicationID(id, guardiansPayload);

                    }

                    // Handle siblings data update
                    const siblingsPayload = siblingsData.filter(
                        (sibling) => sibling.Fname || sibling.Lname || sibling.Occupation || sibling.EducationLevel || sibling.Income || sibling.Status
                    );



                    try {
                        const response = await ApiApplicationUpdateInternalServices.updateSiblingsByApplicationID(id, siblingsPayload);

                    } catch (error) {
                        console.error('Error updating siblings data:', error);
                    }

                    // Handle activities data update
                    const activitiesPayload = activities.filter(
                        (activity) => activity.ActivityName || activity.AcademicYear || activity.Position
                    );



                    try {
                        const response = await ApiApplicationUpdateInternalServices.updateActivitiesByApplicationID(id, activitiesPayload);

                    } catch (error) {
                        console.error('Error updating activities data:', error);
                    }

                    // Handle scholarship histories update
                    const scholarshipHistoriesPayload = scholarship_histories.filter(
                        (history) => history.ScholarshipName || history.AcademicYear || history.AmountReceived
                    );



                    try {
                        const response = await ApiApplicationUpdateInternalServices.updateScholarshipHistory(id, scholarshipHistoriesPayload);

                    } catch (error) {
                        console.error('Error updating scholarship histories data:', error);
                    }

                    // Handle work experiences update
                    const workExperiencesPayload = work_experiences.filter(
                        (exp) => exp.Name || exp.JobType || exp.Duration || exp.Earnings
                    );



                    try {
                        const response = await ApiApplicationUpdateInternalServices.updateWorkExperience(id, workExperiencesPayload);

                    } catch (error) {
                        console.error('Error updating work experiences data:', error);
                    }
                    // Prepare the array for file details, using ApplicationID from the id provided
                    const ApplicationID = id;

                    // Create FormData object
                    const formData = new FormData();

                    application_files.forEach((fileData, index) => {
                        formData.append(`application_files[${index}][DocumentName]`, fileData.DocumentName || '');
                        formData.append(`application_files[${index}][DocumentType]`, fileData.DocumentType || '');
                        formData.append(`application_files[${index}][ApplicationID]`, fileData.ApplicationID || '');

                        // If it's a new file, append it
                        if (fileData.FilePath instanceof File) {
                            formData.append(`application_files[${index}][FilePath]`, fileData.FilePath); // Upload the new file
                        } else if (fileData.FilePath) {
                            // Append existing file path if no new file was uploaded
                            formData.append(`application_files[${index}][ExistingFilePath]`, fileData.FilePath); // Send existing file path
                        }
                    });

                    // Log the content of the FormData for debugging
                    for (let pair of formData.entries()) {

                    }

                    // Update the files using the FormData method
                    ApiApplicationFileServices.updateApplicationFiles(ApplicationID, formData)
                        .then(response => {

                        })
                        .catch(error => {
                            console.error('Error updating files:', error.response?.data || error.message);
                        });





                    // Log other application update status


                    // Clear sessionStorage after successful save
                    sessionStorage.removeItem('EditStep');
                    sessionStorage.removeItem('EditStudents');
                    sessionStorage.removeItem('EditApplicationData');
                    sessionStorage.removeItem('EditGuardianData');
                    sessionStorage.removeItem('EditAddressData');
                    sessionStorage.removeItem('EditCurrentAddressData');
                    sessionStorage.removeItem('EditFatherData');
                    sessionStorage.removeItem('EditMotherData');
                    sessionStorage.removeItem('EditCaretakerData');
                    sessionStorage.removeItem('EditSiblingData');
                    sessionStorage.removeItem('EditNumberOfSiblings');
                    sessionStorage.removeItem('EditSiblingsData');
                    sessionStorage.clear();
                    Swal.fire({
                        icon: "success",
                        title: "สมัครทุนเรียบร้อย",
                        showConfirmButton: false,
                        timer: 1500
                    });
                    // Redirect to history page
                    router.push(`/page/History-Application`);
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        console.error('API Error Response:', error.response?.data.errors);
                        setError('Validation error: ' + error.response?.data.message);
                    } else {
                        console.error('Unknown Error:', error);
                        setError('Error updating application. Please check the form fields and try again.');
                    }
                }
            }
        });
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
                                        onChange={handleChangeApplication}
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
                                        onChange={handleChangeApplication}
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
                                        onChange={handleChangeApplication}
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
                                        onChange={handleChangeApplication}
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
                                        onChange={handleChangeApplication}
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
                                        onChange={handleChangeApplication}
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
                                        onChange={handleChangeApplication}
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
                                        onChange={handleChangeApplication}
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
                                        onChange={handleChangeApplication}
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
                                        onChange={handleChangeAddress}
                                        className="w-full p-3 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="province" className="block text-gray-700 mb-2">
                                        จังหวัด
                                    </label>
                                    <select
                                        id="province"
                                        name="province"
                                        value={addressData.province || ""}
                                        onChange={handleChangeAddress}
                                        className="w-full p-3 border border-gray-300 rounded"
                                    >
                                        <option value="">เลือกจังหวัด</option>
                                        {provinces.map((province) => (
                                            <option key={province.id} value={province.name}>
                                                {province.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="District" className="block text-gray-700 mb-2">
                                        อำเภอ
                                    </label>
                                    <select
                                        id="District"
                                        name="District"
                                        value={addressData.District || ""}
                                        onChange={handleChangeAddress}
                                        className="w-full p-3 border border-gray-300 rounded"
                                    >
                                        <option value="">เลือกอำเภอ</option>
                                        {districtsForIDCard.map((district) => (
                                            <option key={district.id} value={district.name}>
                                                {district.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="Subdistrict" className="block text-gray-700 mb-2">
                                        ตำบล
                                    </label>
                                    <select
                                        id="Subdistrict"
                                        name="Subdistrict"
                                        value={addressData.Subdistrict || ""}
                                        onChange={handleChangeAddress}
                                        className="w-full p-3 border border-gray-300 rounded"
                                    >
                                        <option value="">เลือกตำบล</option>
                                        {subdistrictsForIDCard.map((subdistrict) => (
                                            <option key={subdistrict.id} value={subdistrict.name}>
                                                {subdistrict.name}
                                            </option>
                                        ))}
                                    </select>
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
                                        onChange={handleChangeAddress}
                                        className="w-full p-3 border border-gray-300 rounded"
                                    />
                                </div>
                            </div>
                            <div className="mb-4 grid grid-cols-1 sm:grid-cols- gap-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-gray-700">
                                        ที่อยู่ปัจจุบัน
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const { Type, ...addressWithoutType } = addressData; // Destructure and exclude 'Type'
                                                setCurrentAddressData({ ...addressWithoutType, Type: 'ที่อยู่ปัจจุบัน' }); // Include the 'Type' field explicitly
                                            }}
                                            className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 ml-2"
                                        >
                                            ที่อยู่ตามบัตรประชาชน
                                        </button>
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
                                            onChange={handleChangeCurrentAddress}
                                            className="w-full p-3 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="province" className="block text-gray-700 mb-2">
                                            จังหวัด
                                        </label>
                                        <select
                                            id="province"
                                            name="province"
                                            value={currentAddressData.province || ""}
                                            onChange={handleChangeCurrentAddress}
                                            className="w-full p-3 border border-gray-300 rounded"
                                        >
                                            <option value="">เลือกจังหวัด</option>
                                            {provinces.map((province) => (
                                                <option key={province.id} value={province.name}>
                                                    {province.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="District" className="block text-gray-700 mb-2">
                                            อำเภอ
                                        </label>
                                        <select
                                            id="District"
                                            name="District"
                                            value={currentAddressData.District || ""}
                                            onChange={handleChangeCurrentAddress}
                                            className="w-full p-3 border border-gray-300 rounded"
                                        >
                                            <option value="">เลือกอำเภอ</option>
                                            {districtsForCurrentAddress.map((district) => (
                                                <option key={district.id} value={district.name}>
                                                    {district.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="Subdistrict" className="block text-gray-700 mb-2">
                                            ตำบล
                                        </label>
                                        <select
                                            id="Subdistrict"
                                            name="Subdistrict"
                                            value={currentAddressData.Subdistrict || ""}
                                            onChange={handleChangeCurrentAddress}
                                            className="w-full p-3 border border-gray-300 rounded"
                                        >
                                            <option value="">เลือกตำบล</option>
                                            {subdistrictsForCurrentAddress.map((subdistrict) => (
                                                <option key={subdistrict.id} value={subdistrict.name}>
                                                    {subdistrict.name}
                                                </option>
                                            ))}
                                        </select>
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
                                            onChange={handleChangeCurrentAddress}
                                            className="w-full p-3 border border-gray-300 rounded"
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
                                            onChange={handleChangeApplication}
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            className="w-80 p-3 border border-gray-300 rounded"
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
                                            onChange={handleChangeApplication}
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            className="w-80 p-3 border border-gray-300 rounded"
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
                                <select
                                    id="FatherPrefixName"
                                    name="PrefixName"
                                    value={fatherData.PrefixName || ""}
                                    onChange={handleChangeFather}
                                    className="w-30 p-3 border border-gray-300 rounded"
                                    disabled={isCaretakerEditing} // Disable if caretaker info is being edited
                                >
                                    <option value="">คำนำหน้า</option>
                                    <option value="นาย">นาย</option>
                                    <option value="นาง">นาง</option>
                                    <option value="นางสาว">นางสาว</option>
                                </select>
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
                                    onChange={handleChangeFather}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled={isCaretakerEditing} // Disable if caretaker info is being edited
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
                                    onChange={handleChangeFather}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled={isCaretakerEditing} // Disable if caretaker info is being edited
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
                                    onChange={handleChangeFather}
                                    className="w-20 p-3 border border-gray-300 rounded"
                                    disabled={isCaretakerEditing} // Disable if caretaker info is being edited
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
                                        onChange={handleChangeFather}
                                        className="mr-2"
                                    />{' '}
                                    มีชีวิต
                                    <input
                                        type="radio"
                                        id="FatherStatusDeceased"
                                        name="FatherStatus"
                                        value="ไม่มีชีวิต"
                                        checked={fatherData.Status === 'ไม่มีชีวิต'}
                                        onChange={handleChangeFather}
                                        className="ml-4 mr-2"
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
                                    onChange={handleChangeFather}
                                    className="w-70 p-3 border border-gray-300 rounded"
                                    disabled={isCaretakerEditing} // Disable if caretaker info is being edited
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
                                    onChange={handleChangeFather}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled={isCaretakerEditing} // Disable if caretaker info is being edited
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
                                    onChange={handleChangeFather}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled={isCaretakerEditing} // Disable if caretaker info is being edited
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
                                    onChange={handleChangeFather}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled={isCaretakerEditing} // Disable if caretaker info is being edited
                                />
                            </div>
                        </div>

                        {/* Mother's Information */}
                        <div className="mb-10 grid sm:grid-cols-1 md:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                            <div>
                                <label htmlFor="MotherPrefixName" className="block text-gray-700 mb-2">
                                    คำนำหน้า
                                </label>
                                <select
                                    id="MotherPrefixName"
                                    name="PrefixName"
                                    value={motherData.PrefixName || ""}
                                    onChange={handleChangeMother}
                                    className="w-30 p-3 border border-gray-300 rounded"
                                    disabled={isCaretakerEditing} // Disable if caretaker info is being edited
                                >
                                    <option value="">คำนำหน้า</option>
                                    <option value="นาย">นาย</option>
                                    <option value="นาง">นาง</option>
                                    <option value="นางสาว">นางสาว</option>
                                </select>
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
                                    onChange={handleChangeMother}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled={isCaretakerEditing} // Disable if caretaker info is being edited
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
                                    onChange={handleChangeMother}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled={isCaretakerEditing} // Disable if caretaker info is being edited
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
                                    onChange={handleChangeMother}
                                    className="w-20 p-3 border border-gray-300 rounded"
                                    disabled={isCaretakerEditing} // Disable if caretaker info is being edited
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
                                        onChange={handleChangeMother}
                                        className="mr-2"
                                    />{' '}
                                    มีชีวิต
                                    <input
                                        type="radio"
                                        id="MotherStatusDeceased"
                                        name="MotherStatus"
                                        value="ไม่มีชีวิต"
                                        checked={motherData.Status === 'ไม่มีชีวิต'}
                                        onChange={handleChangeMother}
                                        className="ml-4 mr-2"
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
                                    onChange={handleChangeMother}
                                    className="w-70 p-3 border border-gray-300 rounded"
                                    disabled={isCaretakerEditing} // Disable if caretaker info is being edited
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
                                    onChange={handleChangeMother}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled={isCaretakerEditing} // Disable if caretaker info is being edited
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
                                    onChange={handleChangeMother}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled={isCaretakerEditing} // Disable if caretaker info is being edited
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
                                    onChange={handleChangeMother}
                                    className="w-full p-3 border border-gray-300 rounded"
                                    disabled={isCaretakerEditing} // Disable if caretaker info is being edited
                                />
                            </div>
                        </div>

                                        {/* Caretaker Information */}
            <div className="mb-6">
              <div className="flex justify-start items-center space-x-4">
                <h2 className={`text-red-500 ${isCaretakerEditing ? 'text-gray-700' : ''}`}>
                  {isCaretakerEditing
                    ? 'กำลังกรอกข้อมูลผู้อุปการะ (ถ้าเป็นบิดามารดาไม่ต้องกรอกข้อมูล)'
                    : '*ผู้อุปการะ/ผู้เลี้ยงดู (ถ้าเป็นบิดาและมารดาไม่ต้องกรอกข้อมูล)'}
                </h2>
             
              </div>
              <div className="mb-3 grid sm:grid-cols-1 md:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                <div>
                  <label htmlFor="CaretakerPrefixName" className="block text-gray-700 mb-2">
                    คำนำหน้า
                  </label>
                  <select
                    id="CaretakerPrefixName"
                    name="PrefixName"
                    value={caretakerData.PrefixName}
                    onChange={handleChangeCaretaker}
                    className="w-full p-3 border border-gray-300 rounded"
                   
                  >
                    <option value="">คำนำหน้า</option>
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                  </select>
        
                </div>
                <div className="">
                  <label htmlFor="CaretakerFirstName" className="block text-gray-700 mb-2">
                    ชื่อ
                  </label>
                  <input
                    type="text"
                    id="CaretakerFirstName"
                    name="FirstName"
                    value={caretakerData.FirstName}
                    onChange={(e) => {
                      const onlyLetters = e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ''); // Allow only Thai, English letters, and spaces
                      setCaretakerData((prevState) => ({
                        ...prevState,
                        FirstName: onlyLetters,
                      }));
                    }}
                    className="w-full p-3 border border-gray-300 rounded"
                  
                  />
        
                </div>
                <div className="">
                  <label htmlFor="CaretakerLastName" className="block text-gray-700 mb-2">
                    นามสกุล
                  </label>
                  <input
                    type="text"
                    id="CaretakerLastName"
                    name="LastName"
                    value={caretakerData.LastName}
                    onChange={(e) => {
                      const onlyLetters = e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ''); // Allow only Thai, English letters, and spaces
                      setCaretakerData((prevState) => ({
                        ...prevState,
                        LastName: onlyLetters,
                      }));
                    }}
                    className="w-full p-3 border border-gray-300 rounded"
                  
                  />
             
                </div>
                <div className="">
                  <label htmlFor="CaretakerAge" className="block text-gray-700 mb-2">อายุ</label>
                  <input
                    type="number"
                    id="CaretakerAge"
                    name="Age"
                    value={caretakerData.Age} // ใช้ caretakerData.Age เพื่อให้แน่ใจว่าแสดงข้อมูลของผู้อุปการะ
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if ((value >= 1 && value <= 150) || e.target.value === "") {
                        handleChangeCaretaker(e); // อัปเดตเฉพาะค่าที่อยู่ในช่วง 1-150 หรือถ้าค่าว่าง
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded"
                    min="1"
                    max="150"
                  
                  />
         
                </div>
                <div className="">
                  <label htmlFor="CaretakerStatus" className="block text-gray-700 mb-2">
                    สถานภาพ
                  </label>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="CaretakerStatusAlive"
                      name="Status"
                      value="ยังมีชีวิตอยู่"
                      checked={caretakerData.Status === 'ยังมีชีวิตอยู่'}
                      onChange={handleChangeCaretaker}
                      className="mr-2"
                    
                    />{' '}
                    ยังมีชีวิตอยู่
                    <input
                      type="radio"
                      id="CaretakerStatusDeceased"
                      name="Status"
                      value="เสียชีวิตแล้ว"
                      checked={caretakerData.Status === 'เสียชีวิตแล้ว'}
                      onChange={handleChangeCaretaker}
                      className="ml-4 mr-2"
                    
                    />{' '}
                    เสียชีวิตแล้ว
                  </div>
            
                </div>
                <div className="">
                  <label htmlFor="CaretakerPhone" className="block text-gray-700 mb-2">
                    เบอร์โทร
                  </label>
                  <input
                    type="text"
                    id="CaretakerPhone"
                    name="Phone"
                    value={caretakerData.Phone}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, ''); // ลบตัวอักษรที่ไม่ใช่ตัวเลข
                      if (onlyNumbers.length <= 15) { // จำกัดไม่เกิน 10 ตัว
                        setCaretakerData((prevState) => ({
                          ...prevState,
                          Phone: onlyNumbers,
                        }));
                      } else {
                        setCaretakerData((prevState) => ({
                          ...prevState,
                          Phone: onlyNumbers.slice(0, 10), // ตัดตัวเลขเกิน 10 ตัว
                        }));
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded"
                  
                  />
            
                </div>
                <div className="">
                  <label htmlFor="CaretakerOccupation" className="block text-gray-700 mb-2">
                    อาชีพ
                  </label>
                  <input
                    type="text"
                    id="CaretakerOccupation"
                    name="Occupation"
                    value={caretakerData.Occupation}
                    onChange={(e) => {
                      const onlyLetters = e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ''); // Allow only Thai, English letters, and spaces
                      setCaretakerData((prevState) => ({
                        ...prevState,
                        Occupation: onlyLetters,
                      }));
                    }}
                    className="w-full p-3 border border-gray-300 rounded"
                  
                  />
            
                </div>
                <div className="">
                  <label htmlFor="CaretakerIncome" className="block text-gray-700 mb-2">
                    รายได้ต่อเดือน
                  </label>
                  <input
                    type="number"
                    id="CaretakerIncome"
                    name="Income"
                    value={caretakerData.Income}
                    onChange={handleChangeCaretaker}
                    className="w-full p-3 border border-gray-300 rounded"
              
                  />
            
                </div>
                <div className="">
                  <label htmlFor="CaretakerWorkplace" className="block text-gray-700 mb-2">
                    สถานที่ทำงาน
                  </label>
                  <input
                    type="text"
                    id="CaretakerWorkplace"
                    name="Workplace"
                    value={caretakerData.Workplace}
                    onChange={handleChangeCaretaker}
                    className="w-full p-3 border border-gray-300 rounded"
              
                  />
              
                </div>
                <div className="">
                  <label htmlFor="CaretakerType" className="block text-gray-700 mb-2">
                    เกี่ยวข้องเป็น
                  </label>
                  <input
                    type="text"
                    id="CaretakerType"
                    name="CaretakerType"
                    value={caretakerData.Type}
                    onChange={(e) => {
                      const onlyLetters = e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ''); // Allow only Thai, English letters, and spaces
                      setCaretakerData((prevState) => ({
                        ...prevState,
                        CaretakerType: onlyLetters, // Directly update CaretakerType
                      }));
                    }}
                    className="w-full p-3 border border-gray-300 rounded"
                  
                  />
             
                </div>
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
                                    onChange={handleNumberOfSiblingsChange}
                                    className="w-50 p-3 border border-gray-300 rounded"
                                    min={applicationData.NumberOfSiblings || 0} // กำหนดค่า min ให้เป็นค่าเริ่มต้นหรือ 2
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
                                    onChange={handleChangeApplication}
                                    className="w-50 p-3 border border-gray-300 rounded"
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
                                    onChange={handleChangeApplication}
                                    className="w-50 p-3 border border-gray-300 rounded"
                                />
                            </div>
                        </div>


                        {siblingsData.map((sibling, index) => (
                            <div key={index} className="mb-4 grid grid-cols-1 sm:grid-cols-8 gap-6">
                                <div>
                                    <label htmlFor={`PrefixName-${index}`} className="block text-gray-700 mb-2">คำนำหน้า</label>
                                    <select
                                        id={`PrefixName-${index}`}
                                        name="PrefixName"
                                        value={sibling.PrefixName}
                                        onChange={(e) => handleChangeSibling(index, e)}
                                        className="w-30 p-3 border border-gray-300 rounded"
                                    >
                                        <option value="">คำนำหน้า</option>
                                        <option value="นาย">นาย</option>
                                        <option value="นาง">นาง</option>
                                        <option value="นางสาว">นางสาว</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor={`Fname-${index}`} className="block text-gray-700 mb-2">ชื่อ</label>
                                    <input
                                        type="text"
                                        id={`Fname-${index}`}
                                        name="Fname"
                                        value={sibling.Fname}
                                        onChange={(e) => handleChangeSibling(index, e)}
                                        className="w-full p-3 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`Lname-${index}`} className="block text-gray-700 mb-2">นามสกุล</label>
                                    <input
                                        type="text"
                                        id={`Lname-${index}`}
                                        name="Lname"
                                        value={sibling.Lname}
                                        onChange={(e) => handleChangeSibling(index, e)}
                                        className="w-full p-3 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`Occupation-${index}`} className="block text-gray-700 mb-2">อาชีพ</label>
                                    <input
                                        type="text"
                                        id={`Occupation-${index}`}
                                        name="Occupation"
                                        value={sibling.Occupation}
                                        onChange={(e) => handleChangeSibling(index, e)}
                                        className="w-full p-3 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`EducationLevel-${index}`} className="block text-gray-700 mb-2">ระดับการศึกษา</label>
                                    <select
                                        id={`EducationLevel-${index}`}
                                        name="EducationLevel"
                                        value={sibling.EducationLevel}
                                        onChange={(e) => handleChangeSibling(index, e)}
                                        className="w-full p-3 border border-gray-300 rounded"
                                    >
                                        <option value="">-- กรุณาเลือกระดับการศึกษา --</option>
                                        <option value="ก่อนอนุบาล">ก่อนอนุบาล</option>
                                        <option value="อนุบาล">อนุบาล</option>
                                        <option value="ประถมศึกษา">ประถมศึกษา</option>
                                        <option value="มัธยมศึกษาตอนต้น">มัธยมศึกษาตอนต้น</option>
                                        <option value="มัธยมศึกษาตอนปลาย">มัธยมศึกษาตอนปลาย</option>
                                        <option value="ปวช.">ปวช.</option>
                                        <option value="ปวส.">ปวส.</option>
                                        <option value="ปริญญาตรี">ปริญญาตรี</option>
                                        <option value="ปริญญาโท">ปริญญาโท</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor={`Income-${index}`} className="block text-gray-700 mb-2">รายได้</label>
                                    <input
                                        type="number"
                                        id={`Income-${index}`}
                                        name="Income"
                                        value={sibling.Income}
                                        onChange={(e) => handleChangeSibling(index, e)}
                                        className="w-full p-3 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`Status-${index}`} className="block text-gray-700 mb-2">สถานะ</label>
                                    <select
                                        id={`Status-${index}`}
                                        name="Status"
                                        value={sibling.Status}
                                        onChange={(e) => handleChangeSibling(index, e)}
                                        className="w-30 p-3 border border-gray-300 rounded"
                                    >
                                        <option value="">สถานะ</option>
                                        <option value="โสด">โสด</option>
                                        <option value="สมรส">สมรส</option>
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => removeSibling(index)}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        ลบ
                                    </button>
                                </div>
                            </div>
                        ))}

                    </div>
                );

            case 3:
                return (
                    <div>
                        <div className="space-y-4">

                        <div className="mb-1 grid grid-cols-1 sm:grid-cols-6 gap-4 items-center text-center text-gray-700 font-semibold">
  {/* Convert Year_Entry to a number before comparison */}
  {Number(calculateAcademicYear(userData?.Year_Entry)) >= 1 && (
    <div className="col-span-2">
      <label htmlFor="GPAYear1" className="block text-gray-700 mb-2">
        เกรดเฉลี่ยปีที่ 1
      </label>
      <input
        type="number"
        id="GPAYear1"
        name="GPAYear1"
        value={applicationData.GPAYear1}
        onChange={handleChangeApplication}
        inputMode="numeric"
        pattern="[1-9]*[0.0]"
        className="w-3/4 p-3 border border-gray-300 rounded"
      />
       {applicationErrors.GPAYear1 && <p className="text-red-500">{applicationErrors.GPAYear1}</p>}
    </div>
  )}
  {Number(calculateAcademicYear(userData?.Year_Entry)) >= 2 && (
    <div className="col-span-2">
      <label htmlFor="GPAYear2" className="block text-gray-700 mb-2">
        เกรดเฉลี่ยปีที่ 2
      </label>
      <input
        type="number"
        id="GPAYear2"
        name="GPAYear2"
        value={applicationData.GPAYear2}
        onChange={handleChangeApplication}
        inputMode="numeric"
        pattern="[1-9]*[0.0]"
        className="w-3/4 p-3 border border-gray-300 rounded"
      />
       {applicationErrors.GPAYear2 && <p className="text-red-500">{applicationErrors.GPAYear2}</p>}
    </div>
  )}
  {Number(calculateAcademicYear(userData?.Year_Entry)) >= 3 && (
    <div className="col-span-2">
      <label htmlFor="GPAYear3" className="block text-gray-700 mb-2">
        เกรดเฉลี่ยปีที่ 3
      </label>
      <input
        type="number"
        id="GPAYear3"
        name="GPAYear3"
        value={applicationData.GPAYear3}
        onChange={handleChangeApplication}
        inputMode="numeric"
        pattern="[1-9]*[0.0]"
        className="w-3/4 p-3 border border-gray-300 rounded"
      />
       {applicationErrors.GPAYear3 && <p className="text-red-500">{applicationErrors.GPAYear3}</p>}
    </div>
  )}
</div>


                            <div className="col-span-3">
                                <label htmlFor="AdvisorName" className="block text-gray-700 mb-2">
                                    อาจารย์ที่ปรึกษา
                                </label>
                                <input
                                    type="text"
                                    id="AdvisorName"
                                    name="AdvisorName"
                                    value={applicationData.AdvisorName}
                                    onChange={(e) => {
                                        const onlyLettersAndDot = e.target.value.replace(/[^a-zA-Zก-๙.\s]/g, ''); // Allow only letters (English and Thai) and dot
                                        e.target.value = onlyLettersAndDot; // Modify the input value directly
                                        handleChangeApplication(e); // Pass the actual event
                                    }}
                                    className="w-3/4 p-3 border border-gray-300 rounded"
                                />
                            </div>
                        </div>

                        <div className='mt-10 '>
                            <h3 className="text-gray-700 font-semibold">กิจกรรมเสริมหลักสูตร</h3>
                            {activities.map((activity, index) => (
                                <div key={index} className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-6">
                                    <div>
                                        <label htmlFor={`AcademicYear-${index}`} className="block text-gray-700 mb-2">ปีการศึกษา</label>
                                        <select
                                            id={`AcademicYear-${index}`}
                                            name="AcademicYear"
                                            value={activity.AcademicYear}
                                            onChange={(e) => handleActivityChange(index, e)}
                                            className="w-full p-3 border border-gray-300 rounded"
                                        >
                                             <option value="">เลือกปีการศึกษา</option>
                      {Array.from({ length: 4 }, (_, i) => new Date().getFullYear() + 543 - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor={`ActivityName-${index}`} className="block text-gray-700 mb-2">กิจกรรม</label>
                                        <input
                                            type="text"
                                            id={`ActivityName-${index}`}
                                            name="ActivityName"
                                            value={activity.ActivityName}
                                            onChange={(e) => handleActivityChange(index, e)}
                                            className="w-full p-3 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor={`Position-${index}`} className="block text-gray-700 mb-2">ตำแหน่ง</label>
                                        <input
                                            type="text"
                                            id={`Position-${index}`}
                                            name="Position"
                                            value={activity.Position}
                                            onChange={(e) => handleActivityChange(index, e)}
                                            className="w-full p-3 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <button
                                            type="button"
                                            onClick={() => removeActivity(index)}
                                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                        >
                                            ลบ
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addActivity}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                เพิ่มกิจกรรม
                            </button>
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
                                            onChange={(e) => handleScholarshipChange(index, e)}
                                            className="w-full p-3 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor={`AcademicYear-${index}`} className="block text-gray-700 mb-2">ปีการศึกษา</label>
                                        <select
                                            id={`AcademicYear-${index}`}
                                            name="AcademicYear"
                                            value={scholarship.AcademicYear || ''}
                                            onChange={(e) => handleScholarshipChange(index, e)}
                                            className="w-full p-3 border border-gray-300 rounded"
                                        >
                                          <option value="">เลือกปีการศึกษา</option>
                      {Array.from({ length: 4 }, (_, i) => new Date().getFullYear() + 543 - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor={`AmountReceived-${index}`} className="block text-gray-700 mb-2">จำนวนเงินทุน (บาท/ปี)</label>
                                        <input
                                            type="number"
                                            id={`AmountReceived-${index}`}
                                            name="AmountReceived"
                                            value={scholarship.AmountReceived !== null ? scholarship.AmountReceived : 0}
                                            onChange={(e) => handleScholarshipChange(index, e)}
                                            className="w-full p-3 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            onClick={() => removeScholarshipHistory(index)}
                                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                        >
                                            ลบ
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addScholarshipHistory}
                                className="bg-blue-500 mb-10 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                เพิ่มทุนการศึกษา
                            </button>
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
                                        onChange={(e) => handleWorkExperienceChange(index, e)}
                                        className="w-full p-3 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`JobType-${index}`} className="block text-gray-700 mb-2">ลักษณะงาน</label>
                                    <input
                                        type="text"
                                        id={`JobType-${index}`}
                                        name="JobType"
                                        value={experience.JobType || ''}
                                        onChange={(e) => handleWorkExperienceChange(index, e)}
                                        className="w-full p-3 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`Duration-${index}`} className="block text-gray-700 mb-2">ระยะเวลา</label>
                                    <input
                                        type="text"
                                        id={`Duration-${index}`}
                                        name="Duration"
                                        value={experience.Duration || ''}
                                        onChange={(e) => handleWorkExperienceChange(index, e)}
                                        className="w-full p-3 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`Earnings-${index}`} className="block text-gray-700 mb-2">รายได้</label>
                                    <input
                                        type="number"
                                        id={`Earnings-${index}`}
                                        name="Earnings"
                                        value={experience.Earnings !== null ? experience.Earnings : 0}
                                        onChange={(e) => handleWorkExperienceChange(index, e)}
                                        className="w-full p-3 border border-gray-300 rounded"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={() => removeWorkExperience(index)}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        ลบ
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addWorkExperience}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            เพิ่มประวัติการทำงาน
                        </button>
                    </div>

                );

            case 5:
                return (
                    <div>
                        {application_files.map((file, index) => (
                            <div key={index} className="mb-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
                                <div>
                                    <label htmlFor={`DocumentType-${index}`} className="block text-gray-700 mb-2">ประเภทไฟล์</label>
                                    <select
                                        id={`DocumentType-${index}`}
                                        name="DocumentType"
                                        value={file.DocumentType}
                                        onChange={(e) => handleFileChange(index, e)}
                                        className="w-full p-3 border border-gray-300 rounded"
                                    >
                                        <option value="">เลือกประเภทไฟล์</option>
                                        <option value="รูปถ่ายหน้าตรง">รูปถ่ายหน้าตรง</option>
                                        <option value="ใบสมัคร">ใบสมัคร</option>
                                        <option value="หนังสือรับรองสภาพการเป็นนิสิต">หนังสือรับรองสภาพการเป็นนิสิต</option>
                                        <option value="ใบสะสมผลการเรียน">ใบสะสมผลการเรียน</option>
                                        <option value="สำเนาบัตรประชาชนผู้สมัคร">สำเนาบัตรประชาชนผู้สมัคร</option>
                                        <option value="ภาพถ่ายบ้านที่เห็นตัวบ้านทั้งหมด">ภาพถ่ายบ้านที่เห็นตัวบ้านทั้งหมด</option>
                                        <option value="อื่น ๆ">อื่น ๆ</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor={`DocumentName-${index}`} className="block text-gray-700 mb-2">ชื่อเอกสาร</label>
                                    <input
                                        type="text"
                                        id={`DocumentName-${index}`}
                                        name="DocumentName"
                                        value={file.DocumentName}
                                        onChange={(e) => handleFileChange(index, e)}
                                        className="w-full p-3 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`FilePath-${index}`} className="block text-gray-700 mb-2">อัปโหลดไฟล์</label>
                                    <input
                                        type="file"
                                        id={`FilePath-${index}`}
                                        name="FilePath"
                                        accept="application/pdf,image/jpeg,image/png" // Restrict to PDF, JPEG, and PNG files
                                        onChange={(e) => handleFileUpload(index, e)}
                                        className="w-full p-3 border border-gray-300 rounded"
                                    />
                                    {file.error && <p className="text-red-500 mt-2">{file.error}</p>}
                                    {/* Display selected file name */}
                                    {typeof file.FilePath === 'string' && (
                                        <p className="mt-2 text-sm text-gray-600">ไฟล์ที่เลือก: {file.FilePath}</p>
                                    )}
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={() => removeFileEntry(index)}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        ลบ
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addFileEntry}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            เพิ่มไฟล์
                        </button>
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
            <div className="p-6 border border-gray-300 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center text-gray-800">
            {getscholarshipData?.ScholarshipName}
          </h1>
        </div>
                <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="flex justify-center mb-6">
                        <div
                            className={`flex items-center ${step === 1 ? 'text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setStep(1)} // เพิ่ม onClick ที่ div เพื่อให้สามารถคลิกได้ทั้งเลขและตัวอักษร
                            style={{ cursor: 'pointer' }} // เพิ่ม cursor pointer
                        >
                            <span
                                className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 1 ? 'border-blue-600' : 'border-gray-500'}`}
                            >
                                1
                            </span>
                            <span className="ml-2 hidden sm:inline">ประวัติส่วนตัว</span>
                        </div>

                        <div
                            className={`flex items-center ml-4 sm:ml-8 ${step === 2 ? 'text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setStep(2)} // เพิ่ม onClick ที่ div เพื่อให้สามารถคลิกได้ทั้งเลขและตัวอักษร
                            style={{ cursor: 'pointer' }}
                        >
                            <span
                                className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 2 ? 'border-blue-600' : 'border-gray-500'}`}
                            >
                                2
                            </span>
                            <span className="ml-2 hidden sm:inline">ประวัติครอบครัว</span>
                        </div>

                        <div
                            className={`flex items-center ml-4 sm:ml-8 ${step === 3 ? 'text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setStep(3)}
                            style={{ cursor: 'pointer' }}
                        >
                            <span
                                className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 3 ? 'border-blue-600' : 'border-gray-500'}`}
                            >
                                3
                            </span>
                            <span className="ml-2 hidden sm:inline">ประวัติการศึกษา</span>
                        </div>

                        <div
                            className={`flex items-center ml-4 sm:ml-8 ${step === 4 ? 'text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setStep(4)}
                            style={{ cursor: 'pointer' }}
                        >
                            <span
                                className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 4 ? 'border-blue-600' : 'border-gray-500'}`}
                            >
                                4
                            </span>
                            <span className="ml-2 hidden sm:inline">ประวัติการรับทุนศึกษา</span>
                        </div>

                        <div
                            className={`flex items-center ml-4 sm:ml-8 ${step === 5 ? 'text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setStep(5)}
                            style={{ cursor: 'pointer' }}
                        >
                            <span
                                className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 5 ? 'border-blue-600' : 'border-gray-500'}`}
                            >
                                5
                            </span>
                            <span className="ml-2 hidden sm:inline">อัพโหลดเอกสาร</span>
                        </div>
                    </div>

                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <form onSubmit={handleSave}>
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
                            {step !== 5 && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  ถัดไป
                </button>
              )}

                        </div>

                        {step === 2 && (
                            <div className="flex justify-center mt-6 text-center w-full">
                                <button
                                    type="button" // This is for temporary saving, so use type="button"
                                    onClick={handleSave}
                                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-4"
                                >
                                    บันทึก
                                </button>
                            </div>
                        )}
                             {step === 3 && (
                            <div className="flex justify-center mt-6 text-center w-full">
                                <button
                                    type="button" // This is for temporary saving, so use type="button"
                                    onClick={handleSave}
                                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-4"
                                >
                                    บันทึก
                                </button>
                            </div>
                        )}
                             {step === 4 && (
                            <div className="flex justify-center mt-6 text-center w-full">
                                <button
                                    type="button" // This is for temporary saving, so use type="button"
                                    onClick={handleSave}
                                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-4"
                                >
                                    บันทึก
                                </button>
                            </div>
                        )}
                        {step === 5 && (
                            <div className="flex justify-center mt-6 text-center w-full">
                                <button
                                    type="button" // This is for temporary saving, so use type="button"
                                    onClick={handleSave}
                                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-4"
                                >
                                    บันทึก
                                </button>
                                <button
                                    type="button"  // Ensure this is submit type for form submission
                                    onClick={handleSubmit}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    ส่ง
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
