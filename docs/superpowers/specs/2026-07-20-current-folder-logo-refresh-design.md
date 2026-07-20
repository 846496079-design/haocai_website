# 官网新版 Logo 替换设计

## 1. 目标

将 `公司介绍/好财Logo` 目录中当前版本的中文、日文、繁体中文 Logo 应用到官网。用户重新打开 CN、JP、HK 站点时，导航、页脚和公司介绍页均应显示对应语言的新版 Logo。

## 2. 资源映射

- CN：`公司介绍/好财Logo/img_v3_0213l_a14166ad-be6f-473a-bd7a-c5d330a3d3eg.jpg`
- JP：`公司介绍/好财Logo/img_v3_0213l_a14166ad-be6f-473a-bd7a-c5d330a3d3eg_jp.png`
- HK：`公司介绍/好财Logo/img_v3_0213l_a14166ad-be6f-473a-bd7a-c5d330a3d3eg_tc.png`

三张源图均为 `2320 × 848`。源文件保持不变，网页使用从源文件生成的 `1440 × 526` WebP 资源：

- `/images/brand/official-logo-cn-20260720.webp`
- `/images/brand/official-logo-jp-20260720.webp`
- `/images/brand/official-logo-hk-20260720.webp`

新路径带日期版本号，避免浏览器和图片优化缓存继续返回旧 Logo。

## 3. 页面改动

- `components/layout/Navbar.tsx`：三站顶部导航切换到新版资源。
- `components/layout/Footer.tsx`：三站移动端与桌面端页脚切换到新版资源。
- `components/marketing/official-site.tsx`：公司介绍页品牌区切换到新版资源。
- 图片声明尺寸使用与源图一致的比例，页面现有高度和布局类保持不变，避免 Logo 拉伸或影响导航结构。

## 4. 边界

- 不修改 Logo 图形、文字、颜色和源文件。
- 不修改导航、页脚、公司介绍之外的页面结构。
- 不触碰工作区已有的新闻内容、临时文件和其他未提交改动。
- 旧版网页 Logo 继续保留，便于回溯，不再作为页面引用。

## 5. 验收标准

1. CN、JP、HK 的导航、页脚和公司介绍页显示各自对应的新版 Logo。
2. Logo 保持完整比例，没有拉伸、裁切和横向溢出。
3. 桌面端和移动端的现有导航、页脚布局不变。
4. 三张网页资源尺寸一致、文件可读取且路径带 `20260720` 版本号。
5. 项目构建通过，页面未出现中文乱码或资源 404。
