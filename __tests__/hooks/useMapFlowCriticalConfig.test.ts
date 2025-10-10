import { renderHook } from '@testing-library/react-native';
import { useMapFlowCriticalConfig } from '@/hooks/useMapFlowCriticalConfig';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';

// Mock del store
jest.mock('@/store/mapFlow/mapFlow', () => ({
  useMapFlowStore: jest.fn(),
}));

describe('useMapFlowCriticalConfig', () => {
  const mockStore = {
    steps: {
      'idle': {
        id: 'idle',
        bottomSheet: {
          visible: false,
          minHeight: 0,
          maxHeight: 0,
          initialHeight: 0,
          showHandle: true,
          allowDrag: true,
        },
        transition: {
          type: 'none',
          duration: 0,
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
          duration: 200,
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
          type: 'fade',
          duration: 180,
        },
      },
    },
  };

  beforeEach(() => {
    (useMapFlowStore as unknown as jest.Mock).mockReturnValue(mockStore);
  });

  it('identifies no handle steps correctly', () => {
    const { result } = renderHook(() => 
      useMapFlowCriticalConfig('CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR')
    );

    expect(result.current.isNoHandleStep).toBe(true);
    expect(result.current.handleComponent).toBe(null);
  });

  it('identifies no drag steps correctly', () => {
    const { result } = renderHook(() => 
      useMapFlowCriticalConfig('CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR')
    );

    expect(result.current.isNoDragStep).toBe(true);
    expect(result.current.enableHandlePanningGesture).toBe(false);
    expect(result.current.enableContentPanningGesture).toBe(false);
  });

  it('identifies no bottom sheet steps correctly', () => {
    const { result } = renderHook(() => 
      useMapFlowCriticalConfig('idle')
    );

    expect(result.current.isNoBottomSheetStep).toBe(true);
    expect(result.current.index).toBe(-1);
  });

  it('identifies special step types correctly', () => {
    const { result: searchingResult } = renderHook(() => 
      useMapFlowCriticalConfig('CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR')
    );

    expect(searchingResult.current.isSearchingDriverStep).toBe(true);

    const { result: confirmationResult } = renderHook(() => 
      useMapFlowCriticalConfig('confirm_origin')
    );

    expect(confirmationResult.current.isConfirmationStep).toBe(true);
  });
});
