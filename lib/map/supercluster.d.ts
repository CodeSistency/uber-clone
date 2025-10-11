declare module 'supercluster' {
  interface Supercluster {
    load(points: any[]): void;
    getClusters(bbox: [number, number, number, number], zoom: number): any[];
    getChildren(clusterId: number): any[];
    getLeaves(clusterId: number, limit?: number, offset?: number): any[];
    getClusterExpansionZoom(clusterId: number): number;
  }

  interface SuperclusterOptions {
    radius?: number;
    maxZoom?: number;
    minZoom?: number;
    minPoints?: number;
    extent?: [number, number, number, number];
    nodeSize?: number;
    log?: boolean;
    generateId?: boolean;
    map?: (props: any) => any;
    reduce?: (accumulated: any, props: any) => void;
  }

  class Supercluster {
    constructor(options?: SuperclusterOptions);
    load(points: any[]): void;
    getClusters(bbox: [number, number, number, number], zoom: number): any[];
    getChildren(clusterId: number): any[];
    getLeaves(clusterId: number, limit?: number, offset?: number): any[];
    getClusterExpansionZoom(clusterId: number): number;
  }

  export = Supercluster;
}
