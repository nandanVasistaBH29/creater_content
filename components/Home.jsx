/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState, useEffect } from "react";

const HomePage = () => {
  const [text, setText] = useState("");
  const originalText =
    "Start creating amazing content with us. Manage Teams.... Manage Videos.... Manage Scripts....  and much more all in one place.";

  useEffect(() => {
    let index = 0;
    const typeInterval = setInterval(() => {
      setText(originalText.slice(0, index));
      index++;
      if (index > originalText.length) {
        clearInterval(typeInterval);
      }
    }, 100);

    return () => {
      clearInterval(typeInterval);
    };
  }, []);

  return (
    <>
      <div className="h-screen bg-gradient-to-r from-teal-400 to-blue-500">
        <div className="container mx-auto py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to CREATER_CONTENT!
            </h1>
            <p className="text-lg text-white">{text}</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Manage Videos Section */}
            <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center">
              <Link href={"videos/add-video"}>
                <img
                  src="/video.svg"
                  alt="Video Illustration"
                  className="w-full h-48 object-contain mb-4"
                />
              </Link>
              <h2 className="text-xl font-semibold mb-2">Manage Videos</h2>
              <p className="text-gray-700">
                Upload, Generate Subtitles, and manage your videos all in one
                place.
              </p>
            </div>

            {/* Manage Teams Section */}
            <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center">
              <Link href={"teams/create-team"}>
                <img
                  src="/team.svg"
                  alt="Team Illustration"
                  className="w-full h-48 object-contain mb-4"
                />
              </Link>
              <h2 className="text-xl font-semibold mb-2">Manage Teams</h2>
              <p className="text-gray-700">
                Create and organize teams for your content creation projects.
              </p>
            </div>

            {/* Manage Scripts Section */}
            <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center">
              <Link href={"scripts/dashboard"}>
                <img
                  src="/script.svg"
                  alt="Script Illustration"
                  className="w-full h-48 object-contain mb-4"
                />
              </Link>
              <h2 className="text-xl font-semibold mb-2">Manage Scripts</h2>
              <p className="text-gray-700">
                Create, store, and organize scripts for your films.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
