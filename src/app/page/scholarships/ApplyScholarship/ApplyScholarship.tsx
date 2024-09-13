"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/header/Header';
import ApiService from '@/app/services/scholarships/ApiScholarShips';
import Footer from '@/app/components/footer/footer';
import HeaderHome from '@/app/components/headerHome/headerHome';
import ApiServiceScholarships from '@/app/services/scholarships/ApiScholarShips';
import ApiGetALLfilesServiceScholarships from '@/app/services/scholarships/ApiServiceScholarshipsFiles';
import ApiScholarshipsAllImage from '@/app/services/scholarships/ApiScholarshipsImage';
import ApiStudentServices from '@/app/services/students/ApiStudent';

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
  courses: { CourseName: string }[]; // Assuming it's an array of course names
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
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(true);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const fetchUserData = () => {
      // Fetch user data logic here
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    const fetchScholarshipsData = async () => {
      try {
        const response = await ApiServiceScholarships.getAllScholarships();
        const scholarshipsData = response.data;

        // Log the data received from the API
        console.log('Scholarships data:', scholarshipsData);

        const updatedScholarships = await Promise.all(
          scholarshipsData.map(async (scholarship: Scholarship) => {
            if (scholarship.ScholarshipID) {
              try {
                const imageResponse = await ApiScholarshipsAllImage.getImageByScholarshipID(scholarship.ScholarshipID);
                if (imageResponse.status === 200 && imageResponse.data.length > 0) {
                  // Assuming imageResponse.data is an array of images, we take the first one
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
        setRecommendedScholarships(updatedScholarships.slice(0, 1)); // Assuming the first scholarship is recommended
        setAllScholarships(updatedScholarships); // Initialize all scholarships
        console.log('Updated scholarships:', updatedScholarships);
      } catch (error) {
        console.error('Error fetching scholarships', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScholarshipsData();
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
  }, [router]); // Add router to the dependency array if needed

  useEffect(() => {
    const userID = localStorage.getItem('UserID'); // Check if the user is logged in
    
    if (userID && student && scholarships.length > 0) {
      console.log('Student data:', student); // Log the student data
      console.log('All scholarships:', scholarships); // Log the scholarships data
  
      // Filter scholarships where the student's GPA > Minimum_GPA OR Course matches any scholarship courses
      const matchingScholarships = scholarships.filter(scholarship => {
        const studentMeetsGPA = student.GPA > scholarship.Minimum_GPA; // Changed to 'greater than' for recommendation
        const courseMatch = scholarship.courses.some(course => course.CourseName === student.Course);
  
        // Log the GPA check
        if (!studentMeetsGPA) {
          console.log(`GPA does not exceed the requirement for scholarship: ${scholarship.ScholarshipName}. Required GPA: ${scholarship.Minimum_GPA}, Student GPA: ${student.GPA}`);
        }
  
        // Log the course match check
        if (!courseMatch) {
          console.log(`Course does not match for scholarship: ${scholarship.ScholarshipName}. Student Course: ${student.Course}, Scholarship Courses: ${scholarship.courses.map(c => c.CourseName).join(', ')}`);
        }
  
        // Display the scholarship if GPA exceeds OR course matches
        return studentMeetsGPA || courseMatch;
      });
  
      console.log('Recommended scholarships based on GPA or course:', matchingScholarships); // Log the matching scholarships
  
      setRecommendedScholarships(matchingScholarships);
      setLoading(false);
    } else if (!userID) {
      console.log('User is not logged in. No recommendations available.');
    }
  }, [student, scholarships]);
  




  useEffect(() => {
    const intervalId = setInterval(() => {
      window.location.reload();
    }, 600000); // 10 minutes in milliseconds

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, []);

  useEffect(() => {
    if (isScrolling) {
      const scrollDiv = scrollRef.current;
      if (scrollDiv) {
        let scrollAmount = 0;
        scrollIntervalRef.current = setInterval(() => {
          scrollAmount += 2; // Change this value to control the speed of scrolling
          if (scrollAmount >= scrollDiv.scrollWidth - scrollDiv.clientWidth) {
            scrollAmount = 0;
          }
          scrollDiv.scrollTo({ left: scrollAmount, behavior: 'smooth' });
        }, 50); // Change this value to control the interval of scrolling
      }
    } else if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }
  }, [isScrolling]);

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
        {localStorage.getItem('UserID') && recommendedScholarships.length > 0 && (
  <div>
    <h2 className="text-2xl font-semibold mb-6">แนะนำทุนการศึกษา ####</h2>
    <div className="" ref={scrollRef}>
      <div className="flex flex-wrap justify-start">
      {recommendedScholarships.map((scholarship) => (
  <Link key={scholarship.ScholarshipID} href={`/page/scholarships/detail?id=${scholarship.ScholarshipID}`} legacyBehavior>
    <a className="w-full sm:w-1/2 lg:w-1/4 bg-white p-4 shadow-lg rounded-lg m-2 border border-gray-200">
      <img src={scholarship.ImagePath} alt={scholarship.ScholarshipName} className="w-full h-80 object-cover rounded-lg" />
      <h3 className="text-xl font-bold mt-2">{scholarship.ScholarshipName}</h3>
      <p className="text-gray-600">{scholarship.Description}</p>
      <p className="text-gray-500 text-sm">
        Start Date: {scholarship.StartDate ? new Date(scholarship.StartDate).toLocaleDateString() : 'N/A'}
      </p>
      <p className="text-gray-500 text-sm">
        End Date: {scholarship.EndDate ? new Date(scholarship.EndDate).toLocaleDateString() : 'N/A'}
      </p>
    </a>
  </Link>
))}

      </div>
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
                  <p className="text-gray-500 text-sm">Posted on: {scholarship.StartDate ? new Date(scholarship.StartDate).toLocaleDateString() : 'N/A'}</p>
                  <p className="text-gray-500 text-sm">{getStatus(scholarship.StartDate, scholarship.EndDate)}</p>
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
