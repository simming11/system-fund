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
}

export default function ExternalScholarShipsPage() {
  const router = useRouter();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [appliedScholarships, setAppliedScholarships] = useState<number[]>([]); // For storing applied scholarship IDs

  useEffect(() => {
    const fetchScholarshipsData = async () => {
      try {
        const response = await ApiServiceScholarships.getAllScholarships();
        const scholarshipsData = response.data;

        console.log('Scholarships data:', scholarshipsData);

        // Filter scholarships by TypeID === 1
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
        console.log('Filtered and updated scholarships:', updatedScholarships);
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
          console.log('Student data:', studentResponse.data);
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
          // Fetch internal and external applications simultaneously
          const [internalApplications, externalApplications] = await Promise.all([
            ApiApplicationServices.showByStudentId(StudentID), // API for internal applications
            ApiApplicationExternalServices.showByStudent(StudentID) // API for external applications
          ]);

          // Collect ScholarshipIDs from both APIs
          const appliedScholarshipIdsInternal = internalApplications.map((application: { ScholarshipID: any; }) => application.ScholarshipID);
          const appliedScholarshipIdsExternal = externalApplications.map((application: { ScholarshipID: any; }) => application.ScholarshipID);

          // Combine ScholarshipIDs from both sources
          const allAppliedScholarshipIds = [...appliedScholarshipIdsInternal, ...appliedScholarshipIdsExternal];
          console.log('Applied Scholarship IDs:', allAppliedScholarshipIds);

          // Update state if there are applied ScholarshipIDs
          if (allAppliedScholarshipIds.length > 0) {
            setAppliedScholarships(allAppliedScholarshipIds); // Store applied scholarship IDs
          } else {
            console.warn('No applications found.');
            setAppliedScholarships([]); // Set an empty array if no applications
          }
        } else {
          console.warn('No StudentID found in localStorage');
        }
      } catch (error) {
        console.error('Error fetching applied scholarships:', error);
        setAppliedScholarships([]); // Set an empty array if there's an error
      }
    };

    fetchAppliedScholarships();
  }, []);

  const getStatus = (startDate?: Date, endDate?: Date): string => {
    const now = new Date();
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (now >= start && now <= end) {
        return "เปิดรับอยู่";
      }
    }
    return "ปิดรับแล้ว";
  };

  // Check if a scholarship has been applied
  const hasApplied = (scholarshipID: number): boolean => {
    return appliedScholarships.includes(scholarshipID);
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
      <Header />
      <div className="container mx-auto px-4 py-8">
        <main className="flex-1">
          <h2 className="text-2xl font-semibold mb-6">ทุนการศึกษาภายใน</h2>
          <div className="flex flex-wrap justify-start">
            {scholarships.map((scholarship) => (
              <Link key={scholarship.ScholarshipID} href={`/page/scholarships/detail?id=${scholarship.ScholarshipID}`} legacyBehavior>
                <a className="w-full sm:w-1/2 lg:w-1/4 bg-white p-4 shadow-lg rounded-lg m-2 border border-gray-200">
                  <img src={scholarship.ImagePath} alt={scholarship.ScholarshipName} className="w-full h-80 object-cover rounded-lg" />
                  <h3 className="text-xl font-bold mt-2">{scholarship.ScholarshipName}</h3>
                  <p className="text-gray-600">{scholarship.Description}</p>
                  <p className="text-gray-500 text-sm">Posted on: {scholarship.StartDate ? new Date(scholarship.StartDate).toLocaleDateString() : 'N/A'}</p>
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
      </div>
      <Footer />
    </div>
  );
}
