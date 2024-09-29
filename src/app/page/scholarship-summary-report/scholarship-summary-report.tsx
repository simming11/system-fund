"use client";

import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { useRouter } from 'next/navigation'; // <-- Correct import

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import ApiApplicationInternalServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationInternalServices';
import ApiApplicationExternalServices from '@/app/services/ApiApplicationExternalServices/ApiApplicationExternalServices';
import ApiServiceScholarships from '@/app/services/scholarships/ApiScholarShips';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import HeaderHome from '@/app/components/headerHome/headerHome';
import AdminHeader from '@/app/components/headerAdmin/headerAdmin';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ScholarshipStats = () => {
    const router = useRouter(); // <-- Use the router instance from useRouter hook
    const [internalCount, setInternalCount] = useState<number>(0);
    const [externalCount, setExternalCount] = useState<number>(0);
    const [filteredDataCount, setFilteredDataCount] = useState<number>(0);
    const [studentApplicationCount, setStudentApplicationCount] = useState<number>(0);

    const [INorEX, setINorEX] = useState<string>('2');
    const [yearApplied, setYearApplied] = useState<string>('2565');

    const [showScholarshipChart, setShowScholarshipChart] = useState<boolean>(true);
    const [showAppliedChart, setShowAppliedChart] = useState<boolean>(false);
    const [showScholarshipTypeYearChart, setShowScholarshipTypeYearChart] = useState<boolean>(false);

    // Declare scholarshipCountMap in a higher scope
    const [scholarshipCountMap, setScholarshipCountMap] = useState<{ [key: string]: number }>({});
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            const Role = localStorage.getItem('UserRole');
    
            if (!token || Role?.trim().toLowerCase() !== 'admin') {
                console.error('Unauthorized access or missing token. Redirecting to login.');
                router.push('/page/control'); // <-- Using useRouter instance for navigation
            }
        }
    }, [router]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const internalResponse = await ApiApplicationInternalServices.getAllApplications();
                const externalResponse = await ApiApplicationExternalServices.getAllApplications();
                const scholarshipsResponse = await ApiServiceScholarships.getAllScholarships();
                const combinedApplications = [...internalResponse, ...externalResponse];

                if (combinedApplications.length > 0) {
                    console.log(combinedApplications[0]);

                    // Filtering internal and external applications where Status is 'ได้รับทุน'
                    const filteredInternalApplications = internalResponse.filter(
                        (application: any) => application.Status === 'ได้รับทุน' && application.scholarship.Year == yearApplied
                    );

                    const filteredExternalApplications = externalResponse.filter(
                        (application: any) => application.Status === 'ได้รับทุน' && application.scholarship.Year == yearApplied
                    );

                    const totalFilteredApplications = filteredInternalApplications.length + filteredExternalApplications.length;
                    setFilteredDataCount(totalFilteredApplications);

                    // Filtered applications for students who didn't receive scholarships
                    const filteredsInternalApplications = internalResponse.filter(
                        (application: any) => application.Status !== 'ได้รับทุน' && application.scholarship.Year == yearApplied
                    );
                    const filteredsExternalApplications = externalResponse.filter(
                        (application: any) => application.Status !== 'ได้รับทุน' && application.scholarship.Year == yearApplied
                    );

                    const totalStudentApplications = filteredsInternalApplications.length + filteredsExternalApplications.length;
                    setStudentApplicationCount(totalStudentApplications);

                    // Group by scholarship name and count how many students received each scholarship
                    const filteredApplicationsByYear = [...filteredInternalApplications, ...filteredExternalApplications].filter(
                        (application: any) => application.scholarship.TypeID == INorEX && application.scholarship.Year == yearApplied
                    );

                    const scholarshipCountMapTemp = filteredApplicationsByYear.reduce((acc: any, application: any) => {
                        const scholarshipName = application.scholarship.ScholarshipName;

                        if (!acc[scholarshipName]) {
                            acc[scholarshipName] = 0;
                        }

                        acc[scholarshipName] += 1;
                        return acc;
                    }, {});

                    setScholarshipCountMap(scholarshipCountMapTemp);

                    // Log scholarship names and how many students received each scholarship
                    for (const [scholarshipName, count] of Object.entries(scholarshipCountMapTemp)) {
                        console.log(`Scholarship Name: ${scholarshipName}, Number of Students Received: ${count}`);
                    }
                }
                if (scholarshipsResponse && scholarshipsResponse.data) {
                    const internalScholarships = scholarshipsResponse.data.filter(
                        (scholarshipInternal: any) =>
                            scholarshipInternal.TypeID === 1 &&
                            scholarshipInternal.Year &&  // Check that Year exists
                            scholarshipInternal.Year == yearApplied // Filter by year
                    );
                    const externalScholarships = scholarshipsResponse.data.filter(
                        (scholarshipExternal: any) =>
                            scholarshipExternal.TypeID === 2 &&
                            scholarshipExternal.Year &&  // Check that Year exists
                            scholarshipExternal.Year == yearApplied // Filter by year
                    );
                    setInternalCount(internalScholarships.length);
                    setExternalCount(externalScholarships.length);
                }
            } catch (error) {
                console.error('Error fetching application data:', error);
            }
        };

        fetchData();
    }, [INorEX, yearApplied]);

    // Data for the first pie chart (Internal vs External Scholarships)
    const scholarshipTypeData = {
        labels: ['ทุนภายในคณะ', 'ทุนภายนอกที่เข้ามาในคณะ'],
        datasets: [
            {
                label: `ทุนการศึกษาในปี ${yearApplied}`,
                data: [internalCount, externalCount] ,
                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
                borderWidth: 1,
            },
        ],
    };

    // Data for the applied and received scholarships pie chart
    const appliedScholarshipsData = {
        labels: [`นิสิตที่สมัครทุนการศึกษาในปี ${yearApplied} คน`, `นิสิตที่ได้รับทุนในปี ${yearApplied}คน`],
        datasets: [
            {
                label: 'Applied vs Received Scholarships',
                data: [studentApplicationCount, filteredDataCount],
                backgroundColor: ['rgba(100, 50, 255, 0.6)', 'rgba(255, 205, 86, 0.6)'],
                borderColor: ['rgba(100, 50, 255, 1)', 'rgba(255, 205, 86, 0.6)'],
                borderWidth: 1,
            },
        ],
    };

    // Data for the third chart (scholarship types received by students per year)
    const scholarshipTypeYearData = {
        labels: Object.keys(scholarshipCountMap),
        datasets: [
            {
                label: `Scholarships by Type in ${yearApplied}`,
                data: Object.values(scholarshipCountMap),
                backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Scholarship Statistics',
            },
        },
    };

    // Rendering logic for the three charts
    const renderChart = () => {
        if (showScholarshipChart) {
            return <Pie data={scholarshipTypeData} options={options} />;
        } else if (showAppliedChart) {
            return <Pie data={appliedScholarshipsData} options={options} />;
        } else if (showScholarshipTypeYearChart && Object.keys(scholarshipCountMap)) {
            return <Pie data={scholarshipTypeYearData} options={options} />;
        } else {
            return <p>No data available for the selected criteria.</p>;
        }
    };

    return (
        <div className='min-h-screen flex flex-col bg-gray-100 bg-white'>
            <HeaderHome />
            <AdminHeader />
            <div className='flex flex-row'>
                <div className="bg-white w-1/8 p-4">
                    <Sidebar />
                </div>
                <div className="flex-1 bg-white flex flex-col justify-center mb-60">
                    <div className="bg-white p-4 md:p-5 lg:p-6 rounded-lg w-full max-w-5xl mb-4 md:mb-50 lg:mb-6 ">
                        <h2 className="text-lg md:text-xl lg:text-2xl font-semibold mb-4 text-center">สถิติทุนการศึกษา</h2>

                        <div className="flex flex-col md:flex-row md:justify-center md:items-center">
                            {/* Display selected chart */}
                            <div className="w-full md:w-1/2">
                                {renderChart()}
                            </div>

                            {/* Dropdown for selecting academic year */}
                            <div className="ml-0 md:ml-4 mt-4 md:mt-0 w-full md:w-auto">
                                <label className="text-sm md:text-base">ปีการศึกษาที่เลือก:</label>
                                <select
                                    value={yearApplied}
                                    onChange={(e) => setYearApplied(e.target.value)}
                                    className="block w-full px-2 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    {[...Array(16)].map((_, i) => {
                                        const year = 2565 + i; // Start from 2565 to 2580
                                        return (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        );
                                    })}
                                </select>

                            </div>

                            {/* Show only if showing scholarshipTypeYearChart */}
                            {showScholarshipTypeYearChart && (
                                <div className="ml-0 md:ml-4 mt-4 md:mt-0 w-full md:w-auto">
                                    <label className="text-sm md:text-base">ทุนที่เลือก:</label>
                                    <select
                                        value={INorEX}
                                        onChange={(e) => setINorEX(e.target.value)}
                                        className="block w-full px-2 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="1">ภายใน</option>
                                        <option value="2">ภายนอก</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Buttons to select chart */}
                        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
                            <button
                                onClick={() => {
                                    setShowScholarshipChart(true);
                                    setShowAppliedChart(false);
                                    setShowScholarshipTypeYearChart(false);
                                }}
                                className={`px-3 py-2 rounded text-sm md:text-base ${showScholarshipChart ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                                ทุนภายในและภายนอก
                            </button>
                            <button
                                onClick={() => {
                                    setShowScholarshipChart(false);
                                    setShowAppliedChart(true);
                                    setShowScholarshipTypeYearChart(false);
                                }}
                                className={`px-3 py-2 rounded text-sm md:text-base ${showAppliedChart ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                                นิสิตที่สมัครทุนการศึกษาและนิสิตที่ได้รับ
                            </button>
                            <button
                                onClick={() => {
                                    setShowScholarshipChart(false);
                                    setShowAppliedChart(false);
                                    setShowScholarshipTypeYearChart(true);
                                }}
                                className={`px-3 py-2 rounded text-sm md:text-base ${showScholarshipTypeYearChart ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                                แสดงจำนวนทุนที่นิสิตได้รับแต่ละประเภทตามปี
                            </button>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default ScholarshipStats;
