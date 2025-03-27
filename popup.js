// 在文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const siteSelect = document.getElementById('site');
  const elementSelect = document.getElementById('element');
  const deleteBtn = document.getElementById('delete-btn');
  
  // 加载配置文件
  fetch('config.json')
    .then(response => response.json())
    .then(configData => {
      // 存储配置数据
      window.configData = configData;
      
      // 填充网站选择下拉框
      configData.forEach(siteObj => {
        const siteName = Object.keys(siteObj)[0];
        const option = document.createElement('option');
        option.value = siteName;
        option.textContent = siteName;
        siteSelect.appendChild(option);
      });
    })
    .catch(error => {
      console.error('加载配置文件失败:', error);
    });
  
  // 网站选择变化时触发
  siteSelect.addEventListener('change', function() {
    // 清空元素选择下拉框
    elementSelect.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- 请选择要删除的元素 --';
    elementSelect.appendChild(defaultOption);
    
    const selectedSite = siteSelect.value;
    
    if (selectedSite) {
      // 启用元素选择下拉框
      elementSelect.disabled = false;
      
      // 查找选中的网站配置
      const siteConfig = window.configData.find(site => Object.keys(site)[0] === selectedSite);
      
      if (siteConfig) {
        // 填充元素选择下拉框
        const elements = siteConfig[selectedSite];
        for (const [elementName, elementValue] of Object.entries(elements)) {
          const option = document.createElement('option');
          option.value = elementValue;
          option.textContent = elementName;
          elementSelect.appendChild(option);
        }
      }
    } else {
      // 禁用元素选择下拉框
      elementSelect.disabled = true;
      deleteBtn.disabled = true;
    }
  });
  
  // 元素选择变化时触发
  elementSelect.addEventListener('change', function() {
    // 根据是否选择了元素来启用或禁用删除按钮
    deleteBtn.disabled = !elementSelect.value;
  });
  
  // 删除按钮点击事件
  deleteBtn.addEventListener('click', function() {
    const selectedSite = siteSelect.value;
    const selectedElement = elementSelect.value;
    
    if (selectedSite && selectedElement) {
      // 向当前活动标签页发送消息
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'deleteElement',
          siteType: selectedSite,
          elementType: selectedElement
        });
      });
    }
  });
}); 