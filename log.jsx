// src/log.jsx
import React, { useEffect, useState } from "react";

function LogPage({ goBack }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/logs")
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => {
        console.error("❌ 無法載入紀錄：", err);
        alert("讀取報表失敗，請稍後再試。");
      });
  }, []);

  return (
    <div className="screen">
      <h2>任務報表</h2>
      {logs.length === 0 ? (
        <p>尚無任務紀錄。</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", marginTop: "20px" }}>
          <thead>
            <tr>
              <th>起點</th>
              <th>終點</th>
              <th>距離 (km)</th>
              <th>碳排放 (kg CO₂)</th>
              <th>時間</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{log.from}</td>
                <td>{log.to}</td>
                <td>{log.distance}</td>
                <td>{log.carbon}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={goBack} style={{ marginTop: "20px" }}>返回主畫面</button>
    </div>
  );
}

export default LogPage;
