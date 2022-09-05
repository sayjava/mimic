import useSWR from "swr";
import React from "react";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const mockState = {
  error: null,
  mocks: null,
  busy: null
}
const MockStateContext = React.createContext({ state: mockState });

export const useMocksState = () => {
  const ctx = React.useContext(MockStateContext);
  if (!ctx) {
    throw new Error("Must be used within a MocksProvider");
  }

  return ctx;
};

export const MocksProvider = ({ children }) => {
  const basePath = process.env.apiPath;
  const { data: mocks, error } = useSWR(`${basePath}/api/mocks`, fetcher);

  return (
    <div>
      <MockStateContext.Provider
        value={{ mocks, error, busy: !mocks && !error }}
      >
        {children}
      </MockStateContext.Provider>
    </div>
  );
};
