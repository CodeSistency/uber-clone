// Script de prueba para verificar estilos del mapa
const { DARK_MODERN_STYLE, getMapStyle, validateMapConfig } = require('./constants/mapStyles.ts');



// Verificar que DARK_MODERN_STYLE existe y tiene contenido


// Verificar que getMapStyle funciona
try {
  const darkStyle = getMapStyle({ theme: 'dark' });
  :', {
    length: darkStyle.length,
    hasGeometryFill: darkStyle.some(s => s.elementType === 'geometry.fill'),
  });
} catch (error) {
  
}

// Verificar que validateMapConfig funciona
try {
  const config = validateMapConfig({});
  :', {
    theme: config.theme,
    hasCustomStyle: !!config.customStyle,
    customStyleName: config.customStyle?.name,
  });
} catch (error) {
  
}


