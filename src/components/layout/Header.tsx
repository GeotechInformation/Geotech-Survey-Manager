// Header tsx

"use client";

import ReactDOM from 'react-dom';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import IconGeneral from "../icons/IconGeneral";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../providers/AuthProvider";

const DynamicProfileBanner = dynamic(() => import('./ProfileBanner'), { loading: () => <></>, })

const pageNames: { [key: string]: string } = {
  '/': 'Survey Creator',
  '/prelim-analysis': 'Analysis',
  '/admin': 'Admin Console'
};

const Header = () => {
  const pathname = usePathname();
  const pageName = pageNames[pathname] || 'Unkown page?';

  const { user, loading } = useAuth();
  const [isProfileBannerVisible, setIsProfileBannerVisible] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);

  /**
   * Enforce document availible for profile banner
   */
  useEffect(() => {
    setIsClient(true);
  }, []);

  /**
   * Render Profile Banner (with animations)
   * @returns 
   */
  const renderProfileBanner = () => (
    <AnimatePresence>
      {isProfileBannerVisible && user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 right-0 w-[100vw] h-[100vh] bg-black bg-opacity-50 flex flex-col justify-center items-center z-50"
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-hsl-l95 dark:bg-hsl-l15 rounded-tl-lg rounded-bl-lg flex flex-col fixed right-0 top-0 bottom-0 px-4 py-8 w-[80%] mb:max-w-[350px]"
          >
            <DynamicProfileBanner onClose={() => setIsProfileBannerVisible(false)} uid={user.uid} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <header className="w-full mt-2 py-3 px-8 flex flex-initial justify-between items-center">
      <Link href="/" className="w-[150px] max-h-[50px] relative">
        <img src="/geotech-info-services.png" alt="Geotech Logo" className="w-full h-full object-contain" />
      </Link>

      <h1 className="font-montserrat font-semibold text-2xl">{pageName}</h1>

      <div className="flex gap-x-8 items-center">
        <Link href="/" className={`text-xl hover:underline px-8 p-1 rounded-md
          ${pathname === '/' && "shadow bg-[length:200%_200%] animate-gradientShift bg-gradient-to-tr from-cyan-400 via-purple-400 to-red-500 text-white"}`}
        >Create</Link>
        <Link href="/prelim-analysis" className={`text-xl hover:underline px-8 p-1 rounded-md
          ${pathname === '/prelim-analysis' && "shadow bg-[length:200%_200%] animate-gradientShift bg-gradient-to-tr from-cyan-400 via-purple-400 to-red-500 text-white"}`}
        >Analysis</Link>

        {loading ? null : (
          !user ? (
            <Link href="/login" className="">Sign In</Link>
          ) : (
            <div className="cursor-pointer flex-shrink-0" onClick={() => setIsProfileBannerVisible(true)} title="Profile">
              <IconGeneral type="profile" className="hover:fill-mb-pink hover:dark:fill-mb-yellow" size={28} />
            </div>
          )
        )}
      </div>

      {isClient && ReactDOM.createPortal(renderProfileBanner(), document.body)}
    </header>
  );
};

export default Header;
