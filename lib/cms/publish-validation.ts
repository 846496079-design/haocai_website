import {
  getMissingLocaleRequiredFields,
  requiredFieldLabels,
  type CmsLocaleArticle,
  type CmsRequiredField,
} from './types'

export type CmsPublishValidationCode = 'MISSING_REQUIRED_FIELDS' | 'PUBLICATION_SNAPSHOT_MISSING'

export class CmsPublishValidationError extends Error {
  readonly code: CmsPublishValidationCode
  readonly fields: CmsRequiredField[]

  constructor(code: CmsPublishValidationCode, message: string, fields: CmsRequiredField[] = []) {
    super(message)
    this.name = 'CmsPublishValidationError'
    this.code = code
    this.fields = fields
  }
}

export function assertCmsLocaleReadyForPublish(article: CmsLocaleArticle) {
  const missing = getMissingLocaleRequiredFields(article)
  if (missing.length) {
    throw new CmsPublishValidationError(
      'MISSING_REQUIRED_FIELDS',
      `请补全：${requiredFieldLabels(missing).join('、')}。`,
      missing,
    )
  }
  if (!article.body.publicationHtml.trim() || !article.body.contentHash) {
    throw new CmsPublishValidationError(
      'PUBLICATION_SNAPSHOT_MISSING',
      '当前发布快照尚未生成，请重新保存草稿。',
    )
  }
}
