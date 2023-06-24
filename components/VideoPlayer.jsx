function VideoPlayer({ video_id }) {
  return (
    <video
      src={`/api/videos/video?video_id=${video_id}`}
      width="800px"
      height="auto"
      controls
      autoPlay
      id="video-player"
    />
  );
}
export default VideoPlayer;
