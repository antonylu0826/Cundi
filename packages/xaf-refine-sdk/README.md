# @cundi/xaf-refine-sdk

這是一個整合 XAF 後端與 Refine 前端的 SDK，包含了身分驗證 (Auth Provider) 與資料存取 (Data Provider) 的核心邏輯。

## 專案結構

此 SDK 包含：
- **AuthProvider**: 處理登入、登出、權限檢查。
- **DataProvider**: 處理 XAF OData 請求。
- **AuthService**: 封裝了與後端 API 互動的邏輯。
- **HttpClient**: 統一的 Fetch Wrapper。

## 如何在專案中使用

### 1. 安裝 (本地開發模式)

在您的 Refine 專案 (例如 `cundiweb`) 中，執行以下指令來連結此 SDK：

```bash
# 在 cundiweb 目錄下
npm install ../packages/xaf-refine-sdk
```

或者，您可以將此 SDK 發佈到私有 NPM Registry 或 GitHub Packages，然後透過標準 `npm install @cundi/xaf-refine-sdk` 安裝。

### 2. 設定 App.tsx

而在您的 `App.tsx` 中，您可以直接引用並使用它：

```tsx
import { authProvider, dataProvider, httpClient } from "@cundi/xaf-refine-sdk";

// 設定 API URL (如果 SDK 內部沒有讀取到環境變數，或需要動態設定)
// 目前 SDK 預設讀取 import.meta.env.VITE_API_URL

function App() {
  return (
    <Refine
      dataProvider={dataProvider(import.meta.env.VITE_API_URL)}
      authProvider={authProvider}
      // ... 其他設定
    >
      {/* ... */}
    </Refine>
  );
}
```

### 3. 使用 Hooks 與 Service

```tsx
import { authService, IApplicationUser } from "@cundi/xaf-refine-sdk";

// 在 Component 中使用
const resetPassword = async (userId, password) => {
  await authService.resetPassword(userId, password);
};
```

## 開發與發佈

1. **安裝依賴**: `npm install`
2. **建置**: `npm run build`
3. **開發模式**: `npm run dev` (監聽檔案變更)
