# dsh-codex-rail (中文文档)

<p align="center">
  <img src="https://img.shields.io/badge/DSH-Plugin-blue?style=flat-square" alt="DSH Plugin" />
  <img src="https://img.shields.io/badge/Version-1.3.9-green?style=flat-square" alt="Version 1.3.9" />
  <img src="https://img.shields.io/badge/License-MIT-purple?style=flat-square" alt="License MIT" />
  <img src="https://img.shields.io/badge/Vibe%20Coding-%E2%9C%A8-orange?style=flat-square" alt="Vibe Coding" />
</p>

<p align="center">
  <a href="./README.md"><b>English Version</b></a> &nbsp;|&nbsp; <b>简体中文</b>
</p>

---

将 **DeepSeek Harness (DSH)** 界面重构为极具现代质感的 **Codex 式双列活动栏**与**全窗一体化**工作区主题插件。

> [!NOTE]
> **作者声明：此为作者自用且为 vibecoding 产物。**  
> 本插件旨在为 DeepSeek Harness 打造精致沉浸的 Codex 双列活动栏与顶栏一体化视觉体验。功能演变与日常维护主要依据作者个人实际工作流展开，欢迎交流体验与提交 PR！

## ✨ 核心特性

- 🎨 **全窗顶栏一体化质感**  
  无缝打通原生标题栏与 48px 活动栏（Activity Rail），彻底消除断层与多余留白，与原生明亮/暗黑主题深度贴合。

- 🗂️ **Codex 级双列工作流与自适应 Popover 锚定**  
  - **48px 图标活动栏**：将插件、终端、浏览器、工作区切换以及 DSH 0.2.1-rc.3 / 0.2.1-rc.4 / 0.2.1-rc.5 / 0.2.2-alpha.2 原生「更多/创建插件」菜单归拢于左侧纵向 Rail，毫秒级浮层对齐，布局井然有序；
  - **弹性会话面板**：侧边列表支持平滑收展，留出最大化的主对话与编码视野；
  - **全套 Codex 专属图标**：深度适配补丁应用与变更检视（0.2.1-rc.5 apply_patch / 交付物审核）、LiveShare 协作共享（0.2.2-alpha.2 实时协作）、个性化推荐（0.2.1-rc.4 官方灵感徽标 / Sparkle）、开发者工具与运行统计（0.2.2-alpha.2 Stats）、Git 工作树与变更请求（0.2.2-alpha.2 Worktree）、Subagent OAR 协同、更多菜单（三点水平排列）、技能探索与看板等专属矢量图形。

- 👤 **快捷账号中心与水晶头像入口**  
  在活动栏底部常驻 30px 精美圆形水晶微质感头像与个人中心入口，点击即可直接呼出或定位到账号与模型配置。

- 🌈 **壁纸引擎无缝透光与毛玻璃兼容**  
  深度适配 Wallpaper Engine 壁纸插件，无缝支持液态磨砂毛玻璃（Liquid Glass）、侧边栏亚克力与全透模式（Full Clear）。

- ⚡ **会话前进 / 后退历史导航**  
  内置导航控制按键，并原生支持 <kbd>Alt</kbd> + <kbd>←</kbd>（后退）和 <kbd>Alt</kbd> + <kbd>→</kbd>（前进）全局快捷键，顺畅穿梭于多轮历史会话。

- 🪄 **工作区 10px 悬浮圆角卡片**  
  主对话与代码编辑区域采用卡片化容器包裹，搭配轻量内衬阴影与圆角设计，层次分明，极具科技美感。

- 🚀 **丝滑动画与高帧率过渡**  
  深度优化 CSS Transform 与浏览器重绘机制，彻底解决原生在侧边栏折叠与展开时的掉帧卡顿。

- ⚡ **智能空闲调度与高频 DOM 防抖 (Idle & Debounced Sync Engine)**  
  采用 120ms 动态防抖与浏览器原生 `requestIdleCallback`（300ms 超时保护），配合活动栏按钮 `__dshHtml` 缓存指纹；深度适配 DSH 0.2.1-rc.5 思维链流式推理展示、0.2.2-alpha.2 右侧栏文档预览与协作面板，彻底阻断高频重绘与多余 DOM 重排开销。

- 🪟 **右侧栏与多端视口自适应联动 (Right Sidebar & Expand Control)**  
  深度兼容 DSH master 及 0.2.2-alpha.2 视口宽度响应式规范，优化会话顶栏角落 `[data-sidebar-right-expand]` 展开/折叠控件质感，与 Codex 沉浸双列及浮动卡片保持毫秒级无缝联动。

## ⌨️ 快捷键速查

| 快捷键 | 功能说明 |
| :--- | :--- |
| <kbd>Alt</kbd> + <kbd>←</kbd> | 后退至上一个会话历史 |
| <kbd>Alt</kbd> + <kbd>→</kbd> | 前进至下一个会话历史 |
| 点击活动栏底部头像 | 快速唤出 / 跳转个人账号中心 |

## 📦 安装与使用

### 方式一：DSH 插件市场安装（推荐）
1. 启动 DeepSeek Harness (DSH)；
2. 进入 **插件市场 (Market)**；
3. 搜索 `dsh-codex-rail` 并点击 **安装**；
4. 安装完成后重启或刷新 DSH 即可生效。

### 方式二：命令行安装
进入你的 DSH 用户 Profile 目录（如 `~/.dsh/profiles/desktop` 或指定 workspace）：
```bash
npm install dsh-codex-rail
```

并在 `cordis.yml` 中确认启用：
```yaml
dsh-codex-rail: {}
```

### 方式三：开发者本地软链接调试
```bash
# 克隆仓库
git clone https://github.com/ComlaiGonnann/dsh-codex-rail.git

# 在 DSH 的 packages 目录下建立软链接 (Windows 示例)
mklink /J "%USERPROFILE%\.dsh\packages\dsh-codex-rail" "你的本地仓库路径\dsh-codex-rail"
```

## ⚙️ 兼容性说明
- **兼容 DSH 版本**：`>= 0.1.1-rc.1`（完美支持 DSH 0.2.0 / 0.2.1-rc.1 / 0.2.1-rc.2 / 0.2.1-rc.3 / 0.2.1-rc.4 / 0.2.1-rc.5 / 0.2.2-alpha.2 Desktop 与 Web）
- **适用平台**：Windows / macOS / Linux

## 📄 开源许可

本项目基于 [MIT License](./LICENSE) 开源发布。
