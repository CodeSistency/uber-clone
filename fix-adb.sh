#!/bin/bash

echo "🔧 Diagnóstico y Solución de Problemas ADB"
echo "=========================================="

# Función para verificar si ADB existe
check_adb() {
    if ! command -v adb &> /dev/null; then
        echo "❌ ADB no está instalado o no está en el PATH"
        echo "   Instala Android SDK Platform Tools:"
        echo "   sudo apt update && sudo apt install android-tools-adb android-tools-fastboot"
        return 1
    else
        echo "✅ ADB encontrado: $(which adb)"
        return 0
    fi
}

# Función para verificar estado del servidor ADB
check_adb_server() {
    echo ""
    echo "📊 Verificando estado del servidor ADB..."

    # Verificar si hay procesos ADB corriendo
    ADB_PROCESSES=$(pgrep -f adb)
    if [ -n "$ADB_PROCESSES" ]; then
        echo "🔄 Procesos ADB corriendo:"
        ps aux | grep adb | grep -v grep
    else
        echo "ℹ️  No hay procesos ADB corriendo"
    fi

    # Verificar socket ADB
    if [ -e "/tmp/adb.log" ]; then
        echo "📝 Log de ADB encontrado en /tmp/adb.log"
        tail -n 5 /tmp/adb.log
    fi
}

# Función para reiniciar ADB
restart_adb() {
    echo ""
    echo "🔄 Reiniciando servidor ADB..."

    # Matar procesos ADB existentes
    echo "Matando procesos ADB existentes..."
    pkill -f adb || true

    # Esperar un momento
    sleep 2

    # Limpiar socket si existe
    if [ -e "/tmp/adb.log" ]; then
        rm -f /tmp/adb.log
        echo "Limpieza de socket ADB completada"
    fi

    # Iniciar servidor ADB
    echo "Iniciando servidor ADB..."
    adb start-server

    if [ $? -eq 0 ]; then
        echo "✅ Servidor ADB iniciado correctamente"
    else
        echo "❌ Error al iniciar servidor ADB"
        return 1
    fi
}

# Función para verificar dispositivos
check_devices() {
    echo ""
    echo "📱 Verificando dispositivos conectados..."

    DEVICES=$(adb devices | grep -v "List" | grep -v "^$")
    if [ -z "$DEVICES" ]; then
        echo "❌ No hay dispositivos conectados"
        echo ""
        echo "💡 Soluciones posibles:"
        echo "   1. Conecta tu dispositivo Android"
        echo "   2. Habilita 'Depuración USB' en Configuración > Opciones de desarrollador"
        echo "   3. Autoriza la conexión en tu dispositivo"
        echo "   4. Si usas emulador, asegúrate de que esté corriendo"
        echo ""
        echo "   Para verificar emuladores corriendo:"
        echo "   $ANDROID_HOME/emulator/emulator -list-avds"
        echo ""
        echo "   Para iniciar un emulador:"
        echo "   $ANDROID_HOME/emulator/emulator -avd <nombre_del_avd>"
        return 1
    else
        echo "✅ Dispositivos encontrados:"
        echo "$DEVICES"
        return 0
    fi
}

# Función para verificar permisos USB
check_usb_permissions() {
    echo ""
    echo "🔌 Verificando permisos USB..."

    if [ -d "/dev/bus/usb" ]; then
        ls -la /dev/bus/usb/ | head -5
        echo ""
        echo "Si ves dispositivos USB pero ADB no los detecta:"
        echo "   1. Crea archivo de reglas UDEV:"
        echo "      sudo nano /etc/udev/rules.d/51-android.rules"
        echo "   2. Agrega esta línea (reemplaza XXXX con tu vendor ID):"
        echo "      SUBSYSTEM==\"usb\", ATTR{idVendor}==\"XXXX\", MODE=\"0666\", GROUP=\"plugdev\""
        echo "   3. Recarga reglas: sudo udevadm control --reload-rules"
        echo "   4. Desconecta y reconecta tu dispositivo"
    else
        echo "Directorio USB no encontrado"
    fi
}

# Función para intentar conexión
test_connection() {
    echo ""
    echo "🔗 Probando conexión..."

    # Obtener lista de dispositivos
    DEVICE_LIST=$(adb devices | tail -n +2 | awk '{print $1}' | grep -v "^$")

    if [ -z "$DEVICE_LIST" ]; then
        echo "❌ No hay dispositivos disponibles para probar"
        return 1
    fi

    # Tomar el primer dispositivo
    FIRST_DEVICE=$(echo "$DEVICE_LIST" | head -n1)

    echo "Probando conexión con dispositivo: $FIRST_DEVICE"

    # Probar conexión básica
    if adb -s "$FIRST_DEVICE" shell echo "test" &> /dev/null; then
        echo "✅ Conexión exitosa con $FIRST_DEVICE"
        return 0
    else
        echo "❌ Error de conexión con $FIRST_DEVICE"
        return 1
    fi
}

# Función principal
main() {
    echo "Iniciando diagnóstico ADB..."
    echo ""

    # Verificar ADB
    if ! check_adb; then
        exit 1
    fi

    # Verificar servidor ADB
    check_adb_server

    # Verificar dispositivos
    if ! check_devices; then
        check_usb_permissions
        echo ""
        echo "🔄 Intentando reiniciar ADB para solucionar problemas..."
        restart_adb
        check_devices
    fi

    # Probar conexión si hay dispositivos
    test_connection

    echo ""
    echo "📋 Resumen del diagnóstico completado"
    echo ""
    echo "Si aún tienes problemas:"
    echo "1. Asegúrate de que tu dispositivo esté conectado y autorizado"
    echo "2. Reinicia ADB: adb kill-server && adb start-server"
    echo "3. Verifica que no haya otros procesos usando el puerto 5037:"
    echo "   sudo netstat -tulpn | grep 5037"
    echo "4. Prueba ejecutar el comando original nuevamente"
}

# Ejecutar función principal
main "$@"
