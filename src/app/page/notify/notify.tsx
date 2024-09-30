'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import HeaderHome from '@/app/components/headerHome/headerHome';
import AdminHeader from '@/app/components/headerAdmin/headerAdmin';
import ApiLineNotifyServices from '@/app/services/line-notifies/line';
import { useRouter } from 'next/navigation';

interface AcademicData {
  AcademicID?: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  role?: string;
}

interface LineData {
  LineNotifyID: string;
  notify_client_id?: string;
  client_secret?: string;
}

export default function LineNotifyForm() {
  const [formData, setFormData] = useState({
    notify_client_id: '',
    client_secret: '',
    AcademicID: '',
  });

  const [responseMessage, setResponseMessage] = useState('');
  const [lineNotifies, setLineNotifies] = useState<LineData[]>([]);
  const [hasLineToken, setHasLineToken] = useState(false);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure the component is client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const Role = localStorage.getItem('UserRole');

      if (!token || Role?.trim().toLowerCase() !== 'admin') {
        console.error('Unauthorized access or missing token. Redirecting to login.');
        router.push('/page/control');
      }
    }
  }, [isMounted, router]);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get('code');
      const state = queryParams.get('state');

      if (code && state) {
        localStorage.setItem('oauth_code', code);
        localStorage.setItem('oauth_state', state);


        fetchLineNotifiesAndToken(code);
      }
    }
  }, [isMounted]);

const fetchLineNotifiesAndToken = async (code: string) => {
  try {
    const response = await ApiLineNotifyServices.getAllLineNotifies();

    if (response.length > 0) {
      const { client_secret, notify_client_id, LineToken } = response[0];

      if (!client_secret || !notify_client_id) {
        throw new Error('Client ID or Client Secret is missing.');
      }

      setFormData((prevFormData) => ({
        ...prevFormData,
        client_secret: client_secret || '',
        notify_client_id: notify_client_id || '',
      }));

      // Call the new API route in Next.js for fetching the token
      const responseToken = await fetch('/api/line-notify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          notify_client_id,
          client_secret,
        }),
      });

      if (responseToken.ok) {
        const tokenData = await responseToken.json();
        const { access_token } = tokenData;
        updateLineNotifyInDB(access_token);

        setHasLineToken(!LineToken);

        // Save token to localStorage
        localStorage.setItem('line_notify_token', access_token);

        // Update Line Notify in DB with the new token
        

        return access_token;
      } else {
        const errorData = await responseToken.json();
        console.error('Error fetching token:', errorData.error);
      }
    } else {
      throw new Error('No Line Notify data found.');
    }
  } catch (error) {
    console.error('Error fetching Line Notifies or token:', error);
  }
};



  const fetchLineNotifies = async () => {
    try {
      const AcademicID = localStorage.getItem('AcademicID');
      if (!AcademicID) throw new Error('AcademicID is missing');

      const response = await ApiLineNotifyServices.getLineNotifiesByAcademicID(AcademicID);

      if (response.length > 0) {
        const { client_secret, notify_client_id, LineToken } = response[0];

        setFormData((prevFormData) => ({
          ...prevFormData,
          client_secret: client_secret || '',
          notify_client_id: notify_client_id || '',
        }));

        if (LineToken) {
          setHasLineToken(true);
        } else {
          setHasLineToken(false);
        }
      }

      setLineNotifies(response);
    } catch (error) {
      console.error('Error fetching line notifies:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const confirmDelete = window.confirm('คุณต้องการลบ LineNotify ใช่หรือไม่?');
      if (!confirmDelete) return;

      await ApiLineNotifyServices.deleteLineNotify(id);

      setResponseMessage('ลบข้อมูลสำเร็จแล้ว!');
      localStorage.removeItem('oauth_code');
      localStorage.removeItem('oauth_state');
      localStorage.removeItem('line_notify_token');
      localStorage.removeItem('oauth_redirect_uri');
      localStorage.removeItem('oauth_client_id');
      localStorage.removeItem('oauth_scope');

      // ใช้ window.location.href เพื่อรีโหลดหน้าเว็บหลังจากลบเสร็จสิ้น
      window.location.href = '/page/notify';
    } catch (error) {
      console.error('Error deleting Line Notify:', error);
      setResponseMessage('ไม่สามารถลบข้อมูลได้');
    }
  };

  const updateLineNotifyInDB = async (token: string) => {
    try {
      const lineNotifyData = {
        LineToken: token,
        AcademicID: formData.AcademicID,
      };

      const response = await ApiLineNotifyServices.updateLineNotify(formData.AcademicID, lineNotifyData);

    } catch (error) {
      console.error('Error updating Line Notify:', error);
    }
  };

  const handleLineOAuth = (clientId: string | undefined) => {
    if (!clientId) {
      console.error('LINE Client ID is not defined');
      return;
    }

    const redirectUri = 'https://system-fund.vercel.app/page/notify';
    const scope = 'notify';
    const state = [...Array(30)].map(() => Math.random().toString(36)[2]).join('');

    localStorage.setItem('oauth_state', state);
    localStorage.setItem('oauth_client_id', clientId);
    localStorage.setItem('oauth_redirect_uri', redirectUri);
    localStorage.setItem('oauth_scope', scope);

    const encodedRedirectUri = encodeURIComponent(redirectUri);

    window.location.href = `https://notify-bot.line.me/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirectUri}&scope=${scope}&state=${state}`;
  };

  useEffect(() => {
    if (isMounted) {
      fetchLineNotifies();
    }
  }, [isMounted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ดึงค่า AcademicID จาก localStorage
    const AcademicID = localStorage.getItem('AcademicID') || '';

    // อัปเดต formData ด้วยค่า AcademicID
    const updatedFormData = {
      ...formData,
      AcademicID: AcademicID,
    };



    try {
      const response = await ApiLineNotifyServices.createLineNotify(updatedFormData);
      setResponseMessage('Data sent successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      setResponseMessage('Failed to send data.');
    }
  };

  if (!isMounted) {
    return null; // Prevents rendering on the server side
  }

  return (
    <div className="max-h-screen flex flex-col bg-gray-100">
      <div>
        <HeaderHome />
        <AdminHeader />
      </div>
      <div className="flex flex-row">
        <div className="bg-white w-1/8 p-4">
          <Sidebar />
        </div>
        <div className="min-h-screen pb-40 ">
          <div className="bg-white w-full max-w-lg p-8">
            <h1 className="text-2xl font-bold mb-4">Line Notify Form</h1>

            {lineNotifies.length === 0 || !lineNotifies[0]?.notify_client_id || !lineNotifies[0]?.client_secret ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="notify_client_id" className="block text-sm font-medium text-gray-700">
                    Notify Client ID
                  </label>
                  <input
                    type="text"
                    id="notify_client_id"
                    name="notify_client_id"
                    value={formData.notify_client_id}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="client_secret" className="block text-sm font-medium text-gray-700">
                    Client Secret
                  </label>
                  <input
                    type="text"
                    id="client_secret"
                    name="client_secret"
                    value={formData.client_secret}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  Submit
                </button>
              </form>
            ) : (
              <p className="text-green-500 font-semibold">LINE Notify Client ID และ Client Secret ถูกบันทึกแล้ว</p>
            )}

            <h2 className="text-xl font-bold mt-4">Line Notifies:</h2>
            <ul>
              {lineNotifies?.map((notify: LineData, index: number) => (
                <li key={index} className="mt-2">
                  <strong>Notify ID:</strong> {notify.notify_client_id}<br />
                  <strong>Client Secret:</strong> {notify.client_secret}

                  <button
                    onClick={() => handleDelete(notify.LineNotifyID || '')}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 mt-2"
                  >
                    ลบ Line Notify
                  </button>
                </li>
              ))}
            </ul>

            {responseMessage && <p className="mt-4">{responseMessage}</p>}
            {!hasLineToken && (
              <button
                onClick={() => handleLineOAuth(formData.notify_client_id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mt-4"
              >
                Connect to LINE Notify
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
