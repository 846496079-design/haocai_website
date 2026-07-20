import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { getCmsEditorWorkflowGuide, type CmsEditorWorkflowState } from '../../lib/cms/editor-workflow'

const root = process.cwd()
const ready: CmsEditorWorkflowState = {
  translating: false,
  uploading: false,
  saving: false,
  publishing: false,
  chineseComplete: true,
  dirty: false,
  hasCurrentPreview: true,
  reviewed: true,
  translationCompleted: false,
  previewOpened: false,
}

function action(update: Partial<CmsEditorWorkflowState>) {
  return getCmsEditorWorkflowGuide({ ...ready, ...update })
}

assert.equal(action({ translating: true, chineseComplete: false, dirty: true }).action, 'wait', '翻译锁定必须优先于其他编辑器状态。')
assert.equal(action({ publishing: true }).action, 'wait', '发布请求进行中必须防止重复提交。')
assert.equal(action({ uploading: true, chineseComplete: false }).action, 'wait', '图片上传期间必须先等待。')
assert.equal(action({ saving: true, dirty: true }).action, 'wait', '保存期间必须先等待。')
assert.equal(action({ chineseComplete: false, dirty: true }).action, 'complete-cn', '中文缺项必须优先引导补全。')
assert.equal(action({ dirty: true, hasCurrentPreview: false }).action, 'save', '未保存修改必须先保存。')
assert.equal(action({ hasCurrentPreview: false }).action, 'preview', '已保存但未预览时必须引导预览。')
assert.match(action({ hasCurrentPreview: false, translationCompleted: true }).title, /翻译已完成并保存/, '翻译成功后必须明确说明已经保存。')
assert.equal(action({ reviewed: false, previewOpened: true }).action, 'review', '预览后必须引导人工审核。')
assert.match(action({ reviewed: false, previewOpened: true }).message, /返回本页/, '预览后必须告诉用户如何继续。')
assert.equal(action({}).action, 'publish', '全部门禁满足后必须引导确认发布。')

const editor = readFileSync(resolve(root, 'components/cms/cms-news-editor.tsx'), 'utf8')
const design = readFileSync(resolve(root, 'docs/superpowers/specs/2026-07-20-cms-translation-guided-workflow-design.md'), 'utf8')

assert.match(editor, /const \[translating, setTranslating\]/, '编辑器必须使用独立翻译状态。')
assert.match(editor, /setTranslating\(true\);\s*try \{\s*if \(!\(await saveDraft\(\)\)\) return;/, '点击翻译后必须先锁定页面，再保存和调用模型。')
assert.match(editor, /inert=\{translating \? true : undefined\}/, '翻译期间必须锁定整个底层工作区。')
assert.match(editor, /addEventListener\("beforeunload"/, '翻译期间必须注册离页提醒。')
assert.match(editor, /sessionStorage\.setItem\(translationJourneyKey, "translated"\)/, '翻译成功后必须跨重新载入保留引导信号。')
assert.match(editor, /翻译已完成并保存。请预览当前版本后再确认发布。/, '翻译成功后必须给出下一步提示。')
assert.match(editor, /if \(!hasCurrentPreview\)/, '点击发布后必须引导用户完成当前版本预览。')
assert.match(editor, /if \(!reviewed\)/, '点击发布后必须引导用户完成人工审核。')
assert.doesNotMatch(editor, /三语内容：|待补全或保存/, '编辑器不能继续使用含糊的三语合并状态。')
assert.match(editor, /allLocalesReady \? "日文、港文可随本次发布上线"/, '编辑器必须独立呈现外语公开状态。')
assert.match(design, /不自动把未经检查的内容标记为已预览/, '设计依据必须保留人工预览门禁。')

console.log('CMS 翻译锁定与发布引导验证通过。')
