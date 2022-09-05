import { useState } from "react";
import { MocksProvider } from "../providers/mocks.jsx";
import MocksTable from "../components/Mocks.jsx";
import AddMocks from "../components/AddMocks.jsx";

const Dashboard = () => {
  const [state, setState] = useState({ mock: undefined });
  const onMockSelected = (mock) => {
    setState({ mock });
  };
  return (
    <>
      <MocksProvider>
        <div>
          <MocksTable onSelect={onMockSelected} />
        </div>
      </MocksProvider>
      <AddMocks mock={state.mock} />
    </>
  );
};

Dashboard.displayName = "Dashboard";

export default Dashboard;
