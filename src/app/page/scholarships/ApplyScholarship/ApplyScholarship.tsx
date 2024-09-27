"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/header/Header';
import Footer from '@/app/components/footer/footer';
import HeaderHome from '@/app/components/headerHome/headerHome';
import ApiServiceScholarships from '@/app/services/scholarships/ApiScholarShips';
import ApiScholarshipsAllImage from '@/app/services/scholarships/ApiScholarshipsImage';
import ApiStudentServices from '@/app/services/students/ApiStudent';
import ApiApplicationServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationInternalServices';
import ApiApplicationExternalServices from '@/app/services/ApiApplicationExternalServices/ApiApplicationExternalServices';
import styles from './ApplyScholarships.module.css'; // Import styles

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
}

export default function ApplyScholarShipsPage() {
  const router = useRouter();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [recommendedScholarships, setRecommendedScholarships] = useState<Scholarship[]>([]);
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>([]);
  const [appliedScholarships, setAppliedScholarships] = useState<number[]>([]); // New: Track applied scholarships
  const [loading, setLoading] = useState(true); // Ensure loading state is properly managed
  const scrollRef = useRef<HTMLDivElement>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [openScholarships, setOpenScholarships] = useState<Scholarship[]>([]);
  const [closedScholarships, setClosedScholarships] = useState<Scholarship[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  // Fetch all scholarships and student applications
  useEffect(() => {
    const fetchScholarshipsData = async () => {
      try {
        const scholarshipsResponse = await ApiServiceScholarships.getAllScholarships();
        const scholarshipsData = scholarshipsResponse.data;

        const updatedScholarships = await Promise.all(
          scholarshipsData.map(async (scholarship: Scholarship) => {
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


        const now = new Date();

        // Separate open and closed scholarships
        const openScholarships = updatedScholarships.filter(scholarship => {
          const start = new Date(scholarship.StartDate);
          const end = new Date(scholarship.EndDate);
          return now > start && now < end;
        });

        const closedScholarships = updatedScholarships.filter(scholarship => {
          const start = new Date(scholarship.StartDate);
          const end = new Date(scholarship.EndDate);
          return now < start || now > end;
        });

        setScholarships(updatedScholarships);
        setOpenScholarships(openScholarships);
        setClosedScholarships(closedScholarships);
        setRecommendedScholarships(updatedScholarships.slice(0, 1)); // Recommend the first scholarship
        setAllScholarships(updatedScholarships); // Initialize all scholarships
      } catch (error) {
        console.error('Error fetching scholarships', error);
      } finally {
        setLoading(false); // Ensure loading is turned off after fetching
      }
    };

    const fetchAppliedScholarships = async () => {
      try {
        const StudentID = localStorage.getItem('UserID');
        if (StudentID) {
          const [internalApplications, externalApplications] = await Promise.all([
            ApiApplicationServices.showByStudentId(StudentID),  // API สำหรับภายใน
            ApiApplicationExternalServices.showByStudent(StudentID)  // API สำหรับภายนอก
          ]);

          const appliedScholarshipIdsInternal = internalApplications.map((application: { ScholarshipID: any; }) => application.ScholarshipID);
          const appliedScholarshipIdsExternal = externalApplications.map((application: { ScholarshipID: any; }) => application.ScholarshipID);

          const allAppliedScholarshipIds = [...appliedScholarshipIdsInternal, ...appliedScholarshipIdsExternal];
          setAppliedScholarships(allAppliedScholarshipIds);
        } else {
          console.warn('No StudentID found in localStorage');
        }
      } catch (error) {
        console.error('Error fetching applied scholarships:', error);
        setAppliedScholarships([]);
      }
    };

    fetchScholarshipsData();
    fetchAppliedScholarships();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fetch student data by ID and set student state
  useEffect(() => {
    const fetchStudentData = async () => {
      const StudentID = localStorage.getItem('UserID'); // Get the student ID from localStorage

      if (StudentID) {
        try {
          const studentResponse = await ApiStudentServices.getStudent(StudentID);
          setStudent(studentResponse.data); // Set student data into state
          console.log('Student data:', studentResponse.data);
        } catch (error) {
          console.error('Error fetching student data', error);
          router.push('/page/login'); // Redirect to login if fetching student data fails
        }
      } else {
        console.warn('No StudentID found in localStorage');
      }
    };

    fetchStudentData();
  }, [router]);

  const hasApplied = (scholarshipID: number) => {
    return appliedScholarships.includes(scholarshipID);
  };

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
      <div className={isScrolled ? styles.scrolledHeader : ''}>
        <Header />
      </div>
      <div className="container mx-auto px-4 py-8">
        <main className="flex-1">
          {localStorage.getItem('UserID') && recommendedScholarships.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">แนะนำทุนการศึกษา</h2>
              <div className="" ref={scrollRef}>
                <div className="flex flex-wrap justify-start">
                  {recommendedScholarships.map((scholarship) => (
                    <Link key={scholarship.ScholarshipID} href={`/page/scholarships/detail?id=${scholarship.ScholarshipID}`} legacyBehavior>
                      <a className="w-full sm:w-1/2 lg:w-1/4 bg-white p-4 shadow-lg rounded-lg m-2 border border-gray-200">
                        <img src={scholarship.ImagePath} alt={scholarship.ScholarshipName} className="w-full h-80 object-cover rounded-lg" />
                        <h3 className="text-xl font-bold mt-2">{scholarship.ScholarshipName}</h3>
                        <p className="text-gray-600">{scholarship.Description}</p>
                        <p className="text-gray-500 text-sm">เริ่ม {scholarship.StartDate ? new Date(scholarship.StartDate).toLocaleDateString() : 'N/A'}</p>
                        <p className="text-gray-500 text-sm">สิ้นสุด {scholarship.EndDate ? new Date(scholarship.EndDate).toLocaleDateString() : 'N/A'}</p>
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}


          <main className="flex-1">
            {openScholarships.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">ทุนการศึกษาที่เปิดรับอยู่</h2>
                <div className="flex flex-wrap justify-start">
                  {openScholarships.map((scholarship) => (
                    <Link key={scholarship.ScholarshipID} href={`/page/scholarships/detail?id=${scholarship.ScholarshipID}`} legacyBehavior>
                      <a className="w-full sm:w-1/2 lg:w-1/4 bg-white p-4 shadow-lg rounded-lg m-2 border border-gray-200">
                        <img src={scholarship.ImagePath} alt={scholarship.ScholarshipName} className="w-full h-80 object-cover rounded-lg" />
                        <h3 className="text-xl font-bold mt-2">{scholarship.ScholarshipName}</h3>
                        <p className="text-gray-600">{scholarship.Description}</p>
                        <p className="text-gray-500 text-sm">โพสเมื่อ {scholarship.StartDate ? new Date(scholarship.StartDate).toLocaleDateString() : 'N/A'}</p>
                        <p className="text-gray-500 text-sm">{getStatus(scholarship.StartDate, scholarship.EndDate)}</p>

                        {hasApplied(scholarship.ScholarshipID) ? (
                          <p className="text-green-500 font-semibold">สมัครแล้ว</p>
                        ) : ""}
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {closedScholarships.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">ทุนการศึกษาที่ปิดรับแล้ว</h2>
                <div className="flex flex-wrap justify-start">
                  {closedScholarships.map((scholarship) => (
                    <Link key={scholarship.ScholarshipID} href={`/page/scholarships/detail?id=${scholarship.ScholarshipID}`} legacyBehavior>
                      <a className="w-full sm:w-1/2 lg:w-1/4 bg-white p-4 shadow-lg rounded-lg m-2 border border-gray-200">
                        <img src={scholarship.ImagePath} alt={scholarship.ScholarshipName} className="w-full h-80 object-cover rounded-lg" />
                        <h3 className="text-xl font-bold mt-2">{scholarship.ScholarshipName}</h3>
                        <p className="text-gray-600">{scholarship.Description}</p>
                        <p className="text-gray-500 text-sm">โพสเมื่อ {scholarship.StartDate ? new Date(scholarship.StartDate).toLocaleDateString() : 'N/A'}</p>
                        <p className="text-gray-500 text-sm">{getStatus(scholarship.StartDate, scholarship.EndDate)}</p>

                        {hasApplied(scholarship.ScholarshipID) ? (
                          <p className="text-green-500 font-semibold">สมัครแล้ว</p>
                        ) : ""}
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <h2 className="text-2xl font-semibold mb-6">ทุนการศึกษาทั้งหมด</h2>
            <div className="flex flex-wrap justify-start">
              {allScholarships.map((scholarship) => (
                <Link key={scholarship.ScholarshipID} href={`/page/scholarships/detail?id=${scholarship.ScholarshipID}`} legacyBehavior>
                  <a className="w-full sm:w-1/2 lg:w-1/4 bg-white p-4 shadow-lg rounded-lg m-2 border border-gray-200">
                    <img src={scholarship.ImagePath} alt={scholarship.ScholarshipName} className="w-full h-80 object-cover rounded-lg" />
                    <h3 className="text-xl font-bold mt-2">{scholarship.ScholarshipName}</h3>
                    <p className="text-gray-600">{scholarship.Description}</p>
                    <p className="text-gray-500 text-sm">โพสเมื่อ {scholarship.StartDate ? new Date(scholarship.StartDate).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-gray-500 text-sm">{getStatus(scholarship.StartDate, scholarship.EndDate)}</p>

                    {hasApplied(scholarship.ScholarshipID) ? (
                      <p className="text-green-500 font-semibold">สมัครแล้ว</p>
                    ) : (
                      ""
                    )}
                  </a>
                </Link>
              ))}
            </div>

          </main>
        </main>
      </div>
      <Footer />
    </div>
  );
}
