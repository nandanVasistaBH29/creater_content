import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import "react-quill/dist/quill.snow.css";
import { io } from "socket.io-client";

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

const QuillNoSSRWrapper = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    // eslint-disable-next-line react/display-name
    return ({ forwardedRef, ...props }) => <RQ ref={forwardedRef} {...props} />;
  },
  { ssr: false }
);

const ScriptEditor = () => {
  const [socket, setSocket] = useState();
  const [value, setValue] = useState(); // State to store the editor content
  const quillRef = useRef(null); // Ref to access the Quill instance

  useEffect(() => {
    setSocket(io("http://localhost:3001"));

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("recieve-changes", (delta) => {
        console.log(delta);
        if (quillRef.current) {
          const editor = quillRef.current.getEditor();
          editor.updateContents(delta); // Apply the new content to the editor
          setValue(editor.getContents()); // Update the state to trigger a re-render
        }
      });
    }
  }, [socket]);

  //delta is all the small small changes made on the editor
  function handleChange(content, delta, source, editor) {
    if (source !== "user" || socket === null) return;
    socket.emit("send-changes", delta);
  }

  return (
    <div className="bg-yellow-50">
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
