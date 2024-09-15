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
    const [internalData, setInternalData] = useState<number[]>([]);
    const [externalData, setExternalData] = useState<number[]>([]);
    const [academicYears, setAcademicYears] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const internalResponse = await ApiApplicationInternalServices.getAllApplications();
                const externalResponse = await ApiApplicationExternalServices.getAllApplications();
                const ScholarshipsResponse = await ApiServiceScholarships.getAllScholarships();
                console.log(internalResponse);
                console.log(externalResponse);
                
                
                console.log(internalResponse[0].Status,'สถานะ');
                console.log(internalResponse[0].scholarship.Year,'ปี');
                
                
                const internalCounts = countApplicationsByYear(internalResponse);
                const externalCounts = countApplicationsByYear(externalResponse);

                setInternalData(internalCounts.data);
                setExternalData(externalCounts.data);
                setAcademicYears(internalCounts.years);
            } catch (error) {
                console.error('Error fetching application data:', error);
            }
        };

        fetchData();
    }, []);

    const countApplicationsByYear = (applications: any[]) => {
        const yearMap: Record<string, number> = {};
        applications.forEach(app => {
            const year = app.academicYear;  // Assuming you have this field
            if (yearMap[year]) {
                yearMap[year]++;
            } else {
                yearMap[year] = 1;
            }
        });

        const years = Object.keys(yearMap);
        const data = years.map(year => yearMap[year]);
        return { years, data };
    };

    const data = {
        labels: academicYears,
        datasets: [
            {
                label: 'Internal Scholarships',
                data: internalData,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
            {
                label: 'External Scholarships',
                data: externalData,
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
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
                text: 'Scholarship Applications per Academic Year',
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
                <div className="flex-1 flex  justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-6xl">
                        <h2 className="text-2xl font-semibold mb-4 text-center">สถิติการสมัครทุนการศึกษา</h2>
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
