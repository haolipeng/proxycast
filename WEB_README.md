# ProxyCast 网页版

ProxyCast 的纯网页版本，无需 Tauri 桌面框架，通过浏览器访问。

## 快速开始

### 方式一：使用启动脚本（推荐）

```bash
./start-web.sh
```

脚本会自动：
1. 编译 Rust 后端（如果需要）
2. 构建前端（如果需要）
3. 启动服务器

### 方式二：手动启动

```bash
# 1. 编译后端
cargo build -p proxycast-server --release

# 2. 构建前端
cd web
npm install
npm run build
cd ..

# 3. 启动服务器
./target/release/proxycast-server --static-dir web/dist
```

## 访问地址

启动后访问：
- **Web UI**: http://127.0.0.1:9090
- **API**: http://127.0.0.1:9090/v1/chat/completions
- **管理 API**: http://127.0.0.1:9090/api/management

## 命令行选项

```
proxycast-server [OPTIONS]

Options:
  -H, --host <HOST>              监听地址 [default: 127.0.0.1]
  -p, --port <PORT>              监听端口 [default: 9090]
  -c, --config <CONFIG>          配置文件路径
      --static-dir <STATIC_DIR>  静态文件目录 [default: ./web/dist]
      --no-static                禁用静态文件服务
      --log-level <LOG_LEVEL>    日志级别 [default: info]
      --management-only          仅启动管理 API
      --management-port <PORT>   管理 API 端口
  -h, --help                     显示帮助
  -V, --version                  显示版本
```

## 开发模式

前端开发时，可以使用 Vite 开发服务器：

```bash
# 终端 1：启动后端
cargo run -p proxycast-server

# 终端 2：启动前端开发服务器
cd web
npm run dev
```

前端开发服务器会自动代理 API 请求到后端。

## 项目结构

```
proxycast/
├── crates/
│   ├── proxycast-core/     # 核心库
│   ├── proxycast-api/      # 管理 API 层
│   └── proxycast-server/   # 独立服务器
├── web/                    # 前端代码
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── src-tauri/              # Tauri 桌面版（保留）
└── start-web.sh            # 启动脚本
```

## 与桌面版的区别

| 功能 | 桌面版 | 网页版 |
|------|--------|--------|
| API 代理 | ✅ | ✅ |
| Provider 管理 | ✅ | ✅ |
| 流量监控 | ✅ | ✅ |
| 路由规则 | ✅ | ✅ |
| 弹性配置 | ✅ | ✅ |
| 系统托盘 | ✅ | ❌ |
| 浏览器拦截器 | ✅ | ❌ |
| 自动启动 | ✅ | ❌ |

## 配置文件

配置文件位置与桌面版相同：
- Linux/macOS: `~/.config/proxycast/config.yaml`
- Windows: `%APPDATA%\proxycast\config.yaml`

## 作为系统服务运行

### Linux (systemd)

```ini
# /etc/systemd/system/proxycast.service
[Unit]
Description=ProxyCast AI API Proxy
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/proxycast
ExecStart=/path/to/proxycast/target/release/proxycast-server --static-dir /path/to/proxycast/web/dist
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

启用服务：
```bash
sudo systemctl enable proxycast
sudo systemctl start proxycast
```

### macOS (launchd)

```xml
<!-- ~/Library/LaunchAgents/com.proxycast.server.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.proxycast.server</string>
    <key>ProgramArguments</key>
    <array>
        <string>/path/to/proxycast-server</string>
        <string>--static-dir</string>
        <string>/path/to/web/dist</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

启用服务：
```bash
launchctl load ~/Library/LaunchAgents/com.proxycast.server.plist
```
