#!/bin/bash

# 创建图标目录
mkdir -p images

# 使用 Base64 创建一个简单的 SVG 图标
cat > images/icon.svg << EOL
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" fill="#4285f4" rx="20" ry="20"/>
  <path d="M 30,50 L 98,50 L 98,54 L 30,54 Z" fill="white"/>
  <path d="M 30,74 L 98,74 L 98,78 L 30,78 Z" fill="white"/>
  <path d="M 64,30 L 64,98" stroke="white" stroke-width="4"/>
  <circle cx="64" cy="64" r="20" fill="none" stroke="white" stroke-width="4"/>
</svg>
EOL

# 将 SVG 转换为不同尺寸的 PNG (需要 ImageMagick)
echo "请确保已安装 ImageMagick。如果没有，请运行 'brew install imagemagick' 安装。"
echo "转换 SVG 到 PNG..."

# 使用以下命令将 SVG 转换为不同尺寸的 PNG
if command -v convert &> /dev/null; then
  convert -background none images/icon.svg -resize 16x16 images/icon16.png
  convert -background none images/icon.svg -resize 48x48 images/icon48.png
  convert -background none images/icon.svg -resize 128x128 images/icon128.png
  echo "图标生成完成！"
else
  echo "未找到 ImageMagick。请手动创建图标或安装 ImageMagick。"
  echo "创建空白 PNG 文件作为替代..."
  # 创建空白 PNG 文件
  touch images/icon16.png
  touch images/icon48.png
  touch images/icon128.png
fi 