import { Animated, Easing } from 'react-native';
import type { Region, LatLng } from 'react-native-maps';

export type AnimationType = 
  | 'zoom'
  | 'pan'
  | 'fit'
  | 'follow'
  | 'bounce'
  | 'pulse';

export interface AnimationOptions {
  duration: number;
  easing: keyof typeof Easing;
  delay?: number;
}

class AnimationManager {
  private animationValues = new Map<string, Animated.Value>();

  /**
   * Crea un valor animado
   */
  createAnimatedValue(key: string, initialValue: number = 0): Animated.Value {
    const value = new Animated.Value(initialValue);
    this.animationValues.set(key, value);
    return value;
  }

  /**
   * Obtiene un valor animado existente
   */
  getAnimatedValue(key: string): Animated.Value | undefined {
    return this.animationValues.get(key);
  }

  /**
   * Anima un valor con opciones
   */
  animate(
    value: Animated.Value,
    toValue: number,
    options: Partial<AnimationOptions> = {}
  ): Promise<void> {
    const {
      duration = 300,
      easing = 'inOut',
      delay = 0,
    } = options;

    const easingFn = this.getEasingFunction(easing);

    return new Promise((resolve) => {
      Animated.timing(value, {
        toValue,
        duration,
        delay,
        easing: easingFn,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  }

  /**
   * Anima múltiples valores en paralelo
   */
  animateParallel(
    animations: Array<{ value: Animated.Value; toValue: number }>,
    options: Partial<AnimationOptions> = {}
  ): Promise<void> {
    const {
      duration = 300,
      easing = 'inOut',
    } = options;

    const easingFn = this.getEasingFunction(easing);

    return new Promise((resolve) => {
      Animated.parallel(
        animations.map(({ value, toValue }) =>
          Animated.timing(value, {
            toValue,
            duration,
            easing: easingFn,
            useNativeDriver: true,
          })
        )
      ).start(() => resolve());
    });
  }

  /**
   * Anima múltiples valores en secuencia
   */
  animateSequence(
    animations: Array<{ value: Animated.Value; toValue: number; duration?: number }>,
    options: Partial<AnimationOptions> = {}
  ): Promise<void> {
    const { easing = 'inOut' } = options;
    const easingFn = this.getEasingFunction(easing);

    return new Promise((resolve) => {
      Animated.sequence(
        animations.map(({ value, toValue, duration = 300 }) =>
          Animated.timing(value, {
            toValue,
            duration,
            easing: easingFn,
            useNativeDriver: true,
          })
        )
      ).start(() => resolve());
    });
  }

  /**
   * Animación de rebote
   */
  bounce(value: Animated.Value, toValue: number): Promise<void> {
    return new Promise((resolve) => {
      Animated.spring(value, {
        toValue,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  }

  /**
   * Animación de pulso continuo
   */
  pulse(value: Animated.Value, fromValue: number, toValue: number): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: fromValue,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
  }

  /**
   * Interpola valores para transiciones suaves
   */
  interpolate(
    value: Animated.Value,
    inputRange: number[],
    outputRange: number[]
  ): Animated.AnimatedInterpolation<number> {
    return value.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });
  }

  /**
   * Limpia todos los valores animados
   */
  clear(): void {
    this.animationValues.clear();
  }

  // Métodos privados

  private getEasingFunction(easing: string): (value: number) => number {
    const easingMap: Record<string, (value: number) => number> = {
      linear: Easing.linear,
      ease: Easing.ease,
      quad: Easing.quad,
      cubic: Easing.cubic,
      poly: Easing.poly(4),
      sin: Easing.sin,
      circle: Easing.circle,
      exp: Easing.exp,
      elastic: Easing.elastic(1),
      back: Easing.back(1),
      bounce: Easing.bounce,
      bezier: Easing.bezier(0.42, 0, 0.58, 1),
      in: Easing.in(Easing.ease),
      out: Easing.out(Easing.ease),
      inOut: Easing.inOut(Easing.ease),
    };

    return easingMap[easing] || Easing.inOut(Easing.ease);
  }
}

export const animationManager = new AnimationManager();
export { AnimationManager };
