import { mmkvProvider } from '@/lib/storage/mmkvProvider';
import RNFS from 'react-native-fs';
import type { MapTile, DownloadableRegion, CacheOptions, Coordinates } from '@/types/map';

class TileCache {
  private cacheDir: string;
  private options: CacheOptions;
  private readonly CACHE_KEY = '@map_tiles_metadata';

  constructor(options?: Partial<CacheOptions>) {
    this.cacheDir = `${RNFS.DocumentDirectoryPath}/map_tiles`;
    this.options = {
      maxCacheSize: 100, // 100 MB
      maxAge: 30, // 30 días
      compressionEnabled: true,
      ...options,
    };
  }

  /**
   * Inicializa el directorio de caché
   */
  async initialize(): Promise<void> {
    try {
      const exists = await RNFS.exists(this.cacheDir);
      if (!exists) {
        await RNFS.mkdir(this.cacheDir);
      }
    } catch (error) {
      console.error('[TileCache] Failed to initialize:', error);
    }
  }

  /**
   * Calcula tiles necesarios para una región
   */
  calculateTiles(region: DownloadableRegion): MapTile[] {
    const tiles: MapTile[] = [];
    
    for (let z = region.minZoom; z <= region.maxZoom; z++) {
      const n = Math.pow(2, z);
      
      const minTileX = Math.floor((region.bounds.southWest.longitude + 180) / 360 * n);
      const maxTileX = Math.floor((region.bounds.northEast.longitude + 180) / 360 * n);
      
      const minTileY = Math.floor((1 - Math.log(Math.tan(region.bounds.northEast.latitude * Math.PI / 180) + 
        1 / Math.cos(region.bounds.northEast.latitude * Math.PI / 180)) / Math.PI) / 2 * n);
      const maxTileY = Math.floor((1 - Math.log(Math.tan(region.bounds.southWest.latitude * Math.PI / 180) + 
        1 / Math.cos(region.bounds.southWest.latitude * Math.PI / 180)) / Math.PI) / 2 * n);
      
      for (let x = minTileX; x <= maxTileX; x++) {
        for (let y = minTileY; y <= maxTileY; y++) {
          tiles.push({
            x,
            y,
            z,
            url: this.getTileUrl(x, y, z),
            localPath: `${this.cacheDir}/${z}_${x}_${y}.png`,
          });
        }
      }
    }
    
    return tiles;
  }

  /**
   * Descarga un tile individual
   */
  async downloadTile(tile: MapTile): Promise<boolean> {
    try {
      const exists = await RNFS.exists(tile.localPath!);
      if (exists) {
        return true; // Ya existe
      }

      await RNFS.downloadFile({
        fromUrl: tile.url,
        toFile: tile.localPath!,
      }).promise;

      // Guardar metadata
      await this.saveTileMetadata(tile);

      return true;
    } catch (error) {
      console.error(`[TileCache] Failed to download tile ${tile.x},${tile.y},${tile.z}:`, error);
      return false;
    }
  }

  /**
   * Descarga una región completa
   */
  async downloadRegion(
    region: DownloadableRegion,
    onProgress?: (downloaded: number, total: number) => void
  ): Promise<void> {
    const tiles = this.calculateTiles(region);
    let downloaded = 0;

    // Descargar en batches de 10
    const batchSize = 10;
    for (let i = 0; i < tiles.length; i += batchSize) {
      const batch = tiles.slice(i, i + batchSize);
      await Promise.all(batch.map(tile => this.downloadTile(tile)));
      
      downloaded += batch.length;
      onProgress?.(downloaded, tiles.length);
    }

    // Guardar región completa
    await this.saveRegion({
      ...region,
      downloadedTiles: tiles.length,
      isComplete: true,
    });
  }

  /**
   * Obtiene un tile del caché o lo descarga
   */
  async getTile(x: number, y: number, z: number): Promise<string | null> {
    const localPath = `${this.cacheDir}/${z}_${x}_${y}.png`;
    
    try {
      const exists = await RNFS.exists(localPath);
      if (exists) {
        // Verificar si el tile no está muy viejo
        const metadata = await this.getTileMetadata(x, y, z);
        if (metadata && !this.isTileExpired(metadata)) {
          return `file://${localPath}`;
        }
      }

      // Descargar si no existe o está expirado
      const tile: MapTile = {
        x,
        y,
        z,
        url: this.getTileUrl(x, y, z),
        localPath,
      };

      const success = await this.downloadTile(tile);
      return success ? `file://${localPath}` : null;
    } catch (error) {
      console.error('[TileCache] Error getting tile:', error);
      return null;
    }
  }

  /**
   * Limpia tiles expirados
   */
  async cleanExpiredTiles(): Promise<void> {
    try {
      const files = await RNFS.readDir(this.cacheDir);
      const now = new Date();

      for (const file of files) {
        const match = file.name.match(/(\d+)_(\d+)_(\d+)\.png/);
        if (match) {
          const [, z, x, y] = match;
          const metadata = await this.getTileMetadata(
            parseInt(x),
            parseInt(y),
            parseInt(z)
          );

          if (metadata && this.isTileExpired(metadata)) {
            await RNFS.unlink(file.path);
            await this.removeTileMetadata(parseInt(x), parseInt(y), parseInt(z));
          }
        }
      }
    } catch (error) {
      console.error('[TileCache] Error cleaning tiles:', error);
    }
  }

  /**
   * Obtiene el tamaño total del caché
   */
  async getCacheSize(): Promise<number> {
    try {
      const files = await RNFS.readDir(this.cacheDir);
      let totalSize = 0;

      for (const file of files) {
        totalSize += file.size;
      }

      return totalSize / (1024 * 1024); // MB
    } catch (error) {
      console.error('[TileCache] Error getting cache size:', error);
      return 0;
    }
  }

  /**
   * Limpia todo el caché
   */
  async clearCache(): Promise<void> {
    try {
      await RNFS.unlink(this.cacheDir);
      await this.initialize();
      mmkvProvider.cache.delete(this.CACHE_KEY);
    } catch (error) {
      console.error('[TileCache] Error clearing cache:', error);
    }
  }

  // Métodos privados

  private getTileUrl(x: number, y: number, z: number): string {
    // Usar OpenStreetMap tiles como fallback
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  }

  private async saveTileMetadata(tile: MapTile): Promise<void> {
    try {
      const key = `tile_${tile.x}_${tile.y}_${tile.z}`;
      const metadata = {
        ...tile,
        cachedAt: new Date().toISOString(),
      };
      mmkvProvider.cache.set(key, JSON.stringify(metadata));
    } catch (error) {
      console.error('[TileCache] Error saving tile metadata:', error);
    }
  }

  private async getTileMetadata(x: number, y: number, z: number): Promise<MapTile | null> {
    try {
      const key = `tile_${x}_${y}_${z}`;
      const data = mmkvProvider.cache.getString(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  private async removeTileMetadata(x: number, y: number, z: number): Promise<void> {
    try {
      const key = `tile_${x}_${y}_${z}`;
      mmkvProvider.cache.delete(key);
    } catch (error) {
      console.error('[TileCache] Error removing tile metadata:', error);
    }
  }

  private isTileExpired(tile: MapTile): boolean {
    if (!tile.cachedAt) return true;
    const cachedDate = new Date(tile.cachedAt);
    const now = new Date();
    const daysDiff = (now.getTime() - cachedDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > this.options.maxAge;
  }

  private async saveRegion(region: DownloadableRegion): Promise<void> {
    try {
      const regions = await this.getSavedRegions();
      const index = regions.findIndex(r => r.id === region.id);
      
      if (index >= 0) {
        regions[index] = region;
      } else {
        regions.push(region);
      }

      mmkvProvider.cache.set('offline_regions', JSON.stringify(regions));
    } catch (error) {
      console.error('[TileCache] Error saving region:', error);
    }
  }

  async getSavedRegions(): Promise<DownloadableRegion[]> {
    try {
      const data = mmkvProvider.cache.getString('offline_regions');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }
}

export const tileCache = new TileCache();
export { TileCache };
