import { useState, useEffect, useCallback } from 'react';
import { tileCache } from '@/lib/map/tileCache';
import type { DownloadableRegion, Coordinates } from '@/types/map';

export const useOfflineMaps = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [savedRegions, setSavedRegions] = useState<DownloadableRegion[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<{
    regionId: string | null;
    downloaded: number;
    total: number;
  }>({ regionId: null, downloaded: 0, total: 0 });

  useEffect(() => {
    tileCache.initialize().then(() => {
      setIsInitialized(true);
      loadSavedRegions();
    });
  }, []);

  const loadSavedRegions = useCallback(async () => {
    const regions = await tileCache.getSavedRegions();
    setSavedRegions(regions);
  }, []);

  const downloadRegion = useCallback(async (region: DownloadableRegion) => {
    setDownloadProgress({ regionId: region.id, downloaded: 0, total: region.tileCount });

    await tileCache.downloadRegion(region, (downloaded, total) => {
      setDownloadProgress({ regionId: region.id, downloaded, total });
    });

    setDownloadProgress({ regionId: null, downloaded: 0, total: 0 });
    await loadSavedRegions();
  }, [loadSavedRegions]);

  const clearCache = useCallback(async () => {
    await tileCache.clearCache();
    setSavedRegions([]);
  }, []);

  const getCacheSize = useCallback(async (): Promise<number> => {
    return await tileCache.getCacheSize();
  }, []);

  const cleanExpiredTiles = useCallback(async () => {
    await tileCache.cleanExpiredTiles();
  }, []);

  const createRegion = useCallback((
    name: string,
    bounds: { northEast: Coordinates; southWest: Coordinates },
    minZoom: number = 10,
    maxZoom: number = 16
  ): DownloadableRegion => {
    const tiles = tileCache.calculateTiles({
      id: `region_${Date.now()}`,
      name,
      bounds,
      minZoom,
      maxZoom,
      tileCount: 0,
      downloadedTiles: 0,
      isComplete: false,
    });

    return {
      id: `region_${Date.now()}`,
      name,
      bounds,
      minZoom,
      maxZoom,
      tileCount: tiles.length,
      downloadedTiles: 0,
      isComplete: false,
    };
  }, []);

  return {
    isInitialized,
    savedRegions,
    downloadProgress,
    downloadRegion,
    clearCache,
    getCacheSize,
    cleanExpiredTiles,
    createRegion,
    loadSavedRegions,
  };
};
