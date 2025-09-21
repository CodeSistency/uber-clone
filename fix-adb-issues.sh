#!/bin/bash

echo "🔧 Solución de problemas ADB"
echo "============================"

# Función para verificar si un comando se ejecutó correctamente
check_command() {
    if [ $? -eq 0 ]; then
        echo "✓ $1"
    else
        echo "❌ Error en: $1"
        return 1
    fi
}

echo "1. Matando procesos ADB existentes..."
killall adb 2>/dev/null
check_command "Procesos ADB terminados"

echo ""
echo "2. Reiniciando servidor ADB..."
"$ANDROID_HOME/platform-tools/adb" kill-server 2>/dev/null
sleep 2
"$ANDROID_HOME/platform-tools/adb" start-server
check_command "Servidor ADB reiniciado"

echo ""
echo "3. Verificando permisos de ADB..."
ADB_BINARY="$ANDROID_HOME/platform-tools/adb"
if [ ! -x "$ADB_BINARY" ]; then
    echo "Otorgando permisos de ejecución a ADB..."
    chmod +x "$ADB_BINARY"
    check_command "Permisos otorgados"
else
    echo "✓ ADB ya tiene permisos correctos"
fi

echo ""
echo "4. Verificando conectividad del dispositivo..."
DEVICES=$("$ANDROID_HOME/platform-tools/adb" devices 2>/dev/null | grep -v "List of devices" | grep -v "^$")
if [ -n "$DEVICES" ]; then
    echo "✓ Dispositivos conectados:"
    echo "$DEVICES"
else
    echo "ℹ️  No hay dispositivos conectados"
    echo "   Asegúrate de que:"
    echo "   - Tu dispositivo esté conectado por USB"
    echo "   - La depuración USB esté habilitada"
    echo "   - Hayas aceptado el diálogo de autorización en el dispositivo"
fi

echo ""
echo "5. Verificando reglas udev (para dispositivos físicos)..."
UDEV_RULES="/etc/udev/rules.d/51-android.rules"
if [ -f "$UDEV_RULES" ]; then
    echo "✓ Reglas udev existen: $UDEV_RULES"
else
    echo "ℹ️  Creando reglas udev para Android..."
    echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="*", ATTR{idProduct}=="*", MODE="0666", GROUP="plugdev"' | sudo tee "$UDEV_RULES" >/dev/null
    sudo udevadm control --reload-rules
    sudo udevadm trigger
    check_command "Reglas udev creadas"
fi

echo ""
echo "6. Verificando grupo plugdev..."
if groups "$USER" | grep -q plugdev; then
    echo "✓ Usuario pertenece al grupo plugdev"
else
    echo "ℹ️  Agregando usuario al grupo plugdev..."
    sudo usermod -aG plugdev "$USER"
    echo "⚠️  Debes reiniciar tu sesión o ejecutar 'newgrp plugdev' para que los cambios surtan efecto"
fi

echo ""
echo "7. Probando conexión con Expo..."
echo "Ejecutando: npx expo run:android --device"
npx expo run:android --device

echo ""
echo "=== Solución completada ==="
echo ""
echo "Si aún tienes problemas:"
echo "1. Reinicia tu computadora"
echo "2. Verifica que tu dispositivo esté en modo depuración USB"
echo "3. Acepta el diálogo de autorización en tu dispositivo"
echo "4. Si usas emulador, asegúrate de que esté corriendo"
echo ""
echo "Para más ayuda, ejecuta: ./diagnose-adb.sh"
