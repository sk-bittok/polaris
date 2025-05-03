import { useAppDispatch, useAppSelector } from "@/redux";
import { setIsSidebarCollapsed } from "@/state";
import { Bell, Menu, Settings } from "lucide-react";
import { ThemeToggler } from "./theme-toggler";
import Image from "next/image";
import Link from "next/link";


function Navbar() {
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const dispatch = useAppDispatch();

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  }

  return (
    <div className="w-full mb-7 flex justify-between items-center ">
      {/* LEFT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <button className="bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-blue-200 p-3 dark:hover:bg-blue-800" type="button" onClick={toggleSidebar} >
          <Menu size={24} className="w-5 h-5" />
        </button>

        <div className="relative">
          <input className="pl-10 pr-4 py-2 w-70 md:w-80 lg:w-100 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black rounded-lg focus:outline-none focus:border-blue-200 dark:focus:border-blue-800" type="search" placeholder="Search livestock and records..." />

          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Bell size={20} />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-between gap-5">
        <div className="hidden md:flex items-center justify-between gap-5">
          <div>
            <ThemeToggler />
          </div>

          <div className="relative">
            <Bell className="cursor-pointer text-gray-500 size={24" />
            <span className="absolute -top-2 -right-2 inline-flex items-center py-1 px-[0.4rem] text-xs font-semibold leading-none text-red-100 bg-red-400 dark:text-red-900 dark:bg-red-600 rounded-full">
              4
            </span>
          </div>

          <hr className="w-0 h-7 border border-solid border-l border-gray-300 dark:border-gray-700 mx-3" />

          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-6 h-6 rounded-full overflow-hidden relative">
              <Image
                src="globe.svg"
                alt={"User avatar"}
                layout="fill"
                objectFit="cover"
              />
            </div>
          </div>
        </div>

        <Link href="#">
          <Settings className="cursor-pointer text-gray-500" size={24} />
        </Link>
      </div>
    </div>
  )
}

export default Navbar;
