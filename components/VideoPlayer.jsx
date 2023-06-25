import React, { useState, useEffect } from "react";
import axios from "axios";
import { BiSolidLike, BiSolidDislike } from "react-icons/bi";

function VideoPlayer({ video_id }) {
  const [videoData, setVideoData] = useState(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  useEffect(() => {
    const getMetaData = async () => {
      try {
        const res = await axios.get(
          `/api/videos/get-video-metadata?video_id=${video_id}`
        );
        console.log(res.data.data);
        setVideoData(res.data.data);
        setLikes(res.data.data.likes);
        setDislikes(res.data.data.dis_likes);
        const res2 = await axios.put(
          `/api/videos/update-video-metadata?video_id=${video_id}`,
          {
            view_count: res.data.data.view_count + 1,
          }
        );
      } catch (err) {
        console.error(err);
      }
    };
    getMetaData();
  }, [video_id]);
  const handleLikeDislike = async (type) => {
    if (type === "like") {
      setLikes(likes + 1);
      const res2 = await axios.put(
        `/api/videos/update-video-metadata?video_id=${video_id}`,
        {
          likes: likes + (type === "like" ? 1 : 0),
        }
      );
    } else if (type === "dis_likes") {
      const res2 = await setDislikes(dislikes + 1);
      axios.put(`/api/videos/update-video-metadata?video_id=${video_id}`, {
        dis_likes: dislikes + (type === "dis_likes" ? 1 : 0),
      });
    }
  };
  return (
    <div className="flex flex-col justify-center items-center h-fit bg-gradient-to-br from-orange-500 to-yellow-400 p-4">
      {videoData ? (
        <div className="text-white text-center">
          <h2 className="text-4xl font-bold mb-4">{videoData.title}</h2>
        </div>
      ) : (
        <p className="text-white">Loading video data...</p>
      )}

      <video
        src={`/api/videos/video?video_id=${video_id}`}
        width="800px"
        height="auto"
        controls
        autoPlay
        id="video-player"
        className="rounded-lg shadow-lg mt-4"
      />
      <div>
        {videoData && (
          <p className="text-lg text-white">{videoData.description}</p>
        )}
        <div className="flex text-white">
          <div className="mt-4 flex justify-center items-center">
            <button
              onClick={() => handleLikeDislike("like")}
              className="text-green-500 hover:text-green-600 mx-2"
            >
              <BiSolidLike size={24} />
            </button>
            <span className="text-lg text-white mx-2">{likes}</span>
            <button
              onClick={() => handleLikeDislike("dis_likes")}
              className="text-red-500 hover:text-red-600 mx-2"
            >
              <BiSolidDislike size={24} />
            </button>
            <span className="text-lg text-white mx-2">{dislikes}</span>
          </div>
          {videoData && (
            <p className="text-lg text-white mt-4">
              Views: {videoData.view_count}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
