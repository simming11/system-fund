'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/app/components/header/Header';
import Footer from '@/app/components/footer/footer';
import ApiServiceScholarships from '@/app/services/scholarships/ApiScholarShips';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Scholarship {
  ScholarshipID: number;
  ScholarshipName: string;
  Description: string;
  Type: string;
  TypeID: number; // Add TypeID
  StartDate: string;
  EndDate: string;
  Status: string;
  CreatedBy: number;
  UploadFile: string; // JSON string
  created_at: string;
  updated_at: string;
  Scholarship_exID?: number; // Add Scholarship_exID for external scholarship
}

export default function ScholarshipDetail() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter(); // Hook for navigation
  const searchParams = useSearchParams(); // Get search params from the URL
  const id = searchParams.get('id'); // Extract the ID from the query parameters
  const [scholarship, setScholarship] = useState<Scholarship | null>(null); // State to store scholarship data
  const [loading, setLoading] = useState(true); // State to manage loading state

  // Effect to fetch scholarship data
  useEffect(() => {
    if (id) {
      const fetchScholarship = async () => {
        console.log("Fetching scholarship details for id:", id);
        try {
          // Fetch scholarship details
          const response = await ApiServiceScholarships.getScholarship(Number(id));
          const scholarshipData = response.data;
          console.log("Scholarship data fetched:", scholarshipData);

          setScholarship(scholarshipData); // Set scholarship data
        } catch (error) {
          console.error('Error fetching scholarship details', error);
        } finally {
          setLoading(false); // Set loading to false after data is fetched
        }
      };

      fetchScholarship();
    }
  }, [id]);

  // Function to download the file
  const downloadFile = async (fileName: string) => {
    try {
      const response = await ApiServiceScholarships.downloadFile(Number(id), fileName); // Fetch the file
      const url = window.URL.createObjectURL(new Blob([response.data])); // Create a URL for the file

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName); // Use the original filename
      document.body.appendChild(link);
      link.click(); // Programmatically click the link to trigger the download

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file', error);
    }
  };

  // Navigate to the application form
  const handleApplyNow = () => {
    if (scholarship) {
      if (scholarship.TypeID === 1) {
        router.push(`/page/application/create/internal?scholarshipId=${scholarship.ScholarshipID}`);
      } else if (scholarship.TypeID === 2) {
        router.push(`/page/application/create/external?scholarshipId=${scholarship.ScholarshipID}`);
      }
    }
  };

  // Display loading spinner if data is still being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div>
        <p className="ml-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  // Display a message if no scholarship data is found
  if (!scholarship) {
    return <p>Scholarship not found</p>;
  }

  // Parse the UploadFile JSON string
  const files = JSON.parse(scholarship.UploadFile);

  return (
    
    <div className="min-h-screen flex flex-col">

      <Header /> {/* Header component */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Scholarship Name: {scholarship.ScholarshipName}</h2>
          <p className="text-gray-700 mb-4"><span className="font-semibold">Description:</span> {scholarship.Description}</p>
          <p className="text-gray-700 mb-4"><span className="font-semibold">Type:</span> {scholarship.Type}</p>
          <p className="text-gray-700 mb-4"><span className="font-semibold">Start Date:</span> {scholarship.StartDate}</p>
          <p className="text-gray-700 mb-4"><span className="font-semibold">End Date:</span> {scholarship.EndDate}</p>
          <p className="text-gray-700 mb-4"><span className="font-semibold">Status:</span> {scholarship.Status}</p>
          <p className="text-gray-700 mb-4"><span className="font-semibold">Created By:</span> {scholarship.CreatedBy}</p>
          {files.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Files:</h3>
              <ul>
                {files.map((file: string, index: number) => (
                  <li key={index} className="flex items-center justify-between mt-2">
                    <span className="text-gray-700">{file.split('/').pop()}</span>
                    <button
                      onClick={() => downloadFile(file.split('/').pop()!)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-4"
                    >
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={handleApplyNow}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
          >
            Apply Now
          </button>
        </div>
      </div>
      <Footer /> {/* Footer component */}
    </div>
  );
}
