/**
 * Test script to show FCM behavior in different modes
 */



// Simular diferentes modos
const modes = {
  expoGo: {
    name: "Expo Go",
    firebaseInitialized: false,
    fcmWorks: false,
    description: "Firebase NO funciona - Expo Go no soporta FCM completo",
  },
  developmentBuild: {
    name: "Development Build",
    firebaseInitialized: true,
    fcmWorks: true,
    description:
      "Firebase SÍ funciona - Build de desarrollo con configuración completa",
  },
  productionBuild: {
    name: "Production Build",
    firebaseInitialized: true,
    fcmWorks: true,
    description: "Firebase SÍ funciona - Build de producción optimizado",
  },
};



Object.entries(modes).forEach(([key, mode]) => {
  
  
  
  
  
});



// Development build (recomendado para testing)






// Production build






// EAS Build (cloud)












