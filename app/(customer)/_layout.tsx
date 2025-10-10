import { Stack } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Dimensions } from "react-native";

import { 
  AnimatedDrawerLayout, 
  AnimatedBackdrop, 
  CustomerModuleDrawerContent,
  useDrawer
} from "@/components/drawer";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function CustomerLayout() {
  const drawerWidth = SCREEN_WIDTH * 0.6;
  const overflowMargin = SCREEN_WIDTH * 0.1;
  
  // Usar el hook useDrawer para manejar el estado del drawer
  const drawer = useDrawer({ module: "customer" });

  // Log del estado del drawer
  console.log('[CustomerLayout] Drawer state:', {
    isOpen: drawer.isOpen,
    currentModule: drawer.currentModule
  });

  return (
    <AnimatedDrawerLayout
      width={drawerWidth}
      screenWidth={SCREEN_WIDTH}
      overflowMargin={overflowMargin}
      animationDuration={300}
      scaleFactor={0.65}
      borderRadius={24}
      secondaryScaleFactor={0.75}
      secondaryTranslateMultiplier={0.75}
      // Usar el estado controlado del hook
      isOpen={drawer.isOpen}
      onOpenChange={(open) => {
        console.log('[CustomerLayout] onOpenChange called with:', open);
        console.log('[CustomerLayout] Current drawer state:', drawer.isOpen);
        if (open) {
          console.log('[CustomerLayout] Opening drawer');
          drawer.open();
        } else {
          console.log('[CustomerLayout] Closing drawer');
          drawer.close();
        }
        console.log('[CustomerLayout] After state change, drawer.isOpen:', drawer.isOpen);
      }}
      renderBackdrop={({ progress, close }) => {
        console.log('[CustomerLayout] Rendering backdrop with close handler:', !!close);
        return <AnimatedBackdrop progress={progress} onPress={close} />;
      }}
      renderDrawer={(params) => <CustomerModuleDrawerContent drawerParams={params} />}
      renderContent={(params) => (
        <Stack>
          <Stack.Screen 
            name="unified-flow-demo" 
            options={{ 
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="unified-flow-demo-gorhom" 
            options={{ 
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="profile" 
            options={{ 
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="wallet" 
            options={{ 
              headerShown: false 
            }} 
          />
        </Stack>
      )}
    />
  );
}
