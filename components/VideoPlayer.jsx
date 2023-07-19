import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  BiLike,
  BiDislike,
  BiPlay,
  BiPause,
  BiFastForward,
  BiRewind,
  BiFullscreen,
} from "react-icons/bi";
import { HiOutlineCollection, HiOutlineClock } from "react-icons/hi";
import { AiOutlineSetting } from "react-icons/ai";

function VideoPlayer({ video_id }) {
  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const videoOptions = [
    { label: "144p", value: "144p" },
    { label: "360p", value: "360p" },
    { label: "720p", value: "720p" },
  ];
  const [selectedVideoOption, setSelectedVideoOption] = useState(
    videoOptions[0]
  );
  const [videoData, setVideoData] = useState(null);
  const [likes, setLikes] = useState(0);
  const [videoSrc, setVideoSrc] = useState(
    `/api/videos/video-stream-s3?video_id=${video_id}_${selectedVideoOption.value}`
  );
  const [dislikes, setDislikes] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const handleTimeUpdate = () => {
      setCurrentTime(videoRef.current.currentTime);
    };

    videoRef.current.addEventListener("timeupdate", handleTimeUpdate);

    const getMetaData = async () => {
      try {
        const res = await axios.get(
          `/api/videos/get-video-metadata?video_id=${video_id}`
        );
        setVideoData(res.data.data);
        setLikes(res.data.data.likes);
        setDislikes(res.data.data.dis_likes);
      } catch (err) {
        console.error(err);
      }
    };
    getMetaData();
    return () => {
      videoRef.current.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [video_id]);

  const handleLikeDislike = async (type) => {
    if (type === "like") {
      setLikes((prevLikes) => prevLikes + 1);
    } else if (type === "dis_likes") {
      setDislikes((prevDislikes) => prevDislikes + 1);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleFastForward = () => {
    videoRef.current.currentTime += 10;
  };

  const handleRewind = () => {
    videoRef.current.currentTime -= 10;
  };

  const handleSeekStart = () => {
    setSeeking(true);
  };

  const handleSeekEnd = () => {
    setSeeking(false);
  };

  const handleSeekChange = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    handlePlayPause();
  };

  const handleSeekClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percent = x / width;
    const time = percent * videoRef.current.duration;
    setCurrentTime(time);
    videoRef.current.currentTime = time;
  };

  const handleVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    setVolume(volume);
    videoRef.current.volume = volume;
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    videoRef.current.playbackRate = rate;
  };

  const handleVideoOptionChange = (option) => {
    setSelectedVideoOption(option);
    videoRef.current.src = `/api/videos/video-stream-s3?video_id=${video_id}_${option.value}`;
    videoRef.current.load();
    handlePlayPause();
  };

  const handleFullScreen = () => {
    if (!isFullScreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.mozRequestFullScreen) {
        videoRef.current.mozRequestFullScreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    setIsFullScreen(!isFullScreen);
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
        <div className="video-wrapper relative w-full">
          <video
            ref={videoRef}
            src={videoSrc}
            height="auto"
            id="video-player"
            className="w-full max-w-full rounded-lg shadow-lg"
            onTimeUpdate={() => {
              if (!seeking) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
          />
          <div className="custom-controls absolute bottom-0 left-0 right-0 bg-orange-500 bg-opacity-70 py-2 px-4 flex flex-col items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center">
                <button onClick={handlePlayPause}>
                  {isPlaying ? <BiPause size={24} /> : <BiPlay size={24} />}
                </button>
                <button onClick={handleRewind}>
                  <BiRewind size={24} />
                </button>
                <button onClick={handleFastForward}>
                  <BiFastForward size={24} />
                </button>
              </div>
              <input
                type="range"
                min={0}
                max={videoRef.current?.duration}
                value={currentTime}
                onChange={handleSeekChange}
                onClick={handleSeekClick}
                onMouseDown={handleSeekStart}
                onMouseUp={handleSeekEnd}
                className="w-48 mx-4"
              />
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={handleVolumeChange}
                className="w-16"
              />
              <button onClick={handleFullScreen}>
                <BiFullscreen size={24} />
              </button>
              <div className="ml-4">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="text-white focus:outline-none"
                >
                  <AiOutlineSetting size={24} />
                </button>
                {showOptions && (
                  <div className="flex flex-col items-center mt-2">
                    <button className="text-white text-sm mb-1">
                      <HiOutlineCollection
                        size={16}
                        className="inline-block mr-2"
                      />
                      Quality
                    </button>
                    {videoOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleVideoOptionChange(option)}
                        className={`${
                          selectedVideoOption === option
                            ? "text-blue-500"
                            : "text-white"
                        } text-sm mb-1`}
                      >
                        {option.label}
                      </button>
                    ))}
                    <button className="text-white text-sm mb-1">
                      <HiOutlineClock size={16} className="inline-block mr-2" />
                      Speed
                    </button>
                    {playbackRates.map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handlePlaybackRateChange(rate)}
                        className={`${
                          playbackRate === rate ? "text-blue-500" : "text-white"
                        } text-sm mb-1`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        {videoData && (
          <p className="text-lg text-white">{videoData.description}</p>
        )}
        <div className="flex text-white mt-4">
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
