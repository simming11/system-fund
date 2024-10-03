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
import Swal from 'sweetalert2';



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
  status:string
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

  const itemsPerPage = 3; // Number of scholarships per page
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
        console.log(scholarshipsData);
    
         // Filter out scholarships with 'draft' status first
      const filteredScholarships = scholarshipsData.filter((scholarship: Scholarship) => scholarship.status !== "draft");
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
  
        // Filter scholarships that are "open" and not "draft"
        const openScholarships = updatedScholarships.filter(scholarship => {
          const start = new Date(scholarship.StartDate);
          const end = new Date(scholarship.EndDate);
  
          return (
            ((now >= start && now <= end) || now.toDateString() === start.toDateString() || now.toDateString() === end.toDateString()) &&
           
            scholarship.status !== "draft" // Exclude drafts
          );
        });
  
        // Filter scholarships that are "closed" and not "draft"
        const closedScholarships = updatedScholarships.filter(scholarship => {
          const start = new Date(scholarship.StartDate);
          const end = new Date(scholarship.EndDate);
  
          return (
            ((now > end || now < start) && now.toDateString() !== end.toDateString() && now.toDateString() !== start.toDateString()) &&
         
            scholarship.status !== "draft" // Exclude drafts
          );
        });
  
        // Update state for all scholarships
        setScholarships(updatedScholarships);
        setOpenScholarships(openScholarships);
        setClosedScholarships(closedScholarships);
        setAllScholarships(updatedScholarships);
  
        // Fetch student data
        const StudentID = localStorage.getItem('UserID');
        let appliedScholarshipsData: number[] = []; // Store applied scholarship IDs
        if (StudentID) {
          const studentResponse = await ApiStudentServices.getStudent(StudentID);
          setStudent(studentResponse.data);
  
          // Calculate and set the recommended scholarships based on the student's GPA and Course
          recommendScholarships(studentResponse.data.GPA, studentResponse.data.Course, studentResponse.data.Year_Entry);
  
          // Fetch internal and external applications
          const internalApplications = await ApiApplicationServices.showByStudentId(StudentID);
          const externalApplications = await ApiApplicationExternalServices.showByStudent(StudentID);
  
          // Combine internal and external applications to collect applied scholarship IDs
          appliedScholarshipsData = [
            ...internalApplications.map((app: any) => app.ScholarshipID),
            ...externalApplications.map((app: any) => app.ScholarshipID),
          ];
  
          // Set applied scholarships state
          setAppliedScholarships(appliedScholarshipsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [router]);
  

  // Dependencies: only run on initial load
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
    "ฟิสิกส์วัสดุและนาโนเทคโนโลยี",
    "วิทยาศาสตร์การประมงและทรัพยากรทางน้ำ"
  ];

  const recommendScholarships = (studentGPA: number, studentCourse: string, yearEntry: number | null) => {
    const now = new Date(); // Current date

    // Calculate the academic year
    const academicYear = calculateAcademicYear(yearEntry);

    const recommended = scholarships.filter(scholarship => {
      let isGPAValid = scholarship.Minimum_GPA <= studentGPA;
      let isCourseValid = scholarship.courses.some(course => validCourses.includes(course.CourseName));

      // ปรับเงื่อนไขให้รวมวันที่ปัจจุบันตรงกับ `endDate`
      let isEndDateValid = new Date(scholarship.EndDate) >= now || now.toDateString() === new Date(scholarship.EndDate).toDateString();

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

      }

      // Return true only if all conditions are valid
      return isGPAValid && isCourseValid && isEndDateValid && isYearLevelValid;
    });

    setRecommendedScholarships(recommended);

  };



  useEffect(() => {
    const savedRecommendedPage = sessionStorage.getItem('recommendedPage');
    const savedOpenPage = sessionStorage.getItem('openPage');
    const savedClosedPage = sessionStorage.getItem('closedPage');
    const savedAllPage = sessionStorage.getItem('allPage');

    if (savedRecommendedPage) setRecommendedPage(Number(savedRecommendedPage));
    if (savedOpenPage) setOpenPage(Number(savedOpenPage));
    if (savedClosedPage) setClosedPage(Number(savedClosedPage));
    if (savedAllPage) setAllPage(Number(savedAllPage));
  }, []);

  // Save page numbers to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('recommendedPage', recommendedPage.toString());
  }, [recommendedPage]);

  useEffect(() => {
    sessionStorage.setItem('openPage', openPage.toString());
  }, [openPage]);

  useEffect(() => {
    sessionStorage.setItem('closedPage', closedPage.toString());
  }, [closedPage]);

  useEffect(() => {
    sessionStorage.setItem('allPage', allPage.toString());
  }, [allPage]);


  const hasApplied = (scholarshipID: number) => {
    return appliedScholarships.includes(scholarshipID);
  };

  const getStatus = (startDate?: Date, endDate?: Date): string => {
    const now = new Date();
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // ถ้าวันปัจจุบันตรงกับ `startDate` ให้ถือว่า "เปิดรับอยู่"
      if (now.toDateString() === start.toDateString()) {
        return "เปิดรับอยู่";
      }

      // ถ้าวันปัจจุบันตรงกับ `endDate` ให้ถือว่า "เปิดรับอยู่"
      if (now.toDateString() === end.toDateString()) {
        return "เปิดรับอยู่";
      }

      // ถ้าวันปัจจุบันอยู่ระหว่าง `startDate` และ `endDate`
      if (now >= start && now < end) {
        return "เปิดรับอยู่";
      }

      // ถ้าวันปัจจุบันเกิน `endDate` หรืออยู่นอกช่วง
      if (now > end || now < start) {
        return "ปิดรับแล้ว";
      }
    }
    return "ไม่มีข้อมูล"; // กรณีไม่มีข้อมูลวันที่
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
      <div className={styles['page-container']}>
      <HeaderHome />
      <div className={isScrolled ? styles.scrolledHeader : ''}>
        <Header />
      </div>
      <div className={`${styles['main-content']} container mx-auto px-4 py-8 lg:pl-40`}>
        <main className="flex-1">
          {/* Check if there are recommended scholarships */}
          {recommendedScholarships.length > 0 ? (
            <div>
              <h2 className="text-2xl font-semibold mb-6">แนะนำทุนการศึกษา</h2>
              <div className="flex flex-wrap justify-start">
                {paginate(recommendedScholarships, recommendedPage).map((scholarship) => {
                  const status = getStatus(scholarship.StartDate, scholarship.EndDate);
                  const statusColor =
                    status === "ปิดรับแล้ว"
                      ? "text-red-500"
                      : status === "เปิดรับอยู่"
                        ? "text-green-500"
                        : "text-gray-500";

                  return (
                    <Link
                      key={scholarship.ScholarshipID}
                      href={`/page/scholarships/detail?id=${scholarship.ScholarshipID}`}
                      legacyBehavior
                    >
                     <a
  className="w-full sm:w-1/2 lg:w-1/4 bg-white p-4 shadow-lg rounded-lg m-2 border border-gray-200 flex flex-col"
  style={{ minWidth: '400px' }} // Set a minimum width to avoid shrinking
>
  <img
    src={scholarship.ImagePath}
    alt={scholarship.ScholarshipName}
    className="w-full h-80 object-cover rounded-lg"
  />
  <h3 className="text-xl font-bold mt-2">
    {scholarship.ScholarshipName}
  </h3>
  <p className="text-sm text-gray-600 mt-1">
    ปีการศึกษา {scholarship.Year}
  </p>
  <p className="text-gray-600">{scholarship.Description}</p>
  <p className="text-gray-500 text-sm">
    โพสเมื่อ{" "}
    {scholarship.StartDate
      ? new Date(scholarship.StartDate).toLocaleDateString()
      : "N/A"}
  </p>
  {hasApplied(scholarship.ScholarshipID) ? (
    <p className="text-green-500 font-semibold">
      ท่านได้สมัครทุนนี้แล้ว
    </p>
  ) : (
    <p className={`text-sm ${statusColor}`}>{status}</p>
  )}
</a>

                    </Link>
                  );
                })}
              </div>
              {/* Pagination for Recommended Scholarships */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setRecommendedPage((prev) => Math.max(prev - 1, 1))}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                  disabled={recommendedPage === 1}
                >
                  ก่อนหน้า
                </button>
                <span className="px-4 py-2">
                  {recommendedPage} of {totalPages(recommendedScholarships.length)}
                </span>
                <button
                  onClick={() =>
                    setRecommendedPage((prev) =>
                      Math.min(prev + 1, totalPages(recommendedScholarships.length))
                    )
                  }
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                  disabled={recommendedPage === totalPages(recommendedScholarships.length)}
                >
                  ถัดไป
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* If there are no recommended scholarships, show the other sections */}
              {openScholarships.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-10">ทุนการศึกษาที่เปิดรับอยู่</h2>
                  <div className="flex flex-wrap justify-start">
                    {paginate(openScholarships, openPage).map((scholarship) => {
                      const status = getStatus(scholarship.StartDate, scholarship.EndDate);
                      const statusColor =
                        status === "ปิดรับแล้ว"
                          ? "text-red-500"
                          : status === "เปิดรับอยู่"
                            ? "text-green-500"
                            : "text-gray-500";

                      return (
                        <Link
                          key={scholarship.ScholarshipID}
                          href={`/page/scholarships/detail?id=${scholarship.ScholarshipID}`}
                          legacyBehavior
                        >
                          <a className="w-full sm:w-1/2 lg:w-1/4 bg-white p-4 shadow-lg rounded-lg m-2 border border-gray-200">
                            <img
                              src={scholarship.ImagePath}
                              alt={scholarship.ScholarshipName}
                              className="w-full h-80 object-cover rounded-lg"
                            />
                            <h3 className="text-xl font-bold mt-2">
                              {scholarship.ScholarshipName}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              ปีการศึกษา {scholarship.Year}
                            </p>
                            <p className="text-gray-600">{scholarship.Description}</p>
                            <p className="text-gray-500 text-sm">
                              โพสเมื่อ{" "}
                              {scholarship.StartDate
                                ? new Date(scholarship.StartDate).toLocaleDateString()
                                : "N/A"}
                            </p>
                            {hasApplied(scholarship.ScholarshipID) ? (
                              <p className="text-green-500 font-semibold">
                                ท่านได้สมัครทุนนี้แล้ว
                              </p>
                            ) : (
                              <p className={`text-sm ${statusColor}`}>{status}</p>
                            )}
                          </a>
                        </Link>
                      );
                    })}
                  </div>
                  {/* Pagination for Open Scholarships */}
                  <div className="mt-4 flex justify-center">
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
                </div>
              )}

              {closedScholarships.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-10">ทุนการศึกษาที่ปิดรับแล้ว</h2>
                  <div className="flex flex-wrap justify-start">
                    {paginate(closedScholarships, closedPage).map((scholarship) => {
                      const status = getStatus(scholarship.StartDate, scholarship.EndDate);
                      const statusColor =
                        status === "ปิดรับแล้ว"
                          ? "text-red-500"
                          : status === "เปิดรับอยู่"
                            ? "text-green-500"
                            : "text-gray-500";

                      return (
                        <Link
                          key={scholarship.ScholarshipID}
                          href={`/page/scholarships/detail?id=${scholarship.ScholarshipID}`}
                          legacyBehavior
                        >
                          <a className="w-full sm:w-1/2 lg:w-1/4 bg-white p-4 shadow-lg rounded-lg m-2 border border-gray-200">
                            <img
                              src={scholarship.ImagePath}
                              alt={scholarship.ScholarshipName}
                              className="w-full h-80 object-cover rounded-lg"
                            />
                            <h3 className="text-xl font-bold mt-2">
                              {scholarship.ScholarshipName}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              ปีการศึกษา {scholarship.Year}
                            </p>
                            <p className="text-gray-600">{scholarship.Description}</p>
                            <p className="text-gray-500 text-sm">
                              โพสเมื่อ{" "}
                              {scholarship.StartDate
                                ? new Date(scholarship.StartDate).toLocaleDateString()
                                : "N/A"}
                            </p>
                            {hasApplied(scholarship.ScholarshipID) ? (
                              <p className="text-green-500 font-semibold">
                                ท่านได้สมัครทุนนี้แล้ว
                              </p>
                            ) : (
                              <p className={`text-sm ${statusColor}`}>{status}</p>
                            )}
                          </a>
                        </Link>
                      );
                    })}
                  </div>
                  {/* Pagination for Closed Scholarships */}
                  <div className="mt-4 flex justify-center">
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
                </div>
              )}

              {allScholarships.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">ทุนการศึกษาทั้งหมด</h2>
                  <div className="flex flex-wrap justify-start">
                    {paginate(allScholarships, allPage).map((scholarship) => {
                      const status = getStatus(scholarship.StartDate, scholarship.EndDate);
                      const statusColor =
                        status === "ปิดรับแล้ว"
                          ? "text-red-500"
                          : status === "เปิดรับอยู่"
                            ? "text-green-500"
                            : "text-gray-500";

                      return (
                        <Link
                          key={scholarship.ScholarshipID}
                          href={`/page/scholarships/detail?id=${scholarship.ScholarshipID}`}
                          legacyBehavior
                        >
                          <a className="w-full sm:w-1/2 lg:w-1/4 bg-white p-4 shadow-lg rounded-lg m-2 border border-gray-200">
                            <img
                              src={scholarship.ImagePath}
                              alt={scholarship.ScholarshipName}
                              className="w-full h-80 object-cover rounded-lg"
                            />
                            <h3 className="text-xl font-bold mt-2">
                              {scholarship.ScholarshipName}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              ปีการศึกษา {scholarship.Year}
                            </p>
                            <p className="text-gray-600">{scholarship.Description}</p>
                            <p className="text-gray-500 text-sm">
                              โพสเมื่อ{" "}
                              {scholarship.StartDate
                                ? new Date(scholarship.StartDate).toLocaleDateString()
                                : "N/A"}
                            </p>
                            {hasApplied(scholarship.ScholarshipID) ? (
                              <p className="text-green-500 font-semibold">
                                ท่านได้สมัครทุนนี้แล้ว
                              </p>
                            ) : (
                              <p className={`text-sm ${statusColor}`}>{status}</p>
                            )}
                          </a>
                        </Link>
                      );
                    })}
                  </div>
                  {/* Pagination for All Scholarships */}
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => setAllPage((prev) => Math.max(prev - 1, 1))}
                      className="px-4 py-2 bg-gray-300 rounded-lg"
                      disabled={allPage === 1}
                    >
                      ก่อนหน้า
                    </button>
                    <span className="px-4 py-2">{allPage} of {totalPages(allScholarships.length)}</span>
                    <button
                      onClick={() => setAllPage((prev) => Math.min(prev + 1, totalPages(allScholarships.length)))}
                      className="px-4 py-2 bg-gray-300 rounded-lg"
                      disabled={allPage === totalPages(allScholarships.length)}
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

      </div>
      <Footer />
      </div>
    </div>
  );
}
