import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const UserAccess = () => {
  const router = useRouter();
  const { slug: doc_id } = router.query;
  const [owner, setOwner] = useState({ user_id: "", access: "2" });
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState({ warn: "", msg: "" });
  const [newUser, setNewUser] = useState({
    user_id: "",
    access: "0", // Default access set to Viewer (0) Editor(1) owner(2)
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    getAllUsersOfScript();
  }, []);

  const getAllUsersOfScript = async () => {
    try {
      if (!doc_id) setMsg({ warn: "script is invalid go back", msg: "" });
      const res = await axios.get(
        "/api/scripts/get-doc-users?doc_id=" + doc_id
      );
      res.data.data.forEach((user) => {
        if (user.access === "2") setOwner(user);
      });
      setUsers(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };
  const addNewUser = async () => {
    setMsg({ warn: "", msg: "" });
    try {
      console.log(newUser);
      if (owner.user_id !== localStorage.getItem("creater-content-user_id"))
        setMsg({ warn: "only owners can add new members", msg: "" });
      if (!newUser.user_id) setMsg({ warn: "Enter user_id", msg: "" });
      const res = await axios.post("/api/scripts/add-user", {
        doc_id,
        user_id: newUser.user_id,
        access: newUser.access,
      });
      if (res.data) {
        setMsg({ warn: "", msg: "added successfully" });
      }
      if (res.error) setWarn({ warn: "could'n add the user", msg: "" });
    } catch (error) {}
  };

  return (
    <div className="p-4">
      {msg.warn && <p className="text-red-700 p-2 m-2">{msg.warn}</p>}
      {msg.msg && <p className="text-green-700 p-2 m-2">{msg.msg}</p>}
      <h1 className="text-3xl font-bold mb-4">User Access for Document</h1>
      <section className="p-4 border rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Add a User</h3>
        <div className="mb-4">
          <label className="block mb-1">User ID</label>
          <input
            name="user_id"
            value={newUser.user_id}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring focus:border-blue-600"
            placeholder="Enter User ID"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Access Level</label>
          <select
            name="access"
            value={newUser.access}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring focus:border-blue-600"
          >
            <option value="1">Editor</option>
            <option value="0">Viewer</option>
          </select>
        </div>
        <button
          onClick={addNewUser}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Add User
        </button>
      </section>
      <ul className="list-none p-0">
        {users.map((user) => (
          <li key={user.user_id} className="border rounded-lg p-4 my-4">
            <h2 className="text-xl font-semibold mb-2">{user.username}</h2>
            <p className="mb-2">{user.email}</p>
            <p>
              Access level:{" "}
              {user.access === "2"
                ? "Owner"
                : user.access === "1"
                ? "Editor"
                : "Viewer"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserAccess;
