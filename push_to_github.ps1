# RailPulse AI - PowerShell GitHub Push Utility
param(
    [string]$RepoName = "where_is_my_train"
)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   🚆 RailPulse AI - GitHub Push Automation" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$RemoteUrl = "https://github.com/Mohammed-Ashraf-Shaik/$RepoName.git"
Write-Host "Target Remote: $RemoteUrl" -ForegroundColor Yellow

git remote remove origin 2>$null
git remote add origin $RemoteUrl
git branch -M main

Write-Host "Pushing all commits to GitHub main branch..." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n🎉 PUSH SUCCESSFUL! Check your repository at:" -ForegroundColor Green
    Write-Host "https://github.com/Mohammed-Ashraf-Shaik/$RepoName" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️ Push encountered an issue." -ForegroundColor Yellow
    Write-Host "If the repository does not exist yet on GitHub, please create it at:" -ForegroundColor Yellow
    Write-Host "https://github.com/new (Name: $RepoName)" -ForegroundColor White
}

