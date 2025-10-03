# Comandos para ejecutar Expo en Android

## Windows (PowerShell)

```powershell


```

## Ubuntu Linux (Bash) - Comando directo

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64; export ANDROID_HOME=$HOME/Android/Sdk; export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$PATH; npx expo run:android --device
```

## Ubuntu Linux - Scripts preparados

### Opción 1: Script básico (run-android-ubuntu.sh)

```bash
./run-android-ubuntu.sh
```

### Opción 2: Script inteligente con verificación (run-android-ubuntu-alternative.sh)

```bash
./run-android-ubuntu-alternative.sh
```

## Notas importantes

1. **Java Installation**: Asegúrate de tener Java 17 instalado:

   ```bash
   sudo apt update
   sudo apt install openjdk-17-jdk
   ```

2. **Android SDK**: Instala Android Studio o descarga el SDK manualmente. Ruta típica: `~/Android/Sdk`

3. **Verificación**: Si tienes problemas, verifica las rutas ejecutando:

   ```bash
   ls -la $HOME/Android/Sdk
   ls -la /usr/lib/jvm/
   ```

4. **Permisos**: Asegúrate de que los scripts sean ejecutables:
   ```bash
   chmod +x run-android-ubuntu*.sh
   ```

## Solución de problemas

### Problemas comunes de Java/Android SDK

- Si Java no se encuentra, ajusta `JAVA_HOME` en el script
- Si Android SDK no se encuentra, ajusta `ANDROID_HOME` en el script
- Para ARM64 (Raspberry Pi, etc.): Cambia la ruta de Java a `/usr/lib/jvm/java-17-openjdk-arm64`

### Problemas de ADB (Android Debug Bridge)

Si ves errores como "protocol fault" o "Connection reset by peer":

#### Scripts de diagnóstico y solución:

```bash
# Diagnosticar problemas de ADB
./diagnose-adb.sh

# Intentar solucionar problemas automáticamente
./fix-adb-issues.sh
```

#### Soluciones manuales comunes:

1. **Reiniciar ADB**:

   ```bash
   # Matar procesos ADB existentes
   killall adb

   # Reiniciar servidor
   adb kill-server
   adb start-server
   ```

2. **Verificar dispositivo conectado**:

   ```bash
   # Listar dispositivos
   adb devices

   # Si no aparece tu dispositivo:
   # - Verifica que esté conectado por USB
   # - Habilita "Depuración USB" en ajustes del desarrollador
   # - Acepta el diálogo de autorización en el dispositivo
   ```

3. **Permisos USB (para dispositivos físicos)**:

   ```bash
   # Crear reglas udev
   sudo usermod -aG plugdev $USER
   echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="*", ATTR{idProduct}=="*", MODE="0666", GROUP="plugdev"' | sudo tee /etc/udev/rules.d/51-android.rules
   sudo udevadm control --reload-rules
   sudo udevadm trigger
   ```

4. **Si usas emulador**:
   - Asegúrate de que el emulador esté corriendo
   - Verifica que el puerto 5554-5585 esté disponible

5. **Último recurso**:
   ```bash
   # Limpiar completamente
   rm -rf ~/.android/adb*
   adb kill-server
   adb start-server
   ```

#### Verificar instalación completa:

```bash
# Verificar que todo esté correcto
java -version
echo $JAVA_HOME
echo $ANDROID_HOME
adb version
adb devices
```

$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"; $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"; $env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"; .\gradlew assembleRelease
