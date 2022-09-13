import { useState } from "react";
import { useRecords } from "../providers/records";
import DisplayRecord from "./DisplayRecord";

const RecordsTable = () => {
  const { busy, error, records } = useRecords();
  const [state, setState] = useState({ selected: null, selections: {} });

  if (!records || records.length === 0) {
    return <div>No Records Yet!</div>;
  }

  if (error) {
    return <div>Error happened sorry {JSON.stringify(error)}</div>;
  }

  const onChecked = (record: any): any => {
    const selections = state.selections;
    if (selections[record.id]) {
      delete selections[record.id];
    } else {
      selections[record.id] = record;
    }
    setState(Object.assign({}, state, { selections }));
  };

  const selectAll = () => {
    const selections = {};
    if (Object.keys(state.selections).length < records.length) {
      records.forEach((record) => {
        selections[record.id] = record;
      });
    }

    setState(Object.assign({}, state, { selections }));
  };

  const isAllSelected = (): boolean => {
    return Object.keys(state.selections).length === records.length;
  };

  const isAnySelected = (): boolean => {
    return Object.keys(state.selections).length > 0;
  };

  return (
    <div>
      {busy && <div>Busy ......</div>}
      <div style={{ display: "flex" }}>
        <div>
          {isAnySelected() && <button>Mock All Selected</button>}
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    name="select-all"
                    onChange={() => selectAll()}
                    checked={isAllSelected()}
                  />
                </th>
                <th>method</th>
                <th>path</th>
                <th>status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                return (
                  <tr
                    key={record.id}
                    onClick={() =>
                      setState({
                        selected: record,
                        selections: state.selections,
                      })
                    }
                  >
                    <td>
                      <input
                        type="checkbox"
                        name={record.id}
                        value={record.id}
                        onChange={() => onChecked(record)}
                        checked={!!state.selections[record.id]}
                      />
                    </td>
                    <td>{record.request.method}</td>
                    <td>{record.request.path}</td>
                    <td>{record.response.status}</td>
                    <td>{record.isForwarded && <button>Mock</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <ul>
            {Object.keys(state.selections).map((k) => {
              return <li key={k}>{k}</li>;
            })}
          </ul>
        </div>
        <div>
          {state.selected && (
            <div>
              <button>Create Mock</button>
              <DisplayRecord record={state.selected} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordsTable;
