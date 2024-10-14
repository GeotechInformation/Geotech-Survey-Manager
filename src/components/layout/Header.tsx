// Header tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useThemeContext } from "../providers/ThemeProvider";
import IconGeneral from "../icons/IconGeneral";

const Header = () => {
  const { isDarkTheme, toggleTheme } = useThemeContext();
  const pathname = usePathname();
  const pageName = pathname === '/' ? 'Survey Creator' : pathname === 'editor' ? 'Survey Editor' : 'Analysis';

  return (
    <header className="w-full py-4 px-8 flex flex-initial justify-between items-center">
      <Link href="/" className="flex gap-x-2 items-center">
        <Image src="/logo.png" alt="logo" width={40} height={40} />
        <p className="font-montserrat font-bold text-xl">Geotech</p>
      </Link>

      <h1 className="font-montserrat font-bold text-2xl">{pageName}</h1>

      <div className="flex gap-x-8 items-center">
        <Link href="/" className="font-medium text-xl hover:underline">Create</Link>
        <Link href="/editor" className="font-medium text-xl hover:underline">Edit</Link>
        <Link href="/prelim-analysis" className="font-medium text-xl hover:underline">Analysis</Link>

        <button type="button" onClick={toggleTheme} >
          <IconGeneral type="dark-light-mode" className="hover:fill-mb-pink hover:dark:fill-mb-yellow" />
        </button>
      </div>
    </header>
  );
};

export default Header;
