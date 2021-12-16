export type BaseLayer = 'Grayscale' | 'Streets' | 'Satelitte';

export interface Geometry {
  type: string;
  coordinates: any[];
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: Geometry;
  [key: string]: any;
}

export interface GeoJSONData {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
  [key: string]: any;
}

export interface PluginIndex {
  [name: string]: {
    exportName: string;
    path: string;
    for?: string;
  };
}

export interface DataIndex {
  geoJSONUrl: string;
  metadataUrlTemplate: string;
  dataUrlTemplate: string;
}

export interface LayerData {
  [id: string]: {
    data: {
      [year: string]: {
        [timestamp: string]: {
          total: number;
          min: number;
          max: number;
          average: number;
          value: number[];
        };
      };
    };
  };
}

export interface OverlayLayer {
  name: string;
  dataIndexUrl: string;
  colorMap: [number, number, string, string?][];
  variable: string;
}

export interface PluginData {
  name?: string;
  plugins?: PluginData[];
  [prop: string]: any;
}

export interface SidebarData extends PluginData {
  granularity?: string;
}

export interface SidebarData extends PluginData {
  width?: string;
  selectedId?: string | number;
}

export interface MainData extends PluginData {
  pluginIndexUrl: string;
  baseLayers: BaseLayer[];
  overlayLayers: OverlayLayer[];
  yearRange: [number, number];
}
