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

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Scholarship {
  StartDate: Date;
  EndDate: Date;
  CreatedBy: string;
  TypeID: string;
  ScholarshipName: string;
  FundingSource: string;
  Description: string;
  YearLevel: string;
  UploadFile: string;
  ImagePath: string;
  updated_at: Date;
  created_at: Date;
  ScholarshipID: number;
}

export default function ApplyScholarShipsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [recommendedScholarships, setRecommendedScholarships] = useState<Scholarship[]>([]);
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(true);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
          <h2 className="text-2xl font-semibold mb-6">แนะนำทุนการศึกษา</h2>
          <div className="relative mb-4 group">
            <div className="flex overflow-auto space-x-4" ref={scrollRef}>
              {recommendedScholarships.map((scholarship) => (
                <Link key={scholarship.ScholarshipID} href={`/page/scholarships/detail?id=${scholarship.ScholarshipID}`} legacyBehavior>
                  <a className="w-full sm:w-1/2 lg:w-1/4 bg-white p-4 shadow-lg rounded-lg flex-shrink-0 border border-gray-200">
                    <img src={scholarship.ImagePath} alt={scholarship.ScholarshipName} className="w-full h-80 object-cover rounded-lg" />
                    <h3 className="text-xl font-bold mt-2">{scholarship.ScholarshipName}</h3>
                    <p className="text-gray-600">{scholarship.Description}</p>
                    <p className="text-gray-500 text-sm">Posted on: {scholarship.StartDate ? new Date(scholarship.StartDate).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-gray-500 text-sm">{getStatus(scholarship.StartDate, scholarship.EndDate)}</p>
                  </a>
                </Link>
              ))}
            </div>
          </div>
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
