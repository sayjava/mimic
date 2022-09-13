import React, { useState, useEffect } from 'react'

const noop = (mock:any) => {}

const MocksTable = ({ onSelect = noop }) => {
    const [state, setState] = useState({ busy: false, error: null, mocks: []})

    const deleteMock = async (mock) => {
        const res = await fetch(`${process.env.apiPath}/api/mocks/${mock.id}`, {
            method: 'DELETE'
        })

        if(!res.ok) {
            console.error(`Could not delete ${mock.id}`)
        } else {
            loadMocks()
        }
    }

    const loadMocks = async () => {
        try {
            setState({ mocks: [], error: null, busy: true });
            const res = await fetch(`${process.env.apiPath}/api/mocks`);
            const mocks = await res.json();
            setState({ mocks, error: null, busy: false });
        } catch (error) {
            setState({ mocks: [], error, busy: false });
        }
      
    };

    useEffect(() => {
      loadMocks();
    }, [])

    return (
      <div>
        {state.error && <div>
            Error: {state.error.message}
            </div>}
            {state.busy && <div>
            Busy working
            </div>}
            <div>Mocks</div>
        <table>
          <thead>
            <tr>
              <th>method</th>
              <th>path</th>
              <th>status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {state.mocks.map((mock) => {
              return (
                <tr key={mock.id} onClick={() => onSelect(mock)}>
                  <td>{mock.request.method}</td>
                  <td>{mock.request.path}</td>
                  <td>{mock.response.status}</td>
                  <td>
                    <button onClick={() => deleteMock(mock)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
}   

export default MocksTable