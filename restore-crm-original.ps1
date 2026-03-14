# Restaura VBSOLUTIONCRMdeploy para o commit ORIGINAL com pasta Cursor
# Commit: b3c87fec - "Atualização: .gitignore, backend TicketController, frontend CreateLeadSaleModal - Made-with: Cursor"

$REPO = "visaobusinesstech/VBSOLUTIONCRMdeploy"
$COMMIT_ORIGINAL = "b3c87fec6413ea8075cebace6b0af75e06bda287"

$token = $env:GITHUB_TOKEN
if (-not $token) {
    Write-Host "Defina o token: `$env:GITHUB_TOKEN = 'seu_token'" -ForegroundColor Yellow
    exit 1
}

$body = @{ sha = $COMMIT_ORIGINAL; force = $true } | ConvertTo-Json
Invoke-RestMethod -Uri "https://api.github.com/repos/$REPO/git/refs/heads/main" -Method PATCH `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Accept" = "application/vnd.github+json"
        "X-GitHub-Api-Version" = "2022-11-28"
    } -Body $body -ContentType "application/json"

Write-Host "Repositorio restaurado para b3c87fec (pasta Cursor + arquivos originais)." -ForegroundColor Green
Write-Host "Depois: feche o Cursor, apague .git\index.lock se existir, e rode:" -ForegroundColor Cyan
Write-Host "  git fetch origin && git reset --hard origin/main" -ForegroundColor Cyan
