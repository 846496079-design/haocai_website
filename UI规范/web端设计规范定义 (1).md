# web端设计规范定义



> Desktop Design System（1440px）
> 
> 



---



# 0\. 基础要求



## 设计关键词（Design Principle）



整体视觉定位：



> Enterprise AI Workspace
> 
> 



设计关键词：



- Light Tech（轻科技）

- Trustworthy（高可信）

- Multi\-Agent（多智能体协作）

- Low Cognitive Load（低认知负担）

- White Space（留白感）

- Future（未来感）

整体风格：



- 企业级 SaaS

- AI First

- Card Layout

- Soft UI

- Low Contrast

- White Space First

---



## 设计尺寸（Layout）



|项目|规范|
|---|---|
|Desktop|**1440 × 1024 px**|
|Content|**1280 px**|
|Grid|**12 Columns**|
|Base Spacing|**8px Grid**|



推荐布局：



```Plain Text
Sidebar（260）
 
↓
 
Topbar（72）
 
↓
 
Page Header
 
↓
 
Content
 
↓
 
Card / Table
```



---

# 1\.侧边栏规范（Sidebar Definition）



### 导航布局（Navigation Layout）



所有企业级 AI 产品统一采用 **左侧纵向侧边栏（Left Vertical Sidebar）** 作为页面唯一的一级导航。



侧边栏固定在页面最左侧，所有导航菜单采用 **从上到下（Top → Bottom）** 的纵向排列方式，不允许根据不同项目修改导航位置或排列方向。



页面整体布局如下：



```Plain Text
┌─────────────────────────────────────────────────────────────┐
│ 侧边栏 │                    顶部工具栏                      │
│        ├───────────────────────────────────────────────────┤
│        │ 页面标题                                          │
│        ├───────────────────────────────────────────────────┤
│        │                                                   │
│        │                  主内容区域                        │
│        │                                                   │
└─────────────────────────────────────────────────────────────┘
```



页面结构：



```Plain Text
左侧侧边栏（Sidebar）

↓

顶部工具栏（Topbar）

↓

页面标题（Page Header）

↓

主内容区域（Main Content）

↓

卡片 / 表格 / AI 工作区（Card / Table / Workspace）
```



---



### 侧边栏排列方式（Sidebar Direction）



侧边栏采用 **纵向排列（Vertical）**，所有菜单按照 **从上到下（Top → Bottom）** 的顺序依次排列。



推荐结构：



```Plain Text
Logo（品牌 Logo）

↓

工作空间（Workspace）

↓

仪表盘（Dashboard）

↓

AI 智能体（AI Agents）

↓

工作流（Workflow）

↓

知识库（Knowledge）

↓

文件（Files）

↓

应用中心（Applications）

↓

自动化（Automation）

↓

报表（Reports）

──────────────

系统设置（Settings）

↓

帮助中心（Help）

↓

用户中心（User Profile）
```



---



### 侧边栏位置（Sidebar Position）



|项目|规范|
|---|---|
|导航位置|页面最左侧|
|排列方式|纵向排列（Vertical）|
|菜单方向|从上到下（Top → Bottom）|
|默认宽度|260px|
|折叠宽度|72px|
|高度|100vh（全屏高度）|
|定位方式|固定定位（Fixed）|
|是否支持折叠|支持（260px → 72px）|



---



### 导航规则（Navigation Rules）



- 一级导航始终位于左侧侧边栏。

- 顶部工具栏（Topbar）仅用于放置搜索、通知、AI 快捷操作、主题切换、用户信息等功能，不承担页面导航功能。

- 所有一级菜单统一采用 **Icon \+ Text（图标 \+ 文字）** 的展示形式。

- 每一行仅展示一个菜单项，菜单之间采用上下排列，不允许左右横向排列。

- 二级菜单在一级菜单下方展开，并保持纵向排列。

    

---



### AI 生成约束（AI Generation Rules）



所有 AI 生成工具（如 v0、Codex、Claude Code、Figma AI 等）必须遵循以下布局规则：



#### 必须遵循（Must）



- ✅ 一级导航固定在左侧侧边栏

- ✅ 菜单采用纵向排列（Top → Bottom）

- ✅ Sidebar 默认宽度为 260px

- ✅ Sidebar 支持折叠至 72px

- ✅ Topbar 仅作为功能工具栏

- ✅ 主内容区域位于侧边栏右侧

- ✅ 一级菜单采用 Icon \+ Text 布局

    

#### 禁止（Don't）



- ❌ 生成顶部横向导航（Top Navigation）

- ❌ 生成底部导航（Bottom Navigation）

- ❌ 将一级菜单放置到顶部工具栏

- ❌ 菜单左右横向排列

- ❌ 根据不同项目修改导航布局

- ❌ 使用多套导航布局形式

    

---



### 布局固定规则（Layout Rules）



所有 AI 产品（AI 财税、AI Agent、AI 工作台、AI 外呼等）统一采用以下页面结构：



```Plain Text
左侧侧边栏（Sidebar）
        │
        ├── 顶部工具栏（Topbar）
        │
        ├── 页面标题（Page Header）
        │
        └── 主内容区域（Main Content）
                ├── 卡片（Card）
                ├── 表格（Table）
                ├── 图表（Chart）
                └── AI 工作区（Workspace）
```



整个产品保持统一布局，不因业务类型变化而调整导航位置、排列方式或页面结构。



# 2\. 色彩系统（Color System）



## 品牌色（Brand）



建议采用蓝紫科技色系。



|Token|色值|用途|
|---|---|---|
|Primary|`#5B6CFF`|Logo、按钮、激活状态|
|Primary Start|`#4F7BFF`|渐变起始|
|Primary End|`#6C5CFF`|渐变结束|



推荐应用：



- Logo

- Primary Button

- Active

- KPI

- Highlight

---



## 中性色（Neutral）



### 页面颜色



|Token|色值|
|---|---|
|Background|`#F7F9FC`|
|Surface|`#FFFFFF`|
|Hover|`#F3F6FF`|
|Border|`#E6EAF2`|



### 字体颜色



|Token|色值|
|---|---|
|Text Primary|`#18243D`|
|Text Secondary|`#667085`|
|Text Tertiary|`#98A2B3`|
|Disabled|`#CBD5E1`|



---



## 功能色（Status）



|状态|色值|
|---|---|
|Success|`#22C55E`|
|Running|`#3B82F6`|
|Waiting|`#98A2B3`|
|Warning|`#F59E0B`|
|Error|`#EF4444`|



---



## 渐变规范（Gradient）



### Hero Glow



|Token|色值|
|---|---|
|Blue Glow|`#4F7BFF 10%`|
|Purple Glow|`#6C5CFF 6%`|



### Agent Active



|Token|色值|
|---|---|
|Blue Surface|`#EEF2FF`|
|Purple Surface|`#F4F1FF`|



---



# 3\. 字体规范（Typography）



## Font Family



中文：



```Plain Text
PingFang SC
```



英文：



```Plain Text
Inter
```



Fallback：



```Plain Text
Inter,
PingFang SC,
Microsoft YaHei,
Helvetica Neue,
Arial,
sans-serif
```



---



## Font Weight



|场景|Weight|
|---|---|
|页面标题|600|
|模块标题|600|
|卡片标题|500|
|一级正文|400|
|二级正文|400|
|标签|500|
|数据数字|600|



---



## Font Size



> 企业级 Web SaaS 推荐字号
> 
> 



|Token|字号|行高|字重|场景|
|---|---|---|---|---|
|Display|**32px**|40px|600|Dashboard KPI|
|H1|**28px**|36px|600|页面标题|
|H2|**24px**|32px|600|模块标题|
|H3|**20px**|28px|500|卡片标题|
|H4|**18px**|28px|500|二级标题|
|Body|**16px**|24px|400|正文|
|Body Small|**14px**|22px|400|描述|
|Caption|**12px**|18px|500|Label / Badge|



---



## 表格字体



|类型|字号|字重|
|---|---|---|
|Header|14px|500|
|Body|14px|400|



---



## Button



|类型|字号|
|---|---|
|Large|16px|
|Default|16px|
|Small|14px|



---



## Input



|类型|字号|
|---|---|
|Value|16px|
|Placeholder|14px|



---



# 4\. Radius（圆角）



整体采用：



> Large Radius \+ Soft Border
> 
> 



|Token|Radius|
|---|---|
|Button|12px|
|Card|16px|
|Agent|20px|
|Input|24px|
|Dialog|24px|
|Badge|999px|



---



# 5\. Shadow（阴影）



采用低透明度阴影。



|Token|场景|
|---|---|
|Shadow S|普通 Card|
|Shadow M|Hover|
|Shadow L|Dialog|



推荐：



```Plain Text
Card
 
0 4 18 rgba(38,67,104,.05)
```



```Plain Text
Hover
 
0 8 24 rgba(38,67,104,.08)
```



```Plain Text
Dialog
 
0 20 60 rgba(24,36,61,.16)
```



---



# 6\. Component Style



## Sidebar



默认：



```Plain Text
Text
 
#667085
```



Hover：



```Plain Text
#F3F6FF
```



Active：



```Plain Text
Text
 
#3843C9
 
Background
 
#EEF2FF
```



---



## Agent Card



默认：



```Plain Text
Background
 
#FFFFFF
 
Border
 
#E6EAF2
```



激活：



```Plain Text
Background
 
#EEF2FF
 
Border
 
#5B6CFF
```



---



## Input



默认：



```Plain Text
Background
 
#FFFFFF
 
Border
 
#DDE4FF
```



Focus：



```Plain Text
Border
 
#5B6CFF
```



---



## Tool Card



默认：



```Plain Text
#FFFFFF
```



Hover：



```Plain Text
#F8FAFF
```



状态：



|状态|色值|
|---|---|
|Connected|`#22C55E`|
|Offline|`#98A2B3`|



---



## Primary Button



Background：



```Plain Text
#4F7BFF → #6C5CFF
```



Text：



```Plain Text
#FFFFFF
```



Radius：



```Plain Text
12px
```



Height：



```Plain Text
44px
```



---



# 7\. Multi\-Agent Status



|状态|色值|
|---|---|
|Online|`#22C55E`|
|Running|`#3B82F6`|
|Waiting|`#98A2B3`|
|Completed|`#22C55E`|
|Error|`#EF4444`|



---



# 8\. Design Rules



所有 AI 产品统一遵循：



✅ 使用统一 Design Tokens



✅ 使用统一 Typography



✅ 使用统一 Radius



✅ 使用统一 Shadow



✅ 使用统一 Component Style



禁止：



❌ 新增品牌颜色



❌ 修改字体体系



❌ 修改圆角规范



❌ 修改基础间距



❌ 每个项目重新设计视觉风格



> **所有项目（AI 财税、AI Agent、AI 工作台等）均基于本 Design Tokens 实现，确保设计、研发与 AI 生成工具保持一致。**
> 
> 



