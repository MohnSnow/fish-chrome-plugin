/**
 * 元素删除器 - 内容脚本
 * 
 * 该脚本负责在网页中删除指定的元素
 */

// 监听来自弹出窗口的消息
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'deleteElement') {
    const siteType = message.siteType;
    const elementType = message.elementType;
    
    console.log(`准备删除 ${siteType} 网站上的 ${elementType} 元素`);
    
    let elements = [];
    let deleted = 0;
    
    // 根据不同的选择删除不同的元素
    if (elementType.includes(' ')) {
      // 如果元素类型包含空格，认为是CSS类名
      const classNames = elementType.split(' ');
      
      // 查找同时具有所有指定类名的元素
      elements = Array.from(document.body.getElementsByTagName('*'));
      
      classNames.forEach(className => {
        elements = elements.filter(el => el.classList.contains(className));
      });
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
    
    console.log(`已处理 ${deleted} 个元素`);
    
    // 返回结果
    sendResponse({ success: deleted > 0, count: deleted });
  }
  
  // 必须返回true以支持异步响应
  return true;
}); 