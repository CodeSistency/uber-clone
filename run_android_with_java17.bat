@echo off
REM Set Java 17 environment variables for this session
set JAVA_HOME=C:\Program Files\OpenLogic\jdk-17.0.13.11-hotspot
set PATH=C:\Program Files\OpenLogic\jdk-17.0.13.11-hotspot\bin;%PATH%

REM Verify Java version
echo Using Java:
java -version
echo.

REM Run Expo Android build
npx expo run:android

