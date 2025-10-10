import { renderHook } from '@testing-library/react-native';
import { useMapFlowTransitions } from '@/hooks/useMapFlowTransitions';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';

// Mock del store
jest.mock('@/store/mapFlow/mapFlow', () => ({
  useMapFlowStore: jest.fn(),
}));

describe('useMapFlowTransitions', () => {
  const mockStore = {
    steps: {
      'idle': {
        id: 'idle',
        bottomSheet: {
          visible: false,
          minHeight: 0,
          maxHeight: 0,
          initialHeight: 0,
          showHandle: false,
          allowDrag: true,
        },
        transition: {
          type: 'slide',
          duration: 200,
        },
      },
      'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR': {
        id: 'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR',
        bottomSheet: {
          visible: true,
          minHeight: 300,
          maxHeight: 700,
          initialHeight: 500,
          showHandle: false,
          allowDrag: false,
        },
        transition: {
          type: 'fade',
          duration: 180,
        },
      },
      'confirm_origin': {
        id: 'confirm_origin',
        bottomSheet: {
          visible: true,
          minHeight: 100,
          maxHeight: 260,
          initialHeight: 120,
          showHandle: true,
          allowDrag: false,
        },
        transition: {
          type: 'none',
          duration: 0,
        },
      },
    },
  };

  beforeEach(() => {
    (useMapFlowStore as unknown as jest.Mock).mockReturnValue(mockStore);
  });

  it('handles slide transitions correctly', () => {
    const { result } = renderHook(() => 
      useMapFlowTransitions('idle')
    );

    expect(result.current.transitionType).toBe('slide');
    expect(result.current.transitionDuration).toBe(200);
    expect(result.current.isSlideTransition).toBe(true);
    expect(result.current.isFadeTransition).toBe(false);
    expect(result.current.isNoneTransition).toBe(false);
  });

  it('handles fade transitions correctly', () => {
    const { result } = renderHook(() => 
      useMapFlowTransitions('CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR')
    );

    expect(result.current.transitionType).toBe('fade');
    expect(result.current.transitionDuration).toBe(180);
    expect(result.current.isSlideTransition).toBe(false);
    expect(result.current.isFadeTransition).toBe(true);
    expect(result.current.isNoneTransition).toBe(false);
  });

  it('handles none transitions correctly', () => {
    const { result } = renderHook(() => 
      useMapFlowTransitions('confirm_origin')
    );

    expect(result.current.transitionType).toBe('none');
    expect(result.current.transitionDuration).toBe(0);
    expect(result.current.isSlideTransition).toBe(false);
    expect(result.current.isFadeTransition).toBe(false);
    expect(result.current.isNoneTransition).toBe(true);
  });

  it('identifies duration types correctly', () => {
    const { result: quickResult } = renderHook(() => 
      useMapFlowTransitions('CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR')
    );

    expect(quickResult.current.isQuickTransition).toBe(true);
    expect(quickResult.current.isStandardTransition).toBe(false);
    expect(quickResult.current.isSmoothTransition).toBe(false);

    const { result: standardResult } = renderHook(() => 
      useMapFlowTransitions('idle')
    );

    expect(standardResult.current.isQuickTransition).toBe(false);
    expect(standardResult.current.isStandardTransition).toBe(true);
    expect(standardResult.current.isSmoothTransition).toBe(false);
  });
});
