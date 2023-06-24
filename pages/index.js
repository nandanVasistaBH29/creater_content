import { Inter } from "next/font/google";
import VideoUpload from "../components/VideoUpload";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main>
      <VideoUpload />
    </main>
  );
}
