import axios from "axios";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import NavBar from "../../components/Navbar";
import Image from "next/image";

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const fetchData = async () => {
    try {
      const user_id = localStorage.getItem("creater-content-user_id");
      if (!user_id) return;

      const res = await axios.get(
        `/api/videos/get-video-of-user?user_id=${user_id}`
      );

      return res.data.videos;
    } catch (err) {
      console.log(err);
    }
  };

  const cachedVideos = useMemo(async () => {
    const data = await fetchData();
    return data;
  }, []);

  useEffect(() => {
    cachedVideos.then((data) => {
      setVideos(data);
    });
  }, [cachedVideos]);
  return (
    <>
      <NavBar />
      <div className="flex flex-wrap justify-center">
        {videos !== [] &&
          videos.map((video) => (
            <div
              key={video.video_id}
              className="p-1 m-2 bg-white shadow-lg text-orange-400 rounded-md w-full sm:w-1 md:w-1/2 lg:w-1/3 mb-4"
            >
              <Link href={`/videos/${video.video_id}`}>
                <div className="mb-4 aspect-w-16 aspect-h-9 flex justify-center items-center">
                  <img
                    src={`/api/thumbnails/get-thumbnail?video_id=${video.video_id}`}
                    className="rounded-lg shadow-lg mt-4 h-80 w-full"
                    alt="thumbnail of the video "
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-center sm:text-left leading-6 h-24 overflow-hidden">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {video.description.substring(0, 30)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Views: {video.view_count} | Likes: {video.likes} | Dislikes:{" "}
                    {video.dis_likes}
                  </p>
                </div>
              </Link>
            </div>
          ))}
      </div>
    </>
  );
};

export default VideoList;
