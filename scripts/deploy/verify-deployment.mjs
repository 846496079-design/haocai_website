const target = process.argv[2] || 'http://zhangdashi.ai/cn/'

async function fetchRequired(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'cache-control': 'no-cache' },
  })
  if (!response.ok) throw new Error(`${url} 返回 HTTP ${response.status}`)
  return response
}

const pageResponse = await fetchRequired(target)
const html = await pageResponse.text()
const pageCacheControl = pageResponse.headers.get('cache-control') || ''

if (!/(?:^|,)\s*no-store(?:\s*(?:,|$))/i.test(pageCacheControl)) {
  throw new Error(`HTML 未禁止浏览器存储：${pageCacheControl || '缺少 Cache-Control'}`)
}
if (!/(?:^|,)\s*max-age\s*=\s*0(?:\s*(?:,|$))/i.test(pageCacheControl)) {
  throw new Error(`HTML 未声明 max-age=0：${pageCacheControl || '缺少 Cache-Control'}`)
}
if (/(?:^|,)\s*s-maxage\s*=\s*[1-9][0-9]*/i.test(pageCacheControl)) {
  throw new Error(`HTML 仍带有正数共享缓存：${pageCacheControl}`)
}
if (/(?:^|,)\s*max-age\s*=\s*[1-9][0-9]*/i.test(pageCacheControl)) {
  throw new Error(`HTML 仍带有正数浏览器缓存：${pageCacheControl}`)
}

const cssPaths = [...html.matchAll(/href=["']([^"']+\.css(?:\?[^"']*)?)["']/gi)]
  .map((match) => match[1].replaceAll('&amp;', '&'))
const cssUrls = [...new Set(cssPaths.map((href) => new URL(href, pageResponse.url).toString()))]

if (cssUrls.length === 0) throw new Error('HTML 中没有找到 CSS 引用。')

for (const cssUrl of cssUrls) {
  const cssResponse = await fetchRequired(cssUrl)
  const contentType = cssResponse.headers.get('content-type') || ''
  const css = await cssResponse.text()
  if (!contentType.toLowerCase().includes('text/css')) {
    throw new Error(`${cssUrl} 的 Content-Type 不是 text/css：${contentType || '缺失'}`)
  }
  if (css.length === 0) throw new Error(`${cssUrl} 返回了空文件。`)
}

console.log(`部署验收通过：${pageResponse.url}，CSS 文件 ${cssUrls.length} 个。`)
