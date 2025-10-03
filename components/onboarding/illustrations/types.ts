import { ViewStyle } from "react-native";

export interface IllustrationProps {
  className?: string;
  style?: ViewStyle;
  variant?: string;
}

export type IllustrationComponent = React.ComponentType<IllustrationProps>;
