@echo off
set "JAVA17_BIN=C:\Program Files\OpenLogic\jdk-17.0.13.11-hotspot\bin"
set "CURRENT_PATH=%PATH%"

REM Check if Java 17 is already in PATH
echo %CURRENT_PATH% | findstr /C:"jdk-17.0.13.11-hotspot" >nul
if %errorlevel% neq 0 (
    REM Add Java 17 to the beginning of PATH
    setx PATH "%JAVA17_BIN%;%CURRENT_PATH%" /M
    echo PATH updated to include Java 17 at the beginning
) else (
    echo Java 17 already in PATH
)

