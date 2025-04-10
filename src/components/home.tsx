import React from "react";
import { useNavigate } from "react-router-dom";
import AppTabs from "./AppTabs";
import { logout, getCurrentUser } from "../services/auth";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="container px-3 sm:px-4 py-3 sm:py-4 mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex-1"></div>
            <div className="flex-grow text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600">
                Berkah Jaya Transport
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Sistem Manajemen Keuangan
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-xs sm:text-sm flex items-center gap-1 text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-2 sm:px-4 py-3 sm:py-4 mx-auto mb-16 sm:mb-20">
        <AppTabs />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 py-2 sm:py-3 bg-white border-t border-gray-200">
        <div className="container px-3 sm:px-4 mx-auto">
          <p className="text-xs text-center text-gray-500">
            &copy; {new Date().getFullYear()} Berkah Jaya Transport. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
