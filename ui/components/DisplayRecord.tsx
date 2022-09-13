const DisplayRecord = ({ record }) => {
  return (
    <div>
      <h3>Record {record.id}</h3>
      <div style={{ display: "flex" }}>
        <div>
          <dl>
            <dt>Path</dt>
            <dd>{record.request.path}</dd>
            <dt>Method</dt>
            <dd>{record.request.method}</dd>
          </dl>
        </div>
        <div>
          <dl>
            <dt>Status</dt>
            <dd>{record.response.status}</dd>
            <dt>Method</dt>
            <dd>{JSON.stringify(record.response.headers)}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default DisplayRecord;
