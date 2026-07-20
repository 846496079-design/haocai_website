# 完整功能对比表入口点击区域修复实施计划

## 实施步骤

1. 保留首页报价区下方链接的 `-mt-8`、文字、箭头和目标地址。
2. 为链接外层增加 `relative z-10`，使完整 44px 点击区域位于报价 section 上方。
3. 增加静态回归脚本，固定容器层级、链接地址和最小点击高度。
4. 运行静态回归、TypeScript 检查、生产构建和差异检查。
5. 在桌面与手机宽度执行浏览器命中测试，验证文字及链接边缘均命中链接。
6. 仅提交本次实现、测试和计划文件。

## 验证命令

```powershell
npm run site:verify-comparison-link
npm run typecheck:cms
npm run build
git diff --check
```
