import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";

const VideoUpload = () => {
  const [file, setFile] = useState();
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUploaded, setVideoUploaded] = useState(false);
  const router = useRouter();
  async function handleSubmit() {
    const user_id = localStorage.getItem("creater-content-user_id");
    if (!file || !user_id || !title || !description) return;
    setVideoUploaded(false);
    setError(null);
    setProgress(null);
    setSubmitting(true);

    const formData = new FormData();
    formData.append("video", file);

    const config = {
      onUploadProgress: function (progressEvent) {
        const percentComplete = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        setProgress(percentComplete);
      },
    };

    try {
      const res = await axios.post(
        "/api/videos/upload-video-multiple-version",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          ...config,
        }
      );
      setProgress("Updating meta data please wait");
      console.log(res);
      if (res.data.video_id) {
        const res2 = await axios.post("/api/videos/add-video-metadata", {
          user_id,
          video_id: res.data.video_id,
          title,
          description,
        });
        setProgress("done");
        setVideoUploaded(true);
        console.log(res2);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
      setProgress(0);
    }
  }

  function handleSetFile(event) {
    const files = event.target.files;
    if (files?.length) {
      setFile(files[0]);
    }
  }

  return (
    <div className="bg-gradient-to-r from-teal-400 to-blue-500 min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-white text-5xl">Upload Video</h1>
      <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg">
        {error && <p className="text-red-500">{error}</p>}
        {submitting && <p className="text-blue-500">{progress}%</p>}
        <form className="my-4">
          <div className="flex items-center mb-4">
            <label htmlFor="file" className="mr-2 text-teal-500">
              File
            </label>
            <input
              type="file"
              id="file"
              accept=".mp4"
              onChange={handleSetFile}
              className="py-1 px-2 border rounded"
            />
          </div>
          <div className="flex items-center mb-4">
            <label htmlFor="title" className="mr-2 text-teal-500">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              maxLength={45}
              onChange={(e) => setTitle(e.target.value)}
              className="py-1 px-2 border rounded"
            />
          </div>
          <div className="flex items-center mb-4">
            <label htmlFor="description" className="mr-2 text-teal-500">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              maxLength={250}
              onChange={(e) => setDescription(e.target.value)}
              className="py-1 px-2 border rounded"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="bg-teal-500 text-white py-2 px-4 rounded mt-4 hover:bg-teal-600"
            disabled={
              !file || !title || !description || submitting || submitting
            }
          >
            {submitting ? "Uploading..." : "Upload Video"}
          </button>
          <br />
          <br />

          {videoUploaded && (
            <>
              <Link
                className="bg-teal-500 text-white py-2 px-4 rounded mt-4
              hover:bg-teal-600"
                href={"/mail"}
              >
                Mail To Team Members
              </Link>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default VideoUpload;
