const fs = require('fs');
const path = require('path');

// 确保images目录存在
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// 最小的有效PNG文件的base64数据
// 这是一个1x1像素的蓝色PNG图像
const minimalPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const pngData = Buffer.from(minimalPngBase64, 'base64');

// 创建不同尺寸的图标
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const iconPath = path.join(imagesDir, `icon${size}.png`);
  fs.writeFileSync(iconPath, pngData);
  console.log(`已创建图标: ${iconPath}`);
});

console.log('所有图标已成功创建！'); 