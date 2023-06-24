import React, { useState, useEffect } from "react";
import axios from "axios";

function VideoPlayer({ video_id }) {
  const [videoData, setVideoData] = useState(null);
  useEffect(() => {
    const getMetaData = async () => {
      try {
        const res = await axios.get(
          `/api/videos/get-video-metadata?video_id=${video_id}`
        );
        console.log(res.data.title);
        setVideoData(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    getMetaData();
  }, [video_id]);
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-orange-500 to-yellow-400">
      {videoData ? (
        <div className="text-white text-center">
          <h2 className="text-4xl font-bold mb-4">{videoData.title}</h2>
          <p className="text-lg">{videoData.description}</p>
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
    </div>
  );
}

export default VideoPlayer;
