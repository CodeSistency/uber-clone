#!/bin/bash

# Script para ejecutar Expo en Android en Ubuntu
# Ajusta las rutas según tu instalación

# Configurar Java 17 (OpenJDK)
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Configurar Android SDK (ruta típica cuando se instala via Android Studio)
export ANDROID_HOME=$HOME/Android/Sdk

# Actualizar PATH
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$PATH

# Verificar configuraciones
echo "JAVA_HOME: $JAVA_HOME"
echo "ANDROID_HOME: $ANDROID_HOME"
echo "PATH actualizado con Android tools"

# Ejecutar Expo
echo "Ejecutando: npx expo run:android --device"
npx expo run:android --device
