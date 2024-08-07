'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/header/Header';
import Footer from '@/app/components/footer/footer';
import FilterMenu from '@/app/FilterMenu';
import ApiApplicationWithAttachmentService from '@/app/services/applicationwithAttachment/api';

interface Attachment {
  AttachmentID: number;
  ApplicationID: number;
  FilePath: string;
  created_at: string;
  updated_at: string;
}

interface Application {
  ApplicationID: number;
  StudentID: number;
  ScholarshipID: number;
  ApplicationDate: string;
  Status: string;
  Attachment: string;
  PersonalInfo: string;
  FamilyInfo: string;
  AcademicInfo: string;
  ScholarshipHistory: string;
  LoanAmount: number;
  MonthlyExpense: number;
  WorkHistory: string;
  FinancialInfo: string;
  Reasons: string;
  Signature: string;
  created_at: string;
  updated_at: string;
  attachments?: Attachment[];
}

const ApplicationsPage: React.FC = () => {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState<string>('');
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await ApiApplicationWithAttachmentService.getAllApplications();
        const applicationsData: Application[] = response.data;
        console.log('Fetched applications:', applicationsData);

        // Fetch attachments for each application
        const applicationsWithAttachments = await Promise.all(
          applicationsData.map(async (application: Application) => {
            const attachmentsResponse = await ApiApplicationWithAttachmentService.getApplicationAttachments(application.ApplicationID);
            application.attachments = attachmentsResponse.data;
            console.log(`Fetched attachments for application ${application.ApplicationID}:`, attachmentsResponse.data);
            return application;
          })
        );

        setApplications(applicationsWithAttachments);
        setFilteredApplications(applicationsWithAttachments); // Initialize filtered applications
      } catch (error) {
        console.error('Error fetching applications', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchType(e.target.value);
  };

  // Filter applications based on search type
  const handleSearch = () => {
    const filtered = applications.filter(application =>
      application.Status.toLowerCase().includes(searchType.toLowerCase())
    );
    setFilteredApplications(filtered);
    console.log('Filtered applications:', filtered);
  };

  // Handle filter change
  // const handleFilterChange = (filter: string) => {
  //   setFilter(filter);
  //   if (filter === 'All') {
  //     setFilteredApplications(applications);
  //   } else {
  //     const filtered = applications.filter(application =>
  //       application.Status.toLowerCase().includes(filter.toLowerCase())
  //     );
  //     setFilteredApplications(filtered);
  //   }
  //   console.log('Filter applied:', filter);
  //   console.log('Filtered applications after filter change:', filtered);
  // };

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
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Applications</h2>
        {/* <FilterMenu onFilterChange={handleFilterChange} /> */}
        <div className="mb-6 flex">
          <input
            type="text"
            placeholder="Search by Status"
            value={searchType}
            onChange={handleSearchChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleSearch}
            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>
        <div id="applications-list" className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredApplications.map((application) => (
            <Link href={`/page/application/detail?id=${application.ApplicationID}`} key={application.ApplicationID}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:border-gray-500 hover:border-2 hover:shadow-lg">
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">Application ID: {application.ApplicationID}</h3>
                  <p className="text-gray-600 mb-4"><strong>Status:</strong> {application.Status}</p>
                  <h3 className="text-lg font-semibold mt-4">Attachments</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ApplicationsPage;
