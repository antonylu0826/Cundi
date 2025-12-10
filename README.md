# Cundi Project

此專案包含 Cundi 系統的前後端程式碼。

## 目錄結構

- `cundiapi/`: 後端 Web API 專案 (DevExpress XAF, ASP.NET Core)
  - 使用 .NET 啟動
- `cundiweb/`: 前端 Web 應用程式 (React, Vite, Refine)
  - 使用 Node.js/npm 啟動

## 快速開始

### 後端 (cundiapi)

1. 進入目錄：
   ```bash
   cd cundiapi
   ```
2. 還原套件並執行：
   ```bash
   dotnet restore
   dotnet run
   ```
   預設網址為 `http://localhost:5000` (或參考 `Properties/launchSettings.json`)

### 前端 (cundiweb)

1. 進入目錄：
   ```bash
   cd cundiweb
   ```
2. 安裝依賴並啟動開發伺服器：
   ```bash
   npm install
   npm run dev
   ```
   預設網址為 `http://localhost:5173`
