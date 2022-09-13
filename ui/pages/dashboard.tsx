import React, { useState } from "react";
import MocksTable from "../components/Mocks";
import AddMocks from "../components/AddMocks";

const Dashboard = () => {
  const [state, setState] = useState({ mock: undefined });
  const onMockSelected = (mock: any) => {
    setState({ mock });
  };
  return (
    <>
      <div>
        <MocksTable onSelect={onMockSelected} />
      </div>
      <AddMocks mock={state.mock} />
    </>
  );
};

Dashboard.displayName = "Dashboard";

export default Dashboard;
