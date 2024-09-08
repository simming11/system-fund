"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import HeaderHome from '@/app/components/headerHome/headerHome';
import AdminHeader from '@/app/components/headerAdmin/headerAdmin';
import ApiServiceAcademics from '@/app/services/academics/ApiAcademics';
import ApiLineNotifyServices from '@/app/services/line-notifies/line'; // Import service
import { useRouter } from 'next/navigation'; // Ensure you're importing useRouter

interface AcademicData {
  AcademicID?: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  role?: string;
}

interface LineData {
  LineNotifyID:string
  notify_client_id?: string;
  client_secret?: string;
}

export default function LineNotifyForm() {
  const [formData, setFormData] = useState({
    notify_client_id: '',
    client_secret: '',
    AcademicID: '', // AcademicID กำหนดเป็น string ที่ว่างเปล่าเริ่มต้น
  });

  const [responseMessage, setResponseMessage] = useState('');
  const [academicData, setAcademicData] = useState<AcademicData | null>(null);
  const [lineNotifies, setLineNotifies] = useState<LineData[]>([]); // ใช้ array ของ LineData เพื่อเก็บข้อมูล
  const [isMounted, setIsMounted] = useState(false); // Ensure component is mounted
  const AcademicID = localStorage.getItem('AcademicID') ?? ''; // ใช้ empty string ถ้า AcademicID เป็น null
  const [hasLineToken, setHasLineToken] = useState(false); // สร้าง state เพื่อตรวจสอบว่ามี LineToken หรือไม่
  const router = useRouter(); // Move useRouter to the top level of the component

  useEffect(() => {
    // ดึง query parameters จาก URL
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');
    const state = queryParams.get('state');

    // ตรวจสอบว่ามีค่า code และ state หรือไม่ ถ้ามีจะเก็บลงใน localStorage และเรียก token
    if (code && state) {
      localStorage.setItem('oauth_code', code);
      localStorage.setItem('oauth_state', state);
      console.log('Code and state saved to localStorage:', { code, state });

      // เรียกฟังก์ชันเพื่อรับ Access Token หลังจากได้รับ code จาก LINE OAuth
      fetchLineNotifiesAndToken(code);
    }
  }, []);

  // ฟังก์ชันสำหรับดึง Access Token และอัพเดต LineToken ลงในฐานข้อมูล
  const fetchLineNotifiesAndToken = async (code: string) => {
    try {
      // Step 1: Fetch Line Notifies first to get client_secret and notify_client_id
      const response = await ApiLineNotifyServices.getAllLineNotifies(); // เรียก API
      if (response.length > 0) {
        // ดึงค่า client_secret และ notify_client_id จาก response
        const { client_secret, notify_client_id, LineToken } = response[0];

        // ตรวจสอบว่ามีค่า client_secret และ notify_client_id
        if (!client_secret || !notify_client_id) {
          throw new Error('Client ID or Client Secret is missing.');
        }

        // อัปเดตค่าใน formData (ถ้าจำเป็น)
        setFormData((prevFormData) => ({
          ...prevFormData,
          client_secret: client_secret || '',
          notify_client_id: notify_client_id || '',
        }));

        console.log('Updated formData with client_secret and notify_client_id:', {
          client_secret,
          notify_client_id,
          LineToken,
        });

        // Step 2: Use these values to fetch the LINE Notify Token
        const responseToken = await axios.post('https://notify-bot.line.me/oauth/token', null, {
          params: {
            grant_type: 'authorization_code',
            code,
            redirect_uri: 'https://b2b1-180-180-225-124.ngrok-free.app/page/notify', // เปลี่ยน URI ตามที่คุณใช้
            client_id: notify_client_id, // ใช้ค่า notify_client_id ที่ดึงมาจาก firstLineNotify
            client_secret: client_secret, // ใช้ค่า client_secret ที่ดึงมาจาก firstLineNotify
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        const { access_token } = responseToken.data;
        console.log('Access Token:', access_token); // Log the access token
        setHasLineToken(!LineToken); // ถ้ามี LineToken ให้ตั้งค่าเป็น true
        localStorage.setItem('line_notify_token', access_token); // Store the token

        // Step 3: อัพเดต Access Token ลงในฐานข้อมูล
        await updateLineNotifyInDB(access_token);

        return access_token;
      } else {
        throw new Error('No Line Notify data found.');
      }
    } catch (error) {
      console.error('Error fetching Line Notifies or token:', error);
      throw error;
    }
  };

  // ฟังก์ชันสำหรับดึงข้อมูลจาก API line-notifies
  const fetchLineNotifies = async () => {
    try {
      if (!AcademicID) {
        throw new Error('AcademicID is missing');
      }
      const response = await ApiLineNotifyServices.getLineNotifiesByAcademicID(AcademicID); // เรียก API
      if (response.length > 0) {
        // ดึงค่า client_secret, notify_client_id และ LineToken จาก response
        const { client_secret, notify_client_id, LineToken } = response[0];

        // อัปเดตค่าใน formData
        setFormData((prevFormData) => ({
          ...prevFormData,
          client_secret: client_secret || '', // ตรวจสอบว่ามีค่า client_secret หรือไม่
          notify_client_id: notify_client_id || '', // ตรวจสอบว่ามีค่า notify_client_id หรือไม่
        }));

        console.log('Updated formData with client_secret and notify_client_id:', {
          client_secret,
          notify_client_id,
        });

        // ตรวจสอบว่า LineToken มีอยู่หรือไม่
        if (LineToken) {
          setHasLineToken(true); // ถ้ามี LineToken ให้ตั้งค่าเป็น true
        } else {
          setHasLineToken(false); // ถ้าไม่มี LineToken ให้ตั้งค่าเป็น false
        }
      }

      // อัปเดต state ของ lineNotifies
      setLineNotifies(response);

      console.log('Fetched Line Notifies:', response); // Log ข้อมูลที่ดึงมาได้
    } catch (error) {
      console.error('Error fetching line notifies:', error);
    }
  };

// ฟังก์ชันสำหรับลบ LineNotify
const handleDelete = async (id: string) => {
  try {
    const confirmDelete = window.confirm('คุณต้องการลบ LineNotify ใช่หรือไม่?');
    if (!confirmDelete) return;

    // เรียกใช้ API เพื่อทำการลบ LineNotify
    await ApiLineNotifyServices.deleteLineNotify(id);

    setResponseMessage('ลบข้อมูลสำเร็จแล้ว!');
    console.log('Line Notify deleted successfully.');

    // Clear specific items from localStorage
    localStorage.removeItem('oauth_code');
    localStorage.removeItem('oauth_state');
    localStorage.removeItem('line_notify_token');
    localStorage.removeItem('oauth_state');
    localStorage.removeItem('oauth_client_id');
    localStorage.removeItem('oauth_redirect_uri');
    localStorage.removeItem('oauth_scope');

    // Fetch updated LineNotifies after deletion
    fetchLineNotifies();
    router.push('https://b2b1-180-180-225-124.ngrok-free.app/page/notify'); // Use router to navigate
  } catch (error) {
    console.error('Error deleting Line Notify:', error);
    setResponseMessage('ไม่สามารถลบข้อมูลได้');
  }
};


  // ฟังก์ชันสำหรับอัพเดต LineToken ลงในฐานข้อมูล
  const updateLineNotifyInDB = async (accessToken: string) => {
    try {
      const lineNotifyData = {
        LineToken: accessToken,
        AcademicID: formData.AcademicID,
      };

      // เรียก API เพื่ออัพเดต LineToken ในฐานข้อมูล
      const response = await ApiLineNotifyServices.updateLineNotify(AcademicID, lineNotifyData);
      console.log('Line Notify updated:', response); // Log the response
    } catch (error) {
      console.error('Error updating Line Notify:', error);
    }
  };

  // ฟังก์ชัน LINE OAuth
  const handleLineOAuth = (clientId: string | undefined) => {
    console.log('Client ID:', clientId); // Log the client ID

    if (!clientId) {
      console.error('LINE Client ID is not defined');
      return;
    }

    const redirectUri = 'https://b2b1-180-180-225-124.ngrok-free.app/page/notify';
    const scope = 'notify';
    const state = [...Array(30)].map(() => Math.random().toString(36)[2]).join('');

    // เก็บค่า state และ clientId ลงใน localStorage
    localStorage.setItem('oauth_state', state);
    localStorage.setItem('oauth_client_id', clientId);
    localStorage.setItem('oauth_redirect_uri', redirectUri);
    localStorage.setItem('oauth_scope', scope);

    const encodedRedirectUri = encodeURIComponent(redirectUri);

    console.log('Redirecting to LINE OAuth...'); // Log before redirecting

    // Redirect ไปที่ LINE OAuth
    window.location.href = `https://notify-bot.line.me/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirectUri}&scope=${scope}&state=${state}`;
  };

  useEffect(() => {
    setIsMounted(true);
    console.log('Component mounted'); // Log when component is mounted

    // ดึงค่า AcademicID จาก localStorage เมื่อ component ถูก mount
    const AcademicID = localStorage.getItem('AcademicID');
    if (AcademicID) {
      console.log('AcademicID from localStorage:', AcademicID); // Log the AcademicID from localStorage

      // อัปเดต formData ด้วย AcademicID ที่ได้
      setFormData((prevFormData) => ({
        ...prevFormData,
        AcademicID: AcademicID, // กำหนดค่า AcademicID ลงใน formData
      }));
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchLineNotifies();
    }
  }, [isMounted]);

  // ฟังก์ชันจัดการการเปลี่ยนแปลงในฟอร์ม
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`Input changed - ${e.target.name}:`, e.target.value); // Log form field changes
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ฟังก์ชันจัดการการส่งฟอร์ม
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData); // Log form submission data

    try {
      // เรียกใช้งานฟังก์ชัน createLineNotify ที่คุณสร้างใน service
      const response = await ApiLineNotifyServices.createLineNotify(formData);

      setResponseMessage('Data sent successfully!');
      console.log('Response:', response); // Log the response from API
    } catch (error) {
      console.error('Error submitting form:', error);
      setResponseMessage('Failed to send data.');
    }
  };

  return (
    <div className="max-h-screen flex flex-col bg-gray-100">
      <div>
        <HeaderHome />
        <AdminHeader />
      </div>
      <div className="flex flex-row">
        <Sidebar />
        <div className="bg-white w-1/8 p-4">
          <h1 className="text-2xl font-bold mb-4">Line Notify Form</h1>

          {/* เช็คว่ามี notify_client_id หรือ client_secret อยู่แล้วหรือไม่ */}
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

              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Submit
              </button>
            </form>
          ) : (
            <p className="text-green-500 font-semibold">LINE Notify Client ID และ Client Secret ถูกบันทึกแล้ว</p>
          )}

          {/* แสดงข้อมูล line-notifies */}
          <h2 className="text-xl font-bold mt-4">Line Notifies:</h2>
          <ul>
            {lineNotifies?.map((notify: LineData, index: number) => (
              <li key={index} className="mt-2">
                <strong>Notify ID:</strong> {notify.notify_client_id}<br />
                <strong>Client Secret:</strong> {notify.client_secret}

                {/* ปุ่มลบ */}
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
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Connect to LINE Notify
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
