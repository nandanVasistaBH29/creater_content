import { v4 as uuid } from "uuid";
import { useRouter } from "next/router";

const Script = () => {
  const doc_id = uuid();
  const router = useRouter();

  const createNewDoc = () => {
    router.push("/scripts/" + doc_id);
  };
  return (
    <div>
      {/* in future implement list of all the docs of the user */}
      <button
        className="bg-blue-600 p-4 m-4 text-white rounded-md"
        onClick={createNewDoc}
      >
        NEW SCRIPT DOC
      </button>
    </div>
  );
};

export default Script;
