// 在文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const siteSelect = document.getElementById('site');
  const elementSelect = document.getElementById('element');
  const deleteBtn = document.getElementById('delete-btn');
  const addNavBarBtn = document.getElementById('add-nav-bar-btn'); // 获取导航条按钮元素
  const addNavBarBtn1 = document.getElementById('add-nav-bar-btn-1'); // 获取导航条1按钮元素
  const addNavBarBtn2 = document.getElementById('add-nav-bar-btn-2'); // 获取导航条2按钮元素
  
  // 检查当前页面是否已有导航条
  checkNavigationBarStatus();
  
  // 添加导航条按钮点击事件
  addNavBarBtn.addEventListener('click', function() {
    // 根据按钮当前文本确定要执行的操作
    const action = addNavBarBtn.textContent.includes('添加') ? 'add' : 'hide';
    
    console.log(`准备${action === 'add' ? '添加' : '隐藏'}导航条...`);
    
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs || tabs.length === 0) {
        console.error('无法获取当前标签页');
        return;
      }
      
      console.log(`向标签页 ${tabs[0].id} 发送toggleNavigationBar消息`);
      
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'toggleNavigationBar',
        operation: action
      }, function(response) {
        console.log('收到响应:', response);
        
        if (chrome.runtime.lastError) {
          console.error('发送消息时出错:', chrome.runtime.lastError);
          return;
        }
        
        if (response && response.success) {
          console.log(action === 'add' ? '导航条添加成功' : '导航条隐藏成功');
          
          // 更新按钮状态
          updateNavBarButton(action === 'add');
          
          // 关闭弹出窗口
          window.close();
        } else {
          console.error(action === 'add' ? '导航条添加失败' : '导航条隐藏失败', response ? response.error : '未知错误');
        }
      });
    });
  });
  
  // 添加导航条1按钮点击事件
  addNavBarBtn1.addEventListener('click', function() {
    console.log('准备添加Confluence风格导航条...');
    
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs || tabs.length === 0) {
        console.error('无法获取当前标签页');
        return;
      }
      
      console.log(`向标签页 ${tabs[0].id} 发送添加Confluence导航条消息`);
      
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'addConfluenceNavBar'
      }, function(response) {
        console.log('收到响应:', response);
        
        if (chrome.runtime.lastError) {
          console.error('发送消息时出错:', chrome.runtime.lastError);
          return;
        }
        
        if (response && response.success) {
          console.log('Confluence导航条添加成功');
          // 关闭弹出窗口
          window.close();
        } else {
          console.error('Confluence导航条添加失败', response ? response.error : '未知错误');
        }
      });
    });
  });
  
  // 添加导航条2按钮点击事件
  addNavBarBtn2.addEventListener('click', function() {
    console.log('准备添加图片导航条...');
    
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs || tabs.length === 0) {
        console.error('无法获取当前标签页');
        return;
      }
      
      console.log(`向标签页 ${tabs[0].id} 发送添加图片导航条消息`);
      
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'addImageNavBar'
      }, function(response) {
        console.log('收到响应:', response);
        
        if (chrome.runtime.lastError) {
          console.error('发送消息时出错:', chrome.runtime.lastError);
          return;
        }
        
        if (response && response.success) {
          console.log('图片导航条添加成功');
          // 关闭弹出窗口
          window.close();
        } else {
          console.error('图片导航条添加失败', response ? response.error : '未知错误');
        }
      });
    });
  });
  
  // 检查导航条状态并更新按钮
  function checkNavigationBarStatus() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'checkNavigationBar'
      }, function(response) {
        if (response && response.exists) {
          updateNavBarButton(true);
        } else {
          updateNavBarButton(false);
        }
      });
    });
  }
  
  // 更新导航条按钮显示状态
  function updateNavBarButton(navBarExists) {
    if (navBarExists) {
      addNavBarBtn.textContent = '隐藏导航条';
      addNavBarBtn.style.backgroundColor = '#d04437';
    } else {
      addNavBarBtn.textContent = '添加导航条';
      addNavBarBtn.style.backgroundColor = '#ff5500';
    }
  }
  
  // 加载配置文件
  fetch('config.json')
    .then(response => response.json())
    .then(configData => {
      // 存储配置数据
      window.configData = configData;
      
      // 填充网站选择下拉框
      configData.forEach(siteObj => {
        const siteName = Object.keys(siteObj)[0];
        // 跳过"通用"类型，因为我们现在有独立按钮了
        if (siteName !== '通用') {
          const option = document.createElement('option');
          option.value = siteName;
          option.textContent = siteName;
          siteSelect.appendChild(option);
        }
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