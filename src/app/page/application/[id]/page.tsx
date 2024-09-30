'use client';

import React, { useState, useEffect, ReactNode, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/header/Header';
import Footer from '@/app/components/footer/footer';
import dynamic from 'next/dynamic';

interface Attachment {
  ApplicationID: string;
  FilePath:      string;
  updated_at:    Date;
  created_at:    Date;
  AttachmentID:  number;
}

interface Application {
  Reasons: ReactNode;
  Signature: ReactNode;
  FinancialInfo: ReactNode;
  WorkHistory: ReactNode;
  LoanAmount: ReactNode;
  AcademicInfo: ReactNode;
  FamilyInfo: ReactNode;
  PersonalInfo: ReactNode;
  StudentID: string;
  TypeID: string;
  ScholarshipID: string;
  ApplicationDate: Date;
  Status: string;
  Major: string;
  GPA: number;
  DOB: Date;
  CurrentAddress: string;
  HometownAddress: string;
  PhoneNumber: string;
  Email: string;
  Religion: string;
  MonthlyIncome: number;
  MonthlyExpenses: number;
  ProfilePicture: string;
  FatherName: string;
  FatherAge: number;
  FatherStatus: string;
  FatherAddress: string;
  FatherOccupation: string;
  FatherIncome: number;
  MotherName: string;
  MotherAge: number;
  MotherStatus: string;
  MotherAddress: string;
  MotherOccupation: string;
  MotherIncome: number;
  GuardianName: string;
  GuardianAge: number;
  GuardianRelationship: string;
  GuardianAddress: string;
  GuardianOccupation: string;
  GuardianIncome: number;
  FamilyStatus: string;
  SiblingsCount: number;
  SiblingsNames: string;
  PrimaryEducationHistory: string;
  PrimaryGPA: number;
  SecondaryEducationHistory: string;
  ScholarshipHistory: string;
  updated_at: Date;
  created_at: Date;
  ApplicationID: number;
}

const ApplicationDetailContent = dynamic(() => Promise.resolve(({ id }: { id: string | null}) => {
  const [application, setApplication] = useState<Application | null>(null); // State to store application data
  const [loading, setLoading] = useState(true); // State to manage loading state

  // Effect to fetch application data
  useEffect(() => {
    if (id) {
      const fetchApplication = async () => {
     
        try {
        } catch (error) {
          console.error('Error fetching application details', error);
        } finally {
          setLoading(false); // Set loading to false after data is fetched
        }
      };

      fetchApplication();
    }
  }, [id]);

  // Display loading spinner if data is still being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 animate-spin"></div>
        <p className="ml-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  // Display a message if no application data is found
  if (!application) {
    return <p>Application not found</p>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Application ID: {application.ApplicationID}</h2>
      <p className="text-gray-700 mb-4"><span className="font-semibold">Status:</span> {application.Status}</p>
      <p className="text-gray-700 mb-4"><span className="font-semibold">Personal Info:</span> {application.PersonalInfo}</p>
      <p className="text-gray-700 mb-4"><span className="font-semibold">Family Info:</span> {application.FamilyInfo}</p>
      <p className="text-gray-700 mb-4"><span className="font-semibold">Academic Info:</span> {application.AcademicInfo}</p>
      <p className="text-gray-700 mb-4"><span className="font-semibold">Scholarship History:</span> {application.ScholarshipHistory}</p>
      <p className="text-gray-700 mb-4"><span className="font-semibold">Loan Amount:</span> {application.LoanAmount}</p>
      <p className="text-gray-700 mb-4"><span className="font-semibold">Monthly Expense:</span> {application.MonthlyExpenses}</p>
      <p className="text-gray-700 mb-4"><span className="font-semibold">Work History:</span> {application.WorkHistory}</p>
      <p className="text-gray-700 mb-4"><span className="font-semibold">Financial Info:</span> {application.FinancialInfo}</p>
      <p className="text-gray-700 mb-4"><span className="font-semibold">Reasons:</span> {application.Reasons}</p>
      <p className="text-gray-700 mb-4"><span className="font-semibold">Signature:</span> {application.Signature}</p>
    </div>
  )
}), { ssr: false});

export default function ApplicationDetail() {
  const router = useRouter(); // Hook for navigation
  //const id = searchParams.get('id'); // Extract the ID from the query parameters
  const id = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null;

  // Function to download the file
  //   const downloadFile = async (fileName: string) => {
  //     try {
  //       const response = await ApiApplicationWithAttachmentService.downloadFile(Number(id), fileName); // Fetch the file
  //       const url = window.URL.createObjectURL(new Blob([response.data])); // Create a URL for the file

  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.setAttribute('download', fileName); // Use the original filename
  //       document.body.appendChild(link);
  //       link.click(); // Programmatically click the link to trigger the download

  //       // Clean up
  //       document.body.removeChild(link);
  //       window.URL.revokeObjectURL(url);
  //     } catch (error) {
  //       console.error('Error downloading file', error);
  //     }
  //   };

  return (
    <div className="min-h-screen flex flex-col">
      <Header /> {/* Header component */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <ApplicationDetailContent id={id} />
        </Suspense>
      </div>
      <Footer /> {/* Footer component */}
    </div>
  );
}
