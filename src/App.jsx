import React, { useState } from "react";
import "./App.css";
import { useEffect } from "react"; 

// 主元件
function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [distance, setDistance] = useState(0);
  const [carbon, setCarbon] = useState(0);

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  }

  // 畫面切換
  if (page === "dashboard")
    return (
      <Dashboard
        setPage={setPage}
        from={from}
        to={to}
        setFrom={setFrom}
        setTo={setTo}
        setDistance={setDistance}
        setCarbon={setCarbon}
      />
    );

  if (page === "temp") return <TemperaturePage goBack={() => setPage("dashboard")} />;
  if (page === "carbon")
    return (
      <CarbonTracker
        goBack={() => setPage("dashboard")}
        from={from}
        to={to}
        distance={distance}
        carbon={carbon}
      />
    );
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
      <input placeholder="工號" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <input placeholder="姓名" value={code} onChange={(e) => setCode(e.target.value)} />
      <button onClick={onLogin}>登入</button>
    </div>
  );
}

// 主畫面
function Dashboard({ setPage, from, to, setFrom, setTo, setDistance, setCarbon }) {
  const [taskStarted, setTaskStarted] = useState(false);
  const [taskInfo, setTaskInfo] = useState("");

  useEffect(() => {
    async function fetchDistance() {
      if (!from || !to) return;

      try {
        const fromCoords = await getCoordinates(from);
        const toCoords = await getCoordinates(to);

        if (!Array.isArray(fromCoords) || !Array.isArray(toCoords)) {
          throw new Error("地點座標無效");
        }

        const d = await getDistanceORS(fromCoords, toCoords);
        if (!d || isNaN(d)) {
          throw new Error("距離取得失敗");
        }

        const c = d * 2.68;
        setDistance(d.toFixed(1));
        setCarbon(c.toFixed(2));
        setTaskInfo(`${from} → ${to}`);
      } catch (err) {
        console.error("錯誤：", err.message);
        alert("無法取得距離，請確認選擇的地點是否正確。");
      }
    }

    fetchDistance();
  }, [from, to]);

  function handleConfirmTask() {
    if (!from || !to) {
      alert("請選擇起點與終點");
    } else {
      setTaskStarted(true);
      alert(`任務設定完成：${from} → ${to}`);
    }
  }

  return (
    <div className="screen">
      <h2>今日任務列表</h2>
      {taskStarted ? (
        <ul>
          <li>配送：{taskInfo} → 冷藏</li>
          <li>配送：{to} → 下車地點 / 冷凍</li>
        </ul>
      ) : (
        <ul>
          <li>尚未設定任務</li>
        </ul>
      )}

      <h3>目前位置：{from || "尚未輸入"}</h3>

      <label>起點：</label>
      <select value={from} onChange={(e) => setFrom(e.target.value)}>
        <option value="">請選擇起點</option>
        <option value="台中市烏日區711物流中心">台中市烏日區711物流中心</option>
        <option value="台中市沙鹿區北勢東711門市">台中市沙鹿區北勢東711門市</option>
        <option value="台中市711聯鑫門市">台中市711聯鑫門市</option>
        <option value="台中市711市鑫門市">台中市711市鑫門市</option>
        <option value="台中市711靜大門市">台中市711靜大門市</option>
      </select>

      <label>終點：</label>
      <select value={to} onChange={(e) => setTo(e.target.value)}>
        <option value="">請選擇終點</option>
        <option value="台中市烏日區711物流中心">台中市烏日區711物流中心</option>
        <option value="台中市沙鹿區北勢東711門市">台中市沙鹿區北勢東711門市</option>
        <option value="台中市711聯鑫門市">台中市711聯鑫門市</option>
        <option value="台中市711市鑫門市">台中市711市鑫門市</option>
        <option value="台中市711靜大門市">台中市711靜大門市</option>
      </select>

      <div className="button-group">
        <button onClick={handleConfirmTask}>確認任務</button>
        <button onClick={() => setPage("temp")}>即時溫控</button>
        <button onClick={() => setPage("carbon")}>碳排追蹤</button>
        <button onClick={() => setPage("report")}>異常回報</button>
      </div>
    </div>
  );
}

// 即時溫控頁面
function TemperaturePage({ goBack }) {
  const [temperature, setTemperature] = useState(4.0);
  const [lastUpdated, setLastUpdated] = useState("2025-04-30 14:20");
  const safeRange = { min: 2, max: 8 };

  const getStatus = () => {
    if (temperature < safeRange.min) return "過低";
    if (temperature > safeRange.max) return "過高";
    return "正常";
  };

  return (
    <div className="screen">
      <h2>即時溫控</h2>
      <p>貨艙溫度：<strong>{temperature}°C</strong></p>
      <p>狀態判斷：<strong>{getStatus()}</strong></p>
      <p>上次更新時間：{lastUpdated}</p>
      <p>溫度曲線圖（模擬中）</p>
      <button onClick={goBack}>返回主畫面</button>
    </div>
  );
}

// 碳排追蹤頁面
function CarbonTracker({ goBack, from, to, distance, carbon }) {
  // 每公里碳排
  const traditionalPerKm = 2.68;
  const pcmPerKm = 0.13;

  const d = parseFloat(distance) || 0;
  const traditionalCarbon = (d * traditionalPerKm).toFixed(2);
  const pcmCarbon = (d * pcmPerKm).toFixed(2);
  const reduction = (traditionalCarbon - pcmCarbon).toFixed(2);
  const efficiency = d > 0
    ? (((traditionalCarbon - pcmCarbon) / traditionalCarbon) * 100).toFixed(1)
    : "0";

  return (
    <div className="screen">
      <h2>碳排追蹤</h2>

      {from && to ? (
        <>
          <p>配送任務：<strong>{from} → {to}</strong></p>
          <p>預估距離：<strong>{distance} km</strong></p>
          <p>碳排計算公式：距離 × 2.68 kg/km</p>
          <p>預估碳排放（傳統冷媒）：<strong>{traditionalCarbon} kg CO₂</strong></p>

          <hr />

          <p>使用 PCM 技術後碳排：<strong>約 {pcmCarbon} kg CO₂</strong></p>
          <p>單車任務減碳：<strong>{reduction} kg CO₂</strong></p>
          <p>減碳效益提升：約 <strong>{efficiency}%</strong></p>
        </>
      ) : (
        <p>尚未輸入任務地點，請先回主頁開始任務。</p>
      )}

      <button onClick={goBack}>返回主畫面</button>
    </div>
  );
}

// 異常回報頁面
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
// 簡易距離對照表函式
export default App;

// 地點座標對照表
const locationMap = {
  "台中市烏日區711物流中心": [24.1012, 120.6161],
  "台中市沙鹿區北勢東711門市": [24.2376, 120.5668],
  "台中市711聯鑫門市": [24.1380, 120.6835],
  "台中市711市鑫門市": [24.1410, 120.6842],
  "台中市711靜大門市": [24.2290, 120.5690]
};

// 根據地點名稱取得經緯度
async function getCoordinates(placeName) {
  const coords = locationMap[placeName];
  if (coords) {
    return coords;
  } else {
    alert(`查無「${placeName}」，請從下拉選單選擇正確地點`);
    return null;
  }
}

// 距離計算函式
function getDistanceORS(fromCoords, toCoords) {
  const [lon1, lat1] = fromCoords;
  const [lon2, lat2] = toCoords;

  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
