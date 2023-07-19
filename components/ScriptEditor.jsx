import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import "react-quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useRouter } from "next/router";

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
      socket.emit("get-document", doc_id);
      loadTheDoc(socket);
      socket.on("recieve-changes", (delta) => {
        if (quillRef.current) {
          const editor = quillRef.current?.getEditor();
          if (editor) editor.updateContents(delta);
          setValue(editor.getContents());
        }
      });
    }
  }, [socket]);
  const loadTheDoc = async (socket) => {
    await socket.once("load-document", (document) => {
      console.log(document);
      setDisable(false);
      const editor = quillRef.current?.getEditor();
      console.log(editor);
      if (editor) editor.updateContents(document); // Apply the new content to the editor
    });
  };
  //delta is all the small small changes made on the editor
  function handleChange(content, delta, source, editor) {
    if (source !== "user" || socket === null) return;
    socket.emit("send-changes", delta);
  }

  return (
    <div className="bg-yellow-50 p-4 rounded-lg shadow-md">
      <QuillNoSSRWrapper
        modules={modules}
        formats={formats}
        theme="snow"
        forwardedRef={quillRef}
        value={value}
        onChange={handleChange}
        placeholder="create your main content"
      />
    </div>
  );
};

export default ScriptEditor;
