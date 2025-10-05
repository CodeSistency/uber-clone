import { Stack } from "expo-router";
import React from "react";

export default function WalletLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          title: "Wallet"
        }} 
      />
      <Stack.Screen 
        name="send-money" 
        options={{ 
          headerShown: false,
          title: "Send Money"
        }} 
      />
      <Stack.Screen 
        name="confirm-transfer" 
        options={{ 
          headerShown: false,
          title: "Confirm Transfer"
        }} 
      />
      <Stack.Screen 
        name="transaction-history" 
        options={{ 
          headerShown: false,
          title: "Transaction History"
        }} 
      />
    </Stack>
  );
}




