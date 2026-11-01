(function () {
  function factory(require) {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    // 永久固定全局唯一 ID，杜绝频繁换 ID 导致旧节点漂移
    const STYLE_ID = "dsh-codex-sidebar-style";
    const RAIL_ID = "dsh-codex-sidebar-rail";
    const TOOLS_BOX_ID = "dsh-codex-sidebar-tools";
    const TITLE_NAV_ID = "dsh-codex-titlebar-nav";
    const BACK_BTN_ID = "dsh-codex-btn-back";
    const FWD_BTN_ID = "dsh-codex-btn-forward";
    const TITLE_TOGGLE_ID = "dsh-codex-btn-title-toggle";
    const TOGGLE_BTN_ID = "dsh-codex-btn-toggle";
    const HOME_BTN_ID = "dsh-codex-btn-home";
    const SETTINGS_SLOT_ID = "dsh-codex-settings-slot";
    const ACTION_CIRCLE_ID = "dsh-codex-btn-action-circle";

    let pluginCtx = null;
    let historyInited = false;
    let cleanupHistory = null;

    // 安全还原原生设置与账户区域，杜绝销毁原生 React 节点
    function restoreNativeSettingsArea() {
      try {
        const settingsSlot = document.getElementById(SETTINGS_SLOT_ID);
        const originSettingsArea = settingsSlot?.querySelector('._2H3hWW_settingsArea, .hHd-Xa_settingsArea, [data-slot="sidebar.settings"]');
        if (originSettingsArea) {
          const settingsBtn = originSettingsArea.querySelector('button');
          if (settingsBtn) {
            settingsBtn.classList.remove("dsh-codex-action-btn");
            settingsBtn.removeAttribute("data-tooltip");
            settingsBtn.querySelector('.dsh-codex-gear-icon')?.remove();
            settingsBtn.querySelector('.dsh-codex-avatar-face')?.remove();
          }
          const root = getSidebarRoot();
          const footArea = root?.querySelector('._2H3hWW_footArea, .hHd-Xa_footArea');
          if (footArea) {
            footArea.appendChild(originSettingsArea);
          } else if (root) {
            root.appendChild(originSettingsArea);
          }
        }
      } catch (e) {}
    }

    // 彻底清除历史残留外挂节点与样式，安全保全原生 React 节点
    function wipeAllZombies() {
      try {
        if (window.__DSH_CODEX_CLEANUP__) {
          window.__DSH_CODEX_CLEANUP__();
        }
      } catch (e) {}
      try {
        if (typeof cleanupHistory === "function") {
          cleanupHistory();
        }
      } catch (e) {}
      cleanupHistory = null;
      historyInited = false;
      restoreNativeSettingsArea();
      try {
        document.getElementById(TITLE_NAV_ID)?.remove();
        document.getElementById(RAIL_ID)?.remove();
        document.getElementById(STYLE_ID)?.remove();
        document.querySelectorAll('[id^="dsh-codex-"]:not(#' + SETTINGS_SLOT_ID + ')').forEach(el => el.remove());
        document.querySelectorAll(".dsh-codex-hide-source").forEach(el => el.classList.remove("dsh-codex-hide-source"));
      } catch (e) {}
    }

    try {
      wipeAllZombies();
    } catch (e) {}

    // 矢量图标定义 (100% 对齐 Codex 官方设计规范)
    const SVG = {
      // 上一步 (后退)
      back: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
      // 下一步 (前进)
      forward: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
      // 面板展开/收起图标 [ ◫ ]
      toggle: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`,
      // Codex 官方主页房子图标 (实心微圆角)
      home: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 3.2L2.5 11.2a1 1 0 0 0 .64 1.8H5v7a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-5h2v5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-7h1.86a1 1 0 0 0 .64-1.8L12 3.2z"/></svg>`,
      // Codex 官方设置齿轮图标
      gear: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
      // Codex 蓝色圆形快捷下载/更新操作图标
      download: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
      // 新会话小铅笔图标
      edit: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`,
      // 插件与工具
      plugin: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>`,
      tasks: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>`,
      skills: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
      // 更多菜单 (三点水平居中)
      more: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1.5" fill="currentColor"></circle><circle cx="19" cy="12" r="1.5" fill="currentColor"></circle><circle cx="5" cy="12" r="1.5" fill="currentColor"></circle></svg>`,
      // 灵感与个性化推荐 (DSH 0.2.1-rc.4 官方专属图标)
      recommendation: `<svg viewBox="0 0 36 36" width="18" height="18" fill="none"><path d="M8 9.8C8 8.81 8.81 8 9.8 8H14.7C15.69 8 16.5 8.81 16.5 9.8V14.7C16.5 15.69 15.69 16.5 14.7 16.5H9.8C8.81 16.5 8 15.69 8 14.7V9.8ZM8 21.3C8 20.31 8.81 19.5 9.8 19.5H14.7C15.69 19.5 16.5 20.31 16.5 21.3V26.2C16.5 27.19 15.69 28 14.7 28H9.8C8.81 28 8 27.19 8 26.2V21.3ZM19.5 21.3C19.5 20.31 20.31 19.5 21.3 19.5H26.2C27.19 19.5 28 20.31 28 21.3V26.2C28 27.19 27.19 28 26.2 28H21.3C20.31 28 19.5 27.19 19.5 26.2V21.3Z" fill="currentColor" opacity="0.88"/><path d="M23.75 7.25C24.47 10.58 25.67 11.78 29 12.5C25.67 13.22 24.47 14.42 23.75 17.75C23.03 14.42 21.83 13.22 18.5 12.5C21.83 11.78 23.03 10.58 23.75 7.25Z" fill="currentColor"/></svg>`,
      // 灵感与个性化推荐 (火花 Sparkle 备用)
      sparkle: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>`,
      // 自定义条目与编排
      custom: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
      // 开发者工具与运行时统计 (DSH 0.2.2-alpha.2 Inspector & Stats 专属图标)
      stats: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>`,
      // 变更请求与工作树 (DSH 0.2.2-alpha.2 Worktree & PR 专属图标)
      worktree: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>`,
      // 独立子代理与 OAR 协同 (DSH 0.2.2-alpha.2 Subagent OAR 专属图标)
      subagent: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>`,
      // 协作共享与 LiveShare (DSH 0.2.2-alpha.2 LiveShare 专属图标)
      share: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`,
      // 变更检视、多文件补丁与交付物 (DSH 0.2.1-rc.5 apply_patch & Changes Review 专属图标)
      patch: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="13" x2="15" y2="13"></line><line x1="12" y1="10" x2="12" y2="16"></line></svg>`
    };

    const EMOJI = {
      memory: "\u{1F9E0}",    // 🧠
      ext: "\u{1F9E9}",       // 🧩
      trending: "\u{1F525}",  // 🔥
      agy: "\u26A1"           // ⚡
    };

    // 行内保底样式，杜绝任何情况下回退为原生黑色方框按钮
    const BTN_STYLE_INLINE = [
      "display:inline-flex",
      "align-items:center",
      "justify-content:center",
      "width:36px",
      "height:36px",
      "min-width:36px",
      "min-height:36px",
      "max-width:36px",
      "max-height:36px",
      "border:none",
      "background:transparent",
      "border-radius:8px",
      "cursor:pointer",
      "padding:0",
      "margin:0",
      "box-sizing:border-box",
      "position:relative",
      "-webkit-app-region:no-drag",
      "outline:none",
      "user-select:none",
      "color:inherit"
    ].join(";");

    function injectCSS() {
      let style = document.getElementById(STYLE_ID);
      if (!style) {
        style = document.createElement("style");
        style.id = STYLE_ID;
        document.head.appendChild(style);
      }

      style.textContent = `
        /* ===== 严格对齐 Codex 原生双列布局规范 CSS ===== */
        :root {
          --codex-bar-w: 48px;
          --codex-panel-w: 250px;
          --codex-total-w: 298px;
          --codex-rail-bg: #f3f4f6;
          --codex-rail-border: rgba(0, 0, 0, 0.08);
          --codex-panel-bg: #ffffff;
          --codex-btn-color: #4b5563;
          --codex-btn-hover: rgba(0, 0, 0, 0.06);
          --codex-btn-active: rgba(0, 0, 0, 0.09);
          --codex-text-active: #111827;
          --codex-blue: #0066fe;
          --codex-ease: cubic-bezier(0.25, 1, 0.5, 1);
          --codex-dur: 0.22s;

          /* 重写 DSH 原生外框与标题栏底色，默认无壁纸时融合一体（有壁纸时由下方兼容层与壁纸引擎接管） */
          --dsw-specific-sidebar-fill: #f3f4f6;
          --dsh-windows-content-radius: 10px !important;
        }

        [data-ds-dark-theme], [data-theme="dark"], .dark {
          --codex-rail-bg: #171717;
          --codex-rail-border: rgba(255, 255, 255, 0.08);
          --codex-panel-bg: #212121;
          --codex-btn-color: #9ca3af;
          --codex-btn-hover: rgba(255, 255, 255, 0.08);
          --codex-btn-active: rgba(255, 255, 255, 0.14);
          --codex-text-active: #f9fafb;
          --codex-blue: #2563eb;

          --dsw-specific-sidebar-fill: #171717;
          --dsh-windows-content-radius: 10px !important;
        }

        /* 标题栏底色与活动栏彻底融合：全窗顶层、侧边栏列、顶栏拖拽条统一为纯正 Codex 浅灰/暗灰底色 (有壁纸时由壁纸引擎动态置空透明) */
        [data-windows-titlebar] .BynINW_frame,
        [data-windows-titlebar] .pI_x6G_frame,
        [data-windows-titlebar] .BynINW_frame:before,
        [data-windows-titlebar] .pI_x6G_frame:before,
        .BynINW_frame,
        .pI_x6G_frame,
        .BynINW_sidebarCol,
        .pI_x6G_sidebarCol,
        [data-windows-titlebar] .BynINW_sidebarCol,
        [data-windows-titlebar] .pI_x6G_sidebarCol {
          background: var(--dsw-specific-sidebar-fill, var(--codex-rail-bg)) !important;
          border-right: none !important;
          border-bottom: none !important;
          box-shadow: none !important;
        }

        /* 1. 标题栏导航控件与菜单起点：固定起点为 106px，彻底对齐 Codex (← → [◫] 文件 编辑 ...) */
        :root,
        html,
        body,
        html[data-windows-titlebar],
        html[data-windows-titlebar]:has([data-sidebar-collapsed]) {
          --dsh-windows-menu-start: 106px !important;
        }

        #${TITLE_NAV_ID} {
          position: fixed !important;
          top: calc((var(--dsh-windows-titlebar-height, 40px) - 26px) / 2) !important;
          left: 8px !important;
          height: 26px !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 3px !important;
          z-index: 99999 !important;
          -webkit-app-region: no-drag !important;
          pointer-events: auto !important;
          user-select: none !important;
        }

        .dsh-codex-title-btn {
          width: 26px !important;
          height: 26px !important;
          min-width: 26px !important;
          min-height: 26px !important;
          max-width: 26px !important;
          max-height: 26px !important;
          border-radius: 6px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: transparent !important;
          border: none !important;
          color: var(--codex-btn-color) !important;
          cursor: pointer !important;
          padding: 0 !important;
          margin: 0 !important;
          transition: background 0.12s ease, color 0.12s ease, opacity 0.12s ease !important;
          outline: none !important;
          position: relative !important;
          -webkit-app-region: no-drag !important;
          flex: none !important;
        }

        .dsh-codex-title-btn:hover:not(:disabled):not(.disabled) {
          background: var(--codex-btn-hover) !important;
          color: var(--codex-text-active) !important;
        }

        .dsh-codex-title-btn:active:not(:disabled):not(.disabled) {
          transform: scale(0.92) !important;
        }

        .dsh-codex-title-btn:disabled,
        .dsh-codex-title-btn.disabled {
          opacity: 0.3 !important;
          cursor: default !important;
          pointer-events: none !important;
        }

        .dsh-codex-title-btn::after {
          content: attr(data-tooltip);
          position: absolute !important;
          top: calc(100% + 5px) !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          background: rgba(15, 23, 42, 0.94) !important;
          color: #ffffff !important;
          font-size: 11.5px !important;
          font-weight: 500 !important;
          white-space: nowrap !important;
          padding: 3px 6px !important;
          border-radius: 4px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
          pointer-events: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          transition: opacity 0.12s ease !important;
          z-index: 999999 !important;
        }

        .dsh-codex-title-btn:hover:not(:disabled):not(.disabled)::after {
          opacity: 1 !important;
          visibility: visible !important;
        }

        .dsh-codex-title-btn:not([data-tooltip])::after,
        .dsh-codex-title-btn[data-tooltip=""]::after {
          display: none !important;
        }

        #${TITLE_TOGGLE_ID} {
          margin-left: 2px !important;
        }

        /* 移出标题栏原本悬浮的原生 toggle 与收起态 newSession，但保留 pointer-events 供内部脚本调用 */
        [data-windows-titlebar] ._2H3hWW_toggle,
        [data-windows-titlebar] .hHd-Xa_toggle,
        ._2H3hWW_root ._2H3hWW_toggle,
        .hHd-Xa_root .hHd-Xa_toggle,
        ._2H3hWW_toggle,
        .hHd-Xa_toggle {
          opacity: 0 !important;
          width: 0 !important;
          height: 0 !important;
          min-width: 0 !important;
          min-height: 0 !important;
          position: fixed !important;
          left: -9999px !important;
          top: -9999px !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          pointer-events: auto !important;
        }

        [data-windows-titlebar] ._2H3hWW_collapsed ._2H3hWW_newSession,
        [data-windows-titlebar] .hHd-Xa_collapsed .hHd-Xa_newSession {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          left: -9999px !important;
        }

        /* 2. AppFrame 外层网格轨道：解除 grid-template-columns 的 transition 性能瓶颈，首列设为 auto，完全由侧栏自身驱动 */
        .BynINW_frame,
        .pI_x6G_frame {
          grid-template-columns: auto minmax(400px, 1fr) auto !important;
          transition: none !important;
          will-change: auto;
        }

        /* 主对话区域：开启 CSS 布局与重排隔离（contain: layout style），防止侧栏伸缩时引发中间流式消息重排 */
        .BynINW_centerCol,
        .pI_x6G_centerCol {
          contain: layout style !important;
          min-width: 0 !important;
          background: var(--dsw-alias-bg-base, var(--codex-panel-bg)) !important;
          box-sizing: border-box !important;
          border-top: 1px solid var(--codex-rail-border) !important;
          transition: border-radius var(--codex-dur) var(--codex-ease), border-color var(--codex-dur) ease !important;
        }

        .BynINW_frame:not([data-sidebar-collapsed]) .BynINW_centerCol,
        .pI_x6G_frame:not([data-sidebar-collapsed]) .pI_x6G_centerCol,
        .BynINW_frame:not(:has(._2H3hWW_collapsed)) .BynINW_centerCol,
        .pI_x6G_frame:not(:has(.hHd-Xa_collapsed)) .pI_x6G_centerCol {
          border-radius: 0 !important;
          border-left: none !important;
        }

        .BynINW_frame[data-sidebar-collapsed] .BynINW_centerCol,
        .pI_x6G_frame[data-sidebar-collapsed] .pI_x6G_centerCol,
        .BynINW_frame:has(._2H3hWW_collapsed) .BynINW_centerCol,
        .pI_x6G_frame:has(.hHd-Xa_collapsed) .pI_x6G_centerCol {
          border-top-left-radius: 10px !important;
          border-left: 1px solid var(--codex-rail-border) !important;
        }

        /* 右侧面板展开与折叠按钮 (适配 DSH 0.2.1-rc.5 / 0.2.2-alpha.2 与 master PR #7556) */
        [data-sidebar-right-expand],
        [data-sidebar-right-toggle] {
          border-radius: 6px !important;
          transition: background 0.12s ease, color 0.12s ease !important;
        }
        [data-sidebar-right-expand]:hover,
        [data-sidebar-right-toggle]:hover {
          background: var(--codex-btn-hover) !important;
          color: var(--codex-text-active) !important;
        }

        /* 3. 侧边栏根容器平滑过渡：只对单一 width 属性做硬件加速过渡，配合旗舰级 Quart Out 缓动曲线 */
        ._2H3hWW_root,
        .hHd-Xa_root {
          box-sizing: border-box !important;
          margin: 0 !important;
          height: 100% !important;
          overflow: hidden !important;
          contain: paint layout !important;
          background: var(--dsw-specific-sidebar-fill, var(--codex-rail-bg)) !important;
          transition: width var(--codex-dur) var(--codex-ease) !important;
          will-change: width;
        }

        /* 展开状态：底色统一为 rail 浅灰/暗灰，与标题栏无缝贯通一体 */
        ._2H3hWW_root:not(._2H3hWW_collapsed),
        .hHd-Xa_root:not(.hHd-Xa_collapsed) {
          position: relative !important;
          width: var(--codex-total-w) !important;
          min-width: var(--codex-total-w) !important;
          max-width: var(--codex-total-w) !important;
          padding-left: var(--codex-bar-w) !important;
        }

        /* 工作区专属白底卡片容器：从 48px 活动栏右侧起跑，上边缘优雅圆角，外围被统一浅灰外壳环绕 */
        ._2H3hWW_root::after,
        .hHd-Xa_root::after {
          content: "" !important;
          position: absolute !important;
          left: var(--codex-bar-w) !important;
          top: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: var(--codex-panel-bg) !important;
          border-top-left-radius: 10px !important;
          border-top: 1px solid var(--codex-rail-border) !important;
          border-left: 1px solid var(--codex-rail-border) !important;
          border-right: 1px solid var(--codex-rail-border) !important;
          box-sizing: border-box !important;
          pointer-events: none !important;
          z-index: 0 !important;
          opacity: 1 !important;
          transition: opacity 0.16s ease !important;
        }

        ._2H3hWW_root._2H3hWW_collapsed::after,
        .hHd-Xa_root.hHd-Xa_collapsed::after,
        .BynINW_frame[data-sidebar-collapsed] ._2H3hWW_root::after,
        .pI_x6G_frame[data-sidebar-collapsed] .hHd-Xa_root::after {
          opacity: 0 !important;
        }

        /* 确保工作区内所有功能部件浮于卡片之上，背景透出优雅圆角 */
        ._2H3hWW_root:not(._2H3hWW_collapsed) ._2H3hWW_logoRow,
        .hHd-Xa_root:not(.hHd-Xa_collapsed) .hHd-Xa_logoRow,
        ._2H3hWW_root:not(._2H3hWW_collapsed) ._2H3hWW_brand,
        .hHd-Xa_root:not(.hHd-Xa_collapsed) .hHd-Xa_brand,
        ._2H3hWW_root:not(._2H3hWW_collapsed) ._2H3hWW_newSession,
        .hHd-Xa_root:not(.hHd-Xa_collapsed) .hHd-Xa_newSession,
        ._2H3hWW_root:not(._2H3hWW_collapsed) ._2H3hWW_regionArea,
        .hHd-Xa_root:not(.hHd-Xa_collapsed) .hHd-Xa_regionArea,
        ._2H3hWW_root:not(._2H3hWW_collapsed) ._2H3hWW_footArea,
        .hHd-Xa_root:not(.hHd-Xa_collapsed) .hHd-Xa_footArea {
          position: relative !important;
          z-index: 1 !important;
        }

        /* 收起状态：根容器固定为 48px 宽 */
        ._2H3hWW_root._2H3hWW_collapsed,
        .hHd-Xa_root.hHd-Xa_collapsed,
        .BynINW_frame[data-sidebar-collapsed] ._2H3hWW_root,
        .pI_x6G_frame[data-sidebar-collapsed] .hHd-Xa_root {
          position: relative !important;
          width: var(--codex-bar-w) !important;
          min-width: var(--codex-bar-w) !important;
          max-width: var(--codex-bar-w) !important;
          padding: 0 !important;
          display: flex !important;
        }

        /* 工作区右侧面板平滑过渡，锁死 250px 宽度杜绝文字换行与抖动，启用 GPU 合成层（注意：不对 _brand 或子元素设 250px 宽，以免撑爆鲸鱼图标） */
        ._2H3hWW_root ._2H3hWW_logoRow,
        .hHd-Xa_root .hHd-Xa_logoRow,
        ._2H3hWW_root ._2H3hWW_regionArea,
        .hHd-Xa_root .hHd-Xa_regionArea {
          min-width: var(--codex-panel-w) !important;
          width: var(--codex-panel-w) !important;
          transform: translate3d(0, 0, 0) !important;
          opacity: 1 !important;
          transition: opacity 0.16s ease, transform var(--codex-dur) var(--codex-ease) !important;
          will-change: transform, opacity;
        }

        ._2H3hWW_root ._2H3hWW_brand,
        .hHd-Xa_root .hHd-Xa_brand,
        ._2H3hWW_root > button._2H3hWW_newSession,
        .hHd-Xa_root > button.hHd-Xa_newSession {
          transform: translate3d(0, 0, 0) !important;
          opacity: 1 !important;
          transition: opacity 0.16s ease, transform var(--codex-dur) var(--codex-ease) !important;
          will-change: transform, opacity;
        }

        /* 收起状态下：硬件加速滑出并淡出 */
        ._2H3hWW_root._2H3hWW_collapsed ._2H3hWW_logoRow,
        .hHd-Xa_root.hHd-Xa_collapsed .hHd-Xa_logoRow,
        ._2H3hWW_root._2H3hWW_collapsed ._2H3hWW_brand,
        .hHd-Xa_root.hHd-Xa_collapsed .hHd-Xa_brand,
        ._2H3hWW_root._2H3hWW_collapsed > button._2H3hWW_newSession,
        .hHd-Xa_root.hHd-Xa_collapsed > button.hHd-Xa_newSession,
        ._2H3hWW_root._2H3hWW_collapsed ._2H3hWW_regionArea,
        .hHd-Xa_root.hHd-Xa_collapsed .hHd-Xa_regionArea,
        .BynINW_frame[data-sidebar-collapsed] ._2H3hWW_logoRow,
        .pI_x6G_frame[data-sidebar-collapsed] .hHd-Xa_logoRow,
        .BynINW_frame[data-sidebar-collapsed] ._2H3hWW_brand,
        .pI_x6G_frame[data-sidebar-collapsed] .hHd-Xa_brand,
        .BynINW_frame[data-sidebar-collapsed] ._2H3hWW_root > button._2H3hWW_newSession,
        .pI_x6G_frame[data-sidebar-collapsed] .hHd-Xa_root > button.hHd-Xa_newSession,
        .BynINW_frame[data-sidebar-collapsed] ._2H3hWW_regionArea,
        .pI_x6G_frame[data-sidebar-collapsed] .hHd-Xa_regionArea {
          opacity: 0 !important;
          transform: translate3d(-14px, 0, 0) !important;
          pointer-events: none !important;
        }

        /* 4. 左侧独立 48px Codex 活动栏 (Activity Bar) - 紧凑贴顶消除违和空隙！ */
        #${RAIL_ID} {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          bottom: 0 !important;
          width: var(--codex-bar-w) !important;
          height: 100% !important;
          background: transparent !important;
          border-right: none !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          align-items: center !important;
          padding: 4px 0 10px 0 !important;
          box-sizing: border-box !important;
          z-index: 9999 !important;
          -webkit-app-region: no-drag !important;
          user-select: none !important;
        }

        #dsh-codex-top-group {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          width: 100% !important;
          gap: 4px !important;
        }

        #${TOOLS_BOX_ID} {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          width: 100% !important;
          gap: 4px !important;
          max-height: calc(100vh - 220px) !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
        #${TOOLS_BOX_ID}::-webkit-scrollbar {
          display: none !important;
        }

        /* 底部群组：严格 48px 宽，居中对齐，杜绝任何位移 */
        #dsh-codex-bot-group {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: flex-end !important;
          width: 100% !important;
          gap: 6px !important;
          box-sizing: border-box !important;
        }

        .dsh-codex-rail-sep {
          width: 24px !important;
          height: 1px !important;
          background: var(--codex-rail-border) !important;
          margin: 4px 0 !important;
          flex: none !important;
        }

        /* 5. 活动栏按钮统一规格 (36x36px，8px 圆角) */
        .dsh-codex-action-btn {
          position: relative !important;
          width: 36px !important;
          height: 36px !important;
          min-width: 36px !important;
          min-height: 36px !important;
          border-radius: 8px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: transparent !important;
          border: none !important;
          color: var(--codex-btn-color) !important;
          cursor: pointer !important;
          padding: 0 !important;
          margin: 0 !important;
          transition: background 0.12s ease, color 0.12s ease !important;
          outline: none !important;
          flex: none !important;
        }

        .dsh-codex-action-btn:hover {
          background: var(--codex-btn-hover) !important;
          color: var(--codex-text-active) !important;
        }

        .dsh-codex-action-btn:active {
          transform: scale(0.96) !important;
        }

        .dsh-codex-action-btn.active {
          background: var(--codex-btn-active) !important;
          color: var(--codex-text-active) !important;
        }

        .dsh-codex-action-btn svg {
          flex: none !important;
        }

        /* Codex 专属小蓝点指示器 (6px 直径，纯正 Codex 风格) */
        .dsh-codex-dot {
          position: absolute !important;
          top: 6px !important;
          right: 6px !important;
          width: 6px !important;
          height: 6px !important;
          border-radius: 50% !important;
          background: var(--codex-blue) !important;
          border: 1.5px solid var(--codex-rail-bg) !important;
          pointer-events: none !important;
          box-sizing: border-box !important;
        }

        /* 数字徽标 (如有大数值通知) */
        .dsh-codex-badge {
          position: absolute !important;
          top: 2px !important;
          right: 2px !important;
          min-width: 14px !important;
          height: 14px !important;
          padding: 0 3px !important;
          border-radius: 7px !important;
          background: var(--codex-blue) !important;
          color: #ffffff !important;
          font-size: 9px !important;
          font-weight: 700 !important;
          line-height: 14px !important;
          text-align: center !important;
          border: 1.5px solid var(--codex-rail-bg) !important;
          box-sizing: border-box !important;
          pointer-events: none !important;
        }

        /* 悬浮气泡提示 (Tooltip) 始终在按钮右侧旁边弹出 */
        .dsh-codex-action-btn::after {
          content: attr(data-tooltip);
          position: absolute !important;
          left: calc(100% + 9px) !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          background: rgba(15, 23, 42, 0.94) !important;
          color: #ffffff !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          white-space: nowrap !important;
          padding: 4px 8px !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25) !important;
          pointer-events: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          transition: opacity 0.12s ease !important;
          z-index: 999999 !important;
        }
        .dsh-codex-action-btn:hover::after,
        .dsh-codex-blue-circle-btn:hover::after {
          opacity: 1 !important;
          visibility: visible !important;
        }

        .dsh-codex-action-btn:not([data-tooltip])::after,
        .dsh-codex-action-btn[data-tooltip=""]::after {
          display: none !important;
        }

        /* 6. 核心细节：将账户中心与设置完美化身为 Codex 底部圆形头像按钮 */
        #${SETTINGS_SLOT_ID} {
          width: 36px !important;
          height: 36px !important;
          min-width: 36px !important;
          min-height: 36px !important;
          max-width: 36px !important;
          max-height: 36px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          position: relative !important;
          box-sizing: border-box !important;
          flex: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* 强制重置 settingsArea 及其所有包裹层为固定 36x36 居中容器 */
        #${SETTINGS_SLOT_ID} ._2H3hWW_settingsArea,
        #${SETTINGS_SLOT_ID} .hHd-Xa_settingsArea,
        #${SETTINGS_SLOT_ID} [class*="triggerRow"],
        #${SETTINGS_SLOT_ID} [data-slot="settings.launcher"],
        #${SETTINGS_SLOT_ID} [data-slot="sidebar.settings"],
        #${SETTINGS_SLOT_ID} [data-slot*="settings"],
        #${SETTINGS_SLOT_ID} .ET65mq_root,
        #${SETTINGS_SLOT_ID} .ET65mq_anchor {
          position: static !important;
          width: 36px !important;
          height: 36px !important;
          min-width: 36px !important;
          min-height: 36px !important;
          max-width: 36px !important;
          max-height: 36px !important;
          margin: 0 !important;
          padding: 0 !important;
          gap: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-sizing: border-box !important;
          animation: none !important;
          transition: none !important;
          transform: none !important;
          pointer-events: auto !important;
          -webkit-app-region: no-drag !important;
          flex: none !important;
          overflow: visible !important;
          background: transparent !important;
          border: none !important;
        }

        /* 仅精准隐藏次级状态连接点与更新提示，绝不误伤 slot 和按钮结构 */
        #${SETTINGS_SLOT_ID} [class*="indicator"],
        #${SETTINGS_SLOT_ID} [class*="Indicator"],
        #${SETTINGS_SLOT_ID} .yiN2GW_indicator {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
        }

        /* 底部账号/设置按钮：严格 30x30px 圆形水晶微质感头像按钮 */
        #${SETTINGS_SLOT_ID} button,
        ._2H3hWW_root ._2H3hWW_settingsArea button,
        .hHd-Xa_root .hHd-Xa_settingsArea button {
          width: 30px !important;
          height: 30px !important;
          min-width: 30px !important;
          min-height: 30px !important;
          max-width: 30px !important;
          max-height: 30px !important;
          border-radius: 50% !important;
          padding: 0 !important;
          margin: 0 !important;
          border: 1px solid rgba(255, 255, 255, 0.22) !important;
          background: rgba(255, 255, 255, 0.15) !important;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3) !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-sizing: border-box !important;
          outline: none !important;
          transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease !important;
          position: relative !important;
          font-size: 0 !important;
          gap: 0 !important;
          overflow: hidden !important;
          flex: none !important;
        }

        #${SETTINGS_SLOT_ID} button:hover,
        ._2H3hWW_root ._2H3hWW_settingsArea button:hover,
        .hHd-Xa_root .hHd-Xa_settingsArea button:hover {
          transform: scale(1.08) !important;
          background: rgba(255, 255, 255, 0.25) !important;
          border-color: rgba(255, 255, 255, 0.45) !important;
        }

        #${SETTINGS_SLOT_ID} button:active,
        ._2H3hWW_root ._2H3hWW_settingsArea button:active,
        .hHd-Xa_root .hHd-Xa_settingsArea button:active {
          transform: scale(0.95) !important;
        }

        /* 隐藏账号中心按钮内的文字 label (如用户名) */
        #${SETTINGS_SLOT_ID} button [class*="label"],
        #${SETTINGS_SLOT_ID} button [class*="Label"] {
          display: none !important;
        }

        /* 账号真实头像容器 span：28x28px 圆形，居中，柔和阴影 */
        #${SETTINGS_SLOT_ID} button [class*="avatar"],
        #${SETTINGS_SLOT_ID} button [class*="Avatar"],
        ._2H3hWW_root ._2H3hWW_settingsArea button [class*="avatar"],
        ._2H3hWW_root ._2H3hWW_settingsArea button [class*="Avatar"],
        .hHd-Xa_root .hHd-Xa_settingsArea button [class*="avatar"],
        .hHd-Xa_root .hHd-Xa_settingsArea button [class*="Avatar"] {
          width: 28px !important;
          height: 28px !important;
          min-width: 28px !important;
          min-height: 28px !important;
          max-width: 28px !important;
          max-height: 28px !important;
          border-radius: 50% !important;
          overflow: hidden !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
          background: var(--codex-rail-border) !important;
          flex: none !important;
          pointer-events: none !important;
        }

        /* 账号真实头像图片 img：100% 充满圆形容器，保持比例 */
        #${SETTINGS_SLOT_ID} button img,
        #${SETTINGS_SLOT_ID} button [class*="avatar"] img,
        ._2H3hWW_root ._2H3hWW_settingsArea button img,
        .hHd-Xa_root .hHd-Xa_settingsArea button img {
          width: 100% !important;
          height: 100% !important;
          min-width: 100% !important;
          min-height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          border-radius: 50% !important;
          object-fit: cover !important;
          display: block !important;
          pointer-events: none !important;
        }

        /* 若暂未加载头像图片或未登录（显示 SVG 图标时），居中 17x17px */
        #${SETTINGS_SLOT_ID} button svg,
        ._2H3hWW_root ._2H3hWW_settingsArea button svg,
        .hHd-Xa_root .hHd-Xa_settingsArea button svg {
          width: 17px !important;
          height: 17px !important;
          display: block !important;
          color: var(--codex-btn-color) !important;
          pointer-events: none !important;
          flex: none !important;
        }

        /* 7. 工作区面板细节精修：Logo 栏、新会话按键、列表完全对标 Codex */
        ._2H3hWW_root ._2H3hWW_logoRow,
        .hHd-Xa_root .hHd-Xa_logoRow {
          height: 44px !important;
          min-height: 44px !important;
          padding: 0 12px 0 14px !important;
          margin: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          flex: none !important;
          border-bottom: 1px solid var(--codex-rail-border) !important;
          background: transparent !important;
          border-top-left-radius: 10px !important;
        }

        ._2H3hWW_root ._2H3hWW_brandName,
        .hHd-Xa_root .hHd-Xa_brandName {
          font-size: 15px !important;
          font-weight: 600 !important;
          color: var(--codex-text-active) !important;
          letter-spacing: -0.01em !important;
        }

        /* 新会话按钮：精炼、扁平、轻薄，仅对顶级 button._newSession 生效，绝不污染内部子 span */
        ._2H3hWW_root > button._2H3hWW_newSession,
        .hHd-Xa_root > button.hHd-Xa_newSession {
          width: calc(var(--codex-panel-w) - 16px) !important;
          min-width: calc(var(--codex-panel-w) - 16px) !important;
          max-width: calc(var(--codex-panel-w) - 16px) !important;
          margin: 8px 8px 6px 8px !important;
          height: 34px !important;
          min-height: 34px !important;
          border: 1px solid rgba(0, 0, 0, 0.06) !important;
          background: rgba(0, 0, 0, 0.025) !important;
          border-radius: 6px !important;
          color: var(--codex-text-active) !important;
          font-size: 13.5px !important;
          font-weight: 500 !important;
          padding: 0 10px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 6px !important;
          box-shadow: none !important;
          transition: background 0.12s ease, opacity 0.16s ease, transform var(--codex-dur) var(--codex-ease) !important;
        }

        [data-ds-dark-theme] ._2H3hWW_root > button._2H3hWW_newSession,
        [data-ds-dark-theme] .hHd-Xa_root > button.hHd-Xa_newSession {
          border-color: rgba(255, 255, 255, 0.08) !important;
          background: rgba(255, 255, 255, 0.04) !important;
        }

        ._2H3hWW_root > button._2H3hWW_newSession:hover,
        .hHd-Xa_root > button.hHd-Xa_newSession:hover {
          background: var(--codex-btn-hover) !important;
        }

        /* 列表区域微调 */
        ._2H3hWW_root ._2H3hWW_regionArea,
        .hHd-Xa_root .hHd-Xa_regionArea {
          margin: 0 !important;
          padding: 4px 8px 12px 8px !important;
          width: var(--codex-panel-w) !important;
          flex: 1 1 0% !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }

        ._2H3hWW_root ._2H3hWW_regionArea::-webkit-scrollbar,
        .hHd-Xa_root .hHd-Xa_regionArea::-webkit-scrollbar {
          width: 4px !important;
        }
        ._2H3hWW_root ._2H3hWW_regionArea::-webkit-scrollbar-thumb,
        .hHd-Xa_root .hHd-Xa_regionArea::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.12) !important;
          border-radius: 2px !important;
        }

        /* 会话列表行细节优化：对标 Codex 原生圆角与平滑交互质感 */
        [data-row-key^="session:"],
        ._2H3hWW_root [role="treeitem"],
        .hHd-Xa_root [role="treeitem"] {
          border-radius: 6px !important;
          transition: background 0.12s ease, color 0.12s ease !important;
        }

        /* 隐藏冗余原生底部面板与已迁移的插件源节点 */
        ._2H3hWW_root ._2H3hWW_panelList,
        .hHd-Xa_root .hHd-Xa_panelList,
        ._2H3hWW_root ._2H3hWW_footerActions,
        .hHd-Xa_root .hHd-Xa_footerActions,
        .dsh-codex-hide-source:not([aria-haspopup="menu"]) {
          display: none !important;
        }

        /* 原生带 popover/menu 的 anchor 保留布局测算，但视觉完全隐形、不拦截任何事件 */
        .dsh-codex-hide-source[aria-haspopup="menu"],
        [class*="moreAnchor"]:has(.dsh-codex-hide-source) {
          position: fixed !important;
          opacity: 0 !important;
          pointer-events: none !important;
          left: -9999px !important;
          top: -9999px !important;
          width: 36px !important;
          height: 36px !important;
        }

        /* ===== 🌈 Wallpaper Engine (dsh-wallpaper-engine) 深度兼容全透明与毛玻璃模式 =====
           当壁纸在场时（body[data-we-wallpaper]、body:has(#dsh-wallpaper-engine-layer) 或存在壁纸图层），
           所有实心底板彻底清底让路，48px 活动栏与 250px 工作区侧栏全部透明跟随壁纸！ */

        body[data-we-wallpaper],
        body:has(#dsh-wallpaper-engine-layer),
        body:has(#dsh-wallpaper-engine-scrim),
        body:has(.we-layer),
        body:has(.we-scrim),
        html:has(#dsh-wallpaper-engine-layer) body,
        html:has(.we-layer) body {
          --dsw-specific-sidebar-fill: transparent !important;
          --dsw-alias-bg-base: transparent !important;
          --codex-rail-bg: transparent !important;
          --codex-panel-bg: transparent !important;
          --codex-rail-border: rgba(255, 255, 255, 0.1) !important;
          --codex-btn-color: rgba(255, 255, 255, 0.78) !important;
          --codex-btn-hover: rgba(255, 255, 255, 0.1) !important;
          --codex-btn-active: rgba(255, 255, 255, 0.16) !important;
          --codex-text-active: #ffffff !important;
        }

        /* 1. 外框、标题栏、侧栏外列、侧栏根容器与主对话区彻底让路清底 */
        body[data-we-wallpaper] .BynINW_frame,
        body[data-we-wallpaper] .pI_x6G_frame,
        body[data-we-wallpaper] [data-windows-titlebar] .BynINW_frame,
        body[data-we-wallpaper] [data-windows-titlebar] .pI_x6G_frame,
        body[data-we-wallpaper] [data-windows-titlebar] .BynINW_frame:before,
        body[data-we-wallpaper] [data-windows-titlebar] .pI_x6G_frame:before,
        body[data-we-wallpaper] .BynINW_sidebarCol,
        body[data-we-wallpaper] .pI_x6G_sidebarCol,
        body[data-we-wallpaper] [data-windows-titlebar] .BynINW_sidebarCol,
        body[data-we-wallpaper] [data-windows-titlebar] .pI_x6G_sidebarCol,
        body[data-we-wallpaper] .BynINW_centerCol,
        body[data-we-wallpaper] .pI_x6G_centerCol,
        body[data-we-wallpaper] [data-windows-titlebar] .BynINW_centerCol,
        body[data-we-wallpaper] [data-windows-titlebar] .pI_x6G_centerCol,
        body[data-we-wallpaper] ._2H3hWW_root,
        body[data-we-wallpaper] .hHd-Xa_root,
        body:has(#dsh-wallpaper-engine-layer) .BynINW_frame,
        body:has(#dsh-wallpaper-engine-layer) .pI_x6G_frame,
        body:has(#dsh-wallpaper-engine-layer) [data-windows-titlebar] .BynINW_frame,
        body:has(#dsh-wallpaper-engine-layer) [data-windows-titlebar] .pI_x6G_frame,
        body:has(#dsh-wallpaper-engine-layer) [data-windows-titlebar] .BynINW_frame:before,
        body:has(#dsh-wallpaper-engine-layer) [data-windows-titlebar] .pI_x6G_frame:before,
        body:has(#dsh-wallpaper-engine-layer) .BynINW_sidebarCol,
        body:has(#dsh-wallpaper-engine-layer) .pI_x6G_sidebarCol,
        body:has(#dsh-wallpaper-engine-layer) [data-windows-titlebar] .BynINW_sidebarCol,
        body:has(#dsh-wallpaper-engine-layer) [data-windows-titlebar] .pI_x6G_sidebarCol,
        body:has(#dsh-wallpaper-engine-layer) .BynINW_centerCol,
        body:has(#dsh-wallpaper-engine-layer) .pI_x6G_centerCol,
        body:has(#dsh-wallpaper-engine-layer) [data-windows-titlebar] .BynINW_centerCol,
        body:has(#dsh-wallpaper-engine-layer) [data-windows-titlebar] .pI_x6G_centerCol,
        body:has(#dsh-wallpaper-engine-layer) ._2H3hWW_root,
        body:has(#dsh-wallpaper-engine-layer) .hHd-Xa_root,
        body:has(.we-layer) .BynINW_frame,
        body:has(.we-layer) .pI_x6G_frame,
        body:has(.we-layer) [data-windows-titlebar] .BynINW_frame,
        body:has(.we-layer) [data-windows-titlebar] .pI_x6G_frame,
        body:has(.we-layer) [data-windows-titlebar] .BynINW_frame:before,
        body:has(.we-layer) [data-windows-titlebar] .pI_x6G_frame:before,
        body:has(.we-layer) .BynINW_sidebarCol,
        body:has(.we-layer) .pI_x6G_sidebarCol,
        body:has(.we-layer) [data-windows-titlebar] .BynINW_sidebarCol,
        body:has(.we-layer) [data-windows-titlebar] .pI_x6G_sidebarCol,
        body:has(.we-layer) .BynINW_centerCol,
        body:has(.we-layer) .pI_x6G_centerCol,
        body:has(.we-layer) [data-windows-titlebar] .BynINW_centerCol,
        body:has(.we-layer) [data-windows-titlebar] .pI_x6G_centerCol,
        body:has(.we-layer) ._2H3hWW_root,
        body:has(.we-layer) .hHd-Xa_root {
          background: transparent !important;
          box-shadow: none !important;
        }

        /* 2. 壁纸模式下：侧边栏（48px活动栏与250px展开卡片）全透明透光，不添加杂乱双边框线 */
        body[data-we-wallpaper] ._2H3hWW_root::after,
        body[data-we-wallpaper] .hHd-Xa_root::after,
        body[data-we-wallpaper] #${RAIL_ID},
        body:has(#dsh-wallpaper-engine-layer) ._2H3hWW_root::after,
        body:has(#dsh-wallpaper-engine-layer) .hHd-Xa_root::after,
        body:has(#dsh-wallpaper-engine-layer) #${RAIL_ID},
        body:has(.we-layer) ._2H3hWW_root::after,
        body:has(.we-layer) .hHd-Xa_root::after,
        body:has(.we-layer) #${RAIL_ID} {
          background: transparent !important;
          background-color: transparent !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          border: none !important;
          box-shadow: none !important;
        }

        /* 活动栏右侧与工作区右侧仅保留单条极细腻微光分割线 */
        body[data-we-wallpaper] #${RAIL_ID},
        body:has(#dsh-wallpaper-engine-layer) #${RAIL_ID},
        body:has(.we-layer) #${RAIL_ID} {
          border-right: 1px solid rgba(255, 255, 255, 0.07) !important;
        }

        body[data-we-wallpaper] .BynINW_centerCol,
        body[data-we-wallpaper] .pI_x6G_centerCol,
        body:has(#dsh-wallpaper-engine-layer) .BynINW_centerCol,
        body:has(#dsh-wallpaper-engine-layer) .pI_x6G_centerCol,
        body:has(.we-layer) .BynINW_centerCol,
        body:has(.we-layer) .pI_x6G_centerCol {
          border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
        }

        /* 壁纸模式下新会话按钮微光质感 */
        body[data-we-wallpaper] ._2H3hWW_root > button._2H3hWW_newSession,
        body[data-we-wallpaper] .hHd-Xa_root > button.hHd-Xa_newSession,
        body:has(#dsh-wallpaper-engine-layer) ._2H3hWW_root > button._2H3hWW_newSession,
        body:has(#dsh-wallpaper-engine-layer) .hHd-Xa_root > button.hHd-Xa_newSession,
        body:has(.we-layer) ._2H3hWW_root > button._2H3hWW_newSession,
        body:has(.we-layer) .hHd-Xa_root > button.hHd-Xa_newSession {
          border-color: rgba(255, 255, 255, 0.12) !important;
          background: rgba(255, 255, 255, 0.05) !important;
          color: #ffffff !important;
        }

        /* 3. 当用户在 Wallpaper 插件中主动开启【左侧栏液态玻璃】且未开启全透时，支持毛玻璃效果 */
        body[data-we-left-sidebar]:not([data-we-sidebar-fullclear]) ._2H3hWW_root::after,
        body[data-we-left-sidebar]:not([data-we-sidebar-fullclear]) .hHd-Xa_root::after,
        body[data-we-left-sidebar]:not([data-we-sidebar-fullclear]) #${RAIL_ID} {
          backdrop-filter: blur(var(--we-left-sidebar-blur, var(--we-sidebar-blur, var(--we-blur, 16px))))
                           saturate(var(--we-sidebar-saturate, var(--we-saturate, 1.8))) !important;
          -webkit-backdrop-filter: blur(var(--we-left-sidebar-blur, var(--we-sidebar-blur, var(--we-blur, 16px))))
                                   saturate(var(--we-sidebar-saturate, var(--we-saturate, 1.8))) !important;
          background-color: color-mix(
            in srgb,
            var(--we-sidebar-color, var(--we-surface-tint-dark, #0d1524))
            calc(var(--we-left-sidebar-alpha, var(--we-sidebar-alpha, 0.35)) * 100%),
            transparent
          ) !important;
        }
      `;
    }

    function getSidebarRoot() {
      return document.querySelector('._2H3hWW_root') ||
             document.querySelector('.hHd-Xa_root') ||
             document.querySelector('.BynINW_sidebarCol > div') ||
             document.querySelector('.pI_x6G_sidebarCol > div');
    }

    let isAnimating = false;
    let animTimer = null;
    function startAnimGuard() {
      isAnimating = true;
      if (animTimer) clearTimeout(animTimer);
      animTimer = setTimeout(() => {
        isAnimating = false;
        try {
          syncAll();
        } catch (e) {}
      }, 260);
    }

    // 展开或收起右侧工作区面板的核心交互驱动
    function toggleWorkspacePanel() {
      startAnimGuard();
      // 1. 首选：通过 Cordis 服务直接切换 (最干净、底层原生支持)
      let layout = null;
      try {
        layout = pluginCtx?.layout ||
                 (typeof pluginCtx?.get === 'function' ? pluginCtx.get('layout') : null) ||
                 pluginCtx?.root?.layout ||
                 (typeof pluginCtx?.root?.get === 'function' ? pluginCtx.root.get('layout') : null);
      } catch (e) {
        console.warn("[dsh-codex] layout resolve failed:", e);
      }

      if (layout && typeof layout.toggleSidebar === 'function') {
        try {
          layout.toggleSidebar();
          return;
        } catch (e) {
          console.warn("[dsh-codex] layout.toggleSidebar failed:", e);
        }
      }

      // 2. 次选：通过原生 React Fiber 闭包中的 onClick 方法直接调用
      const nativeToggle = document.querySelector('button._2H3hWW_toggle, button.hHd-Xa_toggle, button[class*="_toggle"]:not(#dsh-codex-btn-toggle):not(#dsh-codex-btn-title-toggle), button[aria-label*="收起"]:not(#dsh-codex-btn-toggle):not(#dsh-codex-btn-title-toggle), button[aria-label*="展开"]:not(#dsh-codex-btn-toggle):not(#dsh-codex-btn-title-toggle), button[aria-label*="打开"]:not(#dsh-codex-btn-toggle):not(#dsh-codex-btn-title-toggle)');
      if (nativeToggle && nativeToggle.id !== TOGGLE_BTN_ID) {
        try {
          const propKey = Object.keys(nativeToggle).find(k => k.startsWith('__reactProps$') || k.startsWith('__reactEventHandlers$'));
          if (propKey && typeof nativeToggle[propKey]?.onClick === 'function') {
            nativeToggle[propKey].onClick({
              preventDefault() {},
              stopPropagation() {},
              bubbles: true,
              target: nativeToggle,
              currentTarget: nativeToggle
            });
            return;
          }
        } catch (err) {
          console.warn("[dsh-codex] react props click failed:", err);
        }

        // 3. 原生 click 与 dispatchEvent 兜底
        try {
          nativeToggle.click();
          return;
        } catch (err) {}

        try {
          nativeToggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          return;
        } catch (err) {}
      }
    }

    window.__DSH_CODEX_TOGGLE__ = toggleWorkspacePanel;

    // --- 路由与会话历史堆栈管理 (Codex 上一步与下一步导航 100% 深度支持) ---
    const navHistory = {
      stack: [],
      index: -1,
      isNavigating: false,
      currentSessionId: null,

      // 检测是否有弹窗处于打开状态 (如有，后退键可优先关闭弹窗返回)
      getOpenModalCloseBtn() {
        return document.querySelector(
          '.dsh-memory-modal-overlay [class*="close"], ' +
          '.dsh-ext-modal-overlay [class*="close"], ' +
          '.dsh-trending-modal-panel [class*="close"], ' +
          '[role="dialog"] button[aria-label*="关闭"], ' +
          '[role="dialog"] button[aria-label*="Close"], ' +
          '[role="dialog"] .close-button'
        );
      },

      hasOpenModal() {
        return Boolean(this.getOpenModalCloseBtn());
      },

      // 获取当前活跃的 session ID
      getCurrentSessionId() {
        // 1. 从 uiWorkspace 服务获取
        try {
          const uiWs = pluginCtx?.get?.("uiWorkspace", false);
          const sid = uiWs?.selection?.getSnapshot?.()?.sessionId || uiWs?.mainReference?.sessionId;
          if (sid) return sid;
        } catch (e) {}

        // 2. 从 DOM 树选择器获取 (已选中态 aria-selected="true" 或 selected class)
        try {
          const activeRow = document.querySelector(
            '[data-row-key^="session:"][aria-selected="true"], ' +
            '[role="treeitem"][aria-selected="true"][data-row-key^="session:"], ' +
            '[class*="sessionRow"][class*="selected"][data-row-key^="session:"], ' +
            '[class*="_sessionRow"][class*="_selected"][data-row-key^="session:"]'
          );
          if (activeRow) {
            const key = activeRow.getAttribute("data-row-key");
            const sid = key?.replace(/^session:/, '');
            if (sid) return sid;
          }
        } catch (e) {}

        // 3. 从 localStorage 兜底
        try {
          const raw = window.localStorage?.getItem?.("dsh.sessions.current");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.sessionId) return parsed.sessionId;
          }
        } catch (e) {}

        return null;
      },

      // 当监测到当前会话切换时入栈
      onSessionChanged(sessionId) {
        if (!sessionId) return;
        if (this.isNavigating) {
          this.currentSessionId = sessionId;
          this.updateUI();
          return;
        }

        if (this.currentSessionId === sessionId) {
          return;
        }

        // 堆栈尚为空，初始化初始会话
        if (this.stack.length === 0) {
          this.stack = [sessionId];
          this.index = 0;
          this.currentSessionId = sessionId;
          this.updateUI();
          return;
        }

        // 如果与当前栈顶会话相同，忽略
        if (this.index >= 0 && this.stack[this.index] === sessionId) {
          this.currentSessionId = sessionId;
          this.updateUI();
          return;
        }

        // 新会话入栈：截断当前指针之后的历史，压入新会话
        this.stack = this.stack.slice(0, this.index + 1);
        this.stack.push(sessionId);
        this.index = this.stack.length - 1;
        this.currentSessionId = sessionId;
        this.updateUI();
      },

      canGoBack() {
        if (this.hasOpenModal()) return true;
        return this.index > 0;
      },

      canGoForward() {
        return this.index >= 0 && this.index < this.stack.length - 1;
      },

      // 后退 (上一步)
      back() {
        // 如果有弹窗打开，优先关闭弹窗返回主界面
        const modalClose = this.getOpenModalCloseBtn();
        if (modalClose) {
          try {
            modalClose.click();
            this.updateUI();
            return;
          } catch (e) {}
        }

        if (!this.canGoBack()) return;

        this.isNavigating = true;
        this.index--;
        const targetSid = this.stack[this.index];
        this.currentSessionId = targetSid;

        this.activateSession(targetSid);

        try {
          window.history.back();
        } catch (e) {}

        setTimeout(() => {
          this.isNavigating = false;
          this.updateUI();
        }, 220);
        this.updateUI();
      },

      // 前进 (下一步)
      forward() {
        if (!this.canGoForward()) return;

        this.isNavigating = true;
        this.index++;
        const targetSid = this.stack[this.index];
        this.currentSessionId = targetSid;

        this.activateSession(targetSid);

        try {
          window.history.forward();
        } catch (e) {}

        setTimeout(() => {
          this.isNavigating = false;
          this.updateUI();
        }, 220);
        this.updateUI();
      },

      // 激活并跳转至指定的 sessionId
      activateSession(sessionId) {
        if (!sessionId) return false;

        // 1. 如果有 panel (如设置/扩展页面) 打开，退出 panel 回到会话主视图
        try {
          const layout = pluginCtx?.get?.("layout", false) || pluginCtx?.layout;
          if (layout && typeof layout.selectPanel === "function") {
            layout.selectPanel(null);
          }
        } catch (e) {}

        // 2. 途径 A: 调用 uiWorkspace 服务层 openSession
        try {
          const uiWs = pluginCtx?.get?.("uiWorkspace", false);
          if (uiWs && typeof uiWs.openSession === "function") {
            uiWs.openSession(sessionId);
            return true;
          }
        } catch (e) {
          console.warn("[dsh-codex] uiWs.openSession fallback:", e);
        }

        // 3. 途径 B: 查找 DOM 对应会话节点并模拟真实点击
        try {
          const row = document.querySelector(`[data-row-key="session:${sessionId}"]`);
          if (row) {
            row.scrollIntoView({ block: "nearest" });
            row.click();
            row.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
            return true;
          }
        } catch (e) {}

        // 4. 途径 C: 遍历所有 session row 匹配 ID
        try {
          const allRows = document.querySelectorAll('[data-row-key^="session:"]');
          for (const r of allRows) {
            const key = r.getAttribute("data-row-key");
            if (key && key.includes(sessionId)) {
              r.scrollIntoView({ block: "nearest" });
              r.click();
              r.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
              return true;
            }
          }
        } catch (e) {}

        return false;
      },

      // 同步导航按钮禁用/启用状态与外观
      updateUI() {
        const backBtn = document.getElementById(BACK_BTN_ID);
        const fwdBtn = document.getElementById(FWD_BTN_ID);
        const hasBack = this.canGoBack();
        const hasFwd = this.canGoForward();

        if (backBtn) {
          backBtn.disabled = !hasBack;
          backBtn.classList.toggle("disabled", !hasBack);
          backBtn.style.opacity = hasBack ? "1" : "0.3";
          backBtn.style.pointerEvents = hasBack ? "auto" : "none";
          backBtn.style.cursor = hasBack ? "pointer" : "default";
        }
        if (fwdBtn) {
          fwdBtn.disabled = !hasFwd;
          fwdBtn.classList.toggle("disabled", !hasFwd);
          fwdBtn.style.opacity = hasFwd ? "1" : "0.3";
          fwdBtn.style.pointerEvents = hasFwd ? "auto" : "none";
          fwdBtn.style.cursor = hasFwd ? "pointer" : "default";
        }
      }
    };

    function ensureTitleNav() {
      let nav = document.getElementById(TITLE_NAV_ID);
      if (!nav) {
        nav = document.createElement("div");
        nav.id = TITLE_NAV_ID;

        // 1. 上一步 (后退)
        const backBtn = document.createElement("button");
        backBtn.id = BACK_BTN_ID;
        backBtn.type = "button";
        backBtn.className = "dsh-codex-title-btn disabled";
        backBtn.disabled = true;
        backBtn.setAttribute("data-tooltip", "后退 (Alt + ←)");
        backBtn.innerHTML = SVG.back;
        backBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          navHistory.back();
        });
        nav.appendChild(backBtn);

        // 2. 下一步 (前进)
        const fwdBtn = document.createElement("button");
        fwdBtn.id = FWD_BTN_ID;
        fwdBtn.type = "button";
        fwdBtn.className = "dsh-codex-title-btn disabled";
        fwdBtn.disabled = true;
        fwdBtn.setAttribute("data-tooltip", "前进 (Alt + →)");
        fwdBtn.innerHTML = SVG.forward;
        fwdBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          navHistory.forward();
        });
        nav.appendChild(fwdBtn);

        // 3. 专属侧边栏切换主键 [ ◫ ] (在标题栏前部，1:1 对标 Codex)
        const toggleBtn = document.createElement("button");
        toggleBtn.id = TITLE_TOGGLE_ID;
        toggleBtn.type = "button";
        toggleBtn.className = "dsh-codex-title-btn";
        toggleBtn.setAttribute("data-tooltip", "展开/收起侧边栏 (Ctrl + B)");
        toggleBtn.innerHTML = SVG.toggle;
        toggleBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWorkspacePanel();
        });
        nav.appendChild(toggleBtn);

        document.body.appendChild(nav);
      }

      navHistory.updateUI();
      return nav;
    }

    function initHistoryTracking() {
      if (historyInited) return;
      historyInited = true;

      // 1. 初次尝试获取当前 session
      const cur = navHistory.getCurrentSessionId();
      if (cur) {
        navHistory.onSessionChanged(cur);
      }

      // 2. 尝试与 uiWorkspace.selection.subscribe 动态绑定
      let unsubWs = null;
      try {
        const tryBindUiWs = () => {
          const uiWs = pluginCtx?.get?.("uiWorkspace", false);
          if (uiWs?.selection && typeof uiWs.selection.subscribe === "function") {
            unsubWs = uiWs.selection.subscribe((snap) => {
              if (snap?.sessionId) {
                navHistory.onSessionChanged(snap.sessionId);
              }
            });
            return true;
          }
          return false;
        };

        if (!tryBindUiWs()) {
          const timer = setInterval(() => {
            if (tryBindUiWs()) clearInterval(timer);
          }, 300);
          setTimeout(() => clearInterval(timer), 8000);
        }
      } catch (e) {}

      // 3. 监听全局点击事件：捕获用户点击会话行、新建会话按钮等
      const handleClick = (e) => {
        try {
          // 点击了具体会话项
          const row = e.target?.closest?.('[data-row-key^="session:"]');
          if (row) {
            const sid = row.getAttribute("data-row-key")?.replace(/^session:/, '');
            if (sid) {
              navHistory.onSessionChanged(sid);
            }
            return;
          }

          // 点击了新建会话按钮
          const newBtn = e.target?.closest?.(
            '._2H3hWW_newSession, .hHd-Xa_newSession, [aria-label*="新会话"], [aria-label*="新建会话"], [aria-label*="New session"]'
          );
          if (newBtn) {
            setTimeout(() => {
              const newSid = navHistory.getCurrentSessionId();
              if (newSid) navHistory.onSessionChanged(newSid);
            }, 300);
            return;
          }
        } catch (err) {}
      };
      document.addEventListener("click", handleClick, true);

      // 4. 监听键盘快捷键：Alt + ← (后退)，Alt + → (前进)
      const handleKeydown = (e) => {
        if (e.altKey && e.key === "ArrowLeft") {
          e.preventDefault();
          navHistory.back();
        } else if (e.altKey && e.key === "ArrowRight") {
          e.preventDefault();
          navHistory.forward();
        }
      };
      window.addEventListener("keydown", handleKeydown);

      cleanupHistory = () => {
        historyInited = false;
        if (unsubWs) {
          try { unsubWs(); } catch (e) {}
        }
        document.removeEventListener("click", handleClick, true);
        window.removeEventListener("keydown", handleKeydown);
      };
    }

    function ensureRail(root) {
      let rail = document.getElementById(RAIL_ID);
      if (!rail) {
        rail = document.createElement("div");
        rail.id = RAIL_ID;

        // --- 顶部群组 ---
        const topGroup = document.createElement("div");
        topGroup.id = "dsh-codex-top-group";

        // 1. Codex 官方主页/工作区入口 [ 🏠 ] (附带专属蓝点指示器，顶端第 1 位！)
        const homeBtn = document.createElement("button");
        homeBtn.id = HOME_BTN_ID;
        homeBtn.type = "button";
        homeBtn.className = "dsh-codex-action-btn active";
        homeBtn.style.cssText = BTN_STYLE_INLINE;
        homeBtn.setAttribute("data-tooltip", "主页与工作区");
        homeBtn.innerHTML = `${SVG.home}<span class="dsh-codex-dot"></span>`;

        const handleHomeClick = (e) => {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }

          // 1. 若打开了扩展面板或设置等非会话主视图，一键退回对话主视图
          try {
            const layout = pluginCtx?.get?.("layout", false) || pluginCtx?.layout;
            if (layout && typeof layout.selectPanel === "function") {
              layout.selectPanel(null);
            }
          } catch (err) {}

          // 2. 若打开了弹窗，一键关闭弹窗
          const modalClose = navHistory.getOpenModalCloseBtn();
          if (modalClose) {
            try { modalClose.click(); } catch (err) {}
          }

          const rootEl = getSidebarRoot();
          const isCollapsed = Boolean(
            document.querySelector('.BynINW_frame[data-sidebar-collapsed], .pI_x6G_frame[data-sidebar-collapsed]') ||
            rootEl?.classList.contains('_2H3hWW_collapsed') ||
            rootEl?.classList.contains('hHd-Xa_collapsed')
          );

          if (isCollapsed) {
            toggleWorkspacePanel();
          } else {
            const region = rootEl?.querySelector('._2H3hWW_regionArea, .hHd-Xa_regionArea');
            if (region) region.scrollTo({ top: 0, behavior: "smooth" });
          }
        };

        homeBtn.addEventListener("click", handleHomeClick);
        homeBtn.onclick = handleHomeClick;
        topGroup.appendChild(homeBtn);

        // 分割线
        const sep1 = document.createElement("div");
        sep1.className = "dsh-codex-rail-sep";
        topGroup.appendChild(sep1);

        // 2. 工具与插件容器
        const toolsBox = document.createElement("div");
        toolsBox.id = TOOLS_BOX_ID;
        topGroup.appendChild(toolsBox);

        rail.appendChild(topGroup);

        // --- 底部群组 ---
        const botGroup = document.createElement("div");
        botGroup.id = "dsh-codex-bot-group";

        const sep2 = document.createElement("div");
        sep2.className = "dsh-codex-rail-sep";
        botGroup.appendChild(sep2);

        // 设置与账户宿主：直接将 DSH 原生包含账户中心的 launcher 化身为活动栏底部圆形头像
        const settingsSlot = document.createElement("div");
        settingsSlot.id = SETTINGS_SLOT_ID;
        botGroup.appendChild(settingsSlot);

        rail.appendChild(botGroup);
      }

      if (rail.parentElement !== root) {
        root.insertBefore(rail, root.firstChild);
      }
      return rail;
    }

    function resolveIcon(el, label) {
      if (label.includes("Memory") || el.matches?.('[data-dsh-memory-sidebar-entry], .dsh-memory-sidebar-entry')) {
        return `<span style="font-size:16px;line-height:1;">${EMOJI.memory}</span>`;
      }
      if (label.includes("扩展") || el.matches?.('[data-dsh-extension-sidebar-entry], .dsh-ext-sidebar-entry')) {
        return `<span style="font-size:16px;line-height:1;">${EMOJI.ext}</span>`;
      }
      if (label.includes("Trending") || el.matches?.('[data-dsh-trending-sidebar-entry], .dsh-trending-sidebar-entry')) {
        return `<span style="font-size:16px;line-height:1;">${EMOJI.trending}</span>`;
      }
      if (label.includes("AGY") || label.includes("自动化") || el.matches?.('[data-dsh-agy-automation-entry], .dsh-agy-auto-sidebar-entry')) {
        return `<span style="font-size:16px;line-height:1;">${EMOJI.agy}</span>`;
      }
      if (label.includes("看板") || el.matches?.('[data-dsh-taskboard-entry]')) {
        return SVG.tasks;
      }
      if (label.includes("技能") || el.matches?.('[data-dsh-skill-explorer-entry]')) {
        return SVG.skills;
      }
      if (label.includes("推荐") || label.includes("Recommend") || el.matches?.('[data-dsh-personalized-recommendations], [data-dsh-recommendation-entry], [data-slot*="recommend"]')) {
        return SVG.recommendation || SVG.sparkle;
      }
      if (label.includes("更多") || label.includes("More") || el.matches?.('[aria-haspopup="menu"], [data-dsh-sidebar-more], [data-dsh-more-menu], [data-slot*="more"], [class*="moreAnchor"] button')) {
        return SVG.more;
      }
      if (label.includes("自定义") || label.includes("Custom") || el.matches?.('[data-dsh-entry-customization], [data-slot*="entry-customization"]')) {
        return SVG.custom;
      }
      if (label.includes("插件") || label.includes("市场") || label.includes("Market") || el.matches?.('[data-dsh-market-entry], [data-slot*="market"]')) {
        return SVG.plugin;
      }
      if (label.includes("统计") || label.includes("Inspector") || label.includes("Stats") || label.includes("开发者") || el.matches?.('[data-dsh-inspector-entry], [data-dsh-stats-entry], [data-slot*="inspector"], [data-slot*="stats"]')) {
        return SVG.stats;
      }
      if (label.includes("工作树") || label.includes("Worktree") || label.includes("变更") || label.includes("PR") || el.matches?.('[data-dsh-worktree-entry], [data-dsh-pr-entry], [data-slot*="worktree"]')) {
        return SVG.worktree;
      }
      if (label.includes("subagent") || label.includes("oar") || label.includes("OAR") || label.includes("子代理") || el.matches?.('[data-dsh-subagent-entry], [data-slot*="subagent"]')) {
        return SVG.subagent;
      }
      if (label.includes("共享") || label.includes("分享") || label.includes("LiveShare") || label.includes("liveshare") || label.includes("Share") || el.matches?.('[data-dsh-liveshare-entry], [data-dsh-share-entry], [data-slot*="liveshare"], [data-slot*="share"]')) {
        return SVG.share;
      }
      if (label.includes("补丁") || label.includes("检视") || label.includes("交付") || label.includes("Patch") || label.includes("patch") || label.includes("Deliver") || label.includes("changes-review") || el.matches?.('[data-dsh-patch-entry], [data-dsh-deliverables-entry], [data-dsh-changes-review-entry], [data-slot*="patch"], [data-slot*="deliverables"], [data-slot*="changes-review"]')) {
        return SVG.patch;
      }

      const svg = el.querySelector?.('svg');
      if (svg) return svg.outerHTML;

      const img = el.querySelector?.('img');
      if (img && img.src) {
        return `<img src="${img.src}" style="width:18px;height:18px;border-radius:4px;object-fit:cover;" />`;
      }

      const firstChar = label.trim().slice(0, 1) || EMOJI.ext;
      return `<span style="font-size:15px;line-height:1;font-weight:600;">${firstChar}</span>`;
    }

    function parseDetails(el) {
      let label = "";
      let badge = "";

      const badgeNode = el.querySelector?.('[class*="badge"], [class*="Badge"], .dsh-memory-sidebar-badge, .dsh-ext-sidebar-badge, .dsh-trending-sidebar-badge, .dsh-agy-auto-sidebar-badge');
      if (badgeNode && badgeNode.textContent) {
        badge = badgeNode.textContent.trim();
      }

      const labelNode = el.querySelector?.('[class*="label"], [class*="Label"], [class*="title"], [class*="Title"], .dsh-memory-sidebar-label, .dsh-ext-sidebar-label, .dsh-trending-sidebar-label, .dsh-agy-auto-sidebar-label');
      if (labelNode && labelNode.textContent) {
        label = labelNode.textContent.trim();
      } else {
        const fullText = el.textContent ? el.textContent.trim() : "";
        label = badge ? fullText.replace(badge, "").trim() : fullText;
      }

      if (!label) {
        label = el.getAttribute?.("aria-label") || el.getAttribute?.("title") || "面板";
      }

      return { label, badge };
    }

    let isSyncing = false;

    function syncAll() {
      if (isSyncing) return;
      const root = getSidebarRoot();
      if (!root) return;

      isSyncing = true;
      try {
        ensureTitleNav();
        ensureRail(root);
        const toolsBox = document.getElementById(TOOLS_BOX_ID);
        if (!toolsBox) return;

        // 1. 同步主页按钮高亮状态（折叠时取消 active，展开时保持 active）
        const isCollapsed = Boolean(
          document.querySelector('.BynINW_frame[data-sidebar-collapsed], .pI_x6G_frame[data-sidebar-collapsed]') ||
          root.classList.contains('_2H3hWW_collapsed') ||
          root.classList.contains('hHd-Xa_collapsed')
        );
        const homeBtn = document.getElementById(HOME_BTN_ID);
        if (homeBtn) {
          homeBtn.classList.toggle("active", !isCollapsed);
        }

        // 2. 将原生的 settingsArea 放入 settingsSlot，直接化身为 Codex 专属圆形头像与设置按钮
        const originSettingsArea = root?.querySelector('._2H3hWW_footArea ._2H3hWW_settingsArea, .hHd-Xa_footArea .hHd-Xa_settingsArea, [data-slot="sidebar.settings"]') ||
                                   document.querySelector('._2H3hWW_footArea ._2H3hWW_settingsArea, .hHd-Xa_footArea .hHd-Xa_settingsArea, [data-slot="sidebar.settings"]') ||
                                   root?.querySelector('._2H3hWW_settingsArea, .hHd-Xa_settingsArea, [data-slot="sidebar.settings"]') ||
                                   document.querySelector('._2H3hWW_settingsArea, .hHd-Xa_settingsArea, [data-slot="sidebar.settings"]');
        const settingsSlot = document.getElementById(SETTINGS_SLOT_ID);
        if (originSettingsArea && settingsSlot && originSettingsArea.parentElement !== settingsSlot) {
          settingsSlot.innerHTML = "";
          settingsSlot.appendChild(originSettingsArea);
        }

        if (originSettingsArea) {
          const settingsBtn = originSettingsArea.querySelector('button');
          if (settingsBtn) {
            settingsBtn.classList.add("dsh-codex-action-btn");
            settingsBtn.setAttribute("data-tooltip", "账号中心与设置");
            if (settingsBtn.hasAttribute("title")) settingsBtn.removeAttribute("title");
            settingsBtn.querySelector('.dsh-codex-gear-icon')?.remove();
            settingsBtn.querySelector('.dsh-codex-avatar-face')?.remove();
          }
        }

        // 3. 收集所有非工作区的窗口/插件入口（严格排除任何设置与账户相关组件）
        const selectors = [
          '[data-dsh-memory-sidebar-entry]',
          '.dsh-memory-sidebar-entry',
          '[data-dsh-extension-sidebar-entry]',
          '.dsh-ext-sidebar-entry',
          '[data-dsh-trending-sidebar-entry]',
          '.dsh-trending-sidebar-entry',
          '[data-dsh-agy-automation-entry]',
          '.dsh-agy-auto-sidebar-entry',
          '[data-dsh-taskboard-entry]',
          '[data-dsh-skill-explorer-entry]',
          '[data-dsh-personalized-recommendations]',
          '[data-dsh-recommendation-entry]',
          '[data-slot*="recommend"]',
          '[data-dsh-entry-customization]',
          '[data-slot*="entry-customization"]',
          '[data-dsh-sidebar-more]',
          '[data-dsh-more-menu]',
          '[data-slot*="more"]',
          '[class*="moreAnchor"] button',
          '[data-dsh-ssh-entry]',
          '[data-dsh-plugin]',
          'nav._2H3hWW_panelList > button',
          'nav.hHd-Xa_panelList > button',
          'nav[class*="_panelList"] > button',
          '._2H3hWW_panelRow',
          '.hHd-Xa_panelRow',
          '[class*="_panelRow"]'
        ];

        const sourceElements = new Set();

        // 自动发现任何其他插件插入在 logo 与 regionArea 之间的自定义按钮
        Array.from(root.children).forEach(el => {
          if (!el || el.id === RAIL_ID) return;
          if (el.matches?.('._2H3hWW_logoRow, .hHd-Xa_logoRow, ._2H3hWW_brand, .hHd-Xa_brand, ._2H3hWW_newSession, .hHd-Xa_newSession, ._2H3hWW_regionArea, .hHd-Xa_regionArea, ._2H3hWW_footArea, .hHd-Xa_footArea, ._2H3hWW_settingsArea, .hHd-Xa_settingsArea, [data-slot*="settings"]')) return;
          if (el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute?.('role') === 'button' || el.hasAttribute?.('data-dsh-plugin')) {
            sourceElements.add(el);
          }
        });

        // 匹配已知插件选择器
        for (const sel of selectors) {
          try {
            document.querySelectorAll(sel).forEach(el => {
              if (el &&
                  !el.closest?.('.dsh-memory-modal-overlay') &&
                  !el.closest?.('.dsh-ext-modal-overlay') &&
                  !el.closest?.('.dsh-trending-modal-panel') &&
                  !el.closest?.('[class*="_regionArea"]') &&
                  !el.closest?.('[class*="_footArea"]') &&
                  !el.closest?.('[class*="_settingsArea"]') &&
                  !el.closest?.('[data-slot*="settings"]') &&
                  !el.closest?.(`#${RAIL_ID}`)) {
                sourceElements.add(el);
              }
            });
          } catch (e) {}
        }

        const validKeys = new Set();

        sourceElements.forEach((sourceEl, idx) => {
          try {
            const { label, badge } = parseDetails(sourceEl);
            const key = sourceEl.id || sourceEl.getAttribute?.("data-dsh-plugin") || `item-${label}-${idx}`;
            validKeys.add(key);

            let btn = toolsBox.querySelector(`[data-key="${key}"]`);
            if (!btn) {
              btn = document.createElement("button");
              btn.type = "button";
              btn.className = "dsh-codex-action-btn";
              btn.style.cssText = BTN_STYLE_INLINE;
              btn.setAttribute("data-key", key);

              btn.addEventListener("click", () => {
                try {
                  // 若为带 popover/menu 的原生 anchor 节点，将其临时对齐到镜像按钮右侧以供 getBoundingClientRect 准确定位
                  if (sourceEl.getAttribute?.("aria-haspopup") === "menu" || sourceEl.closest?.('[class*="moreAnchor"]')) {
                    const rect = btn.getBoundingClientRect();
                    sourceEl.style.position = "fixed";
                    sourceEl.style.left = `${rect.right + 6}px`;
                    sourceEl.style.top = `${rect.top}px`;
                    sourceEl.style.width = `${rect.width}px`;
                    sourceEl.style.height = `${rect.height}px`;
                    sourceEl.style.zIndex = "-1";
                  }
                  sourceEl.click();
                } catch (e) {
                  console.warn("[dsh-codex] click target error:", e);
                }
              });

              toolsBox.appendChild(btn);
            }

            // 更新提示文本 (显示在右侧)
            btn.setAttribute("data-tooltip", badge && badge !== '·' ? `${label} (${badge})` : label);

            // 更新选中状态
            const isActive = sourceEl.classList?.contains("active") ||
                             sourceEl.matches?.('[class*="_panelActive"], [aria-selected="true"], [aria-current="page"]');
            btn.classList.toggle("active", Boolean(isActive));

            // 更新内容与徽标 (若有小红点或未读，呈现 Codex 小蓝点或数字徽标)
            const iconHtml = resolveIcon(sourceEl, label);
            const badgeHtml = badge && badge !== '·' ? `<span class="dsh-codex-badge">${badge}</span>` : (badge === '·' ? '<span class="dsh-codex-dot"></span>' : '');
            const nextHtml = `${iconHtml}${badgeHtml}`;
            if (btn.__dshHtml !== nextHtml) {
              btn.innerHTML = nextHtml;
              btn.__dshHtml = nextHtml;
            }

            // 在工作区右侧面板中彻底隐藏源元素
            sourceEl.classList.add("dsh-codex-hide-source");
          } catch (itemErr) {
            console.warn("[dsh-codex] sync item error:", itemErr);
          }
        });

        // 清理已被移除的插件按钮
        Array.from(toolsBox.children).forEach(child => {
          const key = child.getAttribute("data-key");
          if (key && !validKeys.has(key)) {
            child.remove();
          }
        });

      } catch (err) {
        console.warn("[dsh-codex] sync error:", err);
      } finally {
        isSyncing = false;
      }
    }

    function apply(ctx) {
      try {
        pluginCtx = ctx;

        // 每次加载/挂载前，先强制通配清场，确保同一周期绝对单例！
        wipeAllZombies();
        injectCSS();
        initHistoryTracking();

        // 合并高频 DOM 变动：120ms 去抖 + 空闲回调执行，避免每帧都做全量 DOM 查询
        let scheduled = null;
        let idleHandle = null;
        const runIdle = (fn) => {
          if (typeof window !== "undefined" && window.requestIdleCallback) {
            idleHandle = window.requestIdleCallback(fn, { timeout: 300 });
            return idleHandle;
          }
          return setTimeout(fn, 0);
        };
        const cancelPendingSync = () => {
          if (scheduled) {
            clearTimeout(scheduled);
            scheduled = null;
          }
          if (idleHandle && typeof window !== "undefined" && window.cancelIdleCallback) {
            window.cancelIdleCallback(idleHandle);
            idleHandle = null;
          }
        };
        const scheduleSync = () => {
          if (isAnimating || scheduled) return;
          scheduled = setTimeout(() => {
            runIdle(() => {
              scheduled = null;
              idleHandle = null;
              if (isAnimating) return;
              try {
                syncAll();
              } catch (err) {
                console.warn("[dsh-codex] syncAll error:", err);
              }
              try {
                const curSid = navHistory.getCurrentSessionId();
                if (curSid && curSid !== navHistory.currentSessionId) {
                  navHistory.onSessionChanged(curSid);
                }
              } catch (e) {}
            });
          }, 120);
        };

        scheduleSync();

        const observer = new MutationObserver((mutations) => {
          let shouldUpdate = false;
          for (const m of mutations) {
            if (m.target?.id === RAIL_ID || m.target?.closest?.(`#${RAIL_ID}`) ||
                m.target?.id === TITLE_NAV_ID || m.target?.closest?.(`#${TITLE_NAV_ID}`)) continue;
            // 忽略聊天流式输出、Markdown 渲染、思维链推理（含 data-variant="think" 与 reasoning slots）、输入框以及右侧文档预览/协作面板的高频 DOM 变动，极大节省渲染与 CPU 开销 (针对 DSH 0.2.1-rc.5 思考文本展示与 0.2.2-alpha.2 / master PR #7556 右侧栏协作预览深度优化)
            if (m.target?.closest?.('[class*="chat"], [class*="conversation"], [class*="message"], [class*="markdown"], [class*="code"], [class*="reasoning"], [class*="think"], [data-variant="think"], [data-slot*="reasoning"], [data-sidebar-right-panel], [class*="sidebarRight"], [class*="sidebar-right"], [data-slot*="sidebar-right"], [data-slot*="documentpreview"], [class*="previewSeat"], textarea, input')) continue;

            // 检测到侧边栏折叠/展开属性变化时，立即启动动画保护，杜绝动画期间的重度 DOM 查询
            if (m.attributeName === "data-sidebar-collapsed" ||
                (m.attributeName === "class" && (
                  m.target?.classList?.contains("_2H3hWW_collapsed") ||
                  m.target?.classList?.contains("hHd-Xa_collapsed") ||
                  m.target?.classList?.contains("BynINW_frame") ||
                  m.target?.classList?.contains("pI_x6G_frame")
                ))) {
              startAnimGuard();
              return;
            }

            shouldUpdate = true;
            break;
          }
          if (shouldUpdate && !isAnimating) {
            scheduleSync();
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["class", "data-sidebar-collapsed", "aria-selected", "data-we-wallpaper", "data-we-glass-page"]
        });

        window.__DSH_CODEX_CLEANUP__ = () => {
          try {
            cancelPendingSync();
            if (animTimer) {
              clearTimeout(animTimer);
              animTimer = null;
            }
            isAnimating = false;
            observer.disconnect();
            if (typeof cleanupHistory === "function") {
              try { cleanupHistory(); } catch (e) {}
              cleanupHistory = null;
            }
            historyInited = false;
            restoreNativeSettingsArea();
            document.getElementById(TITLE_NAV_ID)?.remove();
            document.getElementById(STYLE_ID)?.remove();
            document.getElementById(RAIL_ID)?.remove();
            document.querySelectorAll(".dsh-codex-hide-source").forEach(el => el.classList.remove("dsh-codex-hide-source"));
          } catch (e) {}
        };

        return window.__DSH_CODEX_CLEANUP__;
      } catch (fatal) {
        console.error("[dsh-codex] Plugin apply fatal error caught safely:", fatal);
        return () => {};
      }
    }

    const inject = ["layout"];

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }

  if (typeof window !== "undefined" && window.__ModuleLoader__ && typeof window.__ModuleLoader__.load === "function") {
    // 优先注册规范名称 dsh-codex-rail
    window.__ModuleLoader__.load({
      id: "dsh-codex-rail",
      factory: factory
    });

    // 同时注册双轨兼容别名 dsh-codex-sidebar，确保在以任意名称挂载或 Cordis patch 引用时 100% 顺畅加载
    try {
      window.__ModuleLoader__.load({
        id: "dsh-codex-sidebar",
        factory: factory
      });
    } catch (e) {}
  }
})();
