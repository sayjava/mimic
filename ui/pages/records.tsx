import RecordsTable from "../components/RecordsTable";
import { HTTPRecordsProvider } from "../providers/records";

const RecordsPage = () => {
  return (
    <HTTPRecordsProvider>
      <div>
        <h3>Records Table</h3>
        <RecordsTable />
      </div>
    </HTTPRecordsProvider>
  );
};

export default RecordsPage;
