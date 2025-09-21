export type ColorScheme = "light" | "dark";

export type BrandColor =
  | "primary"
  | "primaryDark"
  | "secondary"
  | "tertiary"
  | "accent";

export interface VariantProps<
  TVariants extends string,
  TSizes extends string = never,
> {
  variant?: TVariants;
  size?: TSizes extends never ? undefined : TSizes;
  className?: string;
}

export type PressHandler = () => void;

export interface IconProps {
  className?: string;
}

export type ReactComponent<P = any> = React.ComponentType<P>;
