import React, { useState, useEffect } from "react";
import axios from "axios";
import { BiLike, BiDislike } from "react-icons/bi";

function VideoPlayer({ video_id }) {
  const [videoData, setVideoData] = useState(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [videoVersion, setVideoVersion] = useState(
    "Select The desired Quality"
  );
  //non cloud streaming
  // const [videoSrc, setVideoSrc] = useState(
  //   `/api/videos/video?video_id=${video_id}`
  // );

  //cloud streaming
  const [videoSrc, setVideoSrc] = useState(
    `/api/videos/video-stream-s3?video_id=${video_id}_720p`
  );
  const [showOptions, setShowOptions] = useState(false);

  const handleToggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleSelectVersion = (version) => {
    setVideoVersion(version);
    setShowOptions(false);
    // setVideoSrc(`/api/videos/video?video_id=${video_id}__${version}`); non cloud
    setVideoSrc(`/api/videos/video-stream-s3?video_id=${video_id}_${version}`); // cloud
  };

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
      setDislikes(dislikes + 1);
      axios.put(`/api/videos/update-video-metadata?video_id=${video_id}`, {
        dis_likes: dislikes + (type === "dis_likes" ? 1 : 0),
      });
    }
  };
  return (
    <div className="flex flex-col justify-center items-center min-h-screen h-fit bg-gradient-to-br from-orange-500 to-yellow-400 p-4">
      {videoData ? (
        <div className="text-white text-center">
          <h2 className="text-4xl font-bold mb-4">{videoData.title}</h2>
        </div>
      ) : (
        <p className="text-white">Loading video data...</p>
      )}

      {videoSrc && (
        <video
          src={videoSrc}
          height="auto"
          controls
          autoPlay
          id="video-player"
          className="w-full max-w-full rounded-lg shadow-lg mt-4 "
        />
      )}

      <div className="video-player-options">
        <div className="options-toggle" onClick={handleToggleOptions}>
          Quality: {videoVersion}
        </div>
        {showOptions && (
          <div className="options-dropdown">
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold p-2 px-4 rounded-lg"
              onClick={() => handleSelectVersion("144p")}
            >
              144p
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 px-4 rounded-lg"
              onClick={() => handleSelectVersion("360p")}
            >
              360p
            </button>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold p-2 px-4 rounded-lg"
              onClick={() => handleSelectVersion("720p")}
            >
              720p
            </button>
          </div>
        )}
      </div>

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
              <BiLike size={24} />
            </button>
            <span className="text-lg text-white mx-2">{likes}</span>
            <button
              onClick={() => handleLikeDislike("dis_likes")}
              className="text-red-500 hover:text-red-600 mx-2"
            >
              <BiDislike size={24} />
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
