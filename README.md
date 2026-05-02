# gokouopenclaw

这是一个基于 [OpenClaw](https://docs.openclaw.ai) 理念构建的**个人 AI 助手仓库**。  
AI 助手代号 **Gokou**，长期驻留于此，跨对话积累记忆、执行任务、持续演化。

## 快速开始

在新的 GitHub Copilot 对话中恢复上下文：

1. 告知助手："请读取 `AGENTS.md` 并按其中规则工作"
2. 可选：粘贴 `MEMORY.md` 中的内容，恢复长期记忆
3. 开始你的任务

## 文件结构

| 文件 | 用途 |
|------|------|
| [`AGENTS.md`](./AGENTS.md) | 核心配置：角色定义、工作规则、记忆策略 |
| [`MEMORY.md`](./MEMORY.md) | 长期记忆：重要结论、偏好、未完成任务 |
| [`memory/daily.md`](./memory/daily.md) | 临时记录：当日草稿、调试日志 |