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
  {/* QR Code Section */}
  <div className="flex flex-col items-center lg:w-2/5 bg-white rounded-lg shadow-lg p-6">
    <Image
      src="/images/line.jpg"  // Path to the QR code image
      alt="QR Code"
      width={200}  // Resize the QR code to make it smaller
      height={200}  // Resize the QR code to make it smaller
      className="rounded-lg mb-4"
    />
    <p className="text-blue-600 text-lg font-bold">เข้าร่วมกลุ่มนี้เพื่อรับข่าวสาร</p>
  </div>

  {/* Contact Info Section */}
  <div className="text-center lg:text-left lg:w-2/5">
    <h1 className="text-3xl font-extrabold text-blue-800 mb-4">
      ติดต่อเรา
    </h1>
    <p className="text-lg text-gray-700 mb-4">
      ฐาปกรณ์ กลุ่มไหม & ชนิกานต์ แวงโสธรณ์
      <br />
      คณะวิทยาศาสตร์และนวัตกรรมดิจิทัล มหาวิทยาลัยทักษิณ
    </p>
    <p className="text-gray-600 text-lg">
      ติดต่อเพิ่มเติมผ่านทาง: <br />
      <span className="block mt-2">Thapakon.K@tsu.ac.th : 0977246630</span>
      <span className="block">Chanikan.W@tsu.ac.th : 0956147976</span>
    </p>

    {/* Facebook Link */}
    <p className="text-blue-600 mt-4">
      <Link href="https://www.facebook.com/scidi.tsu" target="_blank" rel="noopener noreferrer">
        Facebook: www.facebook.com/scidi.tsu
      </Link>
    </p>
  </div>

  {/* Contact Image Section */}
  <div className="flex items-center justify-center lg:w-2/5">
    <div className="bg-white rounded-lg shadow-lg p-6">
      <Image
        src="/images/contact.png"  // Path to the contact image
        alt="Contact Us"
        width={400}  // Resize the image
        height={400}  // Resize the image
        className="rounded-lg"
      />
    </div>
  </div>
</div>

    </div>
  );
}
