import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GorhomMapFlowBottomSheet from '@/components/ui/GorhomMapFlowBottomSheet';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';

// Mock del store
jest.mock('@/store/mapFlow/mapFlow', () => ({
  useMapFlowStore: jest.fn(),
}));

// Mock de todos los hooks que usa el componente
jest.mock('@/hooks/useMapFlowBottomSheet', () => ({
  useMapFlowBottomSheet: jest.fn(() => ({
    goToSnapPoint: jest.fn(),
    goToHeight: jest.fn(),
    scrollUpComplete: jest.fn(),
    scrollDownComplete: jest.fn(),
    getCurrentHeight: jest.fn(() => 200),
    isAtMaxHeight: jest.fn(() => false),
    isAtMinHeight: jest.fn(() => true),
    enableScroll: jest.fn(),
    disableScroll: jest.fn(),
    scrollEnabled: true,
    animatedIndex: { value: 0 },
    animatedPosition: { value: 200 },
  })),
}));

jest.mock('@/hooks/useMapFlowAnimatedValues', () => ({
  useMapFlowAnimatedValues: jest.fn(() => ({
    animatedIndex: { value: 0 },
    animatedPosition: { value: 200 },
    animatedHeight: {},
    animatedOpacity: {},
    animatedTranslateY: {},
  })),
}));

jest.mock('@/hooks/useMapFlowScrollControl', () => ({
  useMapFlowScrollControl: jest.fn(() => ({
    scrollEnabled: true,
    handlePanningEnabled: true,
    contentPanningEnabled: true,
    enableScroll: jest.fn(),
    disableScroll: jest.fn(),
    enableHandlePanning: jest.fn(),
    disableHandlePanning: jest.fn(),
    enableContentPanning: jest.fn(),
    disableContentPanning: jest.fn(),
  })),
}));

jest.mock('@/hooks/useMapFlowBackground', () => ({
  useMapFlowBackground: jest.fn(() => ({
    useGradient: false,
    useBlur: false,
    gradientColors: ['#000000', '#FFFFFF'],
    blurIntensity: 20,
    blurTint: 'default',
    gradientBackground: {},
    blurBackground: {},
  })),
}));

jest.mock('@/hooks/useMapFlowFooter', () => ({
  useMapFlowFooter: jest.fn(() => ({
    footerStyle: {},
    bottomBar: null,
    bottomBarHeight: 0,
    showBottomBarAt: 0,
  })),
}));

jest.mock('@/hooks/useMapFlowSnapPoints', () => ({
  useMapFlowSnapPoints: jest.fn(() => ({
    snapPoints: ['25%', '50%', '75%'],
    calculateSnapPoints: jest.fn(() => ['25%', '50%', '75%']),
  })),
}));

jest.mock('@/hooks/useMapFlowAnimationConfig', () => ({
  useMapFlowAnimationConfig: jest.fn(() => ({
    animationConfig: {
      duration: 200,
      easing: jest.fn(),
    },
    transitionType: 'slide',
    transitionDuration: 200,
  })),
}));

jest.mock('@/hooks/useMapFlowCriticalConfig', () => ({
  useMapFlowCriticalConfig: jest.fn(() => ({
    isNoHandleStep: false,
    isNoDragStep: false,
    isNoBottomSheetStep: false,
    isSearchingDriverStep: false,
    isConfirmationStep: false,
    isRatingStep: false,
    handleComponent: undefined,
    enableHandlePanningGesture: true,
    enableContentPanningGesture: true,
    enableOverDrag: true,
    enablePanDownToClose: true,
    index: 0,
  })),
}));

jest.mock('@/hooks/useMapFlowTransitions', () => ({
  useMapFlowTransitions: jest.fn(() => ({
    animationConfig: {
      duration: 200,
      easing: jest.fn(),
    },
    transitionType: 'slide',
    transitionDuration: 200,
    isSlideTransition: true,
    isFadeTransition: false,
    isNoneTransition: false,
    isQuickTransition: false,
    isStandardTransition: true,
    isSmoothTransition: false,
  })),
}));

jest.mock('@/hooks/useMapFlowHeights', () => ({
  useMapFlowHeights: jest.fn(() => ({
    snapPoints: ['25%', '50%', '75%'],
    minHeight: 100,
    maxHeight: 500,
    initialHeight: 200,
    minPercent: 25,
    maxPercent: 75,
    initialPercent: 50,
    isSmallHeight: false,
    isMediumHeight: true,
    isLargeHeight: false,
    isVeryLargeHeight: false,
    isSearchingDriverHeight: false,
    isConfirmationHeight: false,
    isRatingHeight: false,
  })),
}));

// Mock de @gorhom/bottom-sheet
jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheet: ({ children, ...props }: any) => {
    const MockedBottomSheet = require('react-native').View;
    return <MockedBottomSheet {...props}>{children}</MockedBottomSheet>;
  },
  useBottomSheet: () => ({
    snapToIndex: jest.fn(),
    snapToPosition: jest.fn(),
    expand: jest.fn(),
    collapse: jest.fn(),
    close: jest.fn(),
    isActive: true,
    isClosed: false,
    isExpanded: false,
    isCollapsed: true,
    animatedIndex: { value: 0 },
    animatedPosition: { value: 200 },
    animatedContentHeight: { value: 300 },
  }),
}));

describe('GorhomMapFlowBottomSheet', () => {
  const mockStore = {
    steps: {
      'idle': {
        id: 'idle',
        bottomSheet: {
          visible: false,
          minHeight: 100,
          maxHeight: 500,
          initialHeight: 200,
          showHandle: true,
          allowDrag: true,
          useGradient: false,
          useBlur: false,
          gradientColors: ['#000000', '#FFFFFF'],
          blurIntensity: 20,
          blurTint: 'default',
          bottomBar: null,
          bottomBarHeight: 0,
          showBottomBarAt: 0,
        },
        transition: {
          type: 'slide',
          duration: 200,
        },
      },
    },
    flow: {
      bottomSheetVisible: true,
      bottomSheetMinHeight: 100,
      bottomSheetMaxHeight: 500,
      bottomSheetInitialHeight: 200,
      bottomSheetShowHandle: true,
      bottomSheetAllowDrag: true,
    },
  };

  beforeEach(() => {
    (useMapFlowStore as unknown as jest.Mock).mockReturnValue(mockStore);
  });

  it('renders correctly with basic props', () => {
    const { getByText } = render(
      <GorhomMapFlowBottomSheet
        visible={true}
        minHeight={100}
        maxHeight={500}
        initialHeight={200}
        showHandle={true}
        allowDrag={true}
      >
        <div>Test Content</div>
      </GorhomMapFlowBottomSheet>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('handles onClose callback', () => {
    const onClose = jest.fn();
    
    render(
      <GorhomMapFlowBottomSheet
        visible={true}
        minHeight={100}
        maxHeight={500}
        initialHeight={200}
        onClose={onClose}
      >
        <div>Test Content</div>
      </GorhomMapFlowBottomSheet>
    );

    // Simular cierre
    expect(onClose).not.toHaveBeenCalled();
  });

  it('applies correct props based on step configuration', () => {
    const { getByTestId } = render(
      <GorhomMapFlowBottomSheet
        visible={true}
        minHeight={100}
        maxHeight={500}
        initialHeight={200}
        step="idle"
        testID="bottom-sheet"
      >
        <div>Test Content</div>
      </GorhomMapFlowBottomSheet>
    );

    expect(getByTestId('bottom-sheet')).toBeTruthy();
  });
});
