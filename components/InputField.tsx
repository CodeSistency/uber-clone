import React, { memo, useCallback } from "react";
import {
  TextInput,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";

import { InputFieldProps } from "@/types/type";

const InputFieldComponent = ({
  label,
  icon,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  inputStyle,
  iconStyle,
  className,
  ...props
}: InputFieldProps) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="my-2 w-full">
          <Text
            className={`text-lg font-JakartaSemiBold mb-3 text-black dark:text-white ${labelStyle}`}
          >
            {label}
          </Text>
          <View
            className={`flex flex-row justify-start items-center relative rounded-full border bg-neutral-100 border-neutral-100 focus:border-primary-500 dark:bg-brand-primaryDark dark:border-brand-primaryDark ${containerStyle}`}
          >
            {icon && (
              <Image source={icon} className={`w-6 h-6 ml-4 ${iconStyle}`} />
            )}
            <TextInput
              className={`rounded-full p-4 font-JakartaSemiBold text-[15px] flex-1 text-left text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 ${inputStyle}`}
              secureTextEntry={secureTextEntry}
              {...props}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const InputField = memo(InputFieldComponent);

// For backward compatibility
export default InputField;
