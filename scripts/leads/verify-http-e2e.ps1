$ErrorActionPreference = 'Stop'

$taskTempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('zds-lead-e2e-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $taskTempRoot | Out-Null

$env:HOSTNAME = '127.0.0.1'
$env:PORT = '3105'
$env:NODE_ENV = 'production'
$env:LEAD_OUTBOX_DATABASE_PATH = Join-Path $taskTempRoot 'lead-outbox.sqlite'
$env:LEAD_DATA_ENCRYPTION_KEY = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
$env:LEAD_WORKER_TOKEN = 'test-worker-token-0123456789-abcdef'
$env:CMS_DATABASE_PATH = Join-Path $taskTempRoot 'news-cms.sqlite'
$env:CMS_ADMIN_USERNAME = 'e2e-admin'
$env:CMS_ADMIN_PASSWORD = 'e2e-password-123456'
$env:CMS_COOKIE_SECURE = 'false'
$env:CMS_DATABASE_URL = ''
$env:DATABASE_URL = ''

$stdout = Join-Path $taskTempRoot 'server.out.log'
$stderr = Join-Path $taskTempRoot 'server.err.log'
$server = $null

try {
  $server = Start-Process -FilePath 'node' -ArgumentList 'server.js' -WorkingDirectory '.deploy/release' -WindowStyle Hidden -PassThru -RedirectStandardOutput $stdout -RedirectStandardError $stderr
  $ready = $false
  for ($index = 0; $index -lt 30; $index += 1) {
    $status = curl.exe -sS -o NUL -w '%{http_code}' 'http://127.0.0.1:3105/cn/'
    if ($status -eq '200') {
      $ready = $true
      break
    }
    Start-Sleep -Milliseconds 500
  }
  if (-not $ready) { throw 'Local production server did not become ready.' }

  $workerBody = Join-Path $taskTempRoot 'worker-response.json'
  $workerStatus = curl.exe -sS -o $workerBody -w '%{http_code}' -X POST 'http://127.0.0.1:3105/api/internal/leads/process/' -H 'Authorization: Bearer test-worker-token-0123456789-abcdef'
  if ($workerStatus -ne '200') { throw "Authorized worker endpoint expected 200, got $workerStatus." }

  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  $leadRequest = Join-Path $taskTempRoot 'lead-request.json'
  [System.IO.File]::WriteAllText($leadRequest, '{"contactName":"E2ELeadNameUnique","contactPhone":"13912345678"}', $utf8NoBom)
  $leadBody = Join-Path $taskTempRoot 'lead-response.json'
  $leadStatus = curl.exe -sS -o $leadBody -w '%{http_code}' -X POST 'http://127.0.0.1:3105/api/public/leads/trial/' -H 'Content-Type: application/json' --data-binary "@$leadRequest"
  if ($leadStatus -ne '202') { throw "Public lead endpoint expected 202, got $leadStatus." }

  $unauthorizedStatus = curl.exe -sS -o NUL -w '%{http_code}' -X POST 'http://127.0.0.1:3105/api/internal/leads/process/'
  if ($unauthorizedStatus -ne '401') { throw "Internal worker endpoint expected 401, got $unauthorizedStatus." }

  $cookieJar = Join-Path $taskTempRoot 'cookies.txt'
  $loginRequest = Join-Path $taskTempRoot 'login-request.json'
  [System.IO.File]::WriteAllText($loginRequest, '{"username":"e2e-admin","password":"e2e-password-123456"}', $utf8NoBom)
  $loginBody = Join-Path $taskTempRoot 'login-response.json'
  $loginStatus = curl.exe -sS -o $loginBody -w '%{http_code}' -c $cookieJar -X POST 'http://127.0.0.1:3105/api/cms/auth/login/' -H 'Origin: http://127.0.0.1:3105' -H 'Content-Type: application/json' --data-binary "@$loginRequest"
  if ($loginStatus -ne '200') { throw "Website admin login failed with $loginStatus." }

  $adminPage = Join-Path $taskTempRoot 'admin.html'
  $adminStatus = curl.exe -sS -o $adminPage -w '%{http_code}' -b $cookieJar 'http://127.0.0.1:3105/cms/'
  $leadPage = Join-Path $taskTempRoot 'leads.html'
  $leadPageStatus = curl.exe -sS -o $leadPage -w '%{http_code}' -b $cookieJar 'http://127.0.0.1:3105/cms/leads/'
  if ($adminStatus -ne '200' -or $leadPageStatus -ne '200') { throw 'Website admin pages are unavailable.' }
  if (-not (Select-String -LiteralPath $adminPage -Pattern 'href="/cms/leads/"' -Quiet) -or -not (Select-String -LiteralPath $adminPage -Pattern 'href="/cms/news/"' -Quiet)) { throw 'Website admin does not expose both modules.' }
  if (-not (Select-String -LiteralPath $leadPage -Pattern 'E2ELeadNameUnique' -Quiet)) { throw 'Lead page does not contain the accepted submission.' }

  Stop-Process -Id $server.Id -Force
  $server.WaitForExit()
  $server = $null

  Get-ChildItem -LiteralPath $taskTempRoot -Filter 'lead-outbox.sqlite*' | ForEach-Object {
    $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
    foreach ($plaintext in @('E2ELeadNameUnique', '13912345678')) {
      $needle = [System.Text.Encoding]::UTF8.GetBytes($plaintext)
      for ($offset = 0; $offset -le $bytes.Length - $needle.Length; $offset += 1) {
        $matches = $true
        for ($byteIndex = 0; $byteIndex -lt $needle.Length; $byteIndex += 1) {
          if ($bytes[$offset + $byteIndex] -ne $needle[$byteIndex]) { $matches = $false; break }
        }
        if ($matches) { throw "Plaintext found in lead database file: $($_.Name)." }
      }
    }
  }

  Write-Output "PUBLIC_LEAD_STATUS=$leadStatus"
  Write-Output "PUBLIC_LEAD_BODY=$(Get-Content -LiteralPath $leadBody -Raw -Encoding UTF8)"
  Write-Output "INTERNAL_AUTHORIZED_STATUS=$workerStatus"
  Write-Output "INTERNAL_UNAUTHORIZED_STATUS=$unauthorizedStatus"
  Write-Output "CMS_LOGIN_STATUS=$loginStatus"
  Write-Output "CMS_HOME_STATUS=$adminStatus"
  Write-Output "CMS_LEADS_STATUS=$leadPageStatus"
  Write-Output 'CMS_HOME_HAS_TWO_MODULES=True'
  Write-Output 'CMS_LEADS_HAS_SUBMISSION=True'
  Write-Output 'DATABASE_PLAINTEXT_CHECK=PASS'
} finally {
  if ($server -and -not $server.HasExited) {
    Stop-Process -Id $server.Id -Force
    $server.WaitForExit()
  }
  $resolvedTemp = [System.IO.Path]::GetFullPath($taskTempRoot)
  $allowedTemp = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
  if (-not $resolvedTemp.StartsWith($allowedTemp, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Split-Path -Leaf $resolvedTemp).StartsWith('zds-lead-e2e-')) {
    throw 'Refused to clean an unverified test directory.'
  }
  Remove-Item -LiteralPath $resolvedTemp -Recurse -Force
}
