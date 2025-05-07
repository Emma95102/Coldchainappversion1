import React, { useState } from "react";
import "./App.css";
import { useEffect } from "react"; 
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

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
  if (page === "home") {
    return <SmartDashboard goTo={setPage} />;
  }
  if (!loggedIn) {
    return <LoginScreen onLogin={() => {
      setLoggedIn(true);
      setPage("home"); // 登入後跳到智慧儀表板
    }} />;
  }
  if (page === "fuel") return <FuelPage goBack={() => setPage("home")} />;
  if (page === "route") return <RouteOptimization goBack={() => setPage("home")} />;
  if (page === "footprint") return <CarbonFootprint goBack={() => setPage("home")} />;

  if (page === "pcm") return <PCMModule goBack={() => setPage("home")} />;

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
        <button onClick={() => setPage("home")}>進入儀表板</button>
        <button onClick={() => setPage("temp")}>即時溫控</button>
        <button onClick={() => setPage("carbon")}>碳排追蹤</button>
        <button onClick={() => setPage("report")}>異常回報</button>
      </div>
    </div>
  );
}
//儀表板畫面
function SmartDashboard({ goTo }) {
  return (
    <div className="screen">
      <h2>智慧儀表板</h2>

      <div className="dashboard-section clickable" onClick={() => goTo("fuel")}>
        <h3>車輛耗油檢測</h3>
        <ul>
          <li>即時追蹤運輸車隊油耗數據</li>
          <li>每公里平均碳排為 <strong>0.25 公斤</strong></li>
        </ul>
      </div>

      <div className="dashboard-section clickable" onClick={() => goTo("pcm")}>
        <h3>PCM能源追蹤</h3>
        <ul>
          <li>監控各設備耗損程度</li>
          <li>標準化 PCM 能源消耗指標</li>
        </ul>
      </div>

      <div className="dashboard-section clickable" onClick={() => goTo("route")}>
        <h3>路線配送優化</h3>
        <ul>
          <li>運用大數據分析最佳路徑</li>
          <li>減少不必要的里程與碳排</li>
        </ul>
      </div>

      <div className="dashboard-section clickable" onClick={() => goTo("footprint")}>
        <h3>碳足跡計算</h3>
        <ul>
          <li>自動計算每筆訂單碳排</li>
          <li>提供詳細碳排報表</li>
        </ul>
      </div>

      <div className="button-group">
        <button onClick={() => goTo("dashboard")}>進入任務追蹤</button>
        <button onClick={() => goTo("carbon")}>查看碳排詳情</button>
        <button onClick={() => goTo("pcm")}>查看 PCM 模組</button>
      </div>
    </div>
  );
}
function FuelPage({ goBack }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const fuel = (Math.random() * 2 + 5).toFixed(2); // 模擬油耗數據
      setData((prev) => [...prev.slice(-9), { time, fuel: parseFloat(fuel) }]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="screen">
      <h2>車輛耗油檢測</h2>
      <p>即時油耗圖表：</p>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="time" />
            <YAxis unit=" L" />
            <Tooltip />
            <CartesianGrid stroke="#ccc" />
            <Line type="monotone" dataKey="fuel" stroke="#0070f3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <button onClick={goBack}>返回儀表板</button>
    </div>
  );
}

function RouteOptimization({ goBack }) {
  return (
    <div className="screen">
      <h2>路線配送優化</h2>
      <p>這裡可以放入最佳化路線圖示、里程節省統計或車隊路徑。</p>
      <button onClick={goBack}>返回儀表板</button>
    </div>
  );
}
function CarbonFootprint({ goBack }) {
  return (
    <div className="screen">
      <h2>碳足跡計算</h2>
      <p>這裡可顯示碳排放報表、每張訂單碳排、圖表等資訊。</p>
      <button onClick={goBack}>返回儀表板</button>
    </div>
  );
}


//PCM模組
function PCMModule({ goBack }) {
  return (
    <div className="screen fade-in">
      <h2>PCM 模組總覽</h2>

      <div className="pcm-card">
        <h3>1. 短鏈即配模組</h3>
        <ul>
          <li>配送地點：都市門市</li>
          <li>即時預冷完成：✔</li>
          <li>持溫時間（PCM）：<strong>6 小時</strong></li>
          <li>溫度偏差：±0.5°C</li>
        </ul>
      </div>

      <div className="pcm-card">
        <h3>2. 混溫倉儲模組</h3>

        <ul>
          <li>多溫區：冷藏 / 冷凍</li>
          <li>PCM 隔溫穩定</li>
          <li>本月省電：<strong>54.7 kWh</strong></li>
          <li>冷媒減少：<strong>28%</strong></li>
        </ul>
      </div>

      <div className="pcm-card">
        <h3>3. 智慧保溫箱模組</h3>

        <ul>
          <li>核心技術：相變材料（PCM）</li>
          <li>無電持溫時間：<strong>18 小時</strong></li>
          <li>穩定度：±0.3°C</li>
          <li>系統狀態：<span style={{ color: "green" }}>正常</span></li>
        </ul>
      </div>

      <button onClick={goBack}>返回儀表板</button>
    </div>
  );
}
// 即時溫控頁面
function TemperaturePage({ goBack }) {
  const [temperature, setTemperature] = useState(4.0);
  const [lastUpdated, setLastUpdated] = useState("");
  const [data, setData] = useState([]);
  const safeRange = { min: 2, max: 8 };
  

  useEffect(() => {
    const updateTemperature = () => {
      const temp = parseFloat((Math.random() * 6 + 2).toFixed(1)); // 模擬 2~8°C
      const now = new Date();
      const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      setTemperature(temp);
      setLastUpdated(`${now.toLocaleDateString()} ${time}`);
      setData((prev) => [...prev.slice(-9), { time, temperature: temp }]);
    };

    updateTemperature(); // 初始化
    const interval = setInterval(updateTemperature, 10000); // 每 10 秒更新一次
    return () => clearInterval(interval);
  }, []);

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

      <div style={{ width: "100%", height: 300, marginTop: "20px" }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="time" />
            <YAxis domain={[0, 10]} unit="°C" />
            <Tooltip />
            <CartesianGrid stroke="#ccc" />
            <Line type="monotone" dataKey="temperature" stroke="#e91e63" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <button onClick={goBack} style={{ marginTop: "20px" }}>
        返回主畫面
      </button>
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