import dynamic from "next/dynamic";
import { useEffect, useState, useRef, useCallback, memo } from "react";
import "react-quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useRouter } from "next/router";
import { MdSaveAlt } from "react-icons/md";
import { AiOutlineReload } from "react-icons/ai";
import axios from "axios";

const SAVE_INTERVAL_MS = 10000;
const SOCKET_URL = "http://localhost:3001";
const RESTRICTED = "-1";
const READ_ONLY = "0";
const READ_WRITE = "1";
const OWNER = "2";

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
  const [socket, setSocket] = useState(null);
  const [value, setValue] = useState("");
  const quillRef = useRef(null);
  const router = useRouter();
  const [disable, setDisable] = useState(true);
  const [user, setUser] = useState({});
  const [saving, setSaving] = useState(false); // New state for saving animation

  const { slug: doc_id } = router.query;
  const { title } = router.query;

  useEffect(() => {
    setSocket(io(SOCKET_URL));
    checkUserAccess();
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

  const checkUserAccess = async () => {
    try {
      const user_id = localStorage.getItem("creater-content-user_id");
      const res = await axios.get(
        "/api/scripts/get-doc-users?doc_id=" + doc_id
      );
      const foundUser = res.data.data.find((user) => user.user_id === user_id);
      if (foundUser) {
        setUser(foundUser);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = useCallback(
    (content, delta, source, editor) => {
      if (
        user.access === READ_ONLY ||
        user.access === RESTRICTED ||
        source !== "user" ||
        !socket
      ) {
        return;
      }
      setValue(content);
      socket.emit("send-changes", delta);
    },
    [socket, user.access]
  );

  const handleClick_Load = useCallback(async () => {
    if (user.access === READ_ONLY) {
      return;
    }
    socket.emit("get-document", doc_id);
    socket.once("load-document", (document_content) => {});
    try {
      const res = await axios.post("/api/scripts/get-script", { doc_id });
      if (res.data) {
        const { content } = res.data.data;
        setDisable(false);
        setValue(content);
      }
    } catch (err) {
      console.log(err);
    }
  }, [doc_id, socket, user.access]);

  const saveDoc = useCallback(async () => {
    console.log("saving");
    if (user.access === READ_ONLY || user.access === RESTRICTED || !socket) {
      return;
    }
    setSaving(true); // Show loading spinner during the save process
    socket.emit("save-document", value);
    try {
      const res = await axios.post("/api/scripts/save-or-create-script", {
        content: value,
        doc_id,
      });
      console.log(res);
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false); // Hide loading spinner after saving is complete
    }
  }, [socket, user.access, value, doc_id]);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveDoc();
    }, SAVE_INTERVAL_MS);

    return () => clearInterval(saveInterval);
  }, [value, saveDoc]);

  return (
    <div className="bg-yellow-50 p-4 rounded-lg shadow-md">
      <h1 className="text-3xl underline text-orange-400">{title}</h1>
      <div>
        {user && user.access === READ_ONLY && (
          <p className="p-2 m-2 text-red-600 bg-orange-200 rounded-lg">
            Viewer: Only Read only any changes cant be saved
          </p>
        )}
        {user && user.access === READ_WRITE && (
          <p className="p-2 m-2 text-purple-600 bg-blue-50 rounded-lg">
            Editor: Read and Write ✅ but cant add new users to scripts
          </p>
        )}
        {user && user.access === OWNER && (
          <p className="p-2 m-2 text-green-600 bg-green-50 rounded-lg">
            Owner: All Rights Reserved
          </p>
        )}
      </div>
      <div className="mb-2 text-sm text-gray-600"></div>
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
        className="bg-blue-600 text-white p-4 mx-2  my-4 rounded-md text-xl"
      >
        <div className="flex items-center justify-center">
          <AiOutlineReload />
          <span>Load</span>
        </div>
      </button>
      {(user.access === OWNER || user.access === READ_WRITE) && (
        <button
          onClick={saveDoc}
          className="bg-blue-600 text-white p-4 m-2 rounded-md"
          disabled={saving}
        >
          {saving ? (
            "Saving..."
          ) : (
            <div className="flex justify-center items-center">
              <MdSaveAlt /> <span className="px-2 text-lg">save</span>{" "}
            </div>
          )}
        </button>
      )}
    </div>
  );
};

export default memo(ScriptEditor);
