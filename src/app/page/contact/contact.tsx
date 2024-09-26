import Header from '@/app/components/header/Header';
import HeaderHome from '@/app/components/headerHome/headerHome';
import Image from 'next/image';
import Link from 'next/link';

export default function ContactUsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <HeaderHome />
      <Header />

      {/* Content Section */}
      <div className="flex-grow flex flex-col lg:flex-row items-center justify-center py-12 space-y-8 lg:space-y-0 lg:space-x-8">
        
        {/* Title and Description */}
        <div className="text-center lg:text-left lg:w-2/5">
          <h1 className="text-3xl font-extrabold text-blue-800 mb-4">
            ติดต่อเรา
          </h1>
          <p className="text-lg text-gray-700 mb-4">
            ฐาปกรณ์ กลุ่มไหมฟิเกอร์ & ชนิกานต์ แวงโรสธรณี
            <br />
            คณะวิทยาศาสตร์และนวัตกรรมดิจิทัล มหาวิทยาลัยทักษิณ
          </p>
          <p className="text-gray-600 text-lg">
            ติดต่อเพิ่มเติมผ่านทาง: <br />
            <span className="block mt-2">Thapakon.K@tsu.ac.th : 0977246630</span>
            <span className="block">Chanikan.W@tsu.ac.th : 0956147976</span>
          </p>

           {/* ลิงค์ Facebook */}
           <p className="text-blue-600 mt-4">
            <Link href="https://www.facebook.com/scidi.tsu" target="_blank" rel="noopener noreferrer">
              Facebook: www.facebook.com/scidi.tsu
            </Link>
          </p>
        </div>

        
        {/* Image Section */}
        <div className="flex items-center justify-center lg:w-2/5">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Image
              src="/images/contact.png"  // แก้ไขเป็น path ของรูปภาพที่ถูกต้อง
              alt="Contact Us"
              width={400}  // ปรับขนาดรูปภาพให้เล็กลง
              height={400}  // ปรับขนาดรูปภาพให้เล็กลง
              className="rounded-lg"
            />
          </div>
        </div> 
      </div>
    </div>
  );
}
