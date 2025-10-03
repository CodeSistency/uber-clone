// Script de prueba para verificar estilos del mapa
const { DARK_MODERN_STYLE, getMapStyle, validateMapConfig } = require('./constants/mapStyles.ts');

console.log('🧪 Testing Map Styles...');

// Verificar que DARK_MODERN_STYLE existe y tiene contenido
console.log('DARK_MODERN_STYLE:', {
  name: DARK_MODERN_STYLE.name,
  jsonLength: DARK_MODERN_STYLE.json.length,
  firstElement: DARK_MODERN_STYLE.json[0],
});

// Verificar que getMapStyle funciona
try {
  const darkStyle = getMapStyle({ theme: 'dark' });
  console.log('getMapStyle(dark):', {
    length: darkStyle.length,
    hasGeometryFill: darkStyle.some(s => s.elementType === 'geometry.fill'),
  });
} catch (error) {
  console.error('Error in getMapStyle:', error);
}

// Verificar que validateMapConfig funciona
try {
  const config = validateMapConfig({});
  console.log('validateMapConfig({}):', {
    theme: config.theme,
    hasCustomStyle: !!config.customStyle,
    customStyleName: config.customStyle?.name,
  });
} catch (error) {
  console.error('Error in validateMapConfig:', error);
}

console.log('✅ Test completed');
