<p align="center">
  <img src="public/logo.svg" width="100" height="100" alt="Status Monitor Logo">
</p>

<h1 align="center">站点监测</h1>

<p align="center">优雅的站点状态监控面板</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vue.js" alt="Vue">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css" alt="Tailwind">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
</p>



## 📖 简介

站点监测是一个基于 UptimeRobot API 开发的站点状态监控面板，支持多站点状态监控、实时通知、故障统计等功能。界面简洁美观，响应式设计，支持亮暗主题切换。

## ✨ 功能预览

![功能预览](https://i1.wp.com/dev.ruom.top/i/2025/01/25/629114.webp)

## ✨ 特性

- 📊 实时监控：支持多种监控方式
- 📱 响应式设计：适配移动端和桌面端
- 🌓 主题切换：支持亮色/暗色主题
- 📈 数据统计：可视化展示可用率和响应时间
- 🔔 故障记录：详细的宕机记录和原因分析
- 🔄 自动刷新：定时自动更新监控数据
- 🔐 网页端管理：验证密码后可新增、删除监控
- 💫 平滑动画：流畅的用户界面交互体验

## ⚙️ 部署配置

### 环境要求

- Node.js >= 16.16.0
- NPM >= 8.15.0 或 PNPM >= 8.0.0

### 获取 UptimeRobot API Key

系统使用两个 Key：前端读取监控数据使用只读 Key，服务端新增、删除监控使用账号级 Main API Key。

1. 注册/登录 [UptimeRobot](https://uptimerobot.com/)
2. 进入 [Integrations & API](https://dashboard.uptimerobot.com/integrations)
3. 在 Main API keys 中创建只读 Key（以 `ur` 开头），对应 `VITE_UPTIMEROBOT_API_KEY`
4. 再创建一个未勾选只读的 Main API Key（以 `u` 开头），对应 `UPTIMEROBOT_MAIN_API_KEY`

### 环境变量

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `VITE_UPTIMEROBOT_API_KEY` | 是 | 只读 Key，用于前端获取监控数据 |
| `VITE_UPTIMEROBOT_API_URL` | 是 | 数据接口地址，默认 `/api/status` |
| `VITE_UPTIMEROBOT_ADMIN_URL` | 否 | 管理接口地址，默认 `/api/admin` |
| `VITE_APP_TITLE` | 否 | 站点名称 |
| `UPTIMEROBOT_MAIN_API_KEY` | 管理功能必填 | 账号级 Key，仅由服务端读取 |
| `ADMIN_PASSWORD` | 管理功能必填 | 管理密码，仅由服务端读取 |

`VITE_` 前缀的变量在构建时写入前端产物，其余两个变量在运行时读取。部署平台的环境变量修改后需重新部署才会生效。

### 网页端管理

页面右上角的齿轮按钮进入管理面板。首次进入需输入 `ADMIN_PASSWORD`，通过后可对现有监控执行以下操作：

- 新增：填写名称、地址与检测间隔
- 修改：修改名称、地址与检测间隔
- 暂停 / 恢复：暂停后停止检测，历史数据保留
- 删除：监控与历史数据一并删除，不可恢复

监控卡片上提供编辑按钮，点击后打开对应监控的编辑表单。密码保存在浏览器会话中，关闭标签页后失效，也可在面板内点击「退出」立即清除。

新增的监控类型为 HTTP(s)，检测间隔可选 5 至 60 分钟。UptimeRobot 免费版最短间隔 5 分钟，单账号上限 50 个监控。

### API 代理说明

本项目支持以下三种部署方式,均可实现自动处理跨域请求:

1. **腾讯云 EdgeOne Pages**
   - 点击上方蓝色 "Deploy" 按钮
   - 连接到GitHub，选择项目
   - 框架预设选择Vue，点击开始部署
   - 使用默认配置 `VITE_UPTIMEROBOT_API_URL = "/api/status"`

2. **Vercel**
   - 点击上方黑色 "Deploy" 按钮
   - 连接到GitHub，选择项目
   - 填写项目名称，点击Create
   - 使用默认配置 `VITE_UPTIMEROBOT_API_URL = "/api/status"`

3. **Cloudflare Pages**
   - 点击上方橙色 "Deploy" 按钮
   - 找到计算(worker) 部分
   - 点击创建，选择Pages，连接到GitHub，选择项目，点击开始创建
   - 框架预设选择Vue，点击保持并部署
   - 使用默认配置 `VITE_UPTIMEROBOT_API_URL = "/api/status"`

4. **其他平台**
   - 自行搭建 API 代理
   - 在 `.env` 文件中设置 `VITE_UPTIMEROBOT_API_URL` 为你的 API 代理地址
### 快速开始

1. 克隆项目
```bash
git clone https://github.com/JLinmr/uptime-status.git
cd uptime-status
```

2. 安装依赖
```bash
pnpm install
# 或
npm install
```

3. 配置环境变量

在 `.env` 文件中修改以下配置：

```bash
# 只读 Key
VITE_UPTIMEROBOT_API_KEY = "ur2290572-af4663a4e3f83be26119abbe"

# 数据接口地址
# 腾讯云 EdgeOne Pages、Vercel、Cloudflare Pages 使用 /api/status
# 其他部署方式需自行搭建代理，指向 https://api.uptimerobot.com/v2/getMonitors
VITE_UPTIMEROBOT_API_URL = "/api/status"

# 管理接口地址
VITE_UPTIMEROBOT_ADMIN_URL = "/api/admin"

# 站点名称
VITE_APP_TITLE = "梦爱吃鱼"
```

`UPTIMEROBOT_MAIN_API_KEY` 与 `ADMIN_PASSWORD` 不在 `.env` 中配置，需在部署平台的环境变量中设置。

4. 开发调试
```bash
pnpm dev
# 或
npm run dev

# 开发环境需要将 VITE_UPTIMEROBOT_API_URL 设置为 "https://api.uptimerobot.com/v2/getMonitors"
# 本地开发不启动 Pages Functions，管理接口不可用，需在部署环境验证
```

5. 构建部署
```bash
pnpm build
# 或
npm run build
```
构建的文件在 `dist` 目录下，将 `dist` 目录部署到服务器即可。

## 📝 开源协议

本项目基于 [MIT License](LICENSE) 开源，使用时请遵守开源协议。

## 🙏 致谢

- [UptimeRobot](https://uptimerobot.com/) - 提供监控 API 支持
- [Vue.js](https://vuejs.org/) - 前端框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Chart.js](https://www.chartjs.org/) - 图表库 
