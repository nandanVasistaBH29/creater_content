import Link from "next/link";

const NavBar = () => {
  return (
    <nav className="bg-gradient-to-r from-teal-400 to-blue-500 py-4 h-10 flex justify-center items-center p-2 ">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl font-bold">
          <Link href="/">CREATER_CONTENT</Link>
        </div>
        <div className="space-x-4 flex">
          <Link href="/videos/add-video">
            <div className="text-white hover:text-gray-300">Add Video</div>
          </Link>
          <Link href="/videos/list-videos">
            <div className="text-white hover:text-gray-300">List Videos</div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
