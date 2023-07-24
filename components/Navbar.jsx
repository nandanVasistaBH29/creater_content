import Link from "next/link";
import { useState } from "react";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-teal-500 to-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center relative">
        <div className="text-white text-xl font-bold">
          <Link href="/">CREATER_CONTENT</Link>
        </div>

        {/* Hamburger Icon */}
        <div className="md:hidden flex items-center">
          <button
            onClick={handleMenuToggle}
            className="text-white mx-2 focus:outline-none"
          >
            <div
              className={`w-6 h-1 bg-white mb-1 ${
                isOpen ? "rotate-45 absolute -mt-1" : ""
              }`}
            />
            <div
              className={`w-6 h-1 bg-white mb-1 ${isOpen ? "opacity-0" : ""}`}
            />
            <div
              className={`w-6 h-1 bg-white mb-1 ${
                isOpen ? "-rotate-45 absolute mt-1" : ""
              }`}
            />
          </button>
        </div>

        <div
          className={`md:flex space-x-4 ${
            isOpen ? "block" : "hidden"
          } mt-4 md:mt-0 md:space-y-0 absolute md:relative top-full md:top-auto left-0 right-0 bg-gradient-to-r from-teal-500 to-blue-600 p-4`}
        >
          <Link href="/videos/add-video">
            <div className="text-white hover:text-gray-300">Add Video</div>
          </Link>
          <Link href="/videos/list-videos">
            <div className="text-white hover:text-gray-300">List Videos</div>
          </Link>
          <Link href="/scripts/dashboard">
            <div className="text-white hover:text-gray-300">
              Script DashBoard
            </div>
          </Link>
          <Link href="/teams/create-team">
            <div className="text-white hover:text-gray-300">Create Team</div>
          </Link>
          <Link href="/auth/get-otp">
            <div className="text-white hover:text-gray-300">Register User</div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
