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

export interface OverlayLayer {
  name: string;
  geoJSONData: GeoJSONData;
}

export interface PluginData {
  name?: string;
  tagName?: string;
  plugins?: PluginData[];
}

export interface SidebarData extends PluginData {
  selectedId?: string | number;
}

export interface MainData extends PluginData {
  baseLayers: BaseLayer[];
  overlayLayers: OverlayLayer[];
}
