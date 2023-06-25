import { useState } from "react";
import axios from "axios";

const VideoUpload = () => {
  const [file, setFile] = useState();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit() {
    const data = new FormData();
    const user_id = localStorage.getItem("creater-content-user_id");
    if (!file || !user_id) return;
    setError(null);
    setSubmitting(true);

    data.append("file", file);

    const config = {
      onUploadProgress: function (progressEvent) {
        const percentComplete = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        setProgress(percentComplete);
      },
    };

    try {
      const res = await axios.post("/api/videos/video", data, config);
      // const obj = JSON.parse(res.data);
      console.log(res.data.video_id);
      if (res.data.video_id) {
        const res2 = await axios.post("/api/videos/add-video-metadata", {
          user_id,
          video_id: res.data.video_id,
          title,
          description,
        });
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
    <div className=" bg-gradient-to-r from-purple-500 to-blue-500 min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-white text-5xl">Upload Video</h1>
      <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg">
        {error && <p className="text-red-500">{error}</p>}
        {submitting && <p className="text-blue-500">{progress}%</p>}
        <form className="my-4">
          <div className="flex items-center mb-4">
            <label htmlFor="file" className="mr-2">
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
            <label htmlFor="title" className="mr-2">
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
            <label htmlFor="description" className="mr-2">
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
        </form>
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
        >
          Upload video
        </button>
      </div>
    </div>
  );
};

export default VideoUpload;
