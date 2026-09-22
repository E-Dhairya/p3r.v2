# Lightweight Static File Server in PowerShell for Persona 3 Reload Interface (P3R v2)
param([int]$Port = 8090)

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
  $listener.Start()
  Write-Host "P3R Server active at $prefix" -ForegroundColor Cyan
} catch {
  Write-Warning "Could not bind to port $Port. Trying $Port + 1"
  $Port++
  $prefix = "http://localhost:$Port/"
  $listener = New-Object System.Net.HttpListener
  $listener.Prefixes.Add($prefix)
  $listener.Start()
  Write-Host "P3R Server active at $prefix" -ForegroundColor Cyan
}

$mimeMap = @{
  ".html" = "text/html";
  ".css"  = "text/css";
  ".js"   = "application/javascript";
  ".json" = "application/json";
  ".svg"  = "image/svg+xml";
  ".png"  = "image/png";
  ".jpg"  = "image/jpeg";
  ".mp4"  = "video/mp4";
  ".wav"  = "audio/wav";
  ".mp3"  = "audio/mpeg";
  ".otf"  = "font/otf";
  ".ttf"  = "font/ttf";
}

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $request = $context.Request
  $response = $context.Response

  $localPath = $request.Url.LocalPath.TrimStart('/')
  if ([string]::IsNullOrWhiteSpace($localPath)) { $localPath = "index.html" }
  $filePath = Join-Path $PSScriptRoot $localPath

  if (Test-Path $filePath -PathType Leaf) {
    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
    $mime = if ($mimeMap.ContainsKey($ext)) { $mimeMap[$ext] } else { "application/octet-stream" }
    $response.ContentType = $mime
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $response.StatusCode = 404
    $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
    $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
  }
  $response.Close()
}
