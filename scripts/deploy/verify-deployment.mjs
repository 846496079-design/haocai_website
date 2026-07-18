const target = process.argv[2] || 'http://zhangdashi.ai/cn/'

async function fetchRequired(url, headers = {}) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'cache-control': 'no-cache', ...headers },
  })
  if (!response.ok) throw new Error(`${url} 返回 HTTP ${response.status}`)
  return response
}

const pageResponse = await fetchRequired(target)
const html = await pageResponse.text()
const pageCacheControl = pageResponse.headers.get('cache-control') || ''

function assertPublicRevalidation(cacheControl, resourceName) {
  if (!/(?:^|,)\s*no-cache(?:\s*(?:,|$))/i.test(cacheControl)) {
    throw new Error(`${resourceName} 未声明每次重新验证：${cacheControl || '缺少 Cache-Control'}`)
  }
  if (/(?:^|,)\s*no-store(?:\s*(?:,|$))/i.test(cacheControl)) {
    throw new Error(`${resourceName} 仍使用事故期 no-store 策略：${cacheControl}`)
  }
  if (/(?:^|,)\s*s-maxage\s*=\s*[1-9][0-9]*/i.test(cacheControl)) {
    throw new Error(`${resourceName} 仍带有正数共享缓存：${cacheControl}`)
  }
  if (/(?:^|,)\s*max-age\s*=\s*[1-9][0-9]*/i.test(cacheControl)) {
    throw new Error(`${resourceName} 仍带有正数浏览器缓存：${cacheControl}`)
  }
}

assertPublicRevalidation(pageCacheControl, 'HTML')

if (!pageResponse.headers.get('etag')) throw new Error('HTML 缺少 ETag 内容版本标识。')

const rscResponse = await fetchRequired(target, { rsc: '1' })
const rscContentType = rscResponse.headers.get('content-type') || ''
const rscCacheControl = rscResponse.headers.get('cache-control') || ''
const rsc = await rscResponse.text()
if (!rscContentType.toLowerCase().includes('text/x-component')) {
  throw new Error(`RSC Content-Type 异常：${rscContentType || '缺失'}`)
}
if (rsc.length === 0) throw new Error('RSC 返回了空响应。')
assertPublicRevalidation(rscCacheControl, 'RSC')

const cssPaths = [...html.matchAll(/href=["']([^"']+\.css(?:\?[^"']*)?)["']/gi)]
  .map((match) => match[1].replaceAll('&amp;', '&'))
const cssUrls = [...new Set(cssPaths.map((href) => new URL(href, pageResponse.url).toString()))]
const scriptPaths = [...html.matchAll(/<script[^>]+src=["']([^"']+\.js(?:\?[^"']*)?)["']/gi)]
  .map((match) => match[1].replaceAll('&amp;', '&'))
const scriptUrls = [...new Set(scriptPaths.map((src) => new URL(src, pageResponse.url).toString()))]

if (cssUrls.length === 0) throw new Error('HTML 中没有找到 CSS 引用。')
if (scriptUrls.length === 0) throw new Error('HTML 中没有找到 JavaScript 引用。')

function assertImmutableAsset(response, resourceName) {
  const cacheControl = response.headers.get('cache-control') || ''
  if (!/(?:^|,)\s*max-age\s*=\s*31536000(?:\s*(?:,|$))/i.test(cacheControl)
    || !/(?:^|,)\s*immutable(?:\s*(?:,|$))/i.test(cacheControl)) {
    throw new Error(`${resourceName} 未使用一年 immutable 缓存：${cacheControl || '缺少 Cache-Control'}`)
  }
}

for (const cssUrl of cssUrls) {
  const cssResponse = await fetchRequired(cssUrl)
  const contentType = cssResponse.headers.get('content-type') || ''
  const css = await cssResponse.text()
  if (!contentType.toLowerCase().includes('text/css')) {
    throw new Error(`${cssUrl} 的 Content-Type 不是 text/css：${contentType || '缺失'}`)
  }
  if (css.length === 0) throw new Error(`${cssUrl} 返回了空文件。`)
  assertImmutableAsset(cssResponse, cssUrl)
}

for (const scriptUrl of scriptUrls) {
  const scriptResponse = await fetchRequired(scriptUrl)
  const contentType = scriptResponse.headers.get('content-type') || ''
  const script = await scriptResponse.text()
  if (!contentType.toLowerCase().includes('javascript')) {
    throw new Error(`${scriptUrl} 的 Content-Type 不是 JavaScript：${contentType || '缺失'}`)
  }
  if (script.length === 0) throw new Error(`${scriptUrl} 返回了空文件。`)
  assertImmutableAsset(scriptResponse, scriptUrl)
}

console.log(`部署验收通过：${pageResponse.url}，RSC 正常，CSS ${cssUrls.length} 个，JavaScript ${scriptUrls.length} 个。`)
