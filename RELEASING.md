# Releasing Guide

本项目发布到三个渠道：npm、ClawHub、skills.sh。

## 发布渠道

| 渠道 | 用途 | 发布方式 |
|------|------|----------|
| **npm** | MCP Server + CLI 分发 | GitHub Release 自动触发 |
| **ClawHub** | OpenClaw Skill 市场 | 手动 `clawhub publish` |
| **skills.sh** | 通用 Agent Skill 目录 | 自动（基于 GitHub 仓库） |

## 发版流程

### 1. 更新版本号

修改以下文件中的版本号：

```bash
# package.json
"version": "x.y.z"

# src/mcp/index.ts
version: "x.y.z"

# src/cli/index.ts
.version("x.y.z")

# server.json
"version": "x.y.z"
```

### 2. 更新 CHANGELOG.md

在文件顶部添加新版本条目：

```markdown
## [x.y.z] - YYYY-MM-DD

### Added / Changed / Fixed / Removed
- 变更描述
```

### 3. 提交并推送

```bash
git add -A
git commit -m "release: vx.y.z"
git push origin main
```

### 4. 创建 GitHub Release → 自动发布 npm

```bash
gh release create vx.y.z --title "vx.y.z - 标题" --notes "变更说明"
```

GitHub Actions 会自动：
- 构建项目
- 使用 OIDC Trusted Publishing 发布到 npm（带 provenance 签名）

验证：
```bash
# 检查 CI 状态
gh run list --limit 1

# 检查 npm 上的版本
npm view dida365-ai-tools version
```

### 5. 发布 ClawHub Skill

```bash
clawhub publish ./skills/dida365-cli \
  --slug dida365-cli \
  --name "Dida365 CLI" \
  --version x.y.z \
  --changelog "变更说明"
```

### 6. skills.sh

无需操作。skills.sh 基于 GitHub 仓库自动索引，用户通过以下命令安装：

```bash
npx skills add oymy/dida365-ai-tools
```

## 基础设施

### npm Trusted Publishing (OIDC)

- 配置位置：https://www.npmjs.com/package/dida365-ai-tools/settings
- Workflow：`.github/workflows/publish.yml`
- 无需 NPM_TOKEN，使用 GitHub Actions OIDC 自动认证
- 要求 Node.js >= 24（npm >= 11.5.1）

### GitHub Actions

| Workflow | 触发条件 | 功能 |
|----------|----------|------|
| `ci.yml` | push to main | 构建检查 |
| `publish.yml` | release published | 自动发布到 npm |

### ClawHub 认证

```bash
clawhub login   # 浏览器登录（首次）
clawhub whoami  # 验证登录状态
```
