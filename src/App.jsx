import React, { useState } from "react";
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard"); // 新增：畫面控制
  
  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  }

// 畫面切換邏輯
  if (page === "dashboard") return <Dashboard setPage={setPage} />;
  if (page === "temp") return <TemperaturePage goBack={() => setPage("dashboard")} />;
  if (page === "carbon") return <CarbonTracker goBack={() => setPage("dashboard")} />;

  if (page === "report") return <ErrorReport goBack={() => setPage("dashboard")} />;
  return <div>未知頁面</div>;
}


// 登入畫面
function LoginScreen({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  return (
    <div className="screen">
      <h2>冷鏈司機登入</h2>
      <input
        placeholder="工號"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        placeholder="姓名"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={onLogin}>登入</button>
    </div>
  );
}

// 主畫面

function Dashboard({ setPage }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [distance, setDistance] = useState(0);
  const [carbon, setCarbon] = useState(0);

  function handleStart() {
    if (!from || !to) {
      alert("請輸入起點與終點");
      return;
    }

    let d = getDistanceEstimate(from, to);
    let c = d * 2.68;
    setDistance(d);
    setCarbon(c.toFixed(2));

    alert(`任務開始：${from} → ${to}，預估碳排：${c.toFixed(2)} kg CO₂`);
  }

  return (
    <div className="screen">
      <h2>今日任務列表</h2>
      <ul>
        <li>配送：台中市沙鹿區北勢東門市 → 14:30 / 冷藏</li>
        <li>配送：台中市烏日區711物流中心 → 16:00 / 冷凍</li>
      </ul>

      <h3>目前位置：台中市沙鹿區</h3>

      <input
        placeholder="起點（如：桃園倉儲）"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
      />
      <input
        placeholder="終點（如：台北門市）"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />

      <div className="button-group">
        <button onClick={handleStart}>開始任務</button>
        <button onClick={() => setPage("temp")}>即時溫控</button>
        <button onClick={() => setPage("carbon")}>碳排追蹤</button>
        <button onClick={() => setPage("report")}>異常回報</button>
      </div>
    </div>
  );
}
function getDistanceEstimate(from, to) {
  if (from.includes("桃園") && to.includes("台北")) return 40;
  if (from.includes("台中") && to.includes("高雄")) return 150;
  if (from.includes("台中") && to.includes("台北")) return 130;
  return 30; // 預設距離
}
// 新增：即時溫控畫面
function TemperaturePage({ goBack }) {
  return (
    <div className="screen">
      <h2>即時溫控</h2>
      <p>貨艙溫度：<strong>4.0C</strong></p>
      <p>上次更新時間：10:58</p>
      <p>溫度曲線圖（模擬）即將加入...</p>
      <button onClick={goBack}>返回主畫面</button>
    </div>
  );
}


// 新增：碳排追蹤畫面
function CarbonTracker({ goBack }) {
  return (
    <div className="screen">
      <h2>碳排追蹤</h2>
      <p>今日總碳排：<strong>5.8 kg CO₂</strong></p>
      <ul>
        <li>任務一（冷藏）：2.3 kg CO₂</li>
        <li>任務二（冷凍）：3.5 kg CO₂</li>
      </ul>

      <p>傳統冷媒碳排：約 18.5 kg CO₂ / 日</p>
      <p>使用 PCM 技術後碳排：約 1.0 kg CO₂ / 日</p>
      <p>單車每日減碳：<strong>17.5 kg CO₂</strong></p>
      <p>減碳效益提升：約 <strong>94.6%</strong></p>
      <p>PCM 技術已節省碳排：<strong>7.2 kg CO₂</strong></p>
      <p>累積減碳總量：<strong>84.6 kg CO₂</strong></p>
      <button onClick={goBack}>返回主畫面</button>
    </div>
  );
}

//溫度異常

function ErrorReport({ goBack }) {
  const [type, setType] = useState("溫度異常");
  const [note, setNote] = useState("");

  function handleSubmit() {
    alert(`異常類型：${type}\n說明：${note}`);
    goBack();
  }

  return (
    <div className="screen">
      <h2>異常回報</h2>

      <label>異常類型：</label>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option>溫度異常</option>
        <option>門未關緊</option>
        <option>貨物損壞</option>
        <option>其他</option>
      </select>

      <textarea
        placeholder="請輸入說明..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows="4"
        style={{ width: "100%", marginTop: "10px" }}
      />

      <div className="button-group">
        <button onClick={handleSubmit}>提交回報</button>
        <button onClick={goBack}>返回主畫面</button>
      </div>
    </div>
  );
}

export default App;



