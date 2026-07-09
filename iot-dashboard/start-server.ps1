# Script de PowerShell para levantar un servidor local nativo y evitar bloqueos CORS
$port = 8080
$webroot = Join-Path $PSScriptRoot "web-frontend"
$url = "http://localhost:$port/"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host " Servidor Web Local IoT Dashboard Activo" -ForegroundColor Green
    Write-Host " Dirección: $url" -ForegroundColor Yellow
    Write-Host " Carpeta: $webroot" -ForegroundColor Gray
    Write-Host " Presiona Ctrl+C en esta consola para apagar el servidor." -ForegroundColor Red
    Write-Host "==========================================================" -ForegroundColor Cyan
    
    # Intentar abrir el navegador automáticamente
    Start-Process $url

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Obtener ruta local relativa
        $urlPath = $request.RawUrl.Split('?')[0]
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/index.html"
        }

        $filePath = Join-Path $webroot $urlPath.Replace("/", "\")

        if (Test-Path $filePath -PathType Leaf) {
            # Determinar tipo de contenido
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "text/plain"
            switch ($ext) {
                ".html" { $contentType = "text/html; charset=utf-8" }
                ".css"  { $contentType = "text/css; charset=utf-8" }
                ".js"   { $contentType = "application/javascript; charset=utf-8" }
                ".json" { $contentType = "application/json; charset=utf-8" }
                ".png"  { $contentType = "image/png" }
                ".jpg"  { $contentType = "image/jpeg" }
                ".svg"  { $contentType = "image/svg+xml" }
                ".ico"  { $contentType = "image/x-icon" }
            }

            $buffer = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            # Retornar 404
            $response.StatusCode = 404
            $errBuffer = [System.Text.Encoding]::UTF8.GetBytes("Archivo no encontrado.")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $errBuffer.Length
            $response.OutputStream.Write($errBuffer, 0, $errBuffer.Length)
        }
        $response.OutputStream.Close()
    }
} catch {
    Write-Error $_.Exception.Message
} finally {
    $listener.Stop()
}
