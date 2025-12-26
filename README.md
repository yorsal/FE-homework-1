# Mock OAuth2 nextJS Project

这是一个基于 Next.js 和 NextAuth 构建的演示项目，主要展示了如何实现自定义的 OAuth2 认证流程。项目包含了一个模拟的 OAuth2 Provider 和一个受保护的产品展示页面。

## 功能特性

- **Next.js 15**: 使用最新的 App Router 架构。
- **NextAuth.js**: 用于处理认证和会话管理。
- **Mock OAuth2 Provider**: 内置了一个模拟的 OAuth2 服务端，用于演示完整的授权码模式流程。
- **受保护路由**: 演示了如何保护页面和 API 路由，products 页面仅允许认证用户访问。
- **Tailwind CSS**: 使用现代化 CSS 框架进行 UI 开发。
- **Zustand**: 用于管理全局状态, products 全局 state。

## 快速开始

1.  安装依赖:

    ```bash
    npm install
    ```

2.  启动开发服务器:

    ```bash
    npm run dev
    ```

3.  访问 [http://localhost:3000](http://localhost:3000) 并点击 "Login with OAuth2" 按钮体验流程。

## Mock OAuth2 认证流程详解

本项目实现了一个自定义的 OAuth2 授权码模式（Authorization Code Grant）流程。以下是整个流程的详细说明：

### 1. 发起授权请求 (Authorization Request)

当用户点击首页的 "Login with OAuth2" 按钮时，NextAuth 会将用户重定向到配置的授权端点：

- **URL**: `/auth/authorize`
- **参数**:
  - `client_id`: 客户端 ID
  - `redirect_uri`: 回调地址 (例如 `http://localhost:3000/api/auth/callback/mock-oauth2`)
  - `response_type`: `code` (表示请求授权码)
  - `scope`: `openid`
  - `state`: NextAuth 生成的随机字符串，用于防止 CSRF 攻击

### 2. 用户授权

在 `/auth/authorize` 页面，模拟了用户同意授权的过程。

- 用户点击 "Authorize" 按钮。
- 服务器生成一个临时的 Authorization Code。

### 3. 获取授权码 (Authorization Code)

授权成功后，浏览器会被重定向回 `redirect_uri`，并附带上 `code` 参数：

```
http://localhost:3000/api/auth/callback/mock-oauth2?code=AUTHORIZATION_CODE&state=STATE
```

### 4. 令牌交换 (Token Exchange)

NextAuth 接收到回调后，会在服务端向 Token 端点发起请求，使用授权码交换访问令牌：

- **URL**: `/api/auth/token`
- **方法**: `POST`
- **参数**:
  - `grant_type`: `authorization_code`
  - `code`: 上一步获取的 Authorization Code
  - `redirect_uri`: 回调地址
  - `client_id` & `client_secret`

**Token 端点 (`src/app/api/auth/token/route.ts`) 逻辑**:

- 验证 `code` 的有效性。
- 生成 `access_token` 和 `refresh_token`。
- 返回令牌信息给 NextAuth。

### 5. 获取用户信息 (User Info)

拿到 `access_token` 后，NextAuth 会根据配置自动调用 UserInfo 端点获取当前用户的信息：

- **URL**: `/api/auth/user`
- **Header**: `Authorization: Bearer ACCESS_TOKEN`

**UserInfo 端点 (`src/app/api/auth/user/route.ts`) 逻辑**:

- 验证 `access_token` 的有效性。
- 返回模拟的用户数据 (id, name, email, avatar 等)。

### 6. 建立会话 (Session Creation)

NextAuth 收到用户信息后，会加密生成一个 Session JWT (JSON Web Token)，并将其存储在浏览器的 Cookie 中 (`next-auth.session-token`)。

此时，用户通过认证，状态变为 `authenticated`。

### 7. 访问受保护资源

当用户访问受保护的页面 (如 `/products`) 或 API 时：

- `useSession` hook (客户端) 或 `getServerSession` (服务端) 会验证 Session Cookie。
- 只有拥有有效 Session 的用户才能访问受保护的内容。

---

## 目录结构

### 模拟第三方授权

- `src/app/api/auth/token`: 模拟 OAuth2 Token API（第三方服务）。
- `src/app/api/auth/user`: 模拟 OAuth2 UserInfo API (第三方服务)。
- `src/app/auth/authorize`: 模拟 OAuth2 授权页面（第三方服务）。

### 接口

- `src/app/api/products/routes`: products API

### 页面

- `src/app/layout.tsx`: layout
- `src/app/page.tsx`: home page
- `src/app/products/page.tsx`: products page

### auth 配置

- `src/app/api/auth/[...nextauth]`: NextAuth 配置文件。
- `src/lib/authOptions.ts`: 具体 NextAuth 配置选项。
