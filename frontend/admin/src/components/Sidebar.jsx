import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <HomeIcon className="h-5 w-5" /> },
    { name: "Utilisateurs", path: "/users", icon: <UsersIcon className="h-5 w-5" /> },
    { name: "Restaurants", path: "/restaurants", icon: <BuildingStorefrontIcon className="h-5 w-5" /> },
    { name: "Livreurs", path: "/deliverers", icon: <TruckIcon className="h-5 w-5" /> },
    { name: "Commandes", path: "/orders", icon: <ClipboardDocumentListIcon className="h-5 w-5" /> },
    { name: "Litiges", path: "/disputes", icon: <ExclamationTriangleIcon className="h-5 w-5" /> },
    { name: "Analytics", path: "/analytics", icon: <ChartBarIcon className="h-5 w-5" /> },
  ];

  return (
    <div
      className={`${
        open ? "w-64" : "w-20"
      } bg-white shadow-lg border-r transition-all duration-300 flex flex-col`}
    >
      {/* HEADER SIDEBAR */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <span className="font-bold text-xl text-indigo-600">
          {open ? "Admin" : "A"}
        </span>

        <button
          className="md:hidden block"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <XMarkIcon className="h-6 w-6 text-gray-700" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
              ${isActive
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-200"
              }
              `
            }
          >
            {item.icon}
            {open && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
