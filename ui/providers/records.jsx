import useSWR from "swr";
import React from "react";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const recordsState = {
  error: null,
  records: null,
  busy: null,
};
const RecordStateContext = React.createContext({ state: recordsState });

export const useRecords = () => {
  const ctx = React.useContext(RecordStateContext);
  if (!ctx) {
    throw new Error("Must be used within a RecordsProvider");
  }

  return ctx.state;
};

export const HTTPRecordsProvider = ({ children }) => {
  const basePath = process.env.apiPath;
  const { data: records, error } = useSWR(`${basePath}/api/records`, fetcher);

  return (
    <div>
      <RecordStateContext.Provider
        value={{ state: { records, error, busy: !records && !error } }}
      >
        {children}
      </RecordStateContext.Provider>
    </div>
  );
};
