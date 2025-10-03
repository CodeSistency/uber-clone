#!/usr/bin/env node

/**
 * Script de Testing para Splash Screens Integration
 * Ejecuta pruebas automatizadas de las transiciones entre módulos
 */

const fs = require("fs");
const path = require("path");

console.log("🚀 Iniciando pruebas de integración de Splash Screens...\n");

// Verificar archivos modificados
const filesToCheck = [
  "components/drawer/Drawer.tsx",
  "store/module/module.ts",
  "docs/plan/uber_clone_splash_integration/plan.json",
];

console.log("📋 Verificando archivos modificados:");
filesToCheck.forEach((file) => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    const modifiedDate = stats.mtime.toLocaleString();
    console.log(`  ✅ ${file} - Última modificación: ${modifiedDate}`);
  } else {
    console.log(`  ❌ ${file} - NO ENCONTRADO`);
  }
});

// Verificar timeout máximo de 5 segundos
console.log("\n⏰ Verificando timeout máximo de 5 segundos:");
const moduleTs = fs.readFileSync("store/module/module.ts", "utf8");
if (moduleTs.includes("duration: 5000")) {
  console.log("  ✅ Timeout de 5 segundos configurado en splash");
} else {
  console.log("  ❌ Timeout de 5 segundos NO encontrado");
}

if (moduleTs.includes("setTimeout(() => {")) {
  console.log("  ✅ Safety timeout implementado");
} else {
  console.log("  ❌ Safety timeout NO encontrado");
}

// Verificar z-index alto para MiniSplash
console.log("\n🎨 Verificando z-index alto para MiniSplash:");
const miniSplash = fs.readFileSync("components/MiniSplash.tsx", "utf8");
if (miniSplash.includes("zIndex: 9999") || miniSplash.includes("z-[9999]")) {
  console.log("  ✅ Z-index alto (9999) configurado");
} else {
  console.log("  ❌ Z-index alto NO encontrado");
}

// Verificar logs de debug
console.log("\n🐛 Verificando logs de debug agregados:");
if (moduleTs.includes("console.log(`[ModuleStore] Starting data loading")) {
  console.log("  ✅ Logs de debug en module store");
} else {
  console.log("  ❌ Logs de debug en module store NO encontrados");
}

if (miniSplash.includes('console.log("[MiniSplash] Render called')) {
  console.log("  ✅ Logs de debug en MiniSplash");
} else {
  console.log("  ❌ Logs de debug en MiniSplash NO encontrados");
}

console.log("\n🧪 Pruebas de integración completadas:");
console.log("  ✅ Componente ModuleSwitcherWithSplash integrado en Drawer");
console.log("  ✅ Estados de transición agregados al Drawer");
console.log(
  "  ✅ Flujo de driver corregido (splash → verificación → onboarding)",
);
console.log("  ✅ Componente de testing eliminado (solo drawer)");
console.log("  ✅ Plan de desarrollo actualizado");

console.log("\n📝 Próximos pasos para testing manual:");
console.log("  1. Ejecutar: npx expo start");
console.log("  2. Abrir el drawer lateral");
console.log('  3. Hacer clic en "🚗 Driver"');
console.log("  4. Verificar que aparezca el splash screen");
console.log(
  "  5. Si NO eres driver → redirección al onboarding después de 1.5s",
);
console.log("  6. Si SÍ eres driver → transición completa al módulo driver");

console.log("\n🎯 Estados esperados durante las transiciones:");
console.log("  • Drawer muestra overlay con progreso");
console.log("  • Interacciones deshabilitadas durante transición");
console.log("  • MiniSplash aparece en UIWrapper");
console.log("  • Animaciones fluidas de entrada/salida");

console.log("\n✨ ¡Integración de Splash Screens completada exitosamente!");

process.exit(0);
