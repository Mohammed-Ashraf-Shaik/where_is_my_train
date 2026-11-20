@echo off
cd /d "%~dp0"
echo ========================================================
echo   🚆 RailPulse AI - One-Click Git & GitHub Push Engine
echo ========================================================
echo.
echo Step 1: Ensure you created a repository on GitHub:
echo         https://github.com/new
echo         Recommended repository name: where-is-my-train-ai  (or train-tracker)
echo.
set /p REPO_NAME="Enter your GitHub repository name [default: where-is-my-train-ai]: "
if "%REPO_NAME%"=="" set REPO_NAME=where-is-my-train-ai

echo.
echo Configuring remote origin for repository: %REPO_NAME%...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/Mohammed-Ashraf-Shaik/%REPO_NAME%.git
git branch -M main

echo.
echo Pushing commits to GitHub (Mohammed-Ashraf-Shaik/%REPO_NAME%)...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo   🎉 SUCCESS! All commits pushed to GitHub successfully!
    echo   View online: https://github.com/Mohammed-Ashraf-Shaik/%REPO_NAME%
    echo ========================================================
) else (
    echo.
    echo [ERROR] Push failed.
    echo 1. Verify you created the repository on https://github.com/new
    echo 2. Check that your repository name matches: '%REPO_NAME%'
    echo 3. Check your git authentication credentials.
)
echo.
pause
