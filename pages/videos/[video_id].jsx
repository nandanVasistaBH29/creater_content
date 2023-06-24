import VideoPlayer from "../../components/VideoPlayer";
import { useRouter } from "next/router";

function VideoPage() {
  const router = useRouter();
  const { video_id } = router.query;
  console.log(video_id);
  return (
    <>
      <VideoPlayer video_id={video_id} />
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
