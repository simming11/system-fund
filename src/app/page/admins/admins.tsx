import Header from '@/app/components/header/Header';
import ApiService from '@/app/services/auth/ApiAuth';
import { useEffect, useState } from 'react';

interface DashboardCardProps {
  title: string;
  content: string | JSX.Element;
}

const DashboardCard = ({ title, content }: DashboardCardProps) => (
  <div className="bg-white shadow-md rounded-lg p-6 mb-6">
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    <p>{content}</p>
  </div>
);

export default function AdminPage() {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Uncomment and use your actual fetch logic here
        //const response = await ApiService.fetchUserData();
        //setUserData(response.data);
      } catch (error) {
        console.error('Error fetching admin data', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header/>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard title="User Data" content={userData ? <pre>{JSON.stringify(userData, null, 2)}</pre> : 'Loading...'} />
          <DashboardCard title="Statistics" content="Statistics content goes here..." />
          <DashboardCard title="Recent Activities" content="Recent activities content goes here..." />
          <DashboardCard title="Notifications" content="Notifications content goes here..." />
          <DashboardCard title="Reports" content="Reports content goes here..." />
          <DashboardCard title="Settings" content="Settings content goes here..." />
        </div>
      </div>
    </div>
  );
}
