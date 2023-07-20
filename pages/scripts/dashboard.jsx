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
    const doc_id = uuid();
    e.preventDefault();
    const user_id = localStorage.getItem("creater-content-user_id");
    if (!user_id) router.push("/auth/login");
    try {
      const res = await axios.post("/api/scripts/save-or-create-script", {
        title: newScriptName,
        doc_id,
        content: "<h1>namaskara World</h1>",
      });
      const res2 = await axios.post("/api/scripts/add-user", {
        doc_id,
        user_id,
        access: 2,
      });
      //owner access enum[-1,0,1,2] 2 is owner 1 is editor 0 is viewer -1 no access
      router.push("/scripts/" + doc_id);
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
    <div>
      <h1>Script Dashboard</h1>
      <form>
        <input
          value={newScriptName}
          placeholder="enter the title of script"
          onChange={(e) => setNewScriptName(e.target.value)}
        />
        <button
          className="bg-blue-600 p-4 m-4 text-white rounded-md"
          onClick={(e) => createNewDoc(e)}
        >
          NEW SCRIPT DOC
        </button>
      </form>
      <div>
        {!showOldScripts ? (
          <button onClick={loadOldScripts}>View All</button>
        ) : (
          <button onClick={() => setShowOldScripts(false)}>Close</button>
        )}
        {showOldScripts && (
          <section className=" bg-blue-50">
            {listOfScripts.map((script) => (
              <Link
                href={`/scripts/${script.doc_id}`}
                key={script.doc_id}
                className="p-2 m-2"
              >
                <h2>{script.title}</h2>
                <h3>{timeAgo(script.created_at)} </h3>
                <h3>{timeAgo(script.updated_at)} </h3>
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
