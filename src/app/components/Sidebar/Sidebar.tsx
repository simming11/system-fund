import Image from 'next/image';

const Sidebar = () => {
  return (
    <div className="w-full h-auto m-4 bg-[#fff36e] lg:w-[595px] lg:h-[647px] flex items-center justify-center">
      <Image 
        src="/images/government-scholarship-icon.png" 
        alt="Government Scholarship" 
        width={400} 
        height={900} 
        className="object-cover"
      />
    </div>
  );
};

export default Sidebar;
