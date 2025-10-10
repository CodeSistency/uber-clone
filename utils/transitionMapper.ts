import { Easing } from 'react-native';

interface TransitionConfig {
  type: 'slide' | 'fade' | 'none';
  duration: number;
}

export const mapTransitionToGorhom = (transition: TransitionConfig) => {
  const { type, duration } = transition;
  
  switch (type) {
    case 'slide':
      return {
        duration,
        easing: Easing.out(Easing.cubic),
      };
    case 'fade':
      return {
        duration,
        easing: Easing.inOut(Easing.ease),
      };
    case 'none':
      return {
        duration: 0,
        easing: Easing.linear,
      };
    default:
      return {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
      };
  }
};

export const getTransitionConfig = (type: string, duration: number) => {
  return mapTransitionToGorhom({ type: type as any, duration });
};



