"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/header/Header';
import Footer from '@/app/components/footer/footer';
import HeaderHome from '@/app/components/headerHome/headerHome';
import ApiServiceScholarships from '@/app/services/scholarships/ApiScholarShips';
import ApiScholarshipsAllImage from '@/app/services/scholarships/ApiScholarshipsImage';
import ApiStudentServices from '@/app/services/students/ApiStudent';
import ApiApplicationServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationInternalServices'; // Assuming you have this service
import ApiApplicationExternalServices from '@/app/services/ApiApplicationExternalServices/ApiApplicationExternalServices'; // Assuming you have this service

interface Student {
  StudentID: string;
  FirstName: string;
  LastName: string;
  GPA: number;
  Course: string;
  Year_Entry: number;
}

interface Scholarship {
  ScholarshipID: number;
  ScholarshipName: string;
  Minimum_GPA: number;
  courses: { CourseName: string }[];
  StartDate: Date;
  EndDate: Date;
  Description: string;
  ImagePath: string;
  TypeID: number; // Assuming this field exists in the API response
  Year: string;
}

export default function ExternalScholarShipsPage() {
  const router = useRouter();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [appliedScholarships, setAppliedScholarships] = useState<number[]>([]); // For storing applied scholarship IDs

  // Pagination states
  const itemsPerPage = 4; // Adjust as needed
  const [openPage, setOpenPage] = useState(1);
  const [closedPage, setClosedPage] = useState(1);

  // Fetch Scholarships Data
  useEffect(() => {
    const fetchScholarshipsData = async () => {
      try {
        const response = await ApiServiceScholarships.getAllScholarships();
        const scholarshipsData = response.data;

        // Filter scholarships by TypeID === 2 (External)
        const filteredScholarships = scholarshipsData.filter((scholarship: Scholarship) => scholarship.TypeID === 2);

        // Fetch and attach images for each filtered scholarship
        const updatedScholarships = await Promise.all(
          filteredScholarships.map(async (scholarship: Scholarship) => {
            if (scholarship.ScholarshipID) {
              try {
                const imageResponse = await ApiScholarshipsAllImage.getImageByScholarshipID(scholarship.ScholarshipID);
                if (imageResponse.status === 200 && imageResponse.data.length > 0) {
                  scholarship.ImagePath = imageResponse.data[0].ImagePath;
                }
              } catch (error) {
                console.error(`Error fetching image for scholarship ${scholarship.ScholarshipID}`, error);
              }
            }
            return scholarship;
          })
        );

        setScholarships(updatedScholarships);
    
      } catch (error) {
        console.error('Error fetching scholarships', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScholarshipsData();
  }, []);

  useEffect(() => {
    const fetchStudentData = async () => {
      const StudentID = localStorage.getItem('UserID');
      if (StudentID) {
        try {
          const studentResponse = await ApiStudentServices.getStudent(StudentID);
          setStudent(studentResponse.data);
     
        } catch (error) {
          console.error('Error fetching student data', error);
          router.push('/page/login');
        }
      } else {
        console.warn('No StudentID found in localStorage');
      }
    };

    fetchStudentData();
  }, [router]);

  useEffect(() => {
    const fetchAppliedScholarships = async () => {
      try {
        const StudentID = localStorage.getItem('UserID');
        if (StudentID) {
          const [internalApplications, externalApplications] = await Promise.all([
            ApiApplicationServices.showByStudentId(StudentID),
            ApiApplicationExternalServices.showByStudent(StudentID),
          ]);

          const appliedScholarshipIdsInternal = internalApplications.map(
            (application: { ScholarshipID: any }) => application.ScholarshipID
          );
          const appliedScholarshipIdsExternal = externalApplications.map(
            (application: { ScholarshipID: any }) => application.ScholarshipID
          );

          const allAppliedScholarshipIds = [...appliedScholarshipIdsInternal, ...appliedScholarshipIdsExternal];
          setAppliedScholarships(allAppliedScholarshipIds);
        }
      } catch (error) {
        console.error('Error fetching applied scholarships:', error);
        setAppliedScholarships([]);
      }
    };

    fetchAppliedScholarships();
  }, []);

  const getStatus = (startDate?: Date, endDate?: Date): string => {
    const now = new Date();
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (now > start && now < end) {
        return "เปิดรับอยู่";
      }
    }
    return "ปิดรับแล้ว";
  };

  // Pagination function
  const paginate = (array: Scholarship[], pageNumber: number) => {
    const start = (pageNumber - 1) * itemsPerPage;
    return array.slice(start, start + itemsPerPage);
  };

  const totalPages = (length: number) => Math.ceil(length / itemsPerPage);

  const hasApplied = (scholarshipID: number): boolean => appliedScholarships.includes(scholarshipID);

  // Separate scholarships into open and closed
  const openScholarships = scholarships.filter((scholarship) => {
    const now = new Date();
    return now >= new Date(scholarship.StartDate) && now <= new Date(scholarship.EndDate);
  });

  const closedScholarships = scholarships.filter((scholarship) => {
    const now = new Date();
    return now > new Date(scholarship.EndDate) || now < new Date(scholarship.StartDate);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div>
        <p className="ml-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderHome />
      <Header />
      <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6 text-center md:text-left">ทุนการศึกษามาจากภายนอก</h1>
        <main className="flex-1 pl-10">
          {/* Open Scholarships */}
          <h2 className="text-2xl font-semibold mb-6">ทุนการศึกษาที่เปิดรับอยู่</h2>
          <div className="flex flex-wrap justify-start mb-20">
            {paginate(openScholarships, openPage).map((scholarship) => {
              const status = getStatus(scholarship.StartDate, scholarship.EndDate);
              const statusColor = status === "ปิดรับแล้ว" ? "text-red-500" : "text-green-500";

              return (
                <Link key={scholarship.ScholarshipID} href={`/page/scholarships/detail?id=${scholarship.ScholarshipID}`} legacyBehavior>
                  <a className="w-full sm:w-1/2 lg:w-1/4 bg-white p-4 shadow-lg rounded-lg m-2 border border-gray-200">
                    <img
                      src={scholarship.ImagePath}
                      alt={scholarship.ScholarshipName}
                      className="w-full h-80 object-cover rounded-lg"
                    />
                    <h3 className="text-xl font-bold mt-2">{scholarship.ScholarshipName}</h3>
                    <p className="text-sm text-gray-600 mt-1">ปีการศึกษา {scholarship.Year}</p>
                    <p className="text-gray-600">{scholarship.Description}</p>
                    {hasApplied(scholarship.ScholarshipID) ? (
                      <p className="text-green-500 font-semibold">ท่านได้สมัครทุนนี้แล้ว</p>
                    ) : (
                      <p className={`text-sm ${statusColor}`}>{status}</p>
                    )}
                  </a>
                </Link>
              );
            })}
          </div>
          {/* Pagination for Open Scholarships */}
          <div className="flex justify-center">
            <button
              onClick={() => setOpenPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 bg-gray-300 rounded-lg"
              disabled={openPage === 1}
            >
              ก่อนหน้า
            </button>
            <span className="px-4 py-2">{openPage} of {totalPages(openScholarships.length)}</span>
            <button
              onClick={() => setOpenPage((prev) => Math.min(prev + 1, totalPages(openScholarships.length)))}
              className="px-4 py-2 bg-gray-300 rounded-lg"
              disabled={openPage === totalPages(openScholarships.length)}
            >
              ถัดไป
            </button>
          </div>

          {/* Closed Scholarships */}
          <h2 className="text-2xl font-semibold mb-6">ทุนการศึกษาที่ปิดรับแล้ว</h2>
          <div className="flex flex-wrap justify-start mb-20">
            {paginate(closedScholarships, closedPage).map((scholarship) => {
              const status = getStatus(scholarship.StartDate, scholarship.EndDate);
              const statusColor = status === "ปิดรับแล้ว" ? "text-red-500" : "text-green-500";

              return (
                <Link key={scholarship.ScholarshipID} href={`/page/scholarships/detail?id=${scholarship.ScholarshipID}`} legacyBehavior>
                  <a className="w-full sm:w-1/2 lg:w-1/4 bg-white p-4 shadow-lg rounded-lg m-2 border border-gray-200">
                    <img
                      src={scholarship.ImagePath}
                      alt={scholarship.ScholarshipName}
                      className="w-full h-80 object-cover rounded-lg"
                    />
                    <h3 className="text-xl font-bold mt-2">{scholarship.ScholarshipName}</h3>
                    <p className="text-sm text-gray-600 mt-1">ปีการศึกษา {scholarship.Year}</p>
                    <p className="text-gray-600">{scholarship.Description}</p>
                    {hasApplied(scholarship.ScholarshipID) ? (
                      <p className="text-green-500 font-semibold">ท่านได้สมัครทุนนี้แล้ว</p>
                    ) : (
                      <p className={`text-sm ${statusColor}`}>{status}</p>
                    )}
                  </a>
                </Link>
              );
            })}
          </div>
          {/* Pagination for Closed Scholarships */}
          <div className="flex justify-center">
            <button
              onClick={() => setClosedPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 bg-gray-300 rounded-lg"
              disabled={closedPage === 1}
            >
              ก่อนหน้า
            </button>
            <span className="px-4 py-2">{closedPage} of {totalPages(closedScholarships.length)}</span>
            <button
              onClick={() => setClosedPage((prev) => Math.min(prev + 1, totalPages(closedScholarships.length)))}
              className="px-4 py-2 bg-gray-300 rounded-lg"
              disabled={closedPage === totalPages(closedScholarships.length)}
            >
              ถัดไป
            </button>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
