import { useState, useEffect, useCallback } from 'react';
import { Region } from 'react-native-maps';
import { clusterManager } from '@/lib/map/clusterManager';
import type { DriverMarker, MarkerCluster, Coordinates } from '@/types/map';

export const useMapClustering = (
  markers: DriverMarker[],
  enabled: boolean = true
) => {
  const [clusters, setClusters] = useState<(DriverMarker | MarkerCluster)[]>([]);

  // Cargar marcadores en el cluster manager
  useEffect(() => {
    if (markers.length > 0) {
      clusterManager.load(markers);
    }
  }, [markers]);

  /**
   * Actualiza clusters basado en la región visible
   */
  const updateClusters = useCallback((region: Region, zoom: number) => {
    const bounds = {
      northEast: {
        latitude: region.latitude + region.latitudeDelta / 2,
        longitude: region.longitude + region.longitudeDelta / 2,
      },
      southWest: {
        latitude: region.latitude - region.latitudeDelta / 2,
        longitude: region.longitude - region.longitudeDelta / 2,
      },
    };

    const newClusters = clusterManager.getClusters(bounds, zoom);
    setClusters(newClusters);
  }, []);

  /**
   * Expande un cluster
   */
  const expandCluster = useCallback((clusterId: number): number => {
    return clusterManager.getClusterExpansionZoom(clusterId);
  }, []);

  /**
   * Actualiza las opciones de clustering
   */
  const updateClusteringOptions = useCallback((options: Partial<{
    enabled: boolean;
    radius: number;
    maxZoom: number;
    minZoom: number;
  }>) => {
    clusterManager.updateOptions(options);
  }, []);

  /**
   * Obtiene las opciones actuales de clustering
   */
  const getClusteringOptions = useCallback(() => {
    return clusterManager.getOptions();
  }, []);

  /**
   * Limpia todos los clusters
   */
  const clearClusters = useCallback(() => {
    clusterManager.clear();
    setClusters([]);
  }, []);

  return {
    clusters,
    updateClusters,
    expandCluster,
    updateClusteringOptions,
    getClusteringOptions,
    clearClusters,
  };
};
