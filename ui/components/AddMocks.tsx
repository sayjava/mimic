import Editor from "@monaco-editor/react";
import { useRef, useState } from "react";

const initialMock = [
  {
    request: {
      path: "/hello",
    },
    response: {
      status: 200,
      headers: {
        "Content-Type": "application/text",
      },
      body: "Hello World",
    },
  },
];

const AddUpdateMocks = ({ mock }) => {
  const editorRef = useRef(null);
  const [state, setState] = useState({ busy: false, error: null });
  const apiUrl = `${process.env.apiPath}/api/mocks`;

  const getEditorMock = () => {
    const editorValue = editorRef.current.getValue();
    const mocks = JSON.parse(editorValue);
    return mocks
  };

  const saveMock = async () => {
    try {
     const mock = getEditorMock();
      setState({ busy: true, error: null });

      const mockURL = mock.id ? `${apiUrl}/${mock.id}` : apiUrl;
      const res = await fetch(mockURL, {
        method: mock.id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(mock),
      });

      let error = null;
      if (!res.ok) {
        error = await res.json();
      }

      setState({ error, busy: false });
    } catch (error) {
      setState({ error, busy: false });
    }
  };

  if (state.busy) {
    return <div>Busy ... . ..</div>;
  }

  return (
    <div>
      {state.error && (
        <div>
          <h3>Error Happened</h3>
          {JSON.stringify(state.error.message)}
        </div>
      )}
      <Editor
        value={
          mock
            ? JSON.stringify(mock, null, 2)
            : JSON.stringify(initialMock, null, 2)
        }
        height="30vh"
        theme="vs-dark"
        language="json"
        options={{ minimap: { enabled: false }, smoothScrolling: true }}
        onMount={(editor) => {
          editorRef.current = editor;
        }}
      />
      {mock ? (
        <button onClick={saveMock}>Update Mock</button>
      ) : (
        <button onClick={saveMock}>Create Mock</button>
      )}
    </div>
  );
};

export default AddUpdateMocks;
