# Comandos completos para configurar entorno Android y ejecutar la aplicación

# 1. Configurar variables de entorno
$env:JAVA_HOME = "C:\Program Files\OpenLogic\jdk-17.0.13.11-hotspot"
$env:ANDROID_HOME = "C:\Users\valer\AppData\Local\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\tools\bin;$env:PATH"

# 2. Verificar configuración
Write-Host "JAVA_HOME: $env:JAVA_HOME"
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"

# 3. Comandos para ejecutar dispositivos Android
Write-Host "`nComandos para dispositivos Android:"
Write-Host "==================================="
Write-Host "Listar AVDs disponibles:"
Write-Host "emulator -list-avds"
Write-Host ""
Write-Host "Ejecutar un AVD específico (reemplaza NOMBRE_AVD):"
Write-Host "emulator -avd NOMBRE_AVD"
Write-Host ""
Write-Host "Ver dispositivos conectados:"
Write-Host "adb devices"
Write-Host ""

# 4. Ejecutar la aplicación React Native/Expo
Write-Host "Comandos para ejecutar la aplicación:"
Write-Host "====================================="
Write-Host "Ejecutar en Android (después de tener el emulador corriendo):"
Write-Host "npx expo run:android"
Write-Host ""
Write-Host "Si usas React Native CLI:"
Write-Host "npx react-native run-android"
Write-Host ""
Write-Host "Iniciar servidor de desarrollo Expo:"
Write-Host "npx expo start"
Write-Host ""
Write-Host "Flujo completo recomendado:"
Write-Host "1. Ejecuta este script para configurar variables"
Write-Host "2. En otra terminal: emulator -avd TU_DISPOSITIVO"
Write-Host "3. En otra terminal: npx expo run:android"
