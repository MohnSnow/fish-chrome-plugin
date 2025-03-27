/**
 * 元素删除器 - 内容脚本
 * 
 * 该脚本负责在网页中删除指定的元素
 */

// 检查当前网站是否为力扣
function isLeetcodeSite() {
  return window.location.href.includes('leetcode.cn') || 
         window.location.href.includes('leetcode.com');
}

// 页面加载完成后自动检测网站类型
document.addEventListener('DOMContentLoaded', function() {
  console.log("页面加载完成，检测网站类型...");
  if (isLeetcodeSite()) {
    console.log("检测到力扣网站，准备资源...");
    
    // 预先创建需要的样式元素，但不应用主题
    const styleElement = document.createElement('style');
    styleElement.id = 'leetcode-theme-style';
    document.head.appendChild(styleElement);
    
    // 对于力扣网站，设置MutationObserver以处理可能的DOM变化
    setupLeetcodeMutationObserver();
  }
});

// 设置力扣网站的变化观察器
function setupLeetcodeMutationObserver() {
  console.log("设置力扣网站DOM变化监听器...");
  const observer = new MutationObserver(function(mutations) {
    // 每次DOM变化时，检查是否有我们关心的元素出现
    const editorElements = document.querySelectorAll('.monaco-editor');
    if (editorElements.length > 0) {
      // 如果有已经应用的主题，重新应用
      const themeStyle = document.getElementById('leetcode-theme-style');
      if (themeStyle && themeStyle.getAttribute('data-theme-type')) {
        console.log("检测到编辑器变化，重新应用主题");
        applyMonacoEditorStyles(themeStyle.getAttribute('data-theme-type'));
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// 监听来自弹出窗口的消息
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // 处理添加Confluence风格导航条请求
  if (message.action === 'addConfluenceNavBar') {
    console.log("接收到添加Confluence风格导航条请求");
    try {
      const result = addConfluenceNavBar();
      console.log("Confluence导航条添加结果:", result);
      sendResponse({ success: true });
    } catch (error) {
      console.error("添加Confluence导航条失败:", error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
  
  // 处理添加图片导航条请求
  else if (message.action === 'addImageNavBar') {
    console.log("接收到添加图片导航条请求");
    try {
      const result = addImageNavBar();
      console.log("图片导航条添加结果:", result);
      sendResponse({ success: true });
    } catch (error) {
      console.error("添加图片导航条失败:", error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }

  if (message.action === 'deleteElement') {
    const siteType = message.siteType;
    const elementType = message.elementType;
    
    console.log(`准备处理 ${siteType} 网站上的 ${elementType} 元素`);
    
    let elements = [];
    let deleted = 0;
    
    // 处理通用网站的添加导航条
    if (siteType === "通用" && elementType === "add-navigation-bar") {
      console.log("通过传统方式添加导航条...");
      try {
        const result = addNavigationBar();
        console.log("传统方式添加导航条结果:", result);
        
        // 返回结果
        sendResponse({ success: true, count: 1 });
      } catch (error) {
        console.error("传统方式添加导航条失败:", error);
        sendResponse({ success: false, error: error.message });
      }
      return true;
    }
    
    // 处理力扣网站的主题切换
    if (siteType === "力扣") {
      console.log("应用力扣网站主题:", elementType);
      
      // 检查当前是否为力扣网站
      if (!isLeetcodeSite()) {
        console.log("当前不是力扣网站，无法应用主题");
        alert("请在力扣网站(leetcode.cn 或 leetcode.com)上使用此功能");
        sendResponse({ success: false, count: 0 });
        return true;
      }
      
      deleted = applyLeetcodeTheme(elementType);
      
      // 返回结果
      sendResponse({ success: deleted > 0, count: deleted });
      return true;
    }
    
    // 针对知乎侧边栏的特殊处理
    if (siteType === "知乎" && (elementType.includes("侧边栏") || elementType.includes("RightSideBar"))) {
      console.log("使用专门方法删除知乎侧边栏");
      deleted = removeZhihuSidebar();
      
      // 返回结果
      sendResponse({ success: deleted > 0, count: deleted });
      return true;
    }
    
    // 根据不同的选择删除不同的元素
    if (elementType.includes(' ')) {
      // 如果元素类型包含空格，认为是CSS类名
      const classNames = elementType.split(' ');
      
      // 查找同时具有所有指定类名的元素
      elements = Array.from(document.body.getElementsByTagName('*'));
      
      classNames.forEach(className => {
        elements = elements.filter(el => el.classList.contains(className));
      });
    } else if (elementType.includes('=') || elementType.includes(':')) {
      // 处理属性选择器，例如 data-za-detail-view-path-module=RightSideBar 或 data-za-detail-view-path-module:RightSideBar
      let attrName, attrValue;
      
      if (elementType.includes('=')) {
        [attrName, attrValue] = elementType.split('=');
      } else {
        [attrName, attrValue] = elementType.split(':');
      }
      
      console.log(`查找属性 ${attrName} 为 ${attrValue} 的元素`);
      
      // 使用属性选择器查找元素
      // 尝试多种可能的属性选择器
      const exactSelector = document.querySelectorAll(`[${attrName}="${attrValue}"]`);
      const containsSelector = document.querySelectorAll(`[${attrName}*="${attrValue}"]`);
      const startsWithSelector = document.querySelectorAll(`[${attrName}^="${attrValue}"]`);
      
      elements = [...exactSelector, ...containsSelector, ...startsWithSelector];
      console.log(`找到 ${elements.length} 个匹配元素`);
      
      // 去重
      elements = [...new Set(elements)];
    } else {
      // 使用多种选择器尝试查找元素
      // 1. 首先尝试通过role属性查找
      const elementsByRole = document.querySelectorAll(`[role="${elementType}"]`);
      
      // 2. 尝试通过class查找
      const elementsByClass = document.querySelectorAll(`.${elementType}`);
      
      // 3. 尝试通过id查找
      const elementsById = document.querySelectorAll(`#${elementType}`);
      
      // 4. 针对知乎特殊处理
      if (siteType === "知乎" && elementType === "banner") {
        // 查找知乎的header元素
        const zhihuHeaders = document.querySelectorAll('header[role="banner"]');
        const zhihuAppHeaders = document.querySelectorAll('.AppHeader');
        
        // 尝试查找用户提供的精确类名组合
        try {
          const preciseStickyHeader = document.querySelectorAll('.Sticky.AppHeader.is-fixed');
          if (preciseStickyHeader.length > 0) {
            elements = [...elements, ...preciseStickyHeader];
            console.log('找到精确的Sticky AppHeader元素:', preciseStickyHeader.length);
          }
        } catch (e) {
          console.error('查找精确Sticky Header失败:', e);
        }
        
        // 将知乎的header元素添加到结果中
        elements = [...elements, ...zhihuHeaders, ...zhihuAppHeaders];
      }
      
      // 合并所有找到的元素
      elements = [...elements, ...elementsByRole, ...elementsByClass, ...elementsById];
      
      // 去重
      elements = [...new Set(elements)];
    }
    
    // 删除找到的所有元素
    elements.forEach(el => {
      try {
        console.log('删除元素:', el);
        el.remove();
        deleted++;
      } catch (error) {
        console.error('删除元素时出错:', error);
        
        // 尝试使用其它方法隐藏元素
        try {
          el.style.display = 'none';
          console.log('已隐藏元素:', el);
          deleted++;
        } catch (err) {
          console.error('隐藏元素也失败:', err);
        }
      }
    });
    
    // 针对知乎的header，无论上面是否成功，都添加CSS注入方式作为保险
    if (siteType === "知乎" && elementType === "banner") {
      const style = document.createElement('style');
      // 使用通配符和属性选择器提高匹配率
      style.textContent = `
        header[role="banner"], 
        .AppHeader, 
        .Sticky.AppHeader, 
        .Sticky.AppHeader.is-fixed, 
        header.Sticky,
        div[class*="AppHeader"],
        .TopstoryPageHeader,
        .css-17rnw55,
        header[class*="css-"],
        .Sticky[class*="css-"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          min-height: 0 !important;
          overflow: hidden !important;
          position: absolute !important;
          top: -9999px !important;
        }
      `;
      document.head.appendChild(style);
      console.log('已通过CSS注入隐藏知乎顶部栏');
      deleted = Math.max(1, deleted);
    }
    
    // 针对知乎的侧边栏，使用CSS注入方式作为保险
    if (siteType === "知乎" && (elementType.includes("RightSideBar") || elementType.includes("侧边栏"))) {
      const style = document.createElement('style');
      style.textContent = `
        [data-za-detail-view-path-module="RightSideBar"],
        [data-za-detail-view-path-module*="RightSideBar"],
        .Pc-card,
        .Card,
        .Pc-card.Card,
        .GlobalSideBar,
        [class*="SideBar"],
        [class*="sideBar"],
        [data-za-detail-view-path-module],
        [class*="RightSideBar"],
        aside,
        .css-1qyby9f,
        .css-1oy4rvw {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          width: 0 !important;
          max-width: 0 !important;
          height: 0 !important;
          max-height: 0 !important;
          overflow: hidden !important;
          position: absolute !important;
          pointer-events: none !important;
          z-index: -9999 !important;
        }
        
        /* 调整主内容区域宽度 */
        .Topstory-container {
          width: 100% !important;
          max-width: 1000px !important;
          margin: 0 auto !important;
        }
        
        .Topstory-mainColumn {
          width: 100% !important;
          max-width: none !important;
        }
      `;
      document.head.appendChild(style);
      console.log('已通过增强CSS注入隐藏知乎侧边栏');
      deleted = Math.max(1, deleted);
    }
    
    console.log(`已处理 ${deleted} 个元素`);
    
    // 返回结果
    sendResponse({ success: deleted > 0, count: deleted });
  }
  // 处理导航条状态检查请求
  else if (message.action === 'checkNavigationBar') {
    const navBar = document.querySelector('.custom-nav-bar');
    sendResponse({ 
      exists: navBar ? true : false,
      visible: navBar ? navBar.style.display !== 'none' : false
    });
    return true;
  }
  // 处理导航条显示/隐藏切换请求
  else if (message.action === 'toggleNavigationBar') {
    console.log(`接收到导航条操作请求: ${message.operation}`);
    
    try {
      if (message.operation === 'add') {
        // 如果导航条不存在或已隐藏，则添加/显示它
        const existingNavBar = document.querySelector('.custom-nav-bar');
        if (!existingNavBar) {
          // 导航条不存在，创建一个新的
          addNavigationBar();
          console.log("导航条已添加");
          sendResponse({ success: true, action: 'added' });
        } else if (existingNavBar.style.display === 'none') {
          // 导航条存在但被隐藏，显示它
          existingNavBar.style.display = '';
          // 恢复页面样式
          document.body.style.marginTop = '50px';
          document.body.style.paddingTop = '10px';
          console.log("导航条已显示");
          sendResponse({ success: true, action: 'shown' });
        } else {
          console.log("导航条已经存在并可见");
          sendResponse({ success: true, action: 'already_visible' });
        }
      } else if (message.operation === 'hide') {
        // 隐藏导航条
        const navBar = document.querySelector('.custom-nav-bar');
        if (navBar) {
          navBar.style.display = 'none';
          
          // 恢复页面原始边距
          document.body.style.marginTop = '';
          document.body.style.paddingTop = '';
          
          console.log("导航条已隐藏");
          sendResponse({ success: true, action: 'hidden' });
        } else {
          console.log("没有找到导航条可隐藏");
          sendResponse({ success: false, error: 'navbar_not_found' });
        }
      }
    } catch (error) {
      console.error("处理导航条操作时出错:", error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
  
  // 必须返回true以支持异步响应
  return true;
});

// 添加导航条函数 - 仅添加导航条，不添加控制按钮
function addNavigationBar() {
  console.log("开始添加导航条...");
  
  try {
    // 检查是否已存在导航条
    const existingNavBar = document.querySelector('.custom-nav-bar');
    if (existingNavBar) {
      console.log("导航条已存在，设置为可见");
      existingNavBar.style.display = '';
      
      // 恢复页面样式
      document.body.style.marginTop = '50px';
      document.body.style.paddingTop = '10px';
      
      showNotification("导航条已显示", "info");
      return true;
    }
    
    // 创建新的导航条
    createNavigationBar();
    console.log("导航条已成功添加");
    
    // 显示成功通知
    showNotification("导航条已添加", "success");
    
    return true;
  } catch (error) {
    console.error("添加导航条时发生错误:", error);
    alert("添加导航条失败: " + error.message);
    return false;
  }
}

// 创建导航条
function createNavigationBar() {
  console.log("开始创建导航条元素...");
  try {
    // 创建一个更简单的导航条元素
    const navBar = document.createElement('div');
    navBar.className = 'custom-nav-bar';
    navBar.setAttribute('data-added-by-extension', 'true');
    
    // 设置导航条内容
    navBar.innerHTML = `
      <div class="custom-nav-bar-inner">
        <div class="custom-nav-bar-left">
          <div class="custom-nav-logo">Wiki</div>
          <div class="custom-nav-links">
            <a href="#" class="custom-nav-link">空间</a>
            <a href="#" class="custom-nav-link">人员</a>
            <a href="#" class="custom-nav-button">创建</a>
          </div>
        </div>
        <div class="custom-nav-bar-right">
          <div class="custom-nav-search">
            <input type="text" placeholder="搜索">
          </div>
          <div class="custom-nav-help">
            <a href="#" class="custom-nav-link">帮助</a>
          </div>
          <div class="custom-nav-user">
            <a href="#" class="custom-nav-link">用户</a>
          </div>
        </div>
      </div>
    `;
    
    // 创建样式
    const style = document.createElement('style');
    style.id = 'custom-nav-bar-styles';
    style.textContent = `
      .custom-nav-bar {
        background-color: #205081;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 50px;
        z-index: 10000;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      
      .custom-nav-bar-inner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100%;
        padding: 0 20px;
      }
      
      .custom-nav-bar-left, .custom-nav-bar-right {
        display: flex;
        align-items: center;
      }
      
      .custom-nav-logo {
        font-size: 20px;
        font-weight: bold;
        margin-right: 20px;
      }
      
      .custom-nav-links {
        display: flex;
        align-items: center;
      }
      
      .custom-nav-link {
        color: white;
        text-decoration: none;
        margin-right: 15px;
        font-size: 14px;
      }
      
      .custom-nav-link:hover {
        text-decoration: underline;
      }
      
      .custom-nav-button {
        background-color: #3572b0;
        color: white;
        padding: 5px 10px;
        border-radius: 3px;
        text-decoration: none;
        font-size: 14px;
      }
      
      .custom-nav-button:hover {
        background-color: #2a67ad;
      }
      
      .custom-nav-search input {
        padding: 5px 10px;
        border-radius: 3px;
        border: none;
        width: 200px;
        margin-right: 15px;
      }
      
      /* 调整页面内容，避免被导航条遮挡 */
      body {
        margin-top: 50px !important;
        padding-top: 10px !important;
      }
    `;
    
    console.log("DOM元素和样式已创建，准备添加到文档...");
    
    // 添加导航条和样式到页面
    document.head.appendChild(style);
    document.body.insertBefore(navBar, document.body.firstChild);
    
    // 向下推动页面内容以避免遮挡
    document.body.style.marginTop = '50px';
    document.body.style.paddingTop = '10px';
    
    console.log("导航条已成功添加到页面");
    return true;
  } catch (error) {
    console.error("创建导航条时出错:", error);
    throw error; // 重新抛出错误以便上层处理
  }
}

// 显示通知
function showNotification(message, type = "info") {
  const notification = document.createElement('div');
  
  // 设置样式
  notification.style.cssText = `
    position: fixed;
    top: 70px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    font-family: "Microsoft YaHei", sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;
  
  // 根据类型设置颜色
  if (type === "success") {
    notification.style.backgroundColor = "rgba(82, 196, 26, 0.9)";
    notification.style.color = "white";
  } else if (type === "error") {
    notification.style.backgroundColor = "rgba(255, 77, 79, 0.9)";
    notification.style.color = "white";
  } else {
    notification.style.backgroundColor = "rgba(24, 144, 255, 0.9)";
    notification.style.color = "white";
  }
  
  // 设置消息
  notification.textContent = message;
  
  // 添加到页面
  document.body.appendChild(notification);
  
  // 3秒后自动消失
  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transition = "opacity 0.5s ease";
    
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 3000);
}

// 专门处理力扣网站主题的函数
function applyLeetcodeTheme(themeType) {
  console.log("开始应用力扣主题:", themeType);
  
  // 移除之前可能存在的主题样式
  const existingStyle = document.getElementById('leetcode-theme-style');
  if (existingStyle) {
    existingStyle.textContent = ''; // 清空样式内容，但保留元素
  } else {
    // 如果样式元素不存在，创建一个新的
    const style = document.createElement('style');
    style.id = 'leetcode-theme-style';
    document.head.appendChild(style);
  }
  
  // 获取样式元素
  const style = document.getElementById('leetcode-theme-style');
  style.setAttribute('data-theme-type', themeType);

  // 根据不同的主题类型设置不同的CSS
  switch (themeType) {
    case 'leetcode-dark-theme':
      style.textContent = `
        /* 全局黑暗主题 */
        html, body {
          background-color: #1a1a1a !important;
          color: #e6e6e6 !important;
        }
        
        /* 页面主要区域 */
        .content-wrapper, #app, .content__1YWL, .main__1SUX, 
        .question-list-base, .ReactModalPortal .modal-content,
        .css-1dvkkzs, .css-ttjnks, .css-12h9w2d, .css-jkjr3r {
          background-color: #1a1a1a !important;
          color: #e6e6e6 !important;
        }
        
        /* 头部和侧边栏 */
        header, nav, .nav-container, .css-19rn0oz, .css-rqwr7h,
        .css-10c1h40, .css-jnaaq8, .css-ddp73i, .css-hprsjo {
          background-color: #262626 !important;
          border-color: #333 !important;
        }
        
        /* 代码和预格式化文本 */
        pre, code, .ace_editor, .monaco-editor, .CodeMirror, 
        .editor-container, .code-container, .css-1ivitvk, .css-1g5nrvb {
          background-color: #2d2d2d !important;
          color: #e0e0e0 !important;
          border-color: #444 !important;
        }
        
        /* 表格样式 */
        table, tr, td, th, .css-1a26oi1, .css-1t5yde5, .css-dcbk40 {
          border-color: #444 !important;
          background-color: #333 !important;
          color: #e0e0e0 !important;
        }
        
        /* 文本内容 */
        p, span, div, h1, h2, h3, h4, h5, h6, li, .css-1gtd8zg, .css-1s46lgg {
          color: #e0e0e0 !important;
        }
        
        /* 链接 */
        a, a *, button[class*="link"], .css-1yjl833, .css-1rtvhyd {
          color: #58a6ff !important;
        }
        
        a:hover, a:hover *, button[class*="link"]:hover {
          color: #79b8ff !important;
        }
        
        /* 按钮 */
        button, .btn, [class*="button"], [class*="Button"], .css-1rdgofi, .css-1irdz7v {
          background-color: #0d6efd !important;
          border-color: #0d6efd !important;
          color: white !important;
        }
        
        /* 输入框 */
        input, textarea, select, .css-1gfvo5g, .css-trwn79 {
          background-color: #333 !important;
          color: #e0e0e0 !important;
          border-color: #555 !important;
        }
        
        /* Monaco编辑器特殊处理 */
        .monaco-editor, .monaco-editor-background, .monaco-editor .margin,
        .monaco-editor .inputarea, .monaco-editor * {
          background-color: #202020 !important;
        }
        
        .monaco-editor .view-lines, .monaco-editor .view-line {
          color: #d4d4d4 !important;
        }
        
        /* 滚动条 */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #333 !important;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #555 !important;
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #777 !important;
        }
        
        /* 问题列表 */
        .css-qn0n7o, .css-1rq6c7o, .css-jkjr3r, .css-19rn0oz, .css-12h9w2d {
          background-color: #1a1a1a !important;
          color: #e6e6e6 !important;
        }
        
        /* 问题详情页 */
        .css-ttjnks, .css-1dvkkzs, .css-1u3glkp, .css-1e6doj4,
        .editor__tTJH, .content__2P00, .container__3BmF, .theme-dark {
          background-color: #1a1a1a !important;
          color: #e6e6e6 !important;
        }
      `;
      break;
    case 'leetcode-soft-theme':
      style.textContent = `
        /* 全局柔光主题 */
        html, body {
          background-color: #f5f5f5 !important;
          color: #333 !important;
        }
        
        /* 页面主要区域 */
        .content-wrapper, #app, .content__1YWL, .main__1SUX,
        .question-list-base, .ReactModalPortal .modal-content,
        .css-1dvkkzs, .css-ttjnks, .css-12h9w2d, .css-jkjr3r {
          background-color: #f5f5f5 !important;
          color: #333 !important;
        }
        
        /* 头部和侧边栏 */
        header, nav, .nav-container, .css-19rn0oz, .css-rqwr7h, 
        .css-10c1h40, .css-jnaaq8, .css-ddp73i, .css-hprsjo {
          background-color: #e8e8e8 !important;
          border-color: #ddd !important;
        }
        
        /* 代码和预格式化文本 */
        pre, code, .ace_editor, .monaco-editor, .CodeMirror,
        .editor-container, .code-container, .css-1ivitvk, .css-1g5nrvb {
          background-color: #f0f0f0 !important;
          color: #444 !important;
          border-color: #ddd !important;
        }
        
        /* 表格样式 */
        table, tr, td, th, .css-1a26oi1, .css-1t5yde5, .css-dcbk40 {
          border-color: #ddd !important;
          background-color: #f9f9f9 !important;
          color: #333 !important;
        }
        
        /* 文本内容 */
        p, span, div, h1, h2, h3, h4, h5, h6, li, .css-1gtd8zg, .css-1s46lgg {
          color: #444 !important;
        }
        
        /* 链接 */
        a, a *, button[class*="link"], .css-1yjl833, .css-1rtvhyd {
          color: #0366d6 !important;
        }
        
        a:hover, a:hover *, button[class*="link"]:hover {
          color: #0056b3 !important;
        }
        
        /* 按钮 */
        button, .btn, [class*="button"], [class*="Button"], .css-1rdgofi, .css-1irdz7v {
          background-color: #0d6efd !important;
          border-color: #0d6efd !important;
          color: white !important;
        }
        
        /* 输入框 */
        input, textarea, select, .css-1gfvo5g, .css-trwn79 {
          background-color: #fff !important;
          color: #333 !important;
          border-color: #ccc !important;
        }
        
        /* Monaco编辑器特殊处理 */
        .monaco-editor, .monaco-editor-background, .monaco-editor .margin,
        .monaco-editor .inputarea, .monaco-editor * {
          background-color: #f0f0f0 !important;
        }
        
        .monaco-editor .view-lines, .monaco-editor .view-line {
          color: #333 !important;
        }
        
        /* 滚动条 */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f0f0f0 !important;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #ccc !important;
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #999 !important;
        }
        
        /* 问题列表 */
        .css-qn0n7o, .css-1rq6c7o, .css-jkjr3r, .css-19rn0oz, .css-12h9w2d {
          background-color: #f5f5f5 !important;
          color: #333 !important;
        }
        
        /* 问题详情页 */
        .css-ttjnks, .css-1dvkkzs, .css-1u3glkp, .css-1e6doj4,
        .editor__tTJH, .content__2P00, .container__3BmF {
          background-color: #f5f5f5 !important;
          color: #333 !important;
        }
      `;
      break;
    case 'leetcode-blue-theme':
      style.textContent = `
        /* 全局蓝色护眼主题 */
        html, body {
          background-color: #eef6fb !important;
          color: #222 !important;
        }
        
        /* 页面主要区域 */
        .content-wrapper, #app, .content__1YWL, .main__1SUX,
        .question-list-base, .ReactModalPortal .modal-content,
        .css-1dvkkzs, .css-ttjnks, .css-12h9w2d, .css-jkjr3r {
          background-color: #eef6fb !important;
          color: #222 !important;
        }
        
        /* 头部和侧边栏 */
        header, nav, .nav-container, .css-19rn0oz, .css-rqwr7h,
        .css-10c1h40, .css-jnaaq8, .css-ddp73i, .css-hprsjo {
          background-color: #d4e9f7 !important;
          border-color: #c0ddf2 !important;
        }
        
        /* 代码和预格式化文本 */
        pre, code, .ace_editor, .monaco-editor, .CodeMirror,
        .editor-container, .code-container, .css-1ivitvk, .css-1g5nrvb {
          background-color: #e5f1fb !important;
          color: #333 !important;
          border-color: #c0ddf2 !important;
        }
        
        /* 表格样式 */
        table, tr, td, th, .css-1a26oi1, .css-1t5yde5, .css-dcbk40 {
          border-color: #c0ddf2 !important;
          background-color: #e5f1fb !important;
          color: #333 !important;
        }
        
        /* 文本内容 */
        p, span, div, h1, h2, h3, h4, h5, h6, li, .css-1gtd8zg, .css-1s46lgg {
          color: #333 !important;
        }
        
        /* 链接 */
        a, a *, button[class*="link"], .css-1yjl833, .css-1rtvhyd {
          color: #0366d6 !important;
        }
        
        a:hover, a:hover *, button[class*="link"]:hover {
          color: #0056b3 !important;
        }
        
        /* 按钮 */
        button, .btn, [class*="button"], [class*="Button"], .css-1rdgofi, .css-1irdz7v {
          background-color: #0d6efd !important;
          border-color: #0d6efd !important;
          color: white !important;
        }
        
        /* 输入框 */
        input, textarea, select, .css-1gfvo5g, .css-trwn79 {
          background-color: #fff !important;
          color: #333 !important;
          border-color: #c0ddf2 !important;
        }
        
        /* Monaco编辑器特殊处理 */
        .monaco-editor, .monaco-editor-background, .monaco-editor .margin,
        .monaco-editor .inputarea, .monaco-editor * {
          background-color: #e5f1fb !important;
        }
        
        .monaco-editor .view-lines, .monaco-editor .view-line {
          color: #333 !important;
        }
        
        /* 滚动条 */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #e5f1fb !important;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #b6daf2 !important;
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #80bdea !important;
        }
        
        /* 问题列表 */
        .css-qn0n7o, .css-1rq6c7o, .css-jkjr3r, .css-19rn0oz, .css-12h9w2d {
          background-color: #eef6fb !important;
          color: #222 !important;
        }
        
        /* 问题详情页 */
        .css-ttjnks, .css-1dvkkzs, .css-1u3glkp, .css-1e6doj4,
        .editor__tTJH, .content__2P00, .container__3BmF {
          background-color: #eef6fb !important;
          color: #222 !important;
        }
      `;
      break;
    case 'leetcode-sepia-theme':
      style.textContent = `
        /* 全局棕色主题 */
        html, body {
          background-color: #f8f0e3 !important;
          color: #5f4b32 !important;
        }
        
        /* 页面主要区域 */
        .content-wrapper, #app, .content__1YWL, .main__1SUX,
        .question-list-base, .ReactModalPortal .modal-content,
        .css-1dvkkzs, .css-ttjnks, .css-12h9w2d, .css-jkjr3r {
          background-color: #f8f0e3 !important;
          color: #5f4b32 !important;
        }
        
        /* 头部和侧边栏 */
        header, nav, .nav-container, .css-19rn0oz, .css-rqwr7h,
        .css-10c1h40, .css-jnaaq8, .css-ddp73i, .css-hprsjo {
          background-color: #f2e8d9 !important;
          border-color: #e8d9c0 !important;
        }
        
        /* 代码和预格式化文本 */
        pre, code, .ace_editor, .monaco-editor, .CodeMirror,
        .editor-container, .code-container, .css-1ivitvk, .css-1g5nrvb {
          background-color: #f4ece0 !important;
          color: #5f4b32 !important;
          border-color: #e8d9c0 !important;
        }
        
        /* 表格样式 */
        table, tr, td, th, .css-1a26oi1, .css-1t5yde5, .css-dcbk40 {
          border-color: #e8d9c0 !important;
          background-color: #f4ece0 !important;
          color: #5f4b32 !important;
        }
        
        /* 文本内容 */
        p, span, div, h1, h2, h3, h4, h5, h6, li, .css-1gtd8zg, .css-1s46lgg {
          color: #5f4b32 !important;
        }
        
        /* 链接 */
        a, a *, button[class*="link"], .css-1yjl833, .css-1rtvhyd {
          color: #7c5a2c !important;
        }
        
        a:hover, a:hover *, button[class*="link"]:hover {
          color: #614222 !important;
        }
        
        /* 按钮 */
        button, .btn, [class*="button"], [class*="Button"], .css-1rdgofi, .css-1irdz7v {
          background-color: #b08d57 !important;
          border-color: #b08d57 !important;
          color: white !important;
        }
        
        /* 输入框 */
        input, textarea, select, .css-1gfvo5g, .css-trwn79 {
          background-color: #fdf6e9 !important;
          color: #5f4b32 !important;
          border-color: #e8d9c0 !important;
        }
        
        /* Monaco编辑器特殊处理 */
        .monaco-editor, .monaco-editor-background, .monaco-editor .margin,
        .monaco-editor .inputarea, .monaco-editor * {
          background-color: #f4ece0 !important;
        }
        
        .monaco-editor .view-lines, .monaco-editor .view-line {
          color: #5f4b32 !important;
        }
        
        /* 滚动条 */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f4ece0 !important;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #e0caa3 !important;
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #d1b78c !important;
        }
        
        /* 问题列表 */
        .css-qn0n7o, .css-1rq6c7o, .css-jkjr3r, .css-19rn0oz, .css-12h9w2d {
          background-color: #f8f0e3 !important;
          color: #5f4b32 !important;
        }
        
        /* 问题详情页 */
        .css-ttjnks, .css-1dvkkzs, .css-1u3glkp, .css-1e6doj4,
        .editor__tTJH, .content__2P00, .container__3BmF {
          background-color: #f8f0e3 !important;
          color: #5f4b32 !important;
        }
      `;
      break;
    case 'leetcode-green-theme':
      style.textContent = `
        /* 全局绿色护眼主题 */
        html, body {
          background-color: #f0f7f0 !important;
          color: #333 !important;
        }
        
        /* 页面主要区域 */
        .content-wrapper, #app, .content__1YWL, .main__1SUX,
        .question-list-base, .ReactModalPortal .modal-content,
        .css-1dvkkzs, .css-ttjnks, .css-12h9w2d, .css-jkjr3r {
          background-color: #f0f7f0 !important;
          color: #333 !important;
        }
        
        /* 头部和侧边栏 */
        header, nav, .nav-container, .css-19rn0oz, .css-rqwr7h,
        .css-10c1h40, .css-jnaaq8, .css-ddp73i, .css-hprsjo {
          background-color: #e0f0e0 !important;
          border-color: #c8e6c8 !important;
        }
        
        /* 代码和预格式化文本 */
        pre, code, .ace_editor, .monaco-editor, .CodeMirror,
        .editor-container, .code-container, .css-1ivitvk, .css-1g5nrvb {
          background-color: #e8f5e8 !important;
          color: #333 !important;
          border-color: #c8e6c8 !important;
        }
        
        /* 表格样式 */
        table, tr, td, th, .css-1a26oi1, .css-1t5yde5, .css-dcbk40 {
          border-color: #c8e6c8 !important;
          background-color: #e8f5e8 !important;
          color: #333 !important;
        }
        
        /* 文本内容 */
        p, span, div, h1, h2, h3, h4, h5, h6, li, .css-1gtd8zg, .css-1s46lgg {
          color: #333 !important;
        }
        
        /* 链接 */
        a, a *, button[class*="link"], .css-1yjl833, .css-1rtvhyd {
          color: #2e7d32 !important;
        }
        
        a:hover, a:hover *, button[class*="link"]:hover {
          color: #1b5e20 !important;
        }
        
        /* 按钮 */
        button, .btn, [class*="button"], [class*="Button"], .css-1rdgofi, .css-1irdz7v {
          background-color: #43a047 !important;
          border-color: #43a047 !important;
          color: white !important;
        }
        
        /* 输入框 */
        input, textarea, select, .css-1gfvo5g, .css-trwn79 {
          background-color: #fff !important;
          color: #333 !important;
          border-color: #c8e6c8 !important;
        }
        
        /* Monaco编辑器特殊处理 */
        .monaco-editor, .monaco-editor-background, .monaco-editor .margin,
        .monaco-editor .inputarea, .monaco-editor * {
          background-color: #e8f5e8 !important;
        }
        
        .monaco-editor .view-lines, .monaco-editor .view-line {
          color: #333 !important;
        }
        
        /* 滚动条 */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #e8f5e8 !important;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #c8e6c8 !important;
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a5d6a7 !important;
        }
        
        /* 问题列表 */
        .css-qn0n7o, .css-1rq6c7o, .css-jkjr3r, .css-19rn0oz, .css-12h9w2d {
          background-color: #f0f7f0 !important;
          color: #333 !important;
        }
        
        /* 问题详情页 */
        .css-ttjnks, .css-1dvkkzs, .css-1u3glkp, .css-1e6doj4,
        .editor__tTJH, .content__2P00, .container__3BmF {
          background-color: #f0f7f0 !important;
          color: #333 !important;
        }
      `;
      break;
    default:
      style.textContent = '';
  }
  
  // 立即应用Monaco编辑器样式
  setTimeout(() => {
    applyMonacoEditorStyles(themeType);
  }, 500);
  
  // 通知用户主题已应用
  console.log("成功应用力扣主题:", themeType);
  
  // 添加提示信息
  showThemeNotification(themeType);
  
  return 1; // 表示成功应用主题
}

// 处理Monaco编辑器的样式
function applyMonacoEditorStyles(themeType) {
  console.log("尝试应用编辑器样式:", themeType);
  
  const isDark = themeType === 'leetcode-dark-theme';
  
  // 通过直接注入样式表强制修改Monaco编辑器样式
  const editorStyle = document.createElement('style');
  editorStyle.id = 'monaco-editor-style';
  editorStyle.textContent = `
    /* 强制修改Monaco编辑器样式 */
    .monaco-editor, .monaco-editor .margin, .monaco-editor-background,
    .monaco-editor-background, .monaco-editor .overflow-guard {
      background-color: ${isDark ? '#1e1e1e' : '#f5f5f5'} !important;
    }
    
    .monaco-editor .lines-content, .monaco-editor .view-line,
    .monaco-editor .view-lines {
      color: ${isDark ? '#d4d4d4' : '#333333'} !important;
    }
    
    .monaco-editor .line-numbers {
      color: ${isDark ? '#858585' : '#8e8e8e'} !important;
    }
    
    /* 强制修改编辑器中的语法高亮颜色 */
    .mtk1 { color: ${isDark ? '#d4d4d4' : '#333333'} !important; }
    .mtk2 { color: ${isDark ? '#569cd6' : '#0000ff'} !important; }
    .mtk3 { color: ${isDark ? '#9cdcfe' : '#001080'} !important; }
    .mtk4 { color: ${isDark ? '#ce9178' : '#a31515'} !important; }
    .mtk5 { color: ${isDark ? '#6a9955' : '#008000'} !important; }
    .mtk6 { color: ${isDark ? '#569cd6' : '#0070c1'} !important; }
    .mtk7 { color: ${isDark ? '#d16969' : '#e50000'} !important; }
    .mtk8 { color: ${isDark ? '#dcdcaa' : '#795e26'} !important; }
  `;
  
  // 先删除已存在的样式
  const existingEditorStyle = document.getElementById('monaco-editor-style');
  if (existingEditorStyle) {
    existingEditorStyle.remove();
  }
  
  // 添加新样式
  document.head.appendChild(editorStyle);
  
  console.log("Monaco编辑器样式已应用");
}

// 显示主题切换通知
function showThemeNotification(themeType) {
  let themeName = '';
  
  switch (themeType) {
    case 'leetcode-dark-theme':
      themeName = '暗黑主题';
      break;
    case 'leetcode-soft-theme':
      themeName = '柔光护眼';
      break;
    case 'leetcode-blue-theme':
      themeName = '蓝色护眼';
      break;
    case 'leetcode-sepia-theme':
      themeName = '棕色主题';
      break;
    case 'leetcode-green-theme':
      themeName = '绿色护眼';
      break;
  }
  
  // 创建通知元素
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: rgba(0, 128, 0, 0.8);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 10000;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    font-family: "Microsoft YaHei", sans-serif;
  `;
  notification.textContent = `已成功应用${themeName}`;
  
  // 添加到页面
  document.body.appendChild(notification);
  
  // 3秒后自动移除
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// 专门用于删除知乎侧边栏的函数
function removeZhihuSidebar() {
  console.log("开始专门处理知乎侧边栏...");
  let deleted = 0;
  
  // 使用多种选择器查找侧边栏元素
  const selectors = [
    '[data-za-detail-view-path-module="RightSideBar"]',
    '[data-za-detail-view-path-module*="RightSideBar"]',
    '.GlobalSideBar',
    '.Pc-card.Card',
    '.RightSideBar',
    '[class*="SideBar"]',
    '[class*="sideBar"]',
    'aside',
    '.css-1qyby9f',
    '.css-1oy4rvw'
  ];
  
  // 使用MutationObserver持续监听并删除侧边栏
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      // 检查新添加的节点
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const node = mutation.addedNodes[i];
          // 只处理元素节点
          if (node.nodeType === 1) {
            // 检查元素是否匹配选择器
            if (isSidebarElement(node)) {
              try {
                console.log("检测到新的侧边栏元素:", node);
                node.remove();
                deleted++;
              } catch (e) {
                console.error("无法删除新检测到的侧边栏:", e);
                try {
                  node.style.display = 'none';
                } catch (e2) {}
              }
            }
          }
        }
      }
    });
  });
  
  // 开始监听DOM变化
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // 立即删除当前页面上的侧边栏
  selectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      console.log(`使用选择器 ${selector} 找到 ${elements.length} 个元素`);
      
      elements.forEach(el => {
        try {
          el.remove();
          deleted++;
          console.log("成功删除元素:", el);
        } catch (error) {
          console.error("删除元素失败:", error);
          try {
            el.style.display = 'none';
            deleted++;
            console.log("已隐藏元素:", el);
          } catch (err) {
            console.error("隐藏元素也失败:", err);
          }
        }
      });
    } catch (e) {
      console.error(`选择器 ${selector} 查询失败:`, e);
    }
  });
  
  // 添加CSS规则
  const style = document.createElement('style');
  style.textContent = `
    [data-za-detail-view-path-module="RightSideBar"],
    [data-za-detail-view-path-module*="RightSideBar"],
    .Pc-card,
    .Card,
    .Pc-card.Card,
    .GlobalSideBar,
    [class*="SideBar"],
    [class*="sideBar"],
    [data-za-detail-view-path-module],
    [class*="RightSideBar"],
    aside,
    .css-1qyby9f,
    .css-1oy4rvw {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      width: 0 !important;
      max-width: 0 !important;
      height: 0 !important;
      max-height: 0 !important;
      overflow: hidden !important;
      position: absolute !important;
      pointer-events: none !important;
      z-index: -9999 !important;
    }
    
    /* 调整主内容区域宽度 */
    .Topstory-container {
      width: 100% !important;
      max-width: 1000px !important;
      margin: 0 auto !important;
    }
    
    .Topstory-mainColumn {
      width: 100% !important;
      max-width: none !important;
    }
  `;
  document.head.appendChild(style);
  
  console.log(`已处理 ${deleted} 个侧边栏元素，并添加了CSS规则`);
  return deleted > 0 ? deleted : 1; // 即使没找到元素，也返回1表示CSS注入成功
}

// 判断元素是否是侧边栏元素的辅助函数
function isSidebarElement(element) {
  if (!element || element.nodeType !== 1) return false;
  
  // 检查data属性
  if (element.dataset && element.dataset.zaDetailViewPathModule === "RightSideBar") return true;
  if (element.getAttribute && element.getAttribute("data-za-detail-view-path-module") === "RightSideBar") return true;
  
  // 检查类名
  if (element.classList) {
    if (element.classList.contains("Pc-card") && element.classList.contains("Card")) return true;
    if (element.classList.contains("GlobalSideBar")) return true;
    if (element.classList.contains("RightSideBar")) return true;
    
    // 检查是否包含"SideBar"或"sideBar"的类名
    for (let i = 0; i < element.classList.length; i++) {
      const className = element.classList[i];
      if (className.includes("SideBar") || className.includes("sideBar")) return true;
    }
  }
  
  // 检查标签名
  if (element.tagName && element.tagName.toLowerCase() === "aside") return true;
  
  return false;
}

// 添加Confluence风格导航条
function addConfluenceNavBar() {
  console.log("开始添加Confluence风格导航条...");
  
  try {
    // 检查是否已存在Confluence导航条
    const existingNavBar = document.querySelector('.confluence-nav-bar');
    if (existingNavBar) {
      console.log("Confluence导航条已存在，设置为可见");
      existingNavBar.style.display = '';
      
      // 恢复页面样式
      document.body.style.marginTop = '50px';
      document.body.style.paddingTop = '10px';
      
      showNotification("Confluence导航条已显示", "info");
      return true;
    }
    
    // 创建导航条容器
    const navBar = document.createElement('div');
    navBar.className = 'confluence-nav-bar';
    navBar.setAttribute('data-added-by-extension', 'true');
    
    // 设置导航条内容
    navBar.innerHTML = `
      <div class="confluence-nav-bar-inner">
        <div class="confluence-nav-bar-primary">
          <div class="confluence-nav-logo">
            <a href="#" class="confluence-logo-link">
              <svg viewBox="0 0 32 32" height="24" width="24">
                <path d="M6.4 22.9c-.8.7-1.5 1.9-1.9 3-.1.3-.5.5-.8.5-.1 0-.3 0-.4-.1-.4-.2-.6-.7-.4-1.1.5-1.3 1.4-2.7 2.4-3.6.9-.8 2.4-1.6 3.5-1.7.4-1.1 1.1-2.7 1.8-3.7 1-1.3 2.6-2.3 4-2.8-.2-.1-.3-.3-.5-.5-1.3-1.2-1.9-3-.6-4.8.3-.5.4-.6.8-1 .2-.2.4-.4.5-.6.1-.1.1-.3.1-.4 0-.3-.2-.4-.9-.8-1.3-.8-1.8-1.6-1.8-2.6s.6-2 1.5-2.6c.6-.3 1.3-.4 2.1-.4 1.7 0 3.5.7 5.2 1.9 3.7 2.5 7.2 6.9 8.5 10.7.7 2.1.9 4.2.5 5.7-.3 1.1-1 1.8-2 1.9-1.3.2-2.5-.4-3.9-1.9-.8 1.1-2.6 3.3-4.8 3.3-1 0-1.9-.4-2.7-1.2-1.7 1.2-3.4 2.4-5.2 3.2-1.6.7-3.6 1.1-5 1.1-1.2-.2-2.4-.7-3.6-1.5.1 0 1.4-.1 3.6-1z" fill="#0065FF"></path>
              </svg>
            </a>
          </div>
          <div class="confluence-nav-items">
            <button class="confluence-nav-item">空间</button>
            <button class="confluence-nav-item">创建</button>
          </div>
        </div>
        <div class="confluence-nav-bar-secondary">
          <div class="confluence-nav-search">
            <input type="text" placeholder="搜索" class="confluence-search-input">
            <button class="confluence-search-btn">
              <svg viewBox="0 0 24 24" height="16" width="16">
                <path d="M16.436 15.085l3.94 4.01a1 1 0 01-1.425 1.402l-3.938-4.006a7.5 7.5 0 111.423-1.406zM10.5 16a5.5 5.5 0 100-11 5.5 5.5 0 000 11z" fill="currentColor"></path>
              </svg>
            </button>
          </div>
          <div class="confluence-nav-actions">
            <button class="confluence-nav-action-btn">帮助</button>
            <button class="confluence-nav-action-btn">通知</button>
            <button class="confluence-nav-profile-btn">个人信息</button>
          </div>
        </div>
      </div>
    `;
    
    // 创建样式
    const style = document.createElement('style');
    style.id = 'confluence-nav-bar-styles';
    style.textContent = `
      .confluence-nav-bar {
        background-color: #0052CC;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 56px;
        z-index: 10000;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      
      .confluence-nav-bar-inner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100%;
        padding: 0 20px;
      }
      
      .confluence-nav-bar-primary, .confluence-nav-bar-secondary {
        display: flex;
        align-items: center;
      }
      
      .confluence-nav-logo {
        margin-right: 20px;
      }
      
      .confluence-logo-link {
        display: flex;
        align-items: center;
      }
      
      .confluence-nav-items {
        display: flex;
        align-items: center;
      }
      
      .confluence-nav-item {
        background: none;
        border: none;
        color: white;
        font-size: 14px;
        padding: 8px 12px;
        margin-right: 8px;
        border-radius: 3px;
        cursor: pointer;
      }
      
      .confluence-nav-item:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
      
      .confluence-nav-search {
        display: flex;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.15);
        border-radius: 3px;
        margin-right: 20px;
      }
      
      .confluence-search-input {
        background: transparent;
        border: none;
        color: white;
        padding: 8px 12px;
        width: 200px;
      }
      
      .confluence-search-input::placeholder {
        color: rgba(255, 255, 255, 0.7);
      }
      
      .confluence-search-btn {
        background: none;
        border: none;
        color: white;
        padding: 8px;
        cursor: pointer;
      }
      
      .confluence-nav-actions {
        display: flex;
        align-items: center;
      }
      
      .confluence-nav-action-btn {
        background: none;
        border: none;
        color: white;
        padding: 8px;
        margin-right: 8px;
        cursor: pointer;
      }
      
      .confluence-nav-profile-btn {
        background-color: rgba(255, 255, 255, 0.15);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      
      /* 调整页面内容，避免被导航条遮挡 */
      body {
        margin-top: 56px !important;
        padding-top: 10px !important;
      }
    `;
    
    console.log("DOM元素和样式已创建，准备添加到文档...");
    
    // 添加导航条和样式到页面
    document.head.appendChild(style);
    document.body.insertBefore(navBar, document.body.firstChild);
    
    // 向下推动页面内容以避免遮挡
    document.body.style.marginTop = '56px';
    document.body.style.paddingTop = '10px';
    
    console.log("Confluence导航条已成功添加到页面");
    
    // 显示成功通知
    showNotification("Confluence导航条已添加", "success");
    
    return true;
  } catch (error) {
    console.error("添加Confluence导航条时发生错误:", error);
    throw error;
  }
}

// 添加图片导航条
function addImageNavBar() {
  console.log("开始添加图片导航条...");
  
  try {
    // 检查是否已存在图片导航条
    const existingNavBar = document.querySelector('.image-nav-bar');
    if (existingNavBar) {
      console.log("图片导航条已存在，设置为可见");
      existingNavBar.style.display = '';
      
      // 恢复页面样式
      document.body.style.marginTop = '50px';
      document.body.style.paddingTop = '10px';
      
      showNotification("图片导航条已显示", "info");
      return true;
    }
    
    // 创建导航条容器
    const navBar = document.createElement('div');
    navBar.className = 'image-nav-bar';
    navBar.setAttribute('data-added-by-extension', 'true');
    
    // 创建图片元素
    const imgElement = document.createElement('div');
    imgElement.className = 'image-nav-bar-content';
    
    // 使用Base64编码的图片 - 这里我们提供了选项，实际使用时可以选择其中一种
    
    // 选项1: 直接使用内联SVG（可选）
    // imgElement.innerHTML = `
    //   <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="50" viewBox="0 0 1000 50">
    //     <rect width="1000" height="50" fill="#0052CC"/>
    //     <circle cx="30" cy="25" r="15" fill="#FFF"/>
    //     <rect x="60" y="20" width="60" height="10" rx="5" fill="#FFF"/>
    //     <rect x="130" y="20" width="60" height="10" rx="5" fill="#FFF"/>
    //     <rect x="700" y="15" width="200" height="20" rx="10" fill="rgba(255,255,255,0.2)"/>
    //     <circle cx="960" cy="25" r="15" fill="rgba(255,255,255,0.2)"/>
    //   </svg>
    // `;
    
    // 选项2: 使用实际的图片 - 创建一个直接显示已上传的图片的导航条
    const img = document.createElement('img');
    img.src = chrome.runtime.getURL('WechatIMG42.jpg');
    img.alt = '导航条图片';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    imgElement.appendChild(img);
    
    navBar.appendChild(imgElement);
    
    // 创建样式
    const style = document.createElement('style');
    style.id = 'image-nav-bar-styles';
    style.textContent = `
      .image-nav-bar {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 50px;
        z-index: 10000;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        overflow: hidden;
      }
      
      .image-nav-bar-content {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      
      /* 使用实际图片的样式 */
      .image-nav-bar-content img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top;
      }
      
      /* 调整页面内容，避免被导航条遮挡 */
      body {
        margin-top: 50px !important;
        padding-top: 10px !important;
      }
    `;
    
    console.log("DOM元素和样式已创建，准备添加到文档...");
    
    // 添加导航条和样式到页面
    document.head.appendChild(style);
    document.body.insertBefore(navBar, document.body.firstChild);
    
    // 向下推动页面内容以避免遮挡
    document.body.style.marginTop = '50px';
    document.body.style.paddingTop = '10px';
    
    console.log("图片导航条已成功添加到页面");
    
    // 显示成功通知
    showNotification("图片导航条已添加", "success");
    
    return true;
  } catch (error) {
    console.error("添加图片导航条时发生错误:", error);
    throw error;
  }
} 