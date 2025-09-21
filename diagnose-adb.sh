#!/bin/bash

echo "🔍 Diagnóstico de ADB - Expo Android"
echo "===================================="

# Verificar si ADB existe
echo "1. Verificando instalación de ADB..."
if [ -f "$ANDROID_HOME/platform-tools/adb" ]; then
    echo "✓ ADB encontrado en: $ANDROID_HOME/platform-tools/adb"
    ADB_VERSION=$("$ANDROID_HOME/platform-tools/adb" version 2>/dev/null | head -n 1)
    echo "✓ Versión ADB: $ADB_VERSION"
else
    echo "❌ ADB no encontrado en $ANDROID_HOME/platform-tools/adb"
    echo "   Verifica que Android SDK esté instalado correctamente"
    exit 1
fi

echo ""
echo "2. Verificando procesos ADB..."
ADB_PROCESSES=$(ps aux | grep adb | grep -v grep)
if [ -n "$ADB_PROCESSES" ]; then
    echo "✓ Procesos ADB encontrados:"
    echo "$ADB_PROCESSES"
else
    echo "ℹ️  No hay procesos ADB corriendo"
fi

echo ""
echo "3. Verificando dispositivos conectados..."
DEVICES_OUTPUT=$("$ANDROID_HOME/platform-tools/adb" devices 2>&1)
echo "Salida de 'adb devices':"
echo "$DEVICES_OUTPUT"

echo ""
echo "4. Verificando servidor ADB..."
ADB_STATUS=$("$ANDROID_HOME/platform-tools/adb" start-server 2>&1)
if [ $? -eq 0 ]; then
    echo "✓ Servidor ADB iniciado correctamente"
else
    echo "❌ Error al iniciar servidor ADB:"
    echo "$ADB_STATUS"
fi

echo ""
echo "5. Verificando puertos ADB..."
ADB_PORTS=$(netstat -tlnp 2>/dev/null | grep :5037 || ss -tlnp | grep :5037)
if [ -n "$ADB_PORTS" ]; then
    echo "✓ Puerto ADB (5037) está abierto:"
    echo "$ADB_PORTS"
else
    echo "❌ Puerto ADB (5037) no está abierto"
fi

echo ""
echo "6. Verificando permisos de archivos..."
ADB_BINARY="$ANDROID_HOME/platform-tools/adb"
if [ -x "$ADB_BINARY" ]; then
    echo "✓ ADB tiene permisos de ejecución"
else
    echo "❌ ADB no tiene permisos de ejecución"
    echo "   Ejecuta: chmod +x $ADB_BINARY"
fi

echo ""
echo "7. Información del sistema..."
echo "Usuario actual: $(whoami)"
echo "Directorio actual: $(pwd)"
echo "JAVA_HOME: $JAVA_HOME"
echo "ANDROID_HOME: $ANDROID_HOME"

echo ""
echo "8. Verificando dispositivos USB..."
if command -v lsusb >/dev/null 2>&1; then
    USB_DEVICES=$(lsusb 2>/dev/null | grep -i android || echo "No se encontraron dispositivos Android")
    echo "Dispositivos USB Android:"
    echo "$USB_DEVICES"
else
    echo "❌ lsusb no está instalado (instala con: sudo apt install usbutils)"
fi

echo ""
echo "=== Diagnóstico completado ==="
echo ""
echo "Si hay errores, ejecuta el script de solución:"
echo "./fix-adb-issues.sh"
