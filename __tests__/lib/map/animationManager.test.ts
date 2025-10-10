import { AnimationManager } from '@/lib/map/animationManager';
import { Animated } from 'react-native';

describe('AnimationManager', () => {
  let animationManager: AnimationManager;

  beforeEach(() => {
    animationManager = new AnimationManager();
  });

  describe('createAnimatedValue', () => {
    it('should create an animated value', () => {
      const value = animationManager.createAnimatedValue('test', 0);
      expect(value).toBeInstanceOf(Animated.Value);
      expect(value._value).toBe(0);
    });

    it('should store the animated value for later retrieval', () => {
      const value = animationManager.createAnimatedValue('test', 5);
      const retrieved = animationManager.getAnimatedValue('test');
      expect(retrieved).toBe(value);
    });
  });

  describe('getAnimatedValue', () => {
    it('should return undefined for non-existent key', () => {
      const value = animationManager.getAnimatedValue('non-existent');
      expect(value).toBeUndefined();
    });

    it('should return the stored animated value', () => {
      const originalValue = animationManager.createAnimatedValue('test', 10);
      const retrievedValue = animationManager.getAnimatedValue('test');
      expect(retrievedValue).toBe(originalValue);
    });
  });

  describe('animate', () => {
    it('should animate a value', async () => {
      const value = animationManager.createAnimatedValue('test', 0);
      
      const animationPromise = animationManager.animate(value, 100, {
        duration: 100,
        easing: 'linear',
      });

      expect(animationPromise).toBeInstanceOf(Promise);
      await expect(animationPromise).resolves.not.toThrow();
    });

    it('should use default options when none provided', async () => {
      const value = animationManager.createAnimatedValue('test', 0);
      
      await expect(animationManager.animate(value, 50)).resolves.not.toThrow();
    });
  });

  describe('animateParallel', () => {
    it('should animate multiple values in parallel', async () => {
      const value1 = animationManager.createAnimatedValue('test1', 0);
      const value2 = animationManager.createAnimatedValue('test2', 0);
      
      const animations = [
        { value: value1, toValue: 100 },
        { value: value2, toValue: 200 },
      ];

      await expect(animationManager.animateParallel(animations)).resolves.not.toThrow();
    });
  });

  describe('animateSequence', () => {
    it('should animate values in sequence', async () => {
      const value = animationManager.createAnimatedValue('test', 0);
      
      const animations = [
        { value, toValue: 50 },
        { value, toValue: 100 },
      ];

      await expect(animationManager.animateSequence(animations)).resolves.not.toThrow();
    });
  });

  describe('bounce', () => {
    it('should create a bounce animation', async () => {
      const value = animationManager.createAnimatedValue('test', 0);
      
      await expect(animationManager.bounce(value, 100)).resolves.not.toThrow();
    });
  });

  describe('pulse', () => {
    it('should create a pulse animation', () => {
      const value = animationManager.createAnimatedValue('test', 0);
      const pulse = animationManager.pulse(value, 0, 100);
      
      expect(pulse).toBeInstanceOf(Animated.CompositeAnimation);
    });
  });

  describe('interpolate', () => {
    it('should interpolate values', () => {
      const value = animationManager.createAnimatedValue('test', 0);
      const interpolated = animationManager.interpolate(value, [0, 100], [0, 1]);
      
      expect(interpolated).toBeInstanceOf(Animated.AnimatedInterpolation);
    });
  });

  describe('clear', () => {
    it('should clear all animated values', () => {
      animationManager.createAnimatedValue('test1', 0);
      animationManager.createAnimatedValue('test2', 0);
      
      animationManager.clear();
      
      expect(animationManager.getAnimatedValue('test1')).toBeUndefined();
      expect(animationManager.getAnimatedValue('test2')).toBeUndefined();
    });
  });
});
