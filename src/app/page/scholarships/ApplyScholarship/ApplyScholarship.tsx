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
  YearLevel: string; // Add this line for YearLevel
  Year: string
}

export default function ApplyScholarShipsPage() {
  const router = useRouter();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [recommendedScholarships, setRecommendedScholarships] = useState<Scholarship[]>([]);
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>([]);
  const [appliedScholarships, setAppliedScholarships] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [openScholarships, setOpenScholarships] = useState<Scholarship[]>([]);
  const [closedScholarships, setClosedScholarships] = useState<Scholarship[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
   // Pagination states for each category

  const itemsPerPage = 5; // Number of scholarships per page
   // Pagination states for each category
   const [recommendedPage, setRecommendedPage] = useState(1);
   const [openPage, setOpenPage] = useState(1);
   const [closedPage, setClosedPage] = useState(1);
   const [allPage, setAllPage] = useState(1);

  // Fetch all scholarships and student applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all scholarships
        const scholarshipsResponse = await ApiServiceScholarships.getAllScholarships();
        const scholarshipsData = scholarshipsResponse.data;
        console.log('Scholarships Data:', scholarshipsData);

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
        const openScholarships = updatedScholarships.filter(scholarship => {
          const start = new Date(scholarship.StartDate);
          const end = new Date(scholarship.EndDate);
          return now >= start && now < end;
        });

        const closedScholarships = updatedScholarships.filter(scholarship => {
          const start = new Date(scholarship.StartDate);
          const end = new Date(scholarship.EndDate);
          return  now > end;
        });

        setScholarships(updatedScholarships);
        setOpenScholarships(openScholarships);
        setClosedScholarships(closedScholarships);
        setAllScholarships(updatedScholarships);

        // Fetch student data
        const StudentID = localStorage.getItem('UserID');
        if (StudentID) {
          const studentResponse = await ApiStudentServices.getStudent(StudentID);
          setStudent(studentResponse.data);
          console.log('Student Data:', studentResponse.data);

          // Calculate and set the recommended scholarships based on the student's GPA and Course
          recommendScholarships(studentResponse.data.GPA, studentResponse.data.Course, studentResponse.data.Year_Entry);
        } else {
          // console.warn('No StudentID found in localStorage');
          // router.push('/page/login');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]); // Dependencies: only run on initial load

  // Separate useEffect for recommending scholarships
  // Function to calculate the academic year
  const calculateAcademicYear = (yearEntry: number | null) => {
    if (yearEntry === null) return 'N/A';
    const currentYear = new Date().getFullYear();
    const entryYear = yearEntry - 543; // Convert from Thai year to Gregorian year
    const yearDifference = currentYear - entryYear;

    if (yearDifference === 0) return 'ปี 1';
    if (yearDifference === 1) return 'ปี 2';
    if (yearDifference === 2) return 'ปี 3';
    if (yearDifference === 3) return 'ปี 4';
    if (yearDifference === 4) return 'ปี 5';

    return 'จบการศึกษาแล้ว'; // For years more than 4
  };

  // UseEffect to calculate and recommend scholarships
  useEffect(() => {
    if (student && scholarships.length > 0) {
      recommendScholarships(student.GPA, student.Course, student.Year_Entry);
    }
  }, [student, scholarships]);


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

  const validCourses = [
    "คณิตศาสตร์และการจัดการข้อมูล",
    "วิทยาการคอมพิวเตอร์และสารสนเทศ",
    "วิทยาศาสตร์สิ่งแวดล้อม",
    "เคมี",
    "วิทยาศาสตร์การประมงและทรัพยากรทางน้ำ",
    "ชีววิทยาศาสตร์",
    "ฟิสิกส์วัสดุและนาโนเทคโนโลยี"
  ];

  const recommendScholarships = (studentGPA: number, studentCourse: string, yearEntry: number | null) => {
    const now = new Date(); // Current date

    // Calculate the academic year
    const academicYear = calculateAcademicYear(yearEntry);

    const recommended = scholarships.filter(scholarship => {
      let isGPAValid = scholarship.Minimum_GPA <= studentGPA;
      let isCourseValid = scholarship.courses.some(course => validCourses.includes(course.CourseName));
      let isEndDateValid = new Date(scholarship.EndDate) > now; // Check if EndDate is still valid

      // Define how year level options map to valid academic years
      let validYears: string[] = []; // Explicitly declare type as string[]
      switch (scholarship.YearLevel) {
        case '1':
          validYears = ['ปี 1'];
          break;
        case '2':
          validYears = ['ปี 2'];
          break;
        case '3':
          validYears = ['ปี 3'];
          break;
        case '4':
          validYears = ['ปี 4'];
          break;
        case '1-4':
          validYears = ['ปี 1', 'ปี 2', 'ปี 3', 'ปี 4'];
          break;
        case '2-4':
          validYears = ['ปี 2', 'ปี 3', 'ปี 4'];
          break;
        case '3-4':
          validYears = ['ปี 3', 'ปี 4'];
          break;
        default:
          validYears = []; // No valid years defined
      }

      // Check if the student's academic year is in the list of valid years
      let isYearLevelValid = validYears.includes(academicYear);

      if (isGPAValid && isCourseValid && isEndDateValid && isYearLevelValid) {
        console.log(`Scholarship ${scholarship.ScholarshipName} matches GPA, Course, is within the valid application period, and applies to academic year ${academicYear}.`);
      }

      // Return true only if all conditions are valid
      return isGPAValid && isCourseValid && isEndDateValid && isYearLevelValid;
    });

    setRecommendedScholarships(recommended);
    console.log('Recommended Scholarships:', recommended);
  };





  const hasApplied = (scholarshipID: number) => {
    return appliedScholarships.includes(scholarshipID);
  };

const getStatus = (startDate?: Date, endDate?: Date): string => {
  const now = new Date();
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start < end) {
      return "เปิดรับอยู่";  // Handle case where start date is greater than end date
    }
  
    // If today's date is the same as `endDate`, return "ปิดรับแล้ว"
    if (now.toDateString() === end.toDateString()) {
      return "เปิดรับอยู่";  // Close if it's the last day (same as end date)
    }


    return "ปิดรับแล้ว";  // If it's past the end date or outside the range, show closed
  }
  return "ไม่มีข้อมูล";  // If no dates are provided
};

  

  // Pagination function
  const paginate = (array: Scholarship[], pageNumber: number) => {
    const start = (pageNumber - 1) * itemsPerPage;
    return array.slice(start, start + itemsPerPage);
  };

  const totalPages = (length: number) => Math.ceil(length / itemsPerPage);

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
      <div className="container mx-auto px-4 py-8 pl-40">
        <main className="flex-1">
          
        {recommendedScholarships.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">แนะนำทุนการศึกษา</h2>
              <div className="flex flex-wrap justify-start">
                {paginate(recommendedScholarships, recommendedPage).map((scholarship) => (
                  <Link key={scholarship.ScholarshipID} href={`/page/scholarships/detail?id=${scholarship.ScholarshipID}`} legacyBehavior>
                    <a className="w-full sm:w-1/2 lg:w-1/4 bg-white p-4 shadow-lg rounded-lg m-2 border border-gray-200">
                      <img src={scholarship.ImagePath} alt={scholarship.ScholarshipName} className="w-full h-80 object-cover rounded-lg" />
                      <h3 className="text-xl font-bold mt-2">{scholarship.ScholarshipName}</h3>
                      <p className="text-sm text-gray-600 mt-1">ปีการศึกษา {scholarship.Year}</p> {/* Smaller text */}
                    <p className="text-gray-600">{scholarship.Description}</p>
                    <p className="text-gray-500 text-sm">โพสเมื่อ {scholarship.StartDate ? new Date(scholarship.StartDate).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-gray-500 text-sm">{getStatus(scholarship.StartDate, scholarship.EndDate)}</p>

                    {hasApplied(scholarship.ScholarshipID) ? (
                      <p className="text-green-500 font-semibold">ท่านได้สมัครทุนนี้แล้ว</p>
                    ) : (
                      ""
                    )}
                    </a>
                  </Link>
                ))}
              </div>
              {/* Pagination for Recommended Scholarships */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setRecommendedPage((prev) => Math.max(prev - 1, 1))}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                  disabled={recommendedPage === 1}
                >
                  Previous
                </button>
                <span className="px-4 py-2">{recommendedPage} of {totalPages(recommendedScholarships.length)}</span>
                <button
                  onClick={() => setRecommendedPage((prev) => Math.min(prev + 1, totalPages(recommendedScholarships.length)))}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                  disabled={recommendedPage === totalPages(recommendedScholarships.length)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          <main className="flex-1">
          {openScholarships.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">ทุนการศึกษาที่เปิดรับอยู่</h2>
              <div className="flex flex-wrap justify-start">
                {paginate(openScholarships, openPage).map((scholarship) => (
                  <Link key={scholarship.ScholarshipID} href={`/page/scholarships/detail?id=${scholarship.ScholarshipID}`} legacyBehavior>
                    <a className="w-full sm:w-1/2 lg:w-1/4 bg-white p-4 shadow-lg rounded-lg m-2 border border-gray-200">
                      <img src={scholarship.ImagePath} alt={scholarship.ScholarshipName} className="w-full h-80 object-cover rounded-lg" />
                      <h3 className="text-xl font-bold mt-2">{scholarship.ScholarshipName}</h3>
                      <p className="text-sm text-gray-600 mt-1">ปีการศึกษา {scholarship.Year}</p> {/* Smaller text */}
                    <p className="text-gray-600">{scholarship.Description}</p>
                    <p className="text-gray-500 text-sm">โพสเมื่อ {scholarship.StartDate ? new Date(scholarship.StartDate).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-gray-500 text-sm">{getStatus(scholarship.StartDate, scholarship.EndDate)}</p>

                    {hasApplied(scholarship.ScholarshipID) ? (
                      <p className="text-green-500 font-semibold">ท่านได้สมัครทุนนี้แล้ว</p>
                    ) : (
                      ""
                    )}
                    </a>
                  </Link>
                ))}
              </div>
              {/* Pagination for Open Scholarships */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setOpenPage((prev) => Math.max(prev - 1, 1))}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                  disabled={openPage === 1}
                >
                  Previous
                </button>
                <span className="px-4 py-2">{openPage} of {totalPages(openScholarships.length)}</span>
                <button
                  onClick={() => setOpenPage((prev) => Math.min(prev + 1, totalPages(openScholarships.length)))}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                  disabled={openPage === totalPages(openScholarships.length)}
                >
                  Next
                </button>
              </div>
            </div>
          )}

       {/* Closed Scholarships */}
       {closedScholarships.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">ทุนการศึกษาที่ปิดรับแล้ว</h2>
              <div className="flex flex-wrap justify-start">
                {paginate(closedScholarships, closedPage).map((scholarship) => (
                  <Link key={scholarship.ScholarshipID} href={`/page/scholarships/detail?id=${scholarship.ScholarshipID}`} legacyBehavior>
                    <a className="w-full sm:w-1/2 lg:w-1/4 bg-white p-4 shadow-lg rounded-lg m-2 border border-gray-200">
                      <img src={scholarship.ImagePath} alt={scholarship.ScholarshipName} className="w-full h-80 object-cover rounded-lg" />
                      <h3 className="text-xl font-bold mt-2">{scholarship.ScholarshipName}</h3>
                      <p className="text-sm text-gray-600 mt-1">ปีการศึกษา {scholarship.Year}</p> {/* Smaller text */}
                    <p className="text-gray-600">{scholarship.Description}</p>
                    <p className="text-gray-500 text-sm">โพสเมื่อ {scholarship.StartDate ? new Date(scholarship.StartDate).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-gray-500 text-sm">{getStatus(scholarship.StartDate, scholarship.EndDate)}</p>

                    {hasApplied(scholarship.ScholarshipID) ? (
                      <p className="text-green-500 font-semibold">ท่านได้สมัครทุนนี้แล้ว</p>
                    ) : (
                      ""
                    )}
                    </a>
                  </Link>
                ))}
              </div>
              {/* Pagination for Closed Scholarships */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setClosedPage((prev) => Math.max(prev - 1, 1))}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                  disabled={closedPage === 1}
                >
                  Previous
                </button>
                <span className="px-4 py-2">{closedPage} of {totalPages(closedScholarships.length)}</span>
                <button
                  onClick={() => setClosedPage((prev) => Math.min(prev + 1, totalPages(closedScholarships.length)))}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                  disabled={closedPage === totalPages(closedScholarships.length)}
                >
                  Next
                </button>
              </div>
            </div>
          )}

             {/* All Scholarships */}
          {allScholarships.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">ทุนการศึกษาทั้งหมด</h2>
              <div className="flex flex-wrap justify-start">
                {paginate(allScholarships, allPage).map((scholarship) => (
                  <Link key={scholarship.ScholarshipID} href={`/page/scholarships/detail?id=${scholarship.ScholarshipID}`} legacyBehavior>
                    <a className="w-full sm:w-1/2 lg:w-1/4 bg-white p-4 shadow-lg rounded-lg m-2 border border-gray-200">
                      <img src={scholarship.ImagePath} alt={scholarship.ScholarshipName} className="w-full h-80 object-cover rounded-lg" />
                      <h3 className="text-xl font-bold mt-2">{scholarship.ScholarshipName}</h3>
                      <p className="text-sm text-gray-600 mt-1">ปีการศึกษา {scholarship.Year}</p> {/* Smaller text */}
                    <p className="text-gray-600">{scholarship.Description}</p>
                    <p className="text-gray-500 text-sm">โพสเมื่อ {scholarship.StartDate ? new Date(scholarship.StartDate).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-gray-500 text-sm">{getStatus(scholarship.StartDate, scholarship.EndDate)}</p>

                    {hasApplied(scholarship.ScholarshipID) ? (
                      <p className="text-green-500 font-semibold">ท่านได้สมัครทุนนี้แล้ว</p>
                    ) : (
                      ""
                    )}
                    </a>
                  </Link>
                ))}
              </div>
              {/* Pagination for All Scholarships */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setAllPage((prev) => Math.max(prev - 1, 1))}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                  disabled={allPage === 1}
                >
                  Previous
                </button>
                <span className="px-4 py-2">{allPage} of {totalPages(allScholarships.length)}</span>
                <button
                  onClick={() => setAllPage((prev) => Math.min(prev + 1, totalPages(allScholarships.length)))}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                  disabled={allPage === totalPages(allScholarships.length)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          </main>
        </main>
      </div>
      <Footer />
    </div>
  );
}
