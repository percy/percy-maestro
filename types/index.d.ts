declare module '@percy/maestro' {
  export interface SnapshotOptions {
    widths?: number[];
    minHeight?: number;
    percyCSS?: string;
    scope?: string;
    enableJavaScript?: boolean;
    ignoreRegions?: Region[];
    considerRegions?: Region[];
    regions?: Region[];
    discovery?: Record<string, unknown>;
    additionalSnapshots?: Array<{ name?: string; prefix?: string; suffix?: string; execute?: unknown }>;
    sync?: boolean;
    algorithm?: 'default' | 'layout' | 'ignore';
    url?: string;
  }

  export interface UploadOptions extends SnapshotOptions {
    dir?: string;
    name?: string;
    deviceName?: string;
    osName?: 'Android' | 'iOS' | 'Web';
    osVersion?: string;
    width?: number;
    height?: number;
    orientation?: 'portrait' | 'landscape';
  }

  export interface RegionCoordinates {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  }

  export interface Region {
    algorithm?: 'ignore' | 'layout' | 'consider';
    coOrdinates?: RegionCoordinates;
    elementXpath?: string;
    elementCSS?: string;
    padding?: number | RegionCoordinates;
    configuration?: Record<string, unknown>;
    assertion?: Record<string, unknown>;
  }

  export interface CreateRegionInput extends RegionCoordinates {
    elementXpath?: string;
    elementCSS?: string;
    padding?: number | RegionCoordinates;
    algorithm?: 'ignore' | 'layout' | 'consider';
    configuration?: Record<string, unknown>;
    assertion?: Record<string, unknown>;
  }

  export function createRegion(input: CreateRegionInput): Region;
  export function uploadFromOutputDir(options?: UploadOptions): Promise<void>;

  function percyMaestroSnapshot(name: string, options?: SnapshotOptions): Promise<unknown>;
  export default percyMaestroSnapshot;
  export { percyMaestroSnapshot };
}
