import { useState } from "react";
import axios from "axios";
import { FiUploadCloud, FiCheckCircle } from "react-icons/fi";
import Link from "next/link";

const VideoUpload = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUploaded, setVideoUploaded] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  async function handleSubmit() {
    if (!file || !title || !description) return;
    setVideoUploaded(false);
    setError(null);
    setProgress(0);
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
        "/api/videos/upload-video-multiple-version-s3",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          ...config,
        }
      );

      if (res.data.video_id) {
        const user_id = localStorage.getItem("creater-content-user_id");
        const res2 = await axios.post("/api/videos/add-video-metadata", {
          user_id,
          video_id: res.data.video_id,
          title,
          description,
        });
        setVideoUploaded(true);
        console.log(res2);
        setTimeout(() => {
          setUploadComplete(true);
        }, 2000);
      }
    } catch (e) {
      setError("Failed to upload video. Please try again.");
    } finally {
      setSubmitting(false);
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
      <h1 className="text-white text-5xl mb-8">Upload Video</h1>
      <div className="container mx-auto p-8 bg-white rounded-lg shadow-lg">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {!videoUploaded && !uploadComplete && (
          <form className="my-4">
            <div className="flex items-center mb-4">
              <label htmlFor="file" className="mr-2 text-teal-500">
                <FiUploadCloud className="w-8 h-8" />
              </label>
              <input
                type="file"
                id="file"
                accept=".mp4"
                onChange={handleSetFile}
                className="py-2 px-4 border rounded"
              />
            </div>
            <div className="flex items-center mb-4">
              <label htmlFor="title" className="mr-2 text-teal-500">
                Title
              </label>
              <input
                type="text"
                id="title"
                placeholder="Title"
                value={title}
                maxLength={45}
                onChange={(e) => setTitle(e.target.value)}
                className="py-2 px-4 border rounded"
              />
            </div>
            <div className="flex items-center mb-4">
              <label htmlFor="description" className="mr-2 text-teal-500">
                Description
              </label>
              <textarea
                id="description"
                placeholder="Description"
                value={description}
                maxLength={250}
                onChange={(e) => setDescription(e.target.value)}
                className="py-2 px-4 border rounded"
              />
            </div>
            {progress !== 0 && (
              <p className="text-teal-500 mt-2 text-xs text-center">
                Uploading: {progress}%
              </p>
            )}
            <button
              onClick={handleSubmit}
              className="bg-teal-500 text-white py-2 px-4 rounded mt-4 hover:bg-teal-600"
              disabled={!file || !title || !description || submitting}
            >
              {submitting ? "Uploading..." : "Upload Video"}
            </button>
          </form>
        )}
        {videoUploaded && !uploadComplete && (
          <div className="relative mb-4">
            <div className="h-2 bg-gray-300 rounded-full">
              <div
                className="h-2 bg-teal-500 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-teal-500 mt-2 text-xs text-center">
              Uploading: {progress}%
            </p>
          </div>
        )}
        {uploadComplete && (
          <div className="flex flex-col items-center">
            <FiCheckCircle className="text-green-500 w-16 h-16" />
            <p className="text-green-500 text-2xl my-4">
              Video uploaded successfully!
            </p>
            <p className="text-xl text-center mb-4">Audio extraction</p>
            <p className="text-xl text-center mb-4">Subtitle generation</p>
            <p className="text-xl text-center mb-4">
              Converting video into multiple versions
            </p>
            <Link href="/mail">
              <div className="bg-teal-500 text-white py-2 px-4 rounded mt-4 hover:bg-teal-600">
                Mail To Team Members
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUpload;
