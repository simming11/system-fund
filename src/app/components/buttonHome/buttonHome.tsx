import { HomeIcon } from '@heroicons/react/24/solid'; // Correct import path
import { useRouter } from 'next/navigation';

const ButtonHome = () => {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/page/management');
  };

  return (
    <button onClick={handleNavigate} className="flex items-center mb-2">
      <HomeIcon className="h-8 w-8" /> {/* Icon size adjustment */}
    </button>
  );
};

export default ButtonHome;
