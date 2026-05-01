# Skills — Gokou 技能注册表

此目录包含从以下仓库提取的 AI 工作流技能，由 Gokou 在执行任务时调用。

## 技能来源

| 技能文件 | 来源仓库 | 核心用途 |
|---------|---------|---------|
| [brainstorming.md](./brainstorming.md) | [obra/superpowers](https://github.com/obra/superpowers) | 任何创意/功能设计前的头脑风暴与规格确认 |
| [systematic-debugging.md](./systematic-debugging.md) | [obra/superpowers](https://github.com/obra/superpowers) | 遇到 Bug / 测试失败时的系统化调试 |
| [test-driven-development.md](./test-driven-development.md) | [obra/superpowers](https://github.com/obra/superpowers) | 实现任何功能或修复时先写测试 |
| [verification-before-completion.md](./verification-before-completion.md) | [obra/superpowers](https://github.com/obra/superpowers) | 声明工作完成前必须运行验证命令 |
| [executing-plans.md](./executing-plans.md) | [obra/superpowers](https://github.com/obra/superpowers) | 有已写好的实现计划时按计划执行 |
| [frontend-patterns.md](./frontend-patterns.md) | [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) | React/Next.js 前端开发最佳实践 |
| [ui-ux-pro-max.md](./ui-ux-pro-max.md) | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | UI/UX 设计智能：配色/字体/组件/动画/可访问性 |
| [prompt-optimization.md](./prompt-optimization.md) | [linshenkx/prompt-optimizer](https://github.com/linshenkx/prompt-optimizer) | 提示词优化：结构化、迭代改进提示词质量 |

## 调用规则（快速参考）

- **设计/开发新功能前** → `brainstorming`
- **遇到 Bug/报错** → `systematic-debugging`
- **写实现代码前** → `test-driven-development`
- **宣布任务完成前** → `verification-before-completion`
- **执行已有计划时** → `executing-plans`
- **开发前端 React/Next.js 组件** → `frontend-patterns`
- **任何 UI/UX 设计决策** → `ui-ux-pro-max`
- **撰写或优化提示词** → `prompt-optimization`
