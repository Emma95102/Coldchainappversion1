const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, "logs.json");

app.use(cors());
app.use(bodyParser.json());

// 嘗試從檔案讀取初始資料
let logs = [];
if (fs.existsSync(DATA_FILE)) {
  try {
    const rawData = fs.readFileSync(DATA_FILE, "utf-8");
    logs = JSON.parse(rawData);
    console.log("✅ 已從 logs.json 載入紀錄");
  } catch (err) {
    console.error("❌ 無法讀取 logs.json:", err);
  }
}

// 儲存資料到 logs.json
function saveLogsToFile() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(logs, null, 2), "utf-8");
}

// 接收任務記錄
app.post("/api/logs", (req, res) => {
  const log = req.body;

  if (!log.from || !log.to || !log.distance || !log.carbon) {
    return res.status(400).json({ error: "缺少欄位" });
  }

  logs.push(log);
  saveLogsToFile(); // 儲存至檔案
  console.log("✅ 任務已儲存：", log);

  res.json({ message: "Log saved successfully", data: log });
});

// 提供任務報表
app.get("/api/logs", (req, res) => {
  res.json(logs);
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 伺服器運行中：http://localhost:${PORT}`);
});
