#!/bin/bash

echo "✅ Verificación completa del setup de desarrollo Android"
echo "======================================================"

ERRORS=0

# Verificar Java
echo "1. Verificando Java..."
if [ -n "$JAVA_HOME" ] && [ -f "$JAVA_HOME/bin/java" ]; then
    JAVA_VER=$(java -version 2>&1 | head -n 1)
    echo "✓ Java: $JAVA_VER"
    echo "✓ JAVA_HOME: $JAVA_HOME"
else
    echo "❌ Java no configurado correctamente"
    ERRORS=$((ERRORS + 1))
fi

# Verificar Android SDK
echo ""
echo "2. Verificando Android SDK..."
if [ -n "$ANDROID_HOME" ] && [ -d "$ANDROID_HOME" ]; then
    echo "✓ ANDROID_HOME: $ANDROID_HOME"

    # Verificar platform-tools
    if [ -f "$ANDROID_HOME/platform-tools/adb" ]; then
        ADB_VER=$("$ANDROID_HOME/platform-tools/adb" version 2>/dev/null | head -n 1)
        echo "✓ ADB: $ADB_VER"
    else
        echo "❌ ADB no encontrado"
        ERRORS=$((ERRORS + 1))
    fi

    # Verificar build-tools
    if [ -d "$ANDROID_HOME/build-tools" ]; then
        echo "✓ Build tools encontrados"
    else
        echo "⚠️  Build tools no encontrados (pueden instalarse después)"
    fi
else
    echo "❌ Android SDK no configurado"
    ERRORS=$((ERRORS + 1))
fi

# Verificar PATH
echo ""
echo "3. Verificando PATH..."
if echo "$PATH" | grep -q "$ANDROID_HOME/platform-tools"; then
    echo "✓ Android platform-tools en PATH"
else
    echo "❌ Android platform-tools no está en PATH"
    ERRORS=$((ERRORS + 1))
fi

# Verificar Node.js y Expo
echo ""
echo "4. Verificando Node.js y Expo..."
if command -v node >/dev/null 2>&1; then
    NODE_VER=$(node --version)
    echo "✓ Node.js: $NODE_VER"
else
    echo "❌ Node.js no instalado"
    ERRORS=$((ERRORS + 1))
fi

if command -v npx >/dev/null 2>&1; then
    echo "✓ NPX disponible"
else
    echo "❌ NPX no disponible"
    ERRORS=$((ERRORS + 1))
fi

# Verificar Expo CLI
echo ""
echo "5. Verificando Expo CLI..."
if npx expo --version >/dev/null 2>&1; then
    EXPO_VER=$(npx expo --version 2>/dev/null | head -n 1)
    echo "✓ Expo CLI: $EXPO_VER"
else
    echo "❌ Expo CLI no disponible"
    ERRORS=$((ERRORS + 1))
fi

# Verificar dispositivos
echo ""
echo "6. Verificando dispositivos Android..."
if [ -f "$ANDROID_HOME/platform-tools/adb" ]; then
    DEVICES=$("$ANDROID_HOME/platform-tools/adb" devices 2>/dev/null | grep -v "List of devices" | grep -v "^$" | wc -l)
    if [ "$DEVICES" -gt 0 ]; then
        echo "✓ $DEVICES dispositivo(s) Android conectado(s)"
    else
        echo "ℹ️  No hay dispositivos Android conectados"
        echo "   - Para dispositivo físico: conecta por USB y habilita depuración"
        echo "   - Para emulador: inicia Android Studio y crea/ejecuta un AVD"
    fi
fi

echo ""
echo "=== RESULTADO DE LA VERIFICACIÓN ==="
if [ $ERRORS -eq 0 ]; then
    echo "🎉 ¡Todo está configurado correctamente!"
    echo ""
    echo "Puedes ejecutar:"
    echo "./run-android-ubuntu.sh"
    echo "o"
    echo "./run-android-ubuntu-alternative.sh"
else
    echo "⚠️  Se encontraron $ERRORS problema(s)"
    echo ""
    echo "Ejecuta './fix-adb-issues.sh' para intentar solucionarlos automáticamente"
    echo "o revisa la documentación en docs/runit.md"
fi

echo ""
echo "Información del sistema:"
echo "- Usuario: $(whoami)"
echo "- OS: $(uname -a)"
echo "- Directorio: $(pwd)"
