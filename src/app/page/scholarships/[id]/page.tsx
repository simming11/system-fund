"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/header/Header';
import Footer from '@/app/components/footer/footer';
import ApiServiceScholarships from '@/app/services/scholarships/ApiScholarShips';
import HeaderHome from '@/app/components/headerHome/headerHome';
import ApiGetALLfilesServiceScholarships from '@/app/services/scholarships/ApiServiceScholarshipsFiles';
import ApiApplicationServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationInternalServices';
import ApiApplicationExternalServices from '@/app/services/ApiApplicationExternalServices/ApiApplicationExternalServices';

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
  images: images[];
}

interface images {
  ImageID: number;
  ImagePath: string;
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
export default function ScholarshipDetailPage() {
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get('id');
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<ScholarshipFileData[]>([]);
  const [image, setImage] = useState<images[]>([]);
  const [hasApplied, setHasApplied] = useState(false);
  const BASE_URL = process.env.NEXT_PUBLIC_API_Backend;

  useEffect(() => {
    const checkAndClearSession = () => {
      const lastId = sessionStorage.getItem('lastScholarshipId');

      if (lastId && lastId !== id) {
        sessionStorage.removeItem('lastScholarshipId'); // ลบข้อมูลเก่าออก
        sessionStorage.clear(); // ลบข้อมูลทั้งหมดใน sessionStorage
      }
      sessionStorage.setItem('lastScholarshipId', id || ''); // บันทึก id ใหม่
    };


    const fetchScholarshipData = async () => {
      try {
        if (id) {
          checkAndClearSession(); // ตรวจสอบและลบ session ก่อน

          const response = await ApiServiceScholarships.getScholarship(Number(id));
          setScholarship(response.data);
          const getimages = response.data.images;
          setImage(getimages);

          const documentsResponse = await ApiGetALLfilesServiceScholarships.getScholarshipDocuments(Number(id));
          setDocuments(documentsResponse.data);

          const StudentID = localStorage.getItem('UserID');
          if (StudentID) {
            const [internalApplications, externalApplications] = await Promise.all([
              ApiApplicationServices.showByStudentId(StudentID),
              ApiApplicationExternalServices.showByStudent(StudentID),
            ]);

            const appliedInternal = internalApplications.some(
              (application: { ScholarshipID: number }) => application.ScholarshipID === Number(id)
            );
            const appliedExternal = externalApplications.some(
              (application: { ScholarshipID: number }) => application.ScholarshipID === Number(id)
            );
            setHasApplied(appliedInternal || appliedExternal);
          }
        }
      } catch (error) {
        console.error('Error fetching scholarship data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScholarshipData();
  }, [id]);

  // ประกาศตัวแปร imagePath ก่อนการนำไปใช้
  const imagePath = image.length > 0 ? `${BASE_URL}/storage/${image[0].ImagePath}` : null;

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
  const isApplyDisabled = scholarship
    ? new Date() >new Date(scholarship.StartDate) && new Date() > new Date(scholarship.EndDate)
    : true;


  return (
    <div className="min-h-screen flex flex-col">
      <HeaderHome />
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* ตรวจสอบว่า scholarship มีค่าหรือไม่ ก่อนที่จะแสดงข้อมูล */}
        <h2 className="text-4xl font-bold text-center break-words">
          {scholarship?.ScholarshipName ?? 'Scholarship not found'}
        </h2>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 p-4">
            {imagePath && (
              <div className="flex justify-center items-start mt-5">
                <div className="">
                  <img
                    src={imagePath}
                    alt="ไฟล์ประกอบการสมัคร"
                    width={350}
                    height={350}
                    className="rounded-lg shadow-lg"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="w-full md:w-1/2 p-4">
            {scholarship ? (
              <div className="">
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-1">คุณสมบัติ:</h3>
                  <ul className="list-disc list-inside text-gray-600">
                    <li>เกรดเฉลี่ย {scholarship.Minimum_GPA} ขึ้นไป</li>
                    <li>ชั้นปี{scholarship.YearLevel} </li>
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
                            {file.FilePath.split('/').pop()}
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
              </div>
            ) : (
              <p className="text-red-500">ไม่มี</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          {hasApplied ? (
            <p className="text-green-500 font-semibold text-2xl">ท่านได้สมัครทุนแล้ว</p>
          ) : (
            <button
              onClick={handleApplyNow}
              className={`px-4 py-2 rounded mt-4 text-white ${isApplyDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
              disabled={isApplyDisabled}
            >
              {isApplyDisabled ? 'ปิดรับสมัครแล้ว' : 'สมัครตอนนี้'}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
