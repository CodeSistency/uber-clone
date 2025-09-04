#!/bin/bash

# Script alternativo para ejecutar Expo en Android en Ubuntu
# Versión con verificación de rutas y opciones alternativas

# Función para verificar si un directorio existe
check_path() {
    if [ -d "$1" ]; then
        echo "✓ Encontrado: $1"
        return 0
    else
        echo "✗ No encontrado: $1"
        return 1
    fi
}

echo "Verificando instalación de Java..."

# Opciones comunes de Java en Ubuntu
JAVA_PATHS=(
    "/usr/lib/jvm/java-17-openjdk-amd64"
    "/usr/lib/jvm/java-17-openjdk-arm64"
    "/usr/lib/jvm/java-11-openjdk-amd64"
    "/usr/lib/jvm/java-11-openjdk-arm64"
    "/usr/lib/jvm/default-java"
)

JAVA_HOME=""
for path in "${JAVA_PATHS[@]}"; do
    if check_path "$path"; then
        JAVA_HOME="$path"
        break
    fi
done

if [ -z "$JAVA_HOME" ]; then
    echo "Error: No se encontró Java. Instala OpenJDK con: sudo apt install openjdk-17-jdk"
    exit 1
fi

echo "Verificando Android SDK..."

# Opciones comunes de Android SDK
ANDROID_PATHS=(
    "$HOME/Android/Sdk"
    "/opt/android-sdk"
    "/usr/local/android-sdk"
    "$HOME/Library/Android/sdk"  # Por si acaso
)

ANDROID_HOME=""
for path in "${ANDROID_PATHS[@]}"; do
    if check_path "$path"; then
        ANDROID_HOME="$path"
        break
    fi
done

if [ -z "$ANDROID_HOME" ]; then
    echo "Error: No se encontró Android SDK."
    echo "Instala Android Studio o descarga el SDK manualmente."
    echo "Ruta típica: $HOME/Android/Sdk"
    exit 1
fi

# Configurar variables de entorno
export JAVA_HOME
export ANDROID_HOME
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$PATH

echo ""
echo "=== Configuración ==="
echo "JAVA_HOME: $JAVA_HOME"
echo "ANDROID_HOME: $ANDROID_HOME"
echo "Java version: $(java -version 2>&1 | head -n 1)"
echo "PATH actualizado correctamente"
echo ""

# Ejecutar Expo
echo "Ejecutando Expo..."
npx expo run:android --device
