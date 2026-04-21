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
    algorithm?: 'default' | 'layout' | 'ignore' | 'standard' | 'intelliignore';
    url?: string;
    testCase?: string;
    labels?: string;
    responsiveSnapshotCapture?: boolean;
    ignoreCanvasSerializationErrors?: boolean;
    ignoreStyleSheetSerializationErrors?: boolean;
    [key: string]: unknown;
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

  export interface BoundingBox {
    top: number;
    left: number;
    width: number;
    height: number;
  }

  export interface RegionPaddingObject {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  }

  export interface ElementSelector {
    boundingBox?: BoundingBox;
    elementXpath?: string;
    elementCSS?: string;
  }

  export interface Region {
    algorithm: 'ignore' | 'layout' | 'consider' | 'standard' | 'intelliignore';
    elementSelector: ElementSelector;
    padding?: number | RegionPaddingObject;
    configuration?: {
      diffSensitivity?: number;
      imageIgnoreThreshold?: number;
      carouselsEnabled?: boolean;
      bannersEnabled?: boolean;
      adsEnabled?: boolean;
    };
    assertion?: {
      diffIgnoreThreshold?: number;
    };
  }

  export interface CreateRegionInput {
    boundingBox?: BoundingBox;
    elementXpath?: string;
    elementCSS?: string;
    padding?: number | RegionPaddingObject;
    algorithm?: 'ignore' | 'layout' | 'consider' | 'standard' | 'intelliignore';
    diffSensitivity?: number;
    imageIgnoreThreshold?: number;
    carouselsEnabled?: boolean;
    bannersEnabled?: boolean;
    adsEnabled?: boolean;
    diffIgnoreThreshold?: number;
  }

  export function createRegion(input?: CreateRegionInput): Region;
  export function uploadFromOutputDir(options?: UploadOptions): Promise<void>;

  export const CLIENT_INFO: string;
  export const ENV_INFO: string;

  function percyMaestroSnapshot(name: string, options?: SnapshotOptions): Promise<unknown>;
  export default percyMaestroSnapshot;
  export { percyMaestroSnapshot };
}
