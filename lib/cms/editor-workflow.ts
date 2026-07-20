export type CmsEditorWorkflowAction = 'wait' | 'complete-cn' | 'save' | 'preview' | 'review' | 'publish'

export type CmsEditorWorkflowState = {
  translating: boolean
  uploading: boolean
  saving: boolean
  chineseComplete: boolean
  dirty: boolean
  hasCurrentPreview: boolean
  reviewed: boolean
  translationCompleted: boolean
  previewOpened: boolean
}

export type CmsEditorWorkflowGuide = {
  action: CmsEditorWorkflowAction
  title: string
  message: string
}

export function getCmsEditorWorkflowGuide(state: CmsEditorWorkflowState): CmsEditorWorkflowGuide {
  if (state.translating) {
    return {
      action: 'wait',
      title: '正在翻译并保存',
      message: '请等待日文、繁体内容生成完成，期间不要关闭页面。',
    }
  }
  if (state.uploading) {
    return {
      action: 'wait',
      title: '图片正在上传',
      message: '请等待图片上传完成后再继续。',
    }
  }
  if (state.saving) {
    return {
      action: 'wait',
      title: '草稿正在保存',
      message: '请等待当前保存完成后再继续。',
    }
  }
  if (!state.chineseComplete) {
    return {
      action: 'complete-cn',
      title: state.translationCompleted ? '翻译已完成并保存' : '下一步：补全中文内容',
      message: '请检查简体中文的标题、摘要、分类、封面和正文，补全后保存草稿。',
    }
  }
  if (state.dirty) {
    return {
      action: 'save',
      title: '下一步：保存当前草稿',
      message: '页面存在未保存修改，保存后才能预览当前版本。',
    }
  }
  if (!state.hasCurrentPreview) {
    return {
      action: 'preview',
      title: state.translationCompleted ? '翻译已完成并保存' : '下一步：预览官网效果',
      message: state.translationCompleted
        ? '译文已写入当前草稿。请预览并检查内容和封面，然后再确认发布。'
        : '当前保存版本尚未预览。请先检查官网展示效果。',
    }
  }
  if (!state.reviewed) {
    return {
      action: 'review',
      title: state.previewOpened ? '预览已打开' : '下一步：完成人工审核',
      message: state.previewOpened
        ? '请检查预览内容和封面；确认无误后返回本页，勾选下方人工审核。'
        : '当前版本已完成预览；确认内容无误后，勾选下方人工审核。',
    }
  }
  return {
    action: 'publish',
    title: '检查已完成，可以发布',
    message: '中文内容、当前预览和人工审核均已完成，请使用下方按钮确认发布。',
  }
}
