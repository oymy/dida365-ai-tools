# Dida365 AI Tools

[![npm version](https://img.shields.io/npm/v/dida365-ai-tools.svg)](https://www.npmjs.com/package/dida365-ai-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)

Dida365（滴答清单）v3.0.0 MCP Server + CLI 工具，使用私有 API + Cookie 认证：

- **MCP Server** - 接入 Claude Code / Cursor / Windsurf，用自然语言管理任务
- **CLI** - 命令行直接操作，可脚本化、可管道、可接入 OpenClaw

借鉴了 [ticktick-py](https://github.com/lazeroffmichael/ticktick-py) 的私有 API 实现。

## Features

| 功能 | MCP Tool | CLI Command |
|------|----------|-------------|
| Cookie 认证 | `dida365_auth` | `auth cookie <token> / status` |
| 列出所有项目 | `dida365_list_projects` | `project list` |
| 项目详情与任务 | `dida365_get_project_tasks` | `project show <id>` |
| 查看任务 | `dida365_get_task` | `task show <taskId>` |
| 创建任务 | `dida365_create_task` | `task create <title> -p <pid>` |
| 更新任务 | `dida365_update_task` | - |
| 完成任务 | `dida365_complete_task` | `task complete <pid> <tid>` |
| 删除任务 | `dida365_delete_task` | `task delete <pid> <tid>` |
| 按日期/范围查询已完成 | `dida365_get_completed_tasks` | `completed date / range` |
| 今天完成的任务 | `dida365_get_completed_today` | `completed today` |
| 昨天完成的任务 | - | `completed yesterday` |
| 本周完成的任务 | `dida365_get_completed_this_week` | `completed week` |
| 全量同步（项目/任务/标签） | `dida365_sync` | `sync all` |
| 获取用户设置 | `dida365_get_settings` | `sync settings` |
| 获取时区 | - | `sync timezone` |
| 列出所有标签 | `dida365_list_tags` | `tag list` |
| 创建标签 | `dida365_create_tag` | `tag create <name>` |
| 重命名标签 | `dida365_rename_tag` | `tag rename <old> <new>` |
| 更新标签（颜色/层级） | `dida365_update_tag` | `tag color / nest` |
| 合并标签 | `dida365_merge_tags` | `tag merge <from> <to>` |
| 删除标签 | `dida365_delete_tag` | `tag delete <names...>` |
| 移动任务到其他项目 | `dida365_move_task` | `batch move-task` |
| 设置子任务 | `dida365_set_subtask` | `batch set-subtask` |
| 批量删除任务 | `dida365_batch_delete_tasks` | `batch delete-tasks` |
| 创建项目 | `dida365_batch_create_project` | `batch create-project` |
| 删除项目 | `dida365_batch_delete_projects` | `batch delete-projects` |
| 创建项目文件夹 | `dida365_create_project_group` | `batch create-folder` |
| 删除项目文件夹 | `dida365_delete_project_groups` | `batch delete-folders` |

## Architecture

```
src/
├── core/                          # 核心层（MCP 和 CLI 共享）
│   ├── api-client.ts              # 私有 API 端点
│   ├── token-store.ts             # Cookie Token 持久化
│   ├── types.ts                   # TypeScript 接口
│   └── services/
│       ├── completed.service.ts   # 已完成任务查询
│       ├── sync.service.ts        # 全量同步 + 用户设置
│       ├── tag.service.ts         # 标签 CRUD / 重命名 / 合并
│       └── batch.service.ts       # 批量任务/项目/文件夹操作
│
├── mcp/                           # MCP Server 入口（26 个工具）
│   ├── index.ts
│   └── tools/
│       ├── auth.tool.ts           # 认证（1 个工具）
│       ├── projects.tool.ts       # 项目（2 个工具）
│       ├── tasks.tool.ts          # 任务（5 个工具）
│       ├── completed.tool.ts      # 已完成任务（3 个工具）
│       ├── sync.tool.ts           # 同步（2 个工具）
│       ├── tag.tool.ts            # 标签（6 个工具）
│       └── batch.tool.ts          # 批量操作（7 个工具）
│
└── cli/                           # CLI 入口（7 个命令组，30+ 子命令）
    ├── index.ts
    ├── commands/
    │   ├── auth.cmd.ts            # auth cookie / status
    │   ├── project.cmd.ts         # project list / show
    │   ├── task.cmd.ts            # task create / show / complete / delete
    │   ├── completed.cmd.ts       # completed today / yesterday / week / date / range
    │   ├── sync.cmd.ts            # sync all / settings / timezone
    │   ├── tag.cmd.ts             # tag list / create / rename / color / nest / merge / delete
    │   └── batch.cmd.ts           # batch move-task / set-subtask / delete-tasks / create-project / ...
    └── utils/
        └── output.ts              # 格式化输出
```

## Installation

### Quick Start (npx)

```bash
# MCP Server - 零安装直接启动
npx dida365-ai-tools

# CLI - 零安装直接使用
npx -p dida365-ai-tools dida365 --help
```

### Global Install

```bash
npm install -g dida365-ai-tools

# Now available as:
dida365-mcp    # MCP Server
dida365        # CLI
```

### From Source

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/dida365-ai-tools.git
cd dida365-ai-tools
npm install
npm run build
```

## Authentication

本项目使用 Dida365 私有 API，通过 Cookie 认证。获取步骤：

1. 打开 [dida365.com](https://dida365.com) 并登录
2. 按 `F12` 打开开发者工具
3. 切换到 **Application** (应用) 标签页
4. 左侧找到 **Cookies** → `https://dida365.com`
5. 复制名为 `t` 的 Cookie 值

然后通过 CLI 设置认证：

```bash
dida365 auth cookie <your_cookie_value>
dida365 auth status    # 验证认证状态
```

或在 MCP 中使用 `dida365_auth` 工具设置 Cookie。

## Usage

### MCP Server

#### Claude Code

```bash
# 方式一：npx（推荐）
claude mcp add dida365 -- npx dida365-ai-tools

# 方式二：全局安装后
claude mcp add dida365 -- dida365-mcp
```

#### Cursor / Windsurf

在 MCP 配置文件中添加：

```json
{
  "mcpServers": {
    "dida365": {
      "command": "npx",
      "args": ["-y", "dida365-ai-tools"]
    }
  }
}
```

#### Smithery

Visit [smithery.ai](https://smithery.ai) and search for `dida365-ai-tools`.

### CLI

#### 认证

```bash
dida365 auth cookie <token>     # 设置 Cookie 认证
dida365 auth status             # 检查认证状态
```

#### 项目

```bash
dida365 project list            # 列出所有项目
dida365 project list --json     # JSON 输出
dida365 project show <id>       # 项目详情和任务
```

#### 任务

```bash
dida365 task create "买菜" -p <projectId>
dida365 task create "开会" -p <projectId> -c "讨论内容" --priority 5
dida365 task show <taskId>
dida365 task complete <projectId> <taskId>
dida365 task delete <projectId> <taskId>
```

#### 已完成任务查询

```bash
dida365 completed today                          # 今天
dida365 completed yesterday                      # 昨天
dida365 completed week                           # 本周
dida365 completed date 2024-01-15                # 指定日期
dida365 completed range 2024-01-01 2024-01-31    # 日期范围
dida365 completed today --timezone "Asia/Shanghai"
dida365 completed today --json                   # JSON 输出
```

#### 全量同步

```bash
dida365 sync all                # 同步所有项目/任务/标签
dida365 sync all --json         # JSON 输出
dida365 sync settings           # 查看用户设置
dida365 sync timezone           # 查看时区
```

#### 标签管理

```bash
dida365 tag list                        # 列出所有标签
dida365 tag create "工作" --color "#ff0000"
dida365 tag rename "旧名" "新名"
dida365 tag color "工作" "#0000ff"       # 修改颜色
dida365 tag nest "子标签" "父标签"       # 设置层级
dida365 tag merge "标签A" "标签B"        # 合并（A -> B）
dida365 tag delete "标签A" "标签B"       # 删除（支持多个）
```

#### 批量操作

```bash
# 任务操作
dida365 batch move-task <taskId> <fromProjectId> <toProjectId>
dida365 batch set-subtask <taskId> <parentId> <projectId>
dida365 batch delete-tasks taskId1:projectId1 taskId2:projectId2

# 项目操作
dida365 batch create-project "新项目" --color "#ff0000" --group <groupId>
dida365 batch delete-projects <projectId1> <projectId2>

# 文件夹操作
dida365 batch create-folder "工作"
dida365 batch delete-folders <groupId1> <groupId2>
```

## Development

```bash
npm run dev          # watch 模式，自动重编译
npm run build        # 构建
npm run mcp          # 启动 MCP Server
npm run cli -- <cmd> # 运行 CLI
```

## Publishing / Distribution

本项目支持以下发布渠道：

| 渠道 | 文件 | 说明 |
|------|------|------|
| **npm** | `package.json` | `npm publish` → 用户 `npx dida365-ai-tools` |
| **Smithery** | `smithery.yaml` | MCP Server 市场 |
| **MCP Registry** | `server.json` | 官方 MCP Server 注册表 |
| **GitHub Actions** | `.github/workflows/` | CI (build) + CD (npm publish on release) |

## Credits

- 私有 API 实现借鉴自 [ticktick-py](https://github.com/lazeroffmichael/ticktick-py)
- MCP SDK: [Model Context Protocol](https://github.com/modelcontextprotocol/sdk)
- CLI: [Commander.js](https://github.com/tj/commander.js)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

[MIT](LICENSE)
