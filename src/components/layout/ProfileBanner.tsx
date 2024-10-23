// Profile Banner tsx

import { getUserValue } from "@/services";
import { useEffect, useRef, useState } from "react";
import IconGeneral from "../icons/IconGeneral";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { firebaseApp } from "@/firebaseConfig";
import { useThemeContext } from "../providers/ThemeProvider";

interface ProfileBannerProps {
  uid: string;
  onClose: () => void;
}

const ProfileBanner: React.FC<ProfileBannerProps> = ({ uid, onClose }) => {
  const { toggleTheme } = useThemeContext();
  const innerDivRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState<string>('');
  const [userAdmin, setUserAdmin] = useState<boolean>(false);
  const router = useRouter();

  /**
   * Handle Logout
   */
  async function handleLogout() {
    try {
      await signOut(getAuth(firebaseApp));
      await fetch("/api/logout");
      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Create event listerner for mouse clicks in modal menu
   */
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (innerDivRef.current && !innerDivRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEsc);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  /**
   * Fetch User Data
   */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const name = await getUserValue(uid, 'userName')
        setUserName(name);

        const isAdmin = await getUserValue(uid, 'admin');
        setUserAdmin(isAdmin);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserData();
  }, [uid]);






  return (
    <div ref={innerDivRef}>

      <div className="flex justify-between items-center">
        {userName.length > 0 ? (
          <p className="font-medium">{userName}</p>
        ) : (
          <p>Loading User</p>
        )}
        <div onClick={onClose} className="hover:bg-hsl-l90 hover:dark:bg-hsl-l20 rounded-sm cursor-pointer">
          <IconGeneral type="close" className="fill-hsl-l30 dark:fill-hsl-l70" />
        </div>
      </div>

      <div className="border-b border-hsl-l50 my-4"></div>


      <div onClick={toggleTheme} className="cursor-pointer hover:bg-hsl-l90 hover:dark:bg-hsl-l20 px-2 py-1 my-4 flex items-center gap-2 rounded-md">
        <IconGeneral type='dark-light-mode' className="fill-hsl-l30 dark:fill-hsl-l70" />
        <p className="font-medium text-hsl-l30 dark:text-hsl-l70">Toggle Darkmode</p>
      </div>


      <button type="button" onClick={handleLogout}
        className=" hover:bg-hsl-l90 hover:dark:bg-hsl-l20 px-2 py-1 my-4 flex items-center gap-2 rounded-md w-full">
        <IconGeneral type="logout" className="fill-hsl-l30 dark:fill-hsl-l70" />
        <p className="font-medium text-hsl-l30 dark:text-hsl-l70">Sign Out</p>
      </button>
    </div>
  );
};

export default ProfileBanner;