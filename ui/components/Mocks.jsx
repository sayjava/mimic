import React from 'react'
import { useMocksState } from '../providers/mocks.jsx'

const noop = () => {}

const MocksTable = ({ onSelect = noop }) => {
    const { mocks, error, busy } = useMocksState()
    
    if(busy) {
        return <div>Loading up mocks</div>
    }

    if(error) {
        return <div>
            Error: {JSON.stringify(error)}
        </div>
    }

  if (mocks) {
    return (
      <div>
        <h3>The Dashboard</h3>
        <table>
          <thead>
            <tr>
              <th>method</th>
              <th>path</th>
              <th>status</th>
            </tr>
          </thead>
          <tbody>
            {mocks.map((mock) => {
              return (
                <tr key={mock.id} onClick={() => onSelect(mock)}>
                  <td>{mock.request.method}</td>
                  <td>{mock.request.path}</td>
                  <td>{mock.response.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}   

export default MocksTable