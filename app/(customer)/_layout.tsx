import { Stack } from "expo-router";
import React from "react";
import { Dimensions } from "react-native";

import { 
  AnimatedDrawerLayout, 
  AnimatedBackdrop, 
  CustomerModuleDrawerContent 
} from "@/components/drawer";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function CustomerLayout() {
  const drawerWidth = SCREEN_WIDTH * 0.6;
  const overflowMargin = SCREEN_WIDTH * 0.1;

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
      renderBackdrop={({ progress }) => <AnimatedBackdrop progress={progress} />}
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
