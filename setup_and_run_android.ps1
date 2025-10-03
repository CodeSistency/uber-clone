# Setup environment variables for Android development with Java 17
$env:JAVA_HOME = "C:\Program Files\OpenLogic\jdk-17.0.13.11-hotspot"
$env:ANDROID_HOME = "C:\Users\valer\AppData\Local\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\tools\bin;$env:PATH"

Write-Host "Environment variables configured:"
Write-Host "JAVA_HOME: $env:JAVA_HOME"
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"
Write-Host ""
Write-Host "Java version:"
java -version
Write-Host ""
Write-Host "Starting Expo Android build..."

# Run the Expo command
npx expo run:android --device 

