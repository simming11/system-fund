"use client";
import { useRouter } from 'next/navigation';
import Header from '@/app/components/header/Header';
import Footer from '@/app/components/footer/footer';
import { Suspense, useEffect, useState } from 'react';
import axios from 'axios';
import ApiCreateApplicationExternalServices from '@/app/services/ApiApplicationExternalServices/ApiCreateAppicationExternalServicer';

interface ApplicationExternaldata {
  StudentID: string;
  ScholarshipID: string;
  ApplicationDate: string;
  Status: string;
}

interface ApplicationFilesData {
  Application_EtID: string;
  DocumentName: string;
  DocumentType: string;
  FilePath: string | File;
}

export default function CreateApplicationExternalPage() {
  const router = useRouter();


  const [applicationData, setApplicationData] = useState<ApplicationExternaldata>({
    StudentID: '',
    ScholarshipID: '',
    ApplicationDate: '',
    Status: 'รออนุมัติ',
  });



  const [applicationFiles, setApplicationFiles] = useState<ApplicationFilesData[]>([
    { Application_EtID: '', DocumentName: '', DocumentType: '', FilePath: '' },
  ]);

  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const Role = localStorage.getItem('UserRole');

      if (!token || Role?.trim().toLowerCase() !== 'student') {
        console.error('Unauthorized access or missing token. Redirecting to login.');
        router.push('/page/login');
      }

      const idStudent = localStorage.getItem('UserID');
      setApplicationData((prevData) => ({
        ...prevData,
        StudentID: idStudent || '',
      }));

      // Fetch search params on the client side
      const searchParams = new URLSearchParams(window.location.search);
      const scholarshipId = searchParams.get('scholarshipId');
      setApplicationData((prevData) => ({
        ...prevData,
        ScholarshipID: scholarshipId || '',
      }));
    }
  }, [router]);
  // Saving the state data to sessionStorage when the component mounts or state changes

  useEffect(() => {
    sessionStorage.setItem('applicationData', JSON.stringify(applicationData));
  }, [applicationData]);



  useEffect(() => {
    sessionStorage.setItem('applicationFiles', JSON.stringify(applicationFiles));
  }, [applicationFiles]);


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

  // Handle file upload with validation for PDF and image files
  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const fileType = file.type;
      const validFileTypes = ['application/pdf', 'image/jpeg', 'image/png'];

      // Check if the file type is valid
      if (!validFileTypes.includes(fileType)) {
        alert('เฉพาะไฟล์ PDF และรูปภาพ (JPEG, PNG) เท่านั้นที่สามารถอัปโหลดได้');
        return; // Exit if the file type is not valid
      }

      const updatedFiles = [...applicationFiles];
      updatedFiles[index].FilePath = file; // Assign the selected file
      setApplicationFiles(updatedFiles); // Update the state with the new file

      console.log('File uploaded:', file);
    }
  };


  // Add a new file entry
  const addFileEntry = () => {
    setApplicationFiles([...applicationFiles, { Application_EtID: '', DocumentName: '', DocumentType: '', FilePath: '' }]);
  };

  // Remove a file entry
  const removeFileEntry = (index: number) => {
    const updatedFiles = applicationFiles.filter((_, i) => i !== index);
    setApplicationFiles(updatedFiles);
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if all fields in applicationFiles are filled out
    for (const file of applicationFiles) {
      if (!file.DocumentType || !file.DocumentName || !file.FilePath) {
        setError('กรุณากรอกข้อมูลทุกฟิลด์ให้ครบถ้วน และอัปโหลดไฟล์สำหรับเอกสาร');
        return; // Prevent form submission if validation fails
      }
    }


    try {
      // Set the status to 'รอประกาศผล'
      const updatedApplicationData = {
        ...applicationData,
        Status: 'รอประกาศผล',
      };

      // Create the application and retrieve the Application_EtID
      console.log(updatedApplicationData);

      const applicationResponse = await ApiCreateApplicationExternalServices.createApplication(updatedApplicationData);
      const Application_EtID = applicationResponse.Application_EtID;

      const tasks: Promise<any>[] = [];

      if (applicationFiles.length > 0) {
        for (const fileData of applicationFiles) {
          const formData = new FormData();

          // Append the Application_EtID
          formData.append('Application_EtID', Application_EtID); // Ensure the backend expects Application_EtID

          // Append Document details
          formData.append('DocumentName', fileData.DocumentName);
          formData.append('DocumentType', fileData.DocumentType);

          // Append the file
          if (fileData.FilePath instanceof File) {
            formData.append('FilePath', fileData.FilePath);
          }

          // Log the FormData contents for debugging
          for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
          }

          // Send the formData using your API service
          tasks.push(ApiCreateApplicationExternalServices.createApplicationFile(formData));
        }
      }

      // Execute all tasks
      await Promise.all(tasks);

      console.log('All data submitted successfully.');
      sessionStorage.clear();
      router.push(`/page/History-Application`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError('Validation error: ' + error.response?.data.message);
      } else {
        setError('Error creating application. Please check the form fields and try again.');
      }
      console.error('Error creating application:', error);
    }
  };



  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8">
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
                  accept=".pdf, image/*" // Restrict the file type to PDF and images
                  onChange={(e) => handleFileUpload(index, e)}
                  className="w-full p-3 border border-gray-300 rounded"
                />
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

        <div className="bg-white  rounded-lg p-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Submit
              </button>
            </div>


          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
