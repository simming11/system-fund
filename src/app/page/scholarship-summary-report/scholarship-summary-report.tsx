'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ApiApplicationInternalServices from '@/app/services/ApiApplicationInternalServices/ApiApplicationInternalServices';
import ApiApplicationExternalServices from '@/app/services/ApiApplicationExternalServices/ApiApplicationExternalServices';
import ApiServiceScholarships from '@/app/services/scholarships/ApiScholarShips';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import HeaderHome from '@/app/components/headerHome/headerHome';
import AdminHeader from '@/app/components/headerAdmin/headerAdmin';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ScholarshipStats = () => {
    const [internalCount, setInternalCount] = useState<number>(0);
    const [externalCount, setExternalCount] = useState<number>(0);
    const [filteredDataCount, setFilteredDataCount] = useState<number>(0);
    const [studentApplicationCount, setstudentApplicationDataCount] = useState<number>(0);

    // States for dynamic inputs
    const [yearReceived, setYearReceived] = useState<string>('2566');
    const [receivedCount, setReceivedCount] = useState<number>(0);
    const [yearApplied, setYearApplied] = useState<string>('2566');
    const [appliedCount, setAppliedCount] = useState<number>(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const internalResponse = await ApiApplicationInternalServices.getAllApplications();
                const externalResponse = await ApiApplicationExternalServices.getAllApplications();
                const ScholarshipsResponse = await ApiServiceScholarships.getAllScholarships();
             
                
                console.log('Current yearReceived:', yearReceived);
                console.log('Current yearApplied:', yearApplied);

                const combinedApplications = [...internalResponse, ...externalResponse];

                if (combinedApplications && combinedApplications.length > 0) {
                    console.log(combinedApplications[0]);
                    
                    // Filter based on the selected yearReceived for received scholarships
                    const filteredInternalApplications = internalResponse.filter(
                        (application: any) =>
                            application.Status === 'ได้รับทุน' &&
                            application.scholarship &&
                            application.scholarship.Year == yearReceived
                    );
                    const filteredExternalApplications = externalResponse.filter(
                        (application: any) =>
                            application.Status === 'ได้รับทุน' &&
                            application.scholarship &&
                            application.scholarship.Year == yearReceived
                    );

                    const totalFilteredApplications = filteredInternalApplications.length + filteredExternalApplications.length;
                    setFilteredDataCount(totalFilteredApplications);
                    
                    // Log the filtered results
                    console.log('Filtered internal applications (Received):', filteredInternalApplications);
                    console.log('Filtered external applications (Received):', filteredExternalApplications);

                    // Filter for students who applied for scholarships (using yearApplied)
                    const filteredsInternalApplications = internalResponse.filter(
                        (application: any) =>
                            application.Status !== 'ได้รับทุน' &&
                            application.scholarship &&
                            application.scholarship.Year == yearApplied
                    );
                    const filteredsExternalApplications = externalResponse.filter(
                        (application: any) =>
                            application.Status !== 'ได้รับทุน' &&
                            application.scholarship &&
                            application.scholarship.Year == yearApplied
                    );

                    const totalStudentApplications = filteredsInternalApplications.length + filteredsExternalApplications.length;
                    setstudentApplicationDataCount(totalStudentApplications);
                    
                    // Log the filtered results for applied students
                    console.log('Filtered internal applications (Applied):', filteredsInternalApplications);
                    console.log('Filtered external applications (Applied):', filteredsExternalApplications);
                }

                if (ScholarshipsResponse && ScholarshipsResponse.data) {
                    const internalScholarships = ScholarshipsResponse.data.filter(
                        (scholarshipinternal: any) => scholarshipinternal.TypeID === 1
                    );
                    const externalScholarships = ScholarshipsResponse.data.filter(
                        (scholarshipexternal: any) => scholarshipexternal.TypeID === 2
                    );
                    setInternalCount(internalScholarships.length);
                    setExternalCount(externalScholarships.length);
                }
            } catch (error) {
                console.error('Error fetching application data:', error);
            }
        };

        fetchData();
    }, [yearReceived, yearApplied]); // Added yearReceived and yearApplied as dependencies
    

    const data = {
        labels: [
            'ทุนภายในที่เข้ามาในคณะ', 
            'ทุนภายนอกที่เข้ามาในคณะ', 
            `จำนวนนิสิตที่ได้รับทุนการศึกษาแต่ละปีการศึกษา ${yearReceived}`, 
            `จำนวนนิสิตที่สมัครทุนการศึกษาแต่ละปีการศึกษา ${yearApplied}`
        ],
        datasets: [
            {
                label: 'Scholarship Count',
                data: [internalCount, externalCount, filteredDataCount, studentApplicationCount],
                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(100, 102, 255, 0.6)','rgba(100, 50, 255, 0.6)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(100, 102, 255, 0.6)'],
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
                text: 'Number of Internal and External Scholarships',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 50,
            },
        },
    };

    return (
<div className='min-h-screen flex flex-col bg-gray-100'>
    <HeaderHome />
    <AdminHeader />
    <div className='flex flex-row'>
        <div className="bg-white w-1/8 p-4">
            <Sidebar />
        </div>
        <div className="flex-1 flex justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-6xl">
                <h2 className="text-2xl font-semibold mb-4 text-center">สถิติทุนการศึกษา</h2>

                {/* Dropdown for Selecting Year and Number for Received Students */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนนิสิตที่ได้รับทุนการศึกษาปีการศึกษา</label>
                    <select
                        value={yearReceived}
                        onChange={(e) => {
                            setYearReceived(e.target.value);
                            console.log('Selected Year for Received Scholarships:', e.target.value);
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="2567">2567</option>
                        <option value="2566">2566</option>
                        <option value="2565">2565</option>
                        <option value="2564">2564</option>
                    </select>
                </div>

                {/* Dropdown for Selecting Year and Number for Applied Students */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนนิสิตที่สมัครทุนการศึกษาปีการศึกษา</label>
                    <select
                        value={yearApplied}
                        onChange={(e) => {
                            setYearApplied(e.target.value);
                            console.log('Selected Year for Applied Scholarships:', e.target.value);
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="2567">2567</option>
                        <option value="2566">2566</option>
                        <option value="2565">2565</option>
                        <option value="2564">2564</option>
                    </select>
                </div>

                <div className="w-full h-100">
                    <Bar data={data} options={options} />
                </div>
            </div>
        </div>
    </div>
</div>

    );
};

export default ScholarshipStats;
