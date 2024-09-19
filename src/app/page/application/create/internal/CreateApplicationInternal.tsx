"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/app/components/header/Header';
import Footer from '@/app/components/footer/footer';
import ApiStudentServices from '@/app/services/students/ApiStudent';
import ApiServiceLocations from '@/app/services/location/apiLocations';
import ApiApplicationCreateInternalServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationCreateInternal';
import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './createApplication.module.css';
interface Students {
  StudentID: string;
  PrefixName: string;
  Course: string;
  Year_Entry: Number;
  DOB: string;
}

interface ApplicationInternaldata {
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

interface AddressesData {
  ApplicationID: string;
  AddressLine: string;
  Subdistrict: string;
  province: string;
  District: string;
  PostalCode: string;
  Type: string;
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

// Define WorkExperiencesData interface
interface WorkExperiencesData {
  ApplicationID: string;
  Name: string;
  JobType: string;
  Duration: string;
  Earnings: number;
}

interface ApplicationFilesData {
  ApplicationID: string;
  DocumentName: string;
  DocumentType: string;
  FilePath: string | File;
  error?: string; // Add this property to handle errors
}



interface CurrentAddressData extends AddressesData { }

export default function CreateApplicationInternalPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('scholarshipId');
  const idStudent = localStorage.getItem('UserID');
  const token = localStorage.getItem('token');
  const router = useRouter();





  const [step, setStep] = useState<number>(() => {
    const savedStep = sessionStorage.getItem('step');
    return savedStep ? Number(savedStep) : 1;
  });

  const [Students, setStudents] = useState<Students>(() => {
    const savedStudents = sessionStorage.getItem('Students');
    return savedStudents ? JSON.parse(savedStudents) : {
      StudentID: '',
      PrefixName: '',
      Course: '',
      Year_Entry: '',
      DOB: '',
    };
  });

  const [applicationData, setApplicationData] = useState<ApplicationInternaldata>(() => {
    const savedApplicationData = sessionStorage.getItem('applicationData');
    return savedApplicationData ? JSON.parse(savedApplicationData) : {
      StudentID: idStudent || '',
      ScholarshipID: id || '',
      ApplicationDate: '',
      Status: 'รออนุมัติ',
      MonthlyIncome: '',
      MonthlyExpenses: '',
      NumberOfSiblings: 0,
      NumberOfSisters: 0,
      NumberOfBrothers: 0,
      GPAYear1: '',
      GPAYear2: '',
      GPAYear3: '',
      AdvisorName: '',
    };
  });

  const [guardianData, setGuardianData] = useState<GuardiansData>(() => {
    const savedGuardianData = sessionStorage.getItem('guardianData');
    return savedGuardianData ? JSON.parse(savedGuardianData) : {
      ApplicationID: '',
      FirstName: '',
      LastName: '',
      PrefixName: '',
      Type: '',
      Occupation: '',
      Income: 1,
      Age: 1,
      Status: '',
      Workplace: '',
      Phone: '',
    };
  });

  const [addressData, setAddressData] = useState<AddressesData>(() => {
    const savedAddressData = sessionStorage.getItem('addressData');
    return savedAddressData ? JSON.parse(savedAddressData) : {
      ApplicationID: '',
      AddressLine: '',
      Subdistrict: '',
      province: '',
      District: '',
      PostalCode: '',
      Type: 'ที่อยู่ตามบัตรประชาชน',
    };
  });

  const [currentAddressData, setCurrentAddressData] = useState<CurrentAddressData>(() => {
    const savedCurrentAddressData = sessionStorage.getItem('currentAddressData');
    return savedCurrentAddressData ? JSON.parse(savedCurrentAddressData) : {
      ApplicationID: '',
      AddressLine: '',
      Subdistrict: '',
      province: '',
      District: '',
      PostalCode: '',
      Type: 'ที่อยู่ปัจจุบัน',
    };
  });

  const [fatherData, setFatherData] = useState<GuardiansData>(() => {
    const savedFatherData = sessionStorage.getItem('fatherData');
    return savedFatherData ? JSON.parse(savedFatherData) : {
      ApplicationID: '',
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
    };
  });

  const [motherData, setMotherData] = useState<GuardiansData>(() => {
    const savedMotherData = sessionStorage.getItem('motherData');
    return savedMotherData ? JSON.parse(savedMotherData) : {
      ApplicationID: '',
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
    };
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
      Type: '',
      Workplace: '',
    };
  });

  const [siblingData, setSiblingData] = useState<SiblingsData>(() => {
    const savedSiblingData = sessionStorage.getItem('siblingData');
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

  const [scholarshipHistory, setScholarshipHistory] = useState<ScholarshipHistoryData[]>([
    { ApplicationID: '', ScholarshipName: '', AmountReceived: 0, AcademicYear: '' },
  ]);

  // Define state for work experiences
  const [workExperiences, setWorkExperiences] = useState<WorkExperiencesData[]>([
    { ApplicationID: '', Name: '', JobType: '', Duration: '', Earnings: 0 },
  ]);

  const [applicationFiles, setApplicationFiles] = useState<ApplicationFilesData[]>([
    { ApplicationID: '', DocumentName: '', DocumentType: '', FilePath: '' },
  ]);

  const [error, setError] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [provinces, setProvinces] = useState<{ id: number; name: string }[]>([]);

  // Separate state for districts and subdistricts for each address type
  const [districtsForIDCard, setDistrictsForIDCard] = useState<{ id: number; name: string }[]>([]);
  const [subdistrictsForIDCard, setSubdistrictsForIDCard] = useState<{ id: number; name: string }[]>([]);
  const [districtsForCurrentAddress, setDistrictsForCurrentAddress] = useState<{ id: number; name: string }[]>([]);
  const [subdistrictsForCurrentAddress, setSubdistrictsForCurrentAddress] = useState<{ id: number; name: string }[]>([]);

  const [isCaretakerEditing, setIsCaretakerEditing] = useState(false);
  const [isParentEditing, setIsParentEditing] = useState(true); // Initially, parent fields are enabled
  const [numberOfSiblings, setNumberOfSiblings] = useState<number>(() => {
    const savedNumberOfSiblings = sessionStorage.getItem('numberOfSiblings');
    return savedNumberOfSiblings ? Number(savedNumberOfSiblings) : 0;
  });
  const [siblingsData, setSiblingsData] = useState<SiblingsData[]>(() => {
    const savedSiblingsData = sessionStorage.getItem('siblingsData');
    return savedSiblingsData ? JSON.parse(savedSiblingsData) : [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const Role = localStorage.getItem('UserRole');

      if (!token || Role?.trim().toLowerCase() !== 'student') {
        console.error('Unauthorized access or missing token. Redirecting to login.');
        router.push('/page/login');
      }
    }
  }, [router]);
  // Saving the state data to sessionStorage when the component mounts or state changes
  useEffect(() => {
    sessionStorage.setItem('Students', JSON.stringify(Students));
  }, [Students]);

  useEffect(() => {
    sessionStorage.setItem('applicationData', JSON.stringify(applicationData));
  }, [applicationData]);

  useEffect(() => {
    sessionStorage.setItem('guardianData', JSON.stringify(guardianData));
  }, [guardianData]);

  useEffect(() => {
    sessionStorage.setItem('addressData', JSON.stringify(addressData));
  }, [addressData]);

  useEffect(() => {
    sessionStorage.setItem('currentAddressData', JSON.stringify(currentAddressData));
  }, [currentAddressData]);

  useEffect(() => {
    sessionStorage.setItem('fatherData', JSON.stringify(fatherData));
  }, [fatherData]);

  useEffect(() => {
    sessionStorage.setItem('motherData', JSON.stringify(motherData));
  }, [motherData]);

  useEffect(() => {
    sessionStorage.setItem('caretakerData', JSON.stringify(caretakerData));
  }, [caretakerData]);

  useEffect(() => {
    sessionStorage.setItem('siblingData', JSON.stringify(siblingData));
  }, [siblingData]);

  useEffect(() => {
    sessionStorage.setItem('siblingsData', JSON.stringify(siblingsData));
  }, [siblingsData]);

  useEffect(() => {
    sessionStorage.setItem('activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    sessionStorage.setItem('scholarshipHistory', JSON.stringify(scholarshipHistory));
  }, [scholarshipHistory]);

  useEffect(() => {
    sessionStorage.setItem('workExperiences', JSON.stringify(workExperiences));
  }, [workExperiences]);

  useEffect(() => {
    sessionStorage.setItem('applicationFiles', JSON.stringify(applicationFiles));
  }, [applicationFiles]);

  useEffect(() => {
    sessionStorage.setItem('step', step.toString());
  }, [step]);

  useEffect(() => {
    sessionStorage.setItem('numberOfSiblings', numberOfSiblings.toString());
  }, [numberOfSiblings]);


  useEffect(() => {
    if (!token) {
      router.push('/page/login');
    }

    if (idStudent) {
      const fetchStudentData = async () => {
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


  // Application data handler
  const handleChangeApplication = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setApplicationData({
      ...applicationData,
      [name]:
        ['MonthlyIncome', 'MonthlyExpenses', 'NumberOfSiblings', 'NumberOfSisters', 'NumberOfBrothers'].includes(name)
          ? Number(value) // Convert these fields to numbers
          : value, // For other fields, use the value as-is
    });
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




  const handleChangeMother = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setMotherData(prevState => ({
      ...prevState,
      [name === 'MotherStatus' ? 'Status' : name]:
        ['Income', 'Age'].includes(name)
          ? Number(value)  // Convert fields like 'Income' and 'Age' to numbers
          : value,          // Use the value directly for non-numeric fields
    }));

    setIsCaretakerEditing(false);  // Disable caretaker editing when parent is being edited
    setIsParentEditing(true);      // Enable parent editing
    console.log('Mother Status:', name === 'MotherStatus' ? value : motherData.Status);  // Log mother's status
  };

  const handleChangeFather = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Handle numeric-only input for 'Phone', 'Income', and 'Age' fields
    const sanitizedValue = ['Phone', 'Income', 'Age'].includes(name)
      ? value.replace(/\D/g, '') // Remove non-numeric characters for these fields
      : value;

    setFatherData(prevState => ({
      ...prevState,
      [name === 'FatherStatus' ? 'Status' : name]:
        ['Income', 'Age'].includes(name)
          ? Number(sanitizedValue)  // Ensure numeric fields remain numbers
          : sanitizedValue,          // Apply sanitized value to non-numeric fields
    }));

    setIsCaretakerEditing(false);  // Disable caretaker editing when parent is being edited
    setIsParentEditing(true);      // Enable parent editing
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
    console.log('Caretaker Data on Change:', {
      ...caretakerData,
      [name]: name === 'Income' || name === 'Age' ? Number(value) : value,
    });
  };

  const handleChangeSibling = (index: number, name: string, value: string | number) => {
    const newSiblingsData = [...siblingsData];
    newSiblingsData[index] = {
      ...newSiblingsData[index],
      [name]: name === 'Income' ? Number(value) : value,
    };
    setSiblingsData(newSiblingsData);

    // Log the updated siblings data
    console.log('Updated Sibling Data:', newSiblingsData);

    // Save updated siblingsData to sessionStorage
    sessionStorage.setItem('siblingsData', JSON.stringify(newSiblingsData));
  };


  const handleNumberOfSiblingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setNumberOfSiblings(value);

    // Adjust the siblingsData array to match the number of siblings
    const newSiblingsData = [...siblingsData];
    if (value > siblingsData.length) {
      // Add new sibling entries
      for (let i = siblingsData.length; i < value; i++) {
        newSiblingsData.push({
          ApplicationID: '',
          PrefixName: '',
          Fname: '',
          Lname: '',
          Occupation: '',
          EducationLevel: '',
          Income: 0,
          Status: '',
        });
      }
    } else {
      // Remove extra sibling entries
      newSiblingsData.splice(value);
    }
    setSiblingsData(newSiblingsData);

    // Log the updated siblings data
    console.log('Adjusted Sibling Data:', newSiblingsData);

    // Save updated siblingsData to sessionStorage
    sessionStorage.setItem('siblingsData', JSON.stringify(newSiblingsData));

    // Update the applicationData state
    setApplicationData({
      ...applicationData,
      NumberOfSiblings: value, // Update the number of siblings in applicationData
    });
  };
  const handleChangeAddress = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressData({
      ...addressData,
      [name]: value,
    });
  };

  const handleChangeCurrentAddress = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCurrentAddressData({
      ...currentAddressData,
      [name]: value,
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
  };

  const addActivity = () => {
    setActivities([...activities, { AcademicYear: '', ActivityName: '', Position: '', ApplicationID: '' }]);
  };

  const removeActivity = (index: number) => {
    const newActivities = activities.filter((_, i) => i !== index);
    setActivities(newActivities);
  };

  // Function to handle input changes for each scholarship history entry
  const handleScholarshipChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedScholarshipHistory = [...scholarshipHistory];
    updatedScholarshipHistory[index] = {
      ...updatedScholarshipHistory[index],
      [name]: name === 'AmountReceived' ? Number(value) : value,
    };
    setScholarshipHistory(updatedScholarshipHistory);
  };

  // Function to add a new scholarship history entry
  const addScholarshipHistory = () => {
    setScholarshipHistory([...scholarshipHistory, { ApplicationID: '', ScholarshipName: '', AmountReceived: 0, AcademicYear: '' }]);
  };

  // Function to remove a scholarship history entry
  const removeScholarshipHistory = (index: number) => {
    const updatedScholarshipHistory = scholarshipHistory.filter((_, i) => i !== index);
    setScholarshipHistory(updatedScholarshipHistory);
  };

  // Function to handle input changes for each work experience entry
  const handleWorkExperienceChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedWorkExperiences = [...workExperiences];
    updatedWorkExperiences[index] = {
      ...updatedWorkExperiences[index],
      [name]: name === 'Earnings' ? Number(value) : value,
    };
    setWorkExperiences(updatedWorkExperiences);
  };

  // Function to add a new work experience entry
  const addWorkExperience = () => {
    setWorkExperiences([...workExperiences, { ApplicationID: '', Name: '', JobType: '', Duration: '', Earnings: 0 }]);
  };

  // Function to remove a work experience entry
  const removeWorkExperience = (index: number) => {
    const updatedWorkExperiences = workExperiences.filter((_, i) => i !== index);
    setWorkExperiences(updatedWorkExperiences);
  };

  // Handle file input changes
  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedFiles = [...applicationFiles];
    updatedFiles[index] = {
      ...updatedFiles[index],
      [name]: value,
    };
    setApplicationFiles(updatedFiles);
  };

  // Handle file upload
  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const updatedFiles = [...applicationFiles];

    if (file) {
      const fileType = file.type;
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

      // Validate file type
      if (!allowedTypes.includes(fileType)) {
        updatedFiles[index].error = 'อัปโหลดเฉพาะไฟล์ PDF หรือรูปภาพ (JPEG, PNG) เท่านั้น';
        setApplicationFiles(updatedFiles);
        return;
      }

      // If valid, set the file and clear any error messages
      updatedFiles[index].FilePath = file;
      updatedFiles[index].error = ''; // Clear error if successful upload
      setApplicationFiles(updatedFiles);
    }
  };


  // Add a new file entry
  const addFileEntry = () => {
    setApplicationFiles([...applicationFiles, { ApplicationID: '', DocumentName: '', DocumentType: '', FilePath: '' }]);
  };

  // Remove a file entry
  const removeFileEntry = (index: number) => {
    const updatedFiles = applicationFiles.filter((_, i) => i !== index);
    setApplicationFiles(updatedFiles);
  };

  const [addressErrors, setAddressErrors] = useState<{ [key: string]: string }>({});
  const [currentAddressErrors, setCurrentAddressErrors] = useState<{ [key: string]: string }>({});
  const [applicationErrors, setApplicationErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false); // Initialize loading state
  const [siblingsErrors, setSiblingsErrors] = useState<{
    PrefixName?: string;
    Fname?: string;
    Lname?: string;
    Occupation?: string;
    EducationLevel?: string;
    Income?: string;
    Status?: string;
  }[]>([]);
  const [errors, setErrors] = useState({
    MonthlyIncome: '',
    MonthlyExpenses: ''
  });


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div>
        <p className="ml-4 text-gray-600">Loading...</p>
      </div>
    );
  }



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

  const validateApplication = () => {
    const errors: { [key: string]: string } = {};

    if (!applicationData.GPAYear1 || applicationData.GPAYear1 < 1 || applicationData.GPAYear1 > 4)
      errors.GPAYear1 = 'กรุณากรอกเกรดเฉลี่ยปีที่ 1 (1.00 - 4.00)';

    if (!applicationData.GPAYear2 || applicationData.GPAYear2 < 1 || applicationData.GPAYear2 > 4)
      errors.GPAYear2 = 'กรุณากรอกเกรดเฉลี่ยปีที่ 2 (1.00 - 4.00)';

    if (!applicationData.GPAYear3 || applicationData.GPAYear3 < 1 || applicationData.GPAYear3 > 4)
      errors.GPAYear3 = 'กรุณากรอกเกรดเฉลี่ยปีที่ 3 (1.00 - 4.00)';

    if (!applicationData.AdvisorName) errors.AdvisorName = 'กรุณากรอกชื่ออาจารย์ที่ปรึกษา';

    setApplicationErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const validateSiblingsData = () => {
    let isValid = true;
    const errors = siblingsData.map((sibling) => {
      const siblingErrors = {
        PrefixName: sibling.PrefixName ? '' : 'กรุณาเลือกคำนำหน้า',
        Fname: sibling.Fname ? '' : 'กรุณากรอกชื่อ',
        Lname: sibling.Lname ? '' : 'กรุณากรอกนามสกุล',
        Occupation: sibling.Occupation ? '' : 'กรุณากรอกอาชีพ',
        EducationLevel: sibling.EducationLevel ? '' : 'กรุณาเลือกระดับการศึกษา',
        Income: sibling.Income ? '' : 'กรุณากรอกรายได้',
        Status: sibling.Status ? '' : 'กรุณาเลือกสถานะ',
      };

      Object.values(siblingErrors).forEach((error) => {
        if (error) {
          isValid = false;
        }
      });

      return siblingErrors;
    });

    setSiblingsErrors(errors); // Set errors in state
    return isValid;
  };

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


  const handleNextStep = () => {
    if (step === 1) {
      if (!validateAddress()) return;
      if (!validateCurrentAddress()) return;
      if (!validateApplicationData()) return;
    }
    if (step === 2) {
      if (!validateSiblingsData()) return;
    }
    if (step === 3) {
      if (!validateApplication()) return;
    }
    setStep(step < 5 ? step + 1 : step);
  };

  const handleSave = async () => {
    // Add loading state
    try {
      setLoading(true); // Start loading

      // Update the application data with the new status
      const updatedApplicationData = {
        ...applicationData,
        Status: 'บันทึกแล้ว',
      };

      // Create the application and retrieve the ApplicationID
      const applicationResponse = await ApiApplicationCreateInternalServices.createApplication(updatedApplicationData);
      const applicationID = applicationResponse.ApplicationID;

      const tasks: Promise<any>[] = [];

      // Update and submit caretakerData if it's filled out, or replace empty values with "-"
      const updatedCaretakerData = {
        ...caretakerData,
        ApplicationID: applicationID,
        FirstName: caretakerData.FirstName || '-',
        LastName: caretakerData.LastName || '-',
        PrefixName: caretakerData.PrefixName || '-',
        Occupation: caretakerData.Occupation || '-',
        Phone: caretakerData.Phone || '-',
        Workplace: caretakerData.Workplace || '-',
        Status: caretakerData.Status || '-',
        Type: caretakerData.Type || '-',
        Age: caretakerData.Age || 0,  // Set Age to 0 if not provided
      };
      tasks.push(ApiApplicationCreateInternalServices.createGuardian(updatedCaretakerData));
      console.log('Caretaker data sent:', updatedCaretakerData);

      // Update and submit fatherData if it's filled out, or replace empty values with "-"
      const updatedFatherData = {
        ...fatherData,
        ApplicationID: applicationID,
        FirstName: fatherData.FirstName || '-',
        LastName: fatherData.LastName || '-',
        PrefixName: fatherData.PrefixName || '-',
        Occupation: fatherData.Occupation || '-',
        Phone: fatherData.Phone || '-',
        Workplace: fatherData.Workplace || '-',
        Status: fatherData.Status || '-',
        Age: fatherData.Age || 0,  // Set Age to 0 if not provided
      };
      tasks.push(ApiApplicationCreateInternalServices.createGuardian(updatedFatherData));
      console.log('Father data sent:', updatedFatherData);

      // Update and submit motherData if it's filled out, or replace empty values with "-"
      const updatedMotherData = {
        ...motherData,
        ApplicationID: applicationID,
        FirstName: motherData.FirstName || '-',
        LastName: motherData.LastName || '-',
        PrefixName: motherData.PrefixName || '-',
        Occupation: motherData.Occupation || '-',
        Phone: motherData.Phone || '-',
        Workplace: motherData.Workplace || '-',
        Status: motherData.Status || '-',
        Age: motherData.Age || 0,  // Set Age to 0 if not provided
      };
      tasks.push(ApiApplicationCreateInternalServices.createGuardian(updatedMotherData));
      console.log('Mother data sent:', updatedMotherData);

      // Send all sibling data as an array to the API
      const updatedSiblingsData = siblingsData.map((sibling) => ({
        ...sibling,
        ApplicationID: applicationID,
      }));
      tasks.push(ApiApplicationCreateInternalServices.createSiblings(updatedSiblingsData));
      console.log('Siblings data sent:', updatedSiblingsData);

      // Send all activities data as an array to the API
      const updatedActivities = activities.map((activity) => ({
        ...activity,
        ApplicationID: applicationID,
      }));
      tasks.push(ApiApplicationCreateInternalServices.createActivity(updatedActivities));
      console.log('Activities data sent:', updatedActivities);

      // Send all scholarship history data as an array to the API
      const updatedScholarshipHistory = scholarshipHistory.map((scholarship) => ({
        ...scholarship,
        ApplicationID: applicationID,
      }));
      tasks.push(ApiApplicationCreateInternalServices.createScholarshipHistory(updatedScholarshipHistory));
      console.log('Scholarship history data sent:', updatedScholarshipHistory);

      // Send all work experience data as an array to the API
      const updatedWorkExperiences = workExperiences.map((workExperience) => ({
        ...workExperience,
        ApplicationID: applicationID,
      }));
      tasks.push(ApiApplicationCreateInternalServices.createWorkExperience(updatedWorkExperiences));
      console.log('Work experience data sent:', updatedWorkExperiences);

      // Submit the addressData and currentAddressData
      const updatedAddressData = { ...addressData, ApplicationID: applicationID };
      tasks.push(ApiApplicationCreateInternalServices.createAddress(updatedAddressData));
      console.log('Address data sent:', updatedAddressData);

      const updatedCurrentAddressData = { ...currentAddressData, ApplicationID: applicationID };
      tasks.push(ApiApplicationCreateInternalServices.createAddress(updatedCurrentAddressData));
      console.log('Current address data sent:', updatedCurrentAddressData);
      // Submit application files
      if (applicationFiles.length > 0) {
        for (const fileData of applicationFiles) {
          const formData = new FormData();
          formData.append('ApplicationID', applicationID);
          formData.append('DocumentName', fileData.DocumentName);
          formData.append('DocumentType', fileData.DocumentType);

          if (fileData.FilePath instanceof File) {
            formData.append('FilePath', fileData.FilePath);
          }

          // Log the formData contents
          for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
          }

          // Push the formData to the API service call
          tasks.push(ApiApplicationCreateInternalServices.createApplicationFile(formData));
        }
      }

      // Execute all tasks
      await Promise.all(tasks);

      console.log('All data submitted successfully.');

      // Clear sessionStorage after successful submission
      sessionStorage.removeItem('step');
      sessionStorage.removeItem('fatherData');
      sessionStorage.removeItem('motherData');
      sessionStorage.removeItem('caretakerData');
      sessionStorage.removeItem('addressData');
      sessionStorage.removeItem('currentAddressData');
      sessionStorage.removeItem('siblingsData');
      sessionStorage.clear();
      router.push(`/page/History-Application`);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError('Validation error: ' + error.response?.data.message);
      } else {
        setError('Error creating application. Please check the form fields and try again.');
      }
      console.error('Error creating application:', error);
    } finally {
      setLoading(false); // End loading
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true); // Optionally, set loading state to disable the form or show a spinner

    try {
      // Set the status to 'รอประกาศผล'
      const updatedApplicationData = {
        ...applicationData,
        Status: 'รอประกาศผล',
      };

      // Create the application and retrieve the ApplicationID
      const applicationResponse = await ApiApplicationCreateInternalServices.createApplication(updatedApplicationData);
      const applicationID = applicationResponse.ApplicationID;

      const tasks: Promise<any>[] = [];

      // Function to update guardian data (caretaker, father, mother)
      const createGuardian = (guardianData: GuardiansData) => {
        const updatedGuardianData = {
          ...guardianData,
          ApplicationID: applicationID,
          FirstName: guardianData.FirstName || '-',
          LastName: guardianData.LastName || '-',
          PrefixName: guardianData.PrefixName || '-',
          Occupation: guardianData.Occupation || '-',
          Phone: guardianData.Phone || '-',
          Workplace: guardianData.Workplace || '-',
          Status: guardianData.Status || '-',
          Age: guardianData.Age || 0,  // Set Age to 0 if not provided
        };
        return ApiApplicationCreateInternalServices.createGuardian(updatedGuardianData);
      };

      // Submit caretaker, father, and mother data
      tasks.push(createGuardian(caretakerData));
      tasks.push(createGuardian(fatherData));
      tasks.push(createGuardian(motherData));

      // Submit siblings data
      if (siblingsData.length > 0) {
        const updatedSiblingsData = siblingsData.map((sibling) => ({
          ...sibling,
          ApplicationID: applicationID,
        }));
        tasks.push(ApiApplicationCreateInternalServices.createSiblings(updatedSiblingsData));
      }

      // Submit activities data
      if (activities.length > 0) {
        const updatedActivities = activities.map((activity) => ({
          ...activity,
          ApplicationID: applicationID,
        }));
        tasks.push(ApiApplicationCreateInternalServices.createActivity(updatedActivities));
      }

      // Submit scholarship history data
      if (scholarshipHistory.length > 0) {
        const updatedScholarshipHistory = scholarshipHistory.map((scholarship) => ({
          ...scholarship,
          ApplicationID: applicationID,
        }));
        tasks.push(ApiApplicationCreateInternalServices.createScholarshipHistory(updatedScholarshipHistory));
      }

      // Submit work experience data
      if (workExperiences.length > 0) {
        const updatedWorkExperiences = workExperiences.map((workExperience) => ({
          ...workExperience,
          ApplicationID: applicationID,
        }));
        tasks.push(ApiApplicationCreateInternalServices.createWorkExperience(updatedWorkExperiences));
      }

      // Submit address data
      const updatedAddressData = { ...addressData, ApplicationID: applicationID };
      tasks.push(ApiApplicationCreateInternalServices.createAddress(updatedAddressData));

      const updatedCurrentAddressData = { ...currentAddressData, ApplicationID: applicationID };
      tasks.push(ApiApplicationCreateInternalServices.createAddress(updatedCurrentAddressData));

      // Submit application files
      if (applicationFiles.length > 0) {
        for (const fileData of applicationFiles) {
          const formData = new FormData();
          formData.append('ApplicationID', applicationID);
          formData.append('DocumentName', fileData.DocumentName);
          formData.append('DocumentType', fileData.DocumentType);
          if (fileData.FilePath instanceof File) {
            formData.append('FilePath', fileData.FilePath);
          }
          tasks.push(ApiApplicationCreateInternalServices.createApplicationFile(formData));
        }
      }

      // Execute all tasks in parallel
      await Promise.all(tasks);

      console.log('All data submitted successfully.');
      // Clear sessionStorage after successful submission
      sessionStorage.removeItem('step');
      sessionStorage.removeItem('fatherData');
      sessionStorage.removeItem('motherData');
      sessionStorage.removeItem('caretakerData');
      sessionStorage.removeItem('addressData');
      sessionStorage.removeItem('currentAddressData');
      sessionStorage.removeItem('siblingsData');
      sessionStorage.clear();

      // Navigate to the application page with status=บันทึกแล้ว
      router.push(`/page/History-Application`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError('Validation error: ' + error.response?.data.message);
      } else {
        setError('Error creating application. Please check the form fields and try again.');
      }
      console.error('Error creating application:', error);
    } finally {
      setLoading(false); // Stop loading spinner or enable the form
    }
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
                    onChange={handleChangeApplication}
                    disabled
                    className="w-full p-3 border border-gray-300 rounded"
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
                    disabled
                    className="w-full p-3 border border-gray-300 rounded"
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
                    disabled
                    className="w-full p-3 border border-gray-300 rounded"
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
                    onChange={handleChangeApplication}
                    disabled
                    className="w-full p-3 border border-gray-300 rounded"
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
              <div className="mb-4 grid grid-cols-3 sm:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="Phone" className="block text-gray-700 mb-2">
                    เบอร์โทร
                  </label>
                  <input
                    id="Phone"
                    name="Phone"
                    value={userData?.Phone || ''}
                    onChange={handleChangeApplication}
                    disabled
                    className="w-full p-3 border border-gray-300 rounded"
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
                    disabled
                    className="w-full p-3 border border-gray-300 rounded"
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
                    disabled
                    className="w-full p-3 border border-gray-300 rounded"
                  />
                </div>
              </div>


              <div className="text-gray-700 mb-1 mt-5">ที่อยู่ตามบัตรประชาชน</div>
              <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="AddressLine" className="block text-gray-700 mb-2">
                    เลขที่
                  </label>
                  <input
                    type="text"
                    id="AddressLine"
                    name="AddressLine"
                    value={addressData.AddressLine}
                    onChange={handleChangeAddress}
                    className="w-full p-3 border border-gray-300 rounded"
                  />
                  {addressErrors.AddressLine && <p className="text-red-500">{addressErrors.AddressLine}</p>}
                </div>
                <div>
                  <label htmlFor="province" className="block text-gray-700 mb-2">
                    จังหวัด
                  </label>
                  <select
                    id="province"
                    name="province"
                    value={addressData.province}
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
                  {addressErrors.province && <p className="text-red-500">{addressErrors.province}</p>}
                </div>
                <div>
                  <label htmlFor="District" className="block text-gray-700 mb-2">
                    อำเภอ
                  </label>
                  <select
                    id="District"
                    name="District"
                    value={addressData.District}
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
                  {addressErrors.District && <p className="text-red-500">{addressErrors.District}</p>}
                </div>
                <div>
                  <label htmlFor="Subdistrict" className="block text-gray-700 mb-2">
                    ตำบล
                  </label>
                  <select
                    id="Subdistrict"
                    name="Subdistrict"
                    value={addressData.Subdistrict}
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
                  {addressErrors.Subdistrict && <p className="text-red-500">{addressErrors.Subdistrict}</p>}
                </div>
                <div>
                  <label htmlFor="PostalCode" className="block text-gray-700 mb-2">
                    รหัสไปรษณีย์
                  </label>
                  <input
                    type="text"
                    id="PostalCode"
                    name="PostalCode"
                    value={addressData.PostalCode}
                    onChange={(e) => {
                      const value = e.target.value;
                      // ดักตัวเลขและจำกัดความยาวไม่เกิน 6 หลัก
                      if (/^\d*$/.test(value) && value.length <= 5) {
                        handleChangeAddress(e); // อัปเดตค่าเมื่อเป็นตัวเลขและไม่เกิน 6 หลัก
                      } else if (value.length > 5) {
                        // ตัดให้เหลือเพียง 6 หลัก
                        handleChangeAddress({
                          ...e,
                          target: {
                            ...e.target,
                            value: value.slice(0, 5),
                          },
                        });
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded"
                  />
                  {addressErrors.PostalCode && <p className="text-red-500">{addressErrors.PostalCode}</p>}
                </div>

              </div>
              <div className="">
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
                        value={currentAddressData.AddressLine}
                        onChange={handleChangeCurrentAddress}
                        className="w-full p-3 border border-gray-300 rounded"
                      />
                      {currentAddressErrors.AddressLine && <p className="text-red-500">{currentAddressErrors.AddressLine}</p>}
                    </div>
                    <div>
                      <label htmlFor="province" className="block text-gray-700 mb-2">
                        จังหวัด
                      </label>
                      <select
                        id="province"
                        name="province"
                        value={currentAddressData.province}
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
                      {currentAddressErrors.province && <p className="text-red-500">{currentAddressErrors.province}</p>}
                    </div>
                    <div>
                      <label htmlFor="District" className="block text-gray-700 mb-2">
                        อำเภอ
                      </label>
                      <select
                        id="District"
                        name="District"
                        value={currentAddressData.District}
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
                      {currentAddressErrors.District && <p className="text-red-500">{currentAddressErrors.District}</p>}
                    </div>
                    <div>
                      <label htmlFor="Subdistrict" className="block text-gray-700 mb-2">
                        ตำบล
                      </label>
                      <select
                        id="Subdistrict"
                        name="Subdistrict"
                        value={currentAddressData.Subdistrict}
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
                      {currentAddressErrors.Subdistrict && <p className="text-red-500">{currentAddressErrors.Subdistrict}</p>}
                    </div>

                    <div>
                      <label htmlFor="PostalCode" className="block text-gray-700 mb-2">
                        รหัสไปรษณีย์
                      </label>
                      <input
                        type="text"
                        id="PostalCode"
                        name="PostalCode"
                        value={currentAddressData.PostalCode}
                        onChange={(e) => {
                          const value = e.target.value;

                          // ดักแค่ตัวเลขและจำกัดความยาวไม่เกิน 5 ตัว
                          if (/^\d*$/.test(value) && value.length <= 5) {
                            handleChangeCurrentAddress(e); // อัปเดตค่าถ้าเป็นตัวเลขและไม่เกิน 5 หลัก
                          } else if (value.length > 5) {
                            // ตัดให้เหลือแค่ 5 หลัก
                            handleChangeCurrentAddress({
                              ...e,
                              target: {
                                ...e.target,
                                value: value.slice(0, 5),
                              },
                            });
                          }
                        }}
                        className="w-full p-3 border border-gray-300 rounded"
                      />
                      {currentAddressErrors.PostalCode && <p className="text-red-500">{currentAddressErrors.PostalCode}</p>}
                    </div>


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
                      className={`w-80 p-3 border  border-gray-300 rounded`}
                    />
                    <span className="ml-2">บาท</span>
                  </div>
                  {errors.MonthlyIncome && <p className="text-red-500">{errors.MonthlyIncome}</p>}
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
                      className={`w-80 p-3 border  border-gray-300 rounded`}
                    />
                    <span className="ml-2">บาท</span>
                  </div>
                  {errors.MonthlyExpenses && <p className="text-red-500">{errors.MonthlyExpenses}</p>}
                </div>


              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="">
            {/* Father's Information */}
            <div className="mb-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
              <div>
                <label htmlFor="FatherPrefixName" className="block text-gray-700 mb-2">
                  คำนำหน้า
                </label>
                <select
                  id="FatherPrefixName"
                  name="PrefixName"
                  value={fatherData.PrefixName}
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
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only alphabetic characters and spaces
                    if (/^[A-Za-zก-๙\s]*$/.test(value)) {
                      handleChangeFather(e); // Only call the handler if the input is valid
                    }
                  }}
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
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only alphabetic characters and spaces (supports English and Thai letters)
                    if (/^[A-Za-zก-๙\s]*$/.test(value)) {
                      handleChangeFather(e); // Only call the handler if the input is valid
                    }
                  }}
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
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    // Ensure the age is greater than or equal to 1
                    if (value >= 1 || e.target.value === "") {
                      handleChangeFather(e); // Only call the handler if the input is valid
                    }
                  }}
                  className="w-20 p-3 border border-gray-300 rounded"
                  min="1" // Ensure min attribute to block lower values from being manually set
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
                    disabled={isCaretakerEditing} // Disable if parent info is being edited

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
                    disabled={isCaretakerEditing} // Disable if parent info is being edited

                  />{' '}
                  ไม่มีชีวิต
                </div>
              </div>

              {/* Disable fields if Father is deceased */}
              <div className="">
                <label htmlFor="FatherPhone" className="block text-gray-700 mb-2">
                  เบอร์โทร
                </label>
                <input
                  type="text"
                  id="FatherPhone"
                  name="Phone"
                  value={fatherData.Phone}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
                    if (onlyNumbers.length <= 10) { // Restrict to 10 digits
                      handleChangeFather(e);  // Pass the original event, no need to modify
                    }
                  }}
                  className={`w-70 p-3 border ${fatherData.Status === 'ไม่มีชีวิต' ? 'bg-gray-200 text-gray-700 font-semibold' : 'border-gray-300'}`}
                  inputMode="numeric" // Helps to show a numeric keyboard on mobile devices
                  disabled={fatherData.Status === 'ไม่มีชีวิต' || isCaretakerEditing}
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
                  onChange={(e) => {
                    const onlyLetters = e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ''); // Allow only alphabetic characters and spaces
                    e.target.value = onlyLetters; // Modify the input value before passing the event
                    handleChangeFather(e);  // Pass the original event
                  }}
                  className={`w-full p-3 border ${fatherData.Status === 'ไม่มีชีวิต' ? 'bg-gray-200 text-gray-700 font-semibold' : 'border-gray-300'}`}
                  disabled={fatherData.Status === 'ไม่มีชีวิต' || isCaretakerEditing}
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
                  className={`w-full p-3 border ${fatherData.Status === 'ไม่มีชีวิต' ? 'bg-gray-200 text-gray-700 font-semibold' : 'border-gray-300'}`}
                  disabled={fatherData.Status === 'ไม่มีชีวิต' || isCaretakerEditing}
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
                  className={`w-full p-3 border ${fatherData.Status === 'ไม่มีชีวิต' ? 'bg-gray-200 text-gray-700 font-semibold' : 'border-gray-300'}`}
                  disabled={fatherData.Status === 'ไม่มีชีวิต' || isCaretakerEditing}
                />
              </div>

            </div>

            {/* Mother's Information */}
            <div className="mb-10 grid grid-cols-3 sm:grid-cols-5 gap-2">
              <div>
                <label htmlFor="MotherPrefixName" className="block text-gray-700 mb-2">
                  คำนำหน้า
                </label>
                <select
                  id="MotherPrefixName"
                  name="PrefixName"
                  value={motherData.PrefixName}
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
                  onChange={(e) => {
                    const onlyLetters = e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ''); // Allow only alphabetic characters and spaces
                    e.target.value = onlyLetters; // Modify the input value before passing the event
                    handleChangeMother(e);  // Pass the original event
                  }}
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
                  onChange={(e) => {
                    const onlyLetters = e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ''); // Allow only alphabetic characters and spaces
                    e.target.value = onlyLetters; // Modify the input value before passing the event
                    handleChangeMother(e);  // Pass the original event
                  }}
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
                    disabled={isCaretakerEditing} // Disable if parent info is being edited
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
                    disabled={isCaretakerEditing} // Disable if parent info is being edited
                  />{' '}
                  ไม่มีชีวิต
                </div>
              </div>

              {/* Disable these fields if Mother is deceased */}
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
                  className={`w-70 p-3 border ${motherData.Status === 'ไม่มีชีวิต'
                    ? 'bg-gray-200 text-gray-900 font-bold' // Darker and bold when disabled
                    : 'border-gray-300'
                    } rounded`}
                  disabled={motherData.Status === 'ไม่มีชีวิต' || isCaretakerEditing}
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
                  className={`w-full p-3 border ${motherData.Status === 'ไม่มีชีวิต'
                    ? 'bg-gray-200 text-gray-900 font-bold ' // Darker and bold when disabled
                    : 'border-gray-300'
                    } rounded`}
                  disabled={motherData.Status === 'ไม่มีชีวิต' || isCaretakerEditing}
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
                  className={`w-full p-3 border ${motherData.Status === 'ไม่มีชีวิต'
                    ? 'bg-gray-200 text-gray-900 font-bold' // Darker and bold when disabled
                    : 'border-gray-300'
                    } rounded`}
                  disabled={motherData.Status === 'ไม่มีชีวิต' || isCaretakerEditing}
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
                  className={`w-full p-3 border ${motherData.Status === 'ไม่มีชีวิต'
                    ? 'bg-gray-200 text-gray-900 font-bold' // Darker and bold when disabled
                    : 'border-gray-300'
                    } rounded`}
                  disabled={motherData.Status === 'ไม่มีชีวิต' || isCaretakerEditing}
                />
              </div>



            </div>

            {/* Caretaker Information */}
            <div className="mb-6">
              <div className="flex justify-start items-center space-x-4">
                <h2 className="text-gray-700">
                  {isCaretakerEditing
                    ? 'กำลังกรอกข้อมูลผู้อุปการะ (ถ้าเป็นบิดามารดาไม่ต้องกรอกข้อมูล)'
                    : 'ผู้อุปการะ (ถ้าเป็นบิดามารดาไม่ต้องกรอกข้อมูล)'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsCaretakerEditing((prev) => !prev);
                    setIsParentEditing((prev) => !prev);
                  }}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                >
                  {isCaretakerEditing ? 'ปิดการกรอกข้อมูล' : 'กรอกข้อมูล'}
                </button>
              </div>

              <div className="mb-6 grid grid-cols-1 sm:grid-cols-5 gap-6">
                <div>
                  <label htmlFor="CaretakerPrefixName" className="block text-gray-700 mb-2">
                    คำนำหน้า
                  </label>
                  <select
                    id="CaretakerPrefixName"
                    name="PrefixName"
                    value={caretakerData.PrefixName}
                    onChange={handleChangeCaretaker}
                    className="w-30 p-3 border border-gray-300 rounded"
                    disabled={!isCaretakerEditing} // Disable if parent info is being edited
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
                    onChange={handleChangeCaretaker}
                    className="w-full p-3 border border-gray-300 rounded"
                    disabled={!isCaretakerEditing} // Disable if parent info is being edited
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
                    onChange={handleChangeCaretaker}
                    className="w-full p-3 border border-gray-300 rounded"
                    disabled={!isCaretakerEditing} // Disable if parent info is being edited
                  />
                </div>
                <div className="">
                  <label htmlFor="CaretakerAge" className="block text-gray-700 mb-2">
                    อายุ
                  </label>
                  <input
                    type="number"
                    id="CaretakerAge"
                    name="Age"
                    value={caretakerData.Age}
                    onChange={handleChangeCaretaker}
                    className="w-20 p-3 border border-gray-300 rounded"
                    disabled={!isCaretakerEditing} // Disable if parent info is being edited
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
                      value="มีชีวิต"
                      checked={caretakerData.Status === 'มีชีวิต'}
                      onChange={handleChangeCaretaker}
                      className="mr-2"
                      disabled={!isCaretakerEditing} // Disable if parent info is being edited
                    />{' '}
                    มีชีวิต
                    <input
                      type="radio"
                      id="CaretakerStatusDeceased"
                      name="Status"
                      value="ไม่มีชีวิต"
                      checked={caretakerData.Status === 'ไม่มีชีวิต'}
                      onChange={handleChangeCaretaker}
                      className="ml-4 mr-2"
                      disabled={!isCaretakerEditing} // Disable if parent info is being edited
                    />{' '}
                    ไม่มีชีวิต
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
                    onChange={handleChangeCaretaker}
                    className="w-70 p-3 border border-gray-300 rounded"
                    disabled={!isCaretakerEditing} // Disable if parent info is being edited
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
                    onChange={handleChangeCaretaker}
                    className="w-full p-3 border border-gray-300 rounded"
                    disabled={!isCaretakerEditing} // Disable if parent info is being edited
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
                    disabled={!isCaretakerEditing} // Disable if parent info is being edited
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
                    disabled={!isCaretakerEditing} // Disable if parent info is being edited
                  />
                </div>
                <div>
                  <label htmlFor="CaretakerType" className="block text-gray-700 mb-2">
                    เกี่ยวข้องเป็น
                  </label>
                  <input
                    type="text"
                    id="CaretakerType"
                    name="Type"
                    value={caretakerData.Type}
                    onChange={handleChangeCaretaker}
                    className="w-full p-3 border border-gray-300 rounded"
                    disabled={!isCaretakerEditing} // Disable if parent info is being edited
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
                  value={numberOfSiblings}
                  onChange={handleNumberOfSiblingsChange}
                  className="w-50 p-3 border border-gray-300 rounded"
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
              <div key={index} className="mb-4 grid grid-cols-1 sm:grid-cols-7 gap-6">
                {/* Prefix Name */}
                <div>
                  <label htmlFor={`PrefixName-${index}`} className="block text-gray-700 mb-2">คำนำหน้า</label>
                  <select
                    id={`PrefixName-${index}`}
                    name="PrefixName"
                    value={sibling.PrefixName}
                    onChange={(e) => handleChangeSibling(index, 'PrefixName', e.target.value)} // Corrected here
                    className="w-30 p-3 border border-gray-300 rounded"
                  >
                    <option value="">คำนำหน้า</option>
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                  </select>
                  {siblingsErrors[index]?.PrefixName && <p className="text-red-500">{siblingsErrors[index].PrefixName}</p>}
                </div>

                {/* First Name */}
                <div>
                  <label htmlFor={`Fname-${index}`} className="block text-gray-700 mb-2">ชื่อ</label>
                  <input
                    type="text"
                    id={`Fname-${index}`}
                    name="Fname"
                    value={sibling.Fname}
                    onChange={(e) => {
                      const onlyLetters = e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ''); // Only allow alphabetic and Thai characters
                      handleChangeSibling(index, 'Fname', onlyLetters); // Corrected here
                    }}
                    className="w-full p-3 border border-gray-300 rounded"
                  />
                  {siblingsErrors[index]?.Fname && <p className="text-red-500">{siblingsErrors[index].Fname}</p>}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor={`Lname-${index}`} className="block text-gray-700 mb-2">นามสกุล</label>
                  <input
                    type="text"
                    id={`Lname-${index}`}
                    name="Lname"
                    value={sibling.Lname}
                    onChange={(e) => {
                      const onlyLetters = e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ''); // Only allow alphabetic and Thai characters
                      handleChangeSibling(index, 'Lname', onlyLetters); // Corrected here
                    }}
                    className="w-full p-3 border border-gray-300 rounded"
                  />
                  {siblingsErrors[index]?.Lname && <p className="text-red-500">{siblingsErrors[index].Lname}</p>}
                </div>

                {/* Occupation */}
                <div>
                  <label htmlFor={`Occupation-${index}`} className="block text-gray-700 mb-2">อาชีพ</label>
                  <input
                    type="text"
                    id={`Occupation-${index}`}
                    name="Occupation"
                    value={sibling.Occupation}
                    onChange={(e) => handleChangeSibling(index, 'Occupation', e.target.value)} // Corrected here
                    className="w-full p-3 border border-gray-300 rounded"
                  />
                  {siblingsErrors[index]?.Occupation && <p className="text-red-500">{siblingsErrors[index].Occupation}</p>}
                </div>

                {/* Education Level */}
                <div>
                  <label htmlFor={`EducationLevel-${index}`} className="block text-gray-700 mb-2">ระดับการศึกษา</label>
                  <select
                    id={`EducationLevel-${index}`}
                    name="EducationLevel"
                    value={sibling.EducationLevel}
                    onChange={(e) => handleChangeSibling(index, 'EducationLevel', e.target.value)} // Corrected here
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
                  {siblingsErrors[index]?.EducationLevel && <p className="text-red-500">{siblingsErrors[index].EducationLevel}</p>}
                </div>

                {/* Income */}
                <div>
                  <label htmlFor={`Income-${index}`} className="block text-gray-700 mb-2">รายได้</label>
                  <input
                    type="number"
                    id={`Income-${index}`}
                    name="Income"
                    value={sibling.Income}
                    onChange={(e) => handleChangeSibling(index, 'Income', e.target.value)} // Corrected here
                    className="w-full p-3 border border-gray-300 rounded"
                  />
                  {siblingsErrors[index]?.Income && <p className="text-red-500">{siblingsErrors[index].Income}</p>}
                </div>

                {/* Status */}
                <div>
                  <label htmlFor={`Status-${index}`} className="block text-gray-700 mb-2">สถานะ</label>
                  <select
                    id={`Status-${index}`}
                    name="Status"
                    value={sibling.Status}
                    onChange={(e) => handleChangeSibling(index, 'Status', e.target.value)} // Corrected here
                    className="w-30 p-3 border border-gray-300 rounded"
                  >
                    <option value="">สถานะ</option>
                    <option value="โสด">โสด</option>
                    <option value="สมรส">สมรส</option>
                  </select>
                  {siblingsErrors[index]?.Status && <p className="text-red-500">{siblingsErrors[index].Status}</p>}
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
                    onChange={handleChangeApplication}
                    inputMode="numeric"
                    pattern="[1-9]*[0.0]"
                    className="w-3/4 p-3 border border-gray-300 rounded"
                  />
                  {applicationErrors.GPAYear1 && <p className="text-red-500">{applicationErrors.GPAYear1}</p>}
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
                    onChange={handleChangeApplication}
                    inputMode="numeric"
                    pattern="[1-9]*[0.0]"
                    className="w-3/4 p-3 border border-gray-300 rounded"
                  />
                  {applicationErrors.GPAYear2 && <p className="text-red-500">{applicationErrors.GPAYear2}</p>}
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
                    onChange={handleChangeApplication}
                    inputMode="numeric"
                    pattern="[1-9]*[0.0]"
                    className="w-3/4 p-3 border border-gray-300 rounded"
                  />
                  {applicationErrors.GPAYear3 && <p className="text-red-500">{applicationErrors.GPAYear3}</p>}
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
                    onChange={(e) => {
                      const onlyLetters = e.target.value.replace(/[^a-zA-Zก-๙\s]/g, ''); // Allow only alphabetic characters and Thai characters
                      e.target.value = onlyLetters; // Modify the input value directly
                      handleChangeApplication(e); // Pass the actual event
                    }}
                    className="w-3/4 p-3 border border-gray-300 rounded"
                  />
                  {applicationErrors.AdvisorName && <p className="text-red-500">{applicationErrors.AdvisorName}</p>}
                </div>

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
                      {Array.from({ length: 2580 - 2564 + 1 }, (_, i) => 2564 + i).map(year => (
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
              {scholarshipHistory.map((scholarship, index) => (
                <div key={index} className="mb-4 mt-2 grid grid-cols-1 sm:grid-cols-5 gap-6">
                  <div>
                    <label htmlFor={`ScholarshipName-${index}`} className="block text-gray-700 mb-2">ชื่อทุนที่ได้รับ</label>
                    <input
                      type="text"
                      id={`ScholarshipName-${index}`}
                      name="ScholarshipName"
                      value={scholarship.ScholarshipName}
                      onChange={(e) => handleScholarshipChange(index, e)}
                      className="w-full p-3 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label htmlFor={`AcademicYear-${index}`} className="block text-gray-700 mb-2">ปีการศึกษา</label>
                    <select
                      id={`AcademicYear-${index}`}
                      name="AcademicYear"
                      value={scholarship.AcademicYear}
                      onChange={(e) => handleScholarshipChange(index, e)}
                      className="w-full p-3 border border-gray-300 rounded"
                    >
                      <option value="">เลือกปีการศึกษา</option>
                      {Array.from({ length: 17 }, (_, i) => 2564 + i).map(year => (
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
                      value={scholarship.AmountReceived}
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
            {workExperiences.map((experience, index) => (
              <div key={index} className="mb-4 grid grid-cols-1 sm:grid-cols-5 gap-6">
                <div>
                  <label htmlFor={`Name-${index}`} className="block text-gray-700 mb-2">ชื่อบริษัทผู้จ้าง</label>
                  <input
                    type="text"
                    id={`Name-${index}`}
                    name="Name"
                    value={experience.Name}
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
                    value={experience.JobType}
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
                    value={experience.Duration}
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
                    value={experience.Earnings}
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
            {applicationFiles.map((file, index) => (
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
                    <option value="รูปถ่ายหน้าตรง"> รูปถ่ายหน้าตรง</option>
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
                    accept="application/pdf, image/jpeg, image/png" // Allow only PDF, JPEG, and PNG files
                    onChange={(e) => handleFileUpload(index, e)}
                    className="w-full p-3 border border-gray-300 rounded"
                  />
                  {/* แจ้งเตือนข้อผิดพลาดใต้กล่องอัปโหลด */}
                  {file.error && <p className="text-red-500 mt-1">{file.error}</p>}
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
      <div className={styles.fixedheader}>
        <Header />

      </div>
      <div className="flex-1 container mx-auto px-4 py-20">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-center mb-6">
            <div className={`flex items-center ${step === 1 ? 'text-blue-600' : 'text-gray-500'}`}>
              <span
                className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 1 ? 'border-blue-600' : 'border-gray-500'}`}
              >
                1
              </span>
              <span className="ml-2 hidden sm:inline">ประวัติส่วนตัว</span>
            </div>
            <div className={`flex items-center ml-4 sm:ml-8 ${step === 2 ? 'text-blue-600' : 'text-gray-500'}`}>
              <span
                className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 2 ? 'border-blue-600' : 'border-gray-500'}`}
              >
                2
              </span>
              <span className="ml-2 hidden sm:inline">ประวัติครอบครัว</span>
            </div>
            <div className={`flex items-center ml-4 sm:ml-8 ${step === 3 ? 'text-blue-600' : 'text-gray-500'}`}>
              <span
                className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 3 ? 'border-blue-600' : 'border-gray-500'}`}
              >
                3
              </span>
              <span className="ml-2 hidden sm:inline">ประวัติการศึกษา</span>
            </div>
            <div className={`flex items-center ml-4 sm:ml-8 ${step === 4 ? 'text-blue-600' : 'text-gray-500'}`}>
              <span
                className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 4 ? 'border-blue-600' : 'border-gray-500'}`}
              >
                4
              </span>
              <span className="ml-2 hidden sm:inline">ประวัติการรับทุนศึกษา</span>
            </div>
            <div className={`flex items-center ml-4 sm:ml-8 ${step === 5 ? 'text-blue-600' : 'text-gray-500'}`}>
              <span
                className={`rounded-full w-10 h-10 flex items-center justify-center border ${step === 5 ? 'border-blue-600' : 'border-gray-500'}`}
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
            {step === 5 && (
              <div className="flex justify-center mt-6 text-center w-full">
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-4"
                >
                  บันทึก
                </button>
                <button
                  type="submit"
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

