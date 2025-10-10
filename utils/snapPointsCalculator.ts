import { Dimensions } from 'react-native';

export const calculateSnapPoints = (
  minHeight: number,
  initialHeight: number,
  maxHeight: number
): string[] => {
  const screenHeight = Dimensions.get('window').height;
  
  const minPercent = Math.round((minHeight / screenHeight) * 100);
  const initialPercent = Math.round((initialHeight / screenHeight) * 100);
  const maxPercent = Math.round((maxHeight / screenHeight) * 100);
  
  const points = [minPercent, initialPercent, maxPercent]
    .filter((height, index, arr) => arr.indexOf(height) === index)
    .sort((a, b) => a - b);
  
  return points.map(point => `${point}%`);
};

export const calculateSnapPointsFromConfig = (config: {
  minHeight: number;
  initialHeight: number;
  maxHeight: number;
}): string[] => {
  return calculateSnapPoints(
    config.minHeight,
    config.initialHeight,
    config.maxHeight
  );
};



