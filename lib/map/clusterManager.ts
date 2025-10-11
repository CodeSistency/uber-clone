import Supercluster from 'supercluster';
import type { DriverMarker, MarkerCluster, Coordinates, ClusteringOptions } from '@/types/map';

class ClusterManager {
  private supercluster: Supercluster;
  private options: ClusteringOptions;

  constructor(options?: Partial<ClusteringOptions>) {
    this.options = {
      enabled: true,
      radius: 60,
      maxZoom: 20,
      minZoom: 0,
      extent: 512,
      nodeSize: 64,
      ...options,
    };

    this.supercluster = new Supercluster({
      radius: this.options.radius,
      maxZoom: this.options.maxZoom,
      minZoom: this.options.minZoom,
      extent: (this.options.extent as unknown as [number, number, number, number]) || [-180, -90, 180, 90],
      nodeSize: this.options.nodeSize,
    });
  }

  /**
   * Carga marcadores en el cluster manager
   */
  load(markers: DriverMarker[]): void {
    const points = markers.map(marker => ({
      type: 'Feature' as const,
      properties: { marker },
      geometry: {
        type: 'Point' as const,
        coordinates: [marker.longitude, marker.latitude],
      },
    }));

    this.supercluster.load(points);
  }

  /**
   * Obtiene clusters visibles en la región actual
   */
  getClusters(bounds: {
    northEast: Coordinates;
    southWest: Coordinates;
  }, zoom: number): (DriverMarker | MarkerCluster)[] {
    if (!this.options.enabled) {
      return this.getAllMarkers();
    }

    const clusters = this.supercluster.getClusters(
      [bounds.southWest.longitude, bounds.southWest.latitude,
       bounds.northEast.longitude, bounds.northEast.latitude],
      Math.floor(zoom)
    );

    return clusters.map((cluster: any) => {
      if (cluster.properties.cluster) {
        return {
          id: `cluster-${cluster.id}`,
          coordinate: {
            latitude: cluster.geometry.coordinates[1],
            longitude: cluster.geometry.coordinates[0],
          },
          pointCount: cluster.properties.point_count,
          markers: this.getClusterChildren(cluster.id as number),
        } as MarkerCluster;
      } else {
        return cluster.properties.marker as DriverMarker;
      }
    });
  }

  /**
   * Obtiene todos los marcadores de un cluster
   */
  private getClusterChildren(clusterId: number): DriverMarker[] {
    const leaves = this.supercluster.getLeaves(clusterId, Infinity);
    return leaves.map((leaf: any) => leaf.properties.marker);
  }

  /**
   * Obtiene todos los marcadores sin clustering
   */
  private getAllMarkers(): DriverMarker[] {
    const points = this.supercluster.getLeaves(0, Infinity);
    return points.map((point: any) => point.properties.marker);
  }

  /**
   * Calcula el zoom óptimo para expandir un cluster
   */
  getClusterExpansionZoom(clusterId: number): number {
    return this.supercluster.getClusterExpansionZoom(clusterId);
  }

  /**
   * Actualiza las opciones de clustering
   */
  updateOptions(newOptions: Partial<ClusteringOptions>): void {
    this.options = { ...this.options, ...newOptions };
    
    // Recrear supercluster con nuevas opciones
    this.supercluster = new Supercluster({
      radius: this.options.radius,
      maxZoom: this.options.maxZoom,
      minZoom: this.options.minZoom,
      extent: (this.options.extent as unknown as [number, number, number, number]) || [-180, -90, 180, 90],
      nodeSize: this.options.nodeSize,
    });
  }

  /**
   * Obtiene las opciones actuales
   */
  getOptions(): ClusteringOptions {
    return { ...this.options };
  }

  /**
   * Limpia todos los datos del cluster
   */
  clear(): void {
    this.supercluster = new Supercluster({
      radius: this.options.radius,
      maxZoom: this.options.maxZoom,
      minZoom: this.options.minZoom,
      extent: (this.options.extent as unknown as [number, number, number, number]) || [-180, -90, 180, 90],
      nodeSize: this.options.nodeSize,
    });
  }
}

export const clusterManager = new ClusterManager();
export { ClusterManager };
