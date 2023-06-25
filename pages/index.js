import { Inter } from "next/font/google";
import VideoUpload from "../components/VideoUpload";
import NavBar from "../components/Navbar";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main>
      <NavBar />
      <VideoUpload />
    </main>
  );
}
