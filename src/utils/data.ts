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
    tagName: string;
    path: string;
    for?: string;
  };
}

export interface DataIndex {
  geoJSONUrl: string;
  metadataUrlTemplate: string;
  dataUrlTemplate: string;
}

export interface LayerMetadata {
  [id: string]: {
    data: any;
  };
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
  pluginIndex?: PluginIndex;
  [prop: string]: any;
}

export interface SidebarChartData extends PluginData {
  granularity?: string;
  selectedId?: string | number;
  layerData?: LayerData;
  layerMetadata?: LayerMetadata;
}

export interface SidebarMetadataData extends PluginData {
  selectedId?: string | number;
  layerData?: LayerData;
  layerMetadata?: LayerMetadata;
}

export interface SidebarData extends PluginData {
  width?: string;
  selectedId?: string | number;
  layerData?: LayerData;
  layerMetadata?: LayerMetadata;
}

export interface MainData extends PluginData {
  pluginIndexUrl: string;
  baseLayers: BaseLayer[];
  overlayLayers: OverlayLayer[];
  yearRange: [number, number];
}
