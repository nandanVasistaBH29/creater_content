import dynamic from "next/dynamic";
import { useEffect, useState, useRef, useCallback } from "react";
import "react-quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useRouter } from "next/router";
import axios from "axios";

const SAVE_INTERVAL_MS = 10000;

const QuillNoSSRWrapper = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    // eslint-disable-next-line react/display-name
    return ({ forwardedRef, ...props }) => <RQ ref={forwardedRef} {...props} />;
  },
  { ssr: false }
);

const modules = {
  toolbar: [
    [
      { header: "1" },
      { header: "2" },
      { font: ["monospace", "sans-serif", "serif"] },
    ],
    [{ size: ["16px"] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    // ["link","image"], // CAN ADD "image"
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
};

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
];

const ScriptEditor = () => {
  const [socket, setSocket] = useState();
  const [value, setValue] = useState(); // State to store the editor content
  const quillRef = useRef(null); // Ref to access the Quill instance
  const router = useRouter();
  const [disable, setDisable] = useState(true);
  const [metaDocData, setMetaDocData] = useState({});
  const [user, setUser] = useState({});
  const { slug: doc_id } = router.query;
  if (doc_id === "") router.push("/scripts/dashboard");

  useEffect(() => {
    setSocket(io("http://localhost:3001"));
    checkUserAccess();
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);
  const checkUserAccess = async () => {
    try {
      const user_id = localStorage.getItem("creater-content-user_id");
      const res = await axios.get(
        "/api/scripts/get-doc-users?doc_id=" + doc_id
      );
      res.data.data.forEach((user) => {
        if (user.user_id === user_id) {
          setUser(user);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("recieve-changes", (delta) => {
        if (quillRef.current) {
          const editor = quillRef.current?.getEditor();
          if (editor) editor.updateContents(delta);
          setValue(editor.getContents());
        }
      });
    }
  }, [socket]);

  //delta is all the small small changes made on the editor
  function handleChange(content, delta, source, editor) {
    if (
      user.access == "-1" ||
      user.access == "1" ||
      source !== "user" ||
      socket === null
    )
      return;

    setValue(content);
    socket.emit("send-changes", delta);
  }
  const handleClick_Load = async () => {
    if (user.access === "-1") return;
    socket.emit("get-document", doc_id);
    socket.once("load-document", (document_content) => {});
    try {
      const res = await axios.post("/api/scripts/get-script", {
        doc_id,
      });
      if (res.data) {
        console.log(res.data.data);
        setMetaDocData(res.data.data);
        setDisable(false);
        setValue(res.data.data.content);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const saveDoc = useCallback(async () => {
    if (user.access == "-1" || user.access == "1" || socket === null) return;
    console.log("saving");
    socket.emit("save-document", value);
    try {
      const res = await axios.post("/api/scripts/save-or-create-script", {
        title: "",
        content: value,
        doc_id,
      });
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  }, [value, socket, user.access, doc_id]);
  //as we are using a continously saving the doc every 5seconds to avoid unnecessary
  //re-renders make using of useCallBackHook to wrap the saveDoc function
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveDoc();
    }, SAVE_INTERVAL_MS);

    // Clean up the interval when the component is unmounted
    return () => clearInterval(saveInterval);
  }, [value, saveDoc]);
  return (
    <div className="bg-yellow-50 p-4 rounded-lg shadow-md">
      <div>
        {user && user.access == "0" && (
          <p className="p-2 m-2 text-red-600 bg-orange-200 rounded-lg">
            Viewer : Only Read only any changes cant be saved
          </p>
        )}
        {user && user.access == "1" && (
          <p className="p-2 m-2 text-purple-600 bg-blue-50 rounded-lg">
            Editor : Read and Write ✅ but cant add new users to scripts
          </p>
        )}
        {user && user.access == "2" && (
          <p className="p-2 m-2 text-green-600 bg-green-50 rounded-lg">
            Owner : All Rights Reserved
          </p>
        )}
      </div>
      {!disable && (
        <QuillNoSSRWrapper
          modules={modules}
          formats={formats}
          theme="snow"
          forwardedRef={quillRef}
          value={value}
          onChange={handleChange}
          placeholder="create your main content"
        />
      )}
      <button
        onClick={handleClick_Load}
        className="bg-blue-600 text-white p-4 m-2 rounded-md"
      >
        Load the Previous Content
      </button>
      {(user.access == "2" || user.access == "1") && (
        <button
          onClick={saveDoc}
          className="bg-blue-600 text-white p-4 m-2 rounded-md"
        >
          Save Document
        </button>
      )}
    </div>
  );
};

export default ScriptEditor;
