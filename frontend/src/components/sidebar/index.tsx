import { useAppDispatch, useAppSelector } from "@/redux";
import { setIsSidebarCollapsed } from "@/state";
import {
  Layout,
  Menu,
  Rabbit,
  Activity,
  Weight,
  HeartPulse,
  Boxes,
} from "lucide-react";
import SidebarLink from "./links";

function Sidebar() {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const dispatch = useAppDispatch();

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  return (
    <div
      className={`fixed flex flex-col h-full ${isSidebarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"} shadow-md rounded-tr-2xl rounded-br-2xl overflow-hidden bg-sidebar z-40 transition-all duration-300`}
    >
      {/* TOP SECTION */}
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${isSidebarCollapsed ? "px-5" : "px-8"} `}
      >
        <div>P</div>

        <h1
          className={`font-extrabold text-2xl ${isSidebarCollapsed ? "hidden" : "block"}`}
        >
          Polaris
        </h1>

        <button
          onClick={() => toggleSidebar()}
          type="button"
          className="md:hidden p-3 bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
        >
          <Menu className="w-5 h-5" size={24} />
        </button>
      </div>
      {/* MID SECTION */}
      <div className="flex-grow mt-8">
        {/* Links */}
        <SidebarLink
          href="/dashboard"
          isSidebarCollapsed={isSidebarCollapsed}
          icon={Layout}
          label="Dashboard"
        />
        <SidebarLink
          href="/breeds"
          isSidebarCollapsed={isSidebarCollapsed}
          icon={Rabbit}
          label="Breeds"
        />
        <SidebarLink
          href="/livestock"
          isSidebarCollapsed={isSidebarCollapsed}
          icon={Activity}
          label="Livestock"
        />
        <SidebarLink
          href="/production-records"
          isSidebarCollapsed={isSidebarCollapsed}
          icon={Boxes}
          label="Production Records"
        />
        <SidebarLink
          href="/weight-records"
          isSidebarCollapsed={isSidebarCollapsed}
          icon={Weight}
          label="Weight Records"
        />
        <SidebarLink
          href="/health-records"
          isSidebarCollapsed={isSidebarCollapsed}
          icon={HeartPulse}
          label="Health Records"
        />
      </div>

      {/* FOOTER SECTION */}
      <div className={`${isSidebarCollapsed ? "hidden" : "block"}  mb-10`}>
        <p className="text-center text-xs">
          &copy; {new Date().getFullYear()} Polaris
        </p>
      </div>
    </div>
  );
}

export default Sidebar;
