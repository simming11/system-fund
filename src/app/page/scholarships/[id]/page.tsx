"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/app/components/header/Header';
import Footer from '@/app/components/footer/footer';
import ApiServiceScholarships from '@/app/services/scholarships/ApiScholarShips';
import HeaderHome from '@/app/components/headerHome/headerHome';
import ApiGetALLfilesServiceScholarships from '@/app/services/scholarships/ApiServiceScholarshipsFiles';
import ApiScholarshipsAllImage from '@/app/services/scholarships/ApiScholarshipsImage';
import Image from 'next/image'
interface Scholarship {
  StartDate: Date;
  EndDate: Date;
  CreatedBy: string;
  TypeID: number;
  ScholarshipName: string;
  YearLevel: string;
  updated_at: Date;
  created_at: Date;
  Minimum_GPA: string;
  Year: number;
  ScholarshipID: number;
  courses: Course[];
  documents: Document[];
  qualifications: Qualification[];
  type: { TypeID: number; TypeName: string };
  creator: { AcademicID: string };
}

interface Course {
  ScholarshipID: number;
  CourseID: number;
  CourseName: string;
}

interface Document {
  ScholarshipID: number;
  DocumentID: number;
  DocumentText: string;
}

interface Qualification {
  ScholarshipID: number;
  QualificationID: number;
  QualificationText: string;
}

interface ScholarshipFileData {
  FileID: number;
  ScholarshipID: number;
  FileType: string;
  FilePath: string; // Assuming FilePath is a string (URL)
  Description?: string;
}

interface ScholarshipImageData {
  ScholarshipID: number;
  ImagePath: File;
}

export default function ScholarshipDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<ScholarshipFileData[]>([]);
  const [image, setImage] = useState<string | null>(null); // Update to use a string instead of an array
  const BASE_URL = process.env.NEXT_PUBLIC_API_Backend;

  useEffect(() => {
    const fetchScholarshipData = async () => {
      try {
        if (id) {
          const response = await ApiServiceScholarships.getScholarship(Number(id));
          setScholarship(response.data);
          const getimages = response.data.images[0]?.ImagePath;
          setImage(getimages || null);
          const documentsResponse = await ApiGetALLfilesServiceScholarships.getScholarshipDocuments(Number(id));
          setDocuments(documentsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching scholarship data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScholarshipData();
  }, [id]);

  const handleDownloadFile = async (fileId: number, fileName: string) => {
    try {
      await ApiGetALLfilesServiceScholarships.downloadFile(fileId, fileName);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleApplyNow = () => {
    if (scholarship) {
      if (scholarship.TypeID === 1) {
        router.push(`/page/application/create/internal?scholarshipId=${scholarship.ScholarshipID}`);
      } else if (scholarship.TypeID === 2) {
        router.push(`/page/application/create/external?scholarshipId=${scholarship.ScholarshipID}`);
      }
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

  const isApplyDisabled = scholarship ? new Date() > new Date(scholarship.EndDate) : true;

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderHome />
      <Header />
      <div className="container mx-auto px-4 py-8">
        {scholarship ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-4xl font-bold text-center break-words">{scholarship.ScholarshipName}</h2>
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-1">คุณสมบัติ:</h3>
              <ul className="list-disc list-inside text-gray-600">
                {scholarship.qualifications.map((qualification, index) => (
                  <li key={index}>{qualification.QualificationText}</li>
                ))}
              </ul>
              <div className="mt-2">
                <h3 className="text-lg font-semibold mb-1">สาขาที่ต้องการ:</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {scholarship.courses.map((course, index) => (
                    <li key={index}>{course.CourseName}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-lg font-semibold mb-1">เอกสารประกอบการสมัคร:</h3>
              <ul className="list-disc list-inside text-gray-600">
                {scholarship.documents.map((document, index) => (
                  <li key={index}>{document.DocumentText}</li>
                ))}
              </ul>
            </div>
            {image && (
              <div className="mt-4">
                <div className="list-disc list-inside text-gray-600">
                  <img
                    src={`${BASE_URL}/storage/${image}`}
                    alt="ไฟล์ประกอบการสมัคร"
                    width={300}
                    height={200}
                  />
                </div>
              </div>
            )}

            {documents && documents.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-1">เอกสารอื่นๆ:</h3>
                <ul className=" list-inside text-gray-600">
                  {documents.map((file, index) => (
                    <li key={index}>
                      <a
                        onClick={() => handleDownloadFile(file.FileID, file.FilePath.split('/').pop()!)}
                        className="text-blue-500 underline cursor-pointer"
                      >
                        {file.FilePath.split('/').pop()} {/* Display the filename */}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-10">
              <p className="text-gray-500 text-sm mb-2">วันที่เปิดรับ: {new Date(scholarship.StartDate).toLocaleDateString()}</p>
              <p className="text-gray-500 text-sm mb-2">วันที่ปิดรับ: {new Date(scholarship.EndDate).toLocaleDateString()}</p>
              <p className="text-gray-500 text-sm mb-2">ปีการศึกษา: {scholarship.Year}</p>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={handleApplyNow}
                className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4 ${isApplyDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isApplyDisabled}
              >
                Apply Now
              </button>
            </div>
          </div>
        ) : (
          <p className="text-red-500">Scholarship not found</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
