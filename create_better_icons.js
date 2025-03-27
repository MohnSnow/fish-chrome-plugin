const fs = require('fs');
const path = require('path');

// 确保images目录存在
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// 创建一个更好看的SVG图标 - 带有渐变色和现代风格的删除元素图标
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff7e5f;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#feb47b;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#00000033" />
    </filter>
  </defs>
  <rect width="128" height="128" rx="24" ry="24" fill="url(#grad1)" filter="url(#shadow)"/>
  <g transform="translate(30, 30) scale(0.55)" fill="white" filter="url(#shadow)">
    <path d="M120.9 14.5a9 9 0 0 1 0 12.7L85.4 63l35.5 35.8a9 9 0 0 1 0 12.7 9 9 0 0 1-12.7 0L72.7 76 37.3 111.5a9 9 0 0 1-12.7 0 9 9 0 0 1 0-12.7L59.9 63 24.5 27.2a9 9 0 0 1 0-12.7 9 9 0 0 1 12.7 0L72.7 50l35.5-35.5a9 9 0 0 1 12.7 0z"/>
  </g>
</svg>`;

// 将SVG内容写入文件
fs.writeFileSync(path.join(imagesDir, 'icon.svg'), svgContent);
console.log('已创建SVG图标');

// 使用Node.js的Buffer创建简单的PNG文件
// 注意：这只是一个替代方案，更好的方式是使用真正的图像处理库
// 如果用户有适当的工具，应该使用SVG到PNG的转换工具

// 一个简单的橙色系PNG文件的base64编码
const pngBase64 = `iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEFklEQVR4nO3dzW8TVxQF8HPvzIyd2AkJoUlICdD0A1qqCgQSC7pCLCr1D6yQuvkLWHXPP8CuXbDqpl20K6QuKlaVKlWoCBUKtBSUJqTYJE5ie+a+LpJSlaa248mduePMb528xbyTc8bOm8xEAiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIqL1MtYD+B6aH3lxCUBT5vNTUE2jNdHZZ6VVY5yA80NwcsoXPcyMXDBv7PqJVus26wEsqGVGbhsiJ2zUy1RRl6CiU10JcR7+3KdIgsgXuR1oeK4+PHbILBZx1t7hfALMDL/YVh9K/WacO6aKHVbzqZWKqHPOZzHkQpDxl2a77z2Y7vk5q9c1C4D6DkQVT2NePi5EPyhmcPAQc99eQdV7hXw/c2XZ8eDtlZYshtyODQ/m5hsvKhbvHcxyzKYBGB948XE1xJ9BOByy+n4vkxOAYbHn48Xtg3cLixvuDNUPTP9YRuOPAfNi50VDwqsuwB1dfrxRADQMl0Lxzlq+9PvZbk2vXABWd/+l1lKl+3rK96rV+NrlsRpuAW8LPrmb85e/znpBVw/aFAFY2f2Xd2LQO7G1k1PdqVLFVWvr2kLzSG2i+0xmw2XM9QNgZfdnGYEVpqAXcikz0/0i6zG9QdvuAKu7f+WkD2NrF2QLWvVGrIbzRm3kH/D9AFixu3eWvh5b5VPAu1y1PpXcX0dn11gEYKB/vL257uXfrv38Jnoc4lwWYwIrB9QP13ce2Oq3xCQAyLWVSkfRbDL3deDRoHHJd1kMA/AcZvz/3Nz4Ds+LxSYAT23tXc5iwtDY3jtWAYDN5yC2SsGjpSyG9I7VTuA+5JpRzOU3GYvNHQB+w9hcDAAQQjYBSNi1AJCwYwAQu2sAgJhdAwBE7hoEIGrXIABRuwYCELNrIAAxuwYDELFrMACApG3XcABiti0AELFtAYCIbQsARGxbACBi2wIAEdsWAIjYtgBAxLYFACK2LQAQsW0BgIhtCwBEbFsAIGLbAgAR2xYAiNi2AEDEtgUAIrYtABCxbQGAiG0LAERsWwAgYtsCABHbFgCI2LYAuY6XsxjSO1YBaPNKExbiQiY/wgWsYjYHwvNqFkN6x+qLFZs84+PbzxuFOTfEYWztJoM2/FcZjOkVqwCgAWj1JfdjaydiGgsbnxsZDOmVev/YeqdGwXk9PbUrkxcOnqoatZu+n79WSKnvlhZzw1mP6wu7ACRyKk1x6e7e55c0g0+CzUo8v1ZNy/eGdj+cSPN/tYvZ6+0lX+eHACnXdv24/NrKLQ2Bv2xgctOzmeY1zc/NaBC5dH8kf9nqNYiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiDz0L5gZpeVo+E49AAAAAElFTkSuQmCC`;

// 为不同尺寸创建PNG文件
const sizes = [16, 48, 128];
const pngData = Buffer.from(pngBase64, 'base64');

sizes.forEach(size => {
  const iconPath = path.join(imagesDir, `icon${size}.png`);
  fs.writeFileSync(iconPath, pngData);
  console.log(`已创建图标: ${iconPath}`);
});

console.log('所有图标已成功创建！');
console.log('提示：为获得最佳效果，请使用真实的图像处理工具（如ImageMagick）将SVG转换为不同尺寸的PNG'); 