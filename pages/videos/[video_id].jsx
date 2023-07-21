import NavBar from "../../components/Navbar";
import VideoPlayer from "../../components/VideoPlayer";
import Comments from "../../components/Comments";
import { useRouter } from "next/router";

function VideoPage() {
  const router = useRouter();
  const { video_id } = router.query;
  return (
    <>
      <NavBar />
      {/* <VideoPlayer video_id={video_id} /> */}
      <Comments video_id={video_id} />
    </>
  );
}
export const getServerSideProps = async (context) => {
  return {
    props: {
      query: context.query,
    },
  };
};
export default VideoPage;
