import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import "react-quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useRouter } from "next/router";
import axios from "axios";

const SAVE_INTERVAL_MS = 2000;

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
  const { slug: doc_id } = router.query;
  if (doc_id === "") router.push("/scripts/dashboard");

  useEffect(() => {
    setSocket(io("http://localhost:3001"));

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

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
    if (source !== "user" || socket === null) return;

    setValue(content);
    socket.emit("send-changes", delta);
  }
  const handleClick_Load = async () => {
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
  const saveDoc = async () => {
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
  };

  return (
    <div className="bg-yellow-50 p-4 rounded-lg shadow-md">
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
      <button
        onClick={saveDoc}
        className="bg-blue-600 text-white p-4 m-2 rounded-md"
      >
        Save Document
      </button>
    </div>
  );
};

export default ScriptEditor;
