"use client";

import { motion } from "framer-motion";
import {
  Film,
  BarChart2,
  TrendingUp,
  Star,
  Menu,
} from "lucide-react";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({
  activeView,
  setActiveView,
  isOpen,
  setIsOpen,
}: SidebarProps) {
  const navItems = [
    { id: "movies", label: "All Movies", icon: Film },
    { id: "charts", label: "Charts", icon: BarChart2 },
    { id: "trends", label: "Trends", icon: TrendingUp },
    { id: "insights", label: "Insights", icon: Star },
  ];

  return (
    <>
      <motion.div
        initial={false}
        animate={{ width: isOpen ? 256 : 80 }}
        className={`h-screen bg-[#121212] border-r border-gray-800 text-white flex flex-col fixed left-0 top-0 z-50 shadow-2xl overflow-hidden`}
      >
        <div className="p-6 flex items-center justify-between h-20 border-b border-gray-800/50">
          <div
            className={`flex items-center gap-3 ${
              !isOpen && "justify-center w-full"
            }`}
          >
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-8 h-8 bg-[#F5C518] rounded-lg flex items-center justify-center hover:bg-yellow-400 transition-colors"
            >
              <Menu className="text-black w-5 h-5" />
            </button>

            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-xl tracking-tight text-[#F5C518]"
              >
                MovieDash
              </motion.span>
            )}
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? "bg-[#F5C518] text-black font-semibold shadow-lg shadow-yellow-500/20"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                } ${!isOpen && "justify-center"}`}
                title={!isOpen ? item.label : undefined}
              >
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive
                      ? "text-black"
                      : "text-gray-400 group-hover:text-white"
                  }`}
                />
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
                {!isOpen && isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#F5C518] rounded-l-full" />
                )}
              </button>
            );
          })}
        </nav>
      </motion.div>
    </>
  );
}
