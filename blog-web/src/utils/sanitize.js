import DOMPurify from 'dompurify'

/**
 * 对将要通过 v-html 渲染的内容做 XSS 过滤
 * @param {string} html - 原始 HTML 字符串
 * @param {object} options - DOMPurify 配置（如 ALLOWED_TAGS）
 * @returns {string} 过滤后的安全 HTML
 */
export function sanitizeHtml(html, options = {}) {
  if (html == null || typeof html !== 'string') return ''
  return DOMPurify.sanitize(html, {
    ALLOW_DATA_ATTR: false,
    ...options
  })
}

/**
 * 用于富文本/评论等，允许常见排版标签
 */
export function sanitizeRichHtml(html) {
  return sanitizeHtml(html, {
    ADD_ATTR: ['target'],
    ADD_TAGS: ['mark']
  })
}
