import { v4 as uuid } from "uuid";
import { useRouter } from "next/router";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";

const Script = () => {
  const [newScriptName, setNewScriptName] = useState("");
  const [listOfScripts, setListOfScripts] = useState([]);
  const [showOldScripts, setShowOldScripts] = useState(false);
  const router = useRouter();

  const createNewDoc = async (e) => {
    if (newScriptName === "") return;
    const doc_id = uuid();
    e.preventDefault();
    const user_id = localStorage.getItem("creater-content-user_id");
    if (!user_id) router.push("/auth/get-otp-login");
    try {
      console.log(newScriptName);
      const res = await axios.post("/api/scripts/save-or-create-script", {
        title: newScriptName,
        doc_id,
        content: "<h1>namaskara World</h1>",
      });
      const res2 = await axios.post("/api/scripts/add-user", {
        doc_id,
        user_id,
        access: "2",
      });
      //owner access enum[-1,0,1,2] 2 is owner 1 is editor 0 is viewer -1 no access
      router.push("/scripts/" + doc_id + "?title=" + newScriptName);
    } catch (err) {
      console.log(err);
    }
  };
  const loadOldScripts = async () => {
    const user_id = localStorage.getItem("creater-content-user_id");
    if (!user_id) router.push("/auth/login");
    try {
      const res = await axios.get(
        "/api/scripts/get-scripts-user?user_id=" + user_id
      );
      setListOfScripts(res.data.data);
      setShowOldScripts(true);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Script Dashboard</h1>
      <form className="mb-4">
        <input
          value={newScriptName}
          onChange={(e) => setNewScriptName(e.target.value)}
          placeholder="Enter the title of the script"
          className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring focus:border-blue-600"
        />
        <button
          onClick={createNewDoc}
          className="bg-blue-600 p-4 text-white rounded-md mt-4"
        >
          NEW SCRIPT DOC
        </button>
      </form>
      <div>
        {!showOldScripts ? (
          <button
            onClick={loadOldScripts}
            className="bg-blue-600 p-2 text-white rounded-md mr-2"
          >
            View All
          </button>
        ) : (
          <button
            onClick={() => setShowOldScripts(false)}
            className="bg-red-600 p-2 text-white rounded-md mr-2"
          >
            Close
          </button>
        )}
        {showOldScripts && (
          <section className="bg-blue-50 p-4 mt-4">
            {listOfScripts.map((script) => (
              <Link
                className="p-2 m-2 block border rounded-lg hover:bg-blue-100"
                href={`/scripts/${script.doc_id}?title=${script.title}`}
                key={script.doc_id}
              >
                <h2 className="text-lg font-semibold">
                  {script.title === "" ? "no title" : script.title}
                </h2>
                <h3 className="text-gray-600 text-sm">
                  Created {timeAgo(script.created_at)} ago
                </h3>
                <h3 className="text-gray-600 text-sm">
                  Updated {timeAgo(script.updated_at)} ago
                </h3>
              </Link>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export function timeAgo(timestamp) {
  const currentTime = new Date();
  const givenTime = new Date(timestamp);
  const timeDifference = currentTime - givenTime;

  // Convert milliseconds to seconds
  const seconds = Math.floor(timeDifference / 1000);

  // Calculate time ago
  if (seconds < 60) {
    return seconds + "s ago";
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return minutes + "m ago";
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return hours + "h ago";
  } else {
    const days = Math.floor(seconds / 86400);
    return days + "d ago";
  }
}

export default Script;
