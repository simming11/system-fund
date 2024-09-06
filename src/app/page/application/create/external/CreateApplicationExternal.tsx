"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/app/components/header/Header';
import Footer from '@/app/components/footer/footer';
import { useEffect, useState } from 'react';
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
  const searchParams = useSearchParams();
  const id = searchParams.get('scholarshipId');
  const idStudent = localStorage.getItem('UserID');
  console.log(idStudent);
  
  const router = useRouter();


  const [applicationData, setApplicationData] = useState<ApplicationExternaldata>({
    StudentID: idStudent || '',
    ScholarshipID: id || '',
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

  // Handle file upload
  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const updatedFiles = [...applicationFiles];
      updatedFiles[index].FilePath = file;
      setApplicationFiles(updatedFiles);
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
        // Submit application files
        for (const [index, fileData] of applicationFiles.entries()) {
            const formData = new FormData();
            formData.append('Application_EtID', Application_EtID);
            formData.append('DocumentName', fileData.DocumentName);
            formData.append('DocumentType', fileData.DocumentType);
            if (fileData.FilePath instanceof File) {
                formData.append('FilePath', fileData.FilePath);
            }
            tasks.push(ApiCreateApplicationExternalServices.createApplicationFile(formData));
            console.log('File data sent:', formData);
        }

        // Execute all tasks
        await Promise.all(tasks);

        console.log('All data submitted successfully.');

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
                    <option value="รูปภาพหน้าตรง">รูปภาพหน้าตรง</option>
                    <option value="ผลการเรียน">ผลการเรียน</option>
                    <option value="เอกสารอื่นๆ">เอกสารอื่นๆ</option>
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
        <div className="bg-white shadow-md rounded-lg p-6">
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
