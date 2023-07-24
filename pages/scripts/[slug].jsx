import React from "react";
import ScriptEditor from "../../components/ScriptEditor";
import NavBar from "../../components/Navbar";
import UserAccess from "../../components/UserAccess.jsx";
const Script = () => {
  return (
    <div>
      <NavBar />
      <ScriptEditor />
      <UserAccess />
    </div>
  );
};

export default Script;
