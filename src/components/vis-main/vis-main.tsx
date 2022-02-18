import { Component, Host, h, Prop, ComponentInterface, Watch } from '@stencil/core';
import leaflet from 'leaflet';
import { BaseLayer, DataIndex, GeoJSONData, LayerData, LayerMetadata, MainData, OverlayLayer, PluginData, PluginIndex, TimeControlData } from '../../utils/data';
import { mockData } from './mock-data';

@Component({
  tag: 'vis-main',
  styleUrl: 'vis-main.css',
  shadow: true,
})
export class VisMain implements ComponentInterface {
  static readonly TAG_NAME = 'vis-main';

  private mapElement: HTMLDivElement;
  private map: leaflet.Map;
  private sidebar: leaflet.Control;
  private sidebarElement: HTMLVisMainSidebarElement;
  private longbar: leaflet.Control;
  private longbarElement: HTMLVisMainLongbarElement;
  private layerDataMap: Map<OverlayLayer, LayerData> = new Map();
  private layerMetadataMap: Map<OverlayLayer, LayerMetadata> = new Map();
  private pluginIndex: PluginIndex = {};
  private overlayLayers: [leaflet.GeoJSON, OverlayLayer][] = [];
  private layerControl = leaflet.control.layers();

  @Prop() serverFileAPIPath = 'http://localhost:5000/files/';

  @Prop() data: MainData = mockData;

  @Watch('data')
  async dataChanged(data: MainData) {
    await this.updatePluginIndex(data);
    this.initializeOverlayLayers(data);
    this.initializeSidebar();
  }

  async componentDidLoad() {
    await this.updatePluginIndex(this.data);
    if (!this.map) {
      await this.initializeMap();
      await this.initializeOverlayLayers(this.data);
      this.initializeSidebar();
      this.initializeLongbar();
      this.initializeLegends();
      this.initializeTimeControl();
    }
  }

  render() {
    return (
      <Host>
        <div id="map" ref={el => (this.mapElement = el)}></div>
      </Host>
    );
  }

  private async initializeOverlayLayers(data: MainData) {
    for (const layerInfo of data.overlayLayers) {
      let response = await fetch(this.serverFileAPIPath + layerInfo.dataIndexUrl);
      const dataIndex = (await response.json()) as DataIndex;
      const dataIndexDirectoryPath = layerInfo.dataIndexUrl.split('/').slice(0, -1).join('/') + '/';
      response = await fetch(this.serverFileAPIPath + dataIndexDirectoryPath + dataIndex.geoJSONUrl);
      const geoJSONData = (await response.json()) as GeoJSONData;
      const layerIds = geoJSONData.features.map(({ properties }) => properties.id);
      for (const id of layerIds) {
        const layerDataUrl = dataIndex.dataUrlTemplate.replace('{VARIABLE}', layerInfo.variable).replace('{GRANULARITY}', 'monthly').replace('{ID}', id);
        let response = await fetch(this.serverFileAPIPath + dataIndexDirectoryPath + layerDataUrl);
        const layerDataForId = await response.json();
        let layerData = this.layerDataMap.get(layerInfo);
        if (!layerData) {
          this.layerDataMap.set(layerInfo, {});
          layerData = this.layerDataMap.get(layerInfo);
        }
        layerData[id] = layerDataForId;

        const layerMetadataUrl = dataIndex.metadataUrlTemplate.replace('{ID}', id);
        response = await fetch(this.serverFileAPIPath + dataIndexDirectoryPath + layerMetadataUrl);
        const layerMetadataForId = await response.json();
        let layerMetadata = this.layerMetadataMap.get(layerInfo);
        if (!layerMetadata) {
          this.layerMetadataMap.set(layerInfo, {});
          layerMetadata = this.layerMetadataMap.get(layerInfo);
        }
        layerMetadata[id] = layerMetadataForId;
      }
      const defaultStyle = {
        fillOpacity: 0.5,
      };
      const geoJSONLayer = leaflet.geoJSON(geoJSONData, {
        style: defaultStyle,
        onEachFeature: (feature, layer) => {
          layer.on('click', () => this.selectPolygon(layerInfo, feature.properties.id));
        },
      });
      this.overlayLayers.push([geoJSONLayer, layerInfo]);
      geoJSONLayer.addTo(this.map);
      this.layerControl.addOverlay(geoJSONLayer, layerInfo.name);
    }
  }

  private async initializeMap() {
    this.map = leaflet.map(this.mapElement).setView([51.312588, -116.021118], 10);
    this.initializeBaseLayers(this.map, this.data.baseLayers);
    this.map.zoomControl.setPosition('topright');
  }

  private initializeSidebar() {
    this.sidebar?.remove();
    const sidebarPlugin = this.data.plugins?.find(plugin => plugin.name === 'Sidebar');
    if (sidebarPlugin) {
      const sidebar = () => {
        const control = new leaflet.Control({ position: 'topleft' });
        control.onAdd = () => {
          this.sidebarElement = leaflet.DomUtil.create('vis-main-sidebar');
          this.sidebarElement.classList.add('leaflet-control-layers');
          this.preventDraggingEventForTheMapElement(this.sidebarElement);
          this.sidebarElement.data = {
            ...sidebarPlugin,
            layerDataMap: this.layerDataMap,
            layerMetadataMap: this.layerMetadataMap,
            pluginIndex: this.pluginIndex,
            updateSelection: ({ layer, id }) => this.selectPolygon(layer, id),
          };
          return this.sidebarElement;
        };
        return control;
      };
      this.sidebar = sidebar().addTo(this.map);
    }
  }

  private initializeLongbar() {
    this.longbar?.remove();
    const longbarPlugin = this.data.plugins?.find(plugin => plugin.name === 'Longbar');
    if (longbarPlugin) {
      const topbar = () => {
        const control = new leaflet.Control({ position: 'bottomright' });
        control.onAdd = () => {
          this.longbarElement = leaflet.DomUtil.create('vis-main-longbar');
          this.longbarElement.classList.add('leaflet-control-layers');
          this.preventDraggingEventForTheMapElement(this.longbarElement);
          this.longbarElement.data = {
            ...longbarPlugin,
            layerDataMap: this.layerDataMap,
            layerMetadataMap: this.layerMetadataMap,
            pluginIndex: this.pluginIndex,
            updateSelection: ({ layer, id }) => this.selectPolygon(layer, id),
          };
          return this.longbarElement;
        };
        return control;
      };
      this.longbar = topbar().addTo(this.map);
    }
  }

  private initializeLegends() {
    const legendPlugins = this.data.plugins?.filter(plugin => plugin.name === 'Legend');
    if (legendPlugins?.length > 0) {
      const legend = (legendPlugin: PluginData) => {
        const control = new leaflet.Control({ position: 'bottomright' });
        control.onAdd = () => {
          const legendElement = leaflet.DomUtil.create('vis-main-legend');
          legendElement.classList.add('leaflet-control-layers');
          this.preventDraggingEventForTheMapElement(legendElement);
          legendElement.data = {
            ...legendPlugin,
            layerData: this.layerDataMap.get(this.data.overlayLayers[0]),
            layerMetadata: this.layerMetadataMap.get(this.data.overlayLayers[0]),
            pluginIndex: this.pluginIndex,
            colorMap: this.data.overlayLayers?.find(layer => layer.variable === legendPlugin.variable)?.colorMap,
          };
          return legendElement;
        };
        return control;
      };
      legendPlugins.forEach(legendPlugin => legend(legendPlugin).addTo(this.map));
    }
  }

  private initializeTimeControl() {
    const timeControlPlugins = this.data.plugins?.filter(plugin => plugin.name === 'TimeControl');
    if (timeControlPlugins?.length > 0) {
      const timeControl = (timeControlPlugin: PluginData) => {
        const control = new leaflet.Control({ position: 'bottomright' });
        control.onAdd = () => {
          const timeControlElement = leaflet.DomUtil.create('vis-main-time-control');
          timeControlElement.classList.add('leaflet-control-layers');
          this.preventDraggingEventForTheMapElement(timeControlElement);
          timeControlElement.data = {
            ...timeControlPlugin,
            yearRange: this.data?.yearRange,
            layerDataMap: this.layerDataMap,
            updateTime: (year, timestamp) => this.updateTime(year, timestamp),
            pluginIndex: this.pluginIndex,
          } as TimeControlData;
          return timeControlElement;
        };
        return control;
      };
      timeControlPlugins.forEach(timeControlPlugin => timeControl(timeControlPlugin).addTo(this.map));
    }
  }

  private preventDraggingEventForTheMapElement(element: HTMLElement) {
    element.addEventListener('mouseover', () => this.map.dragging.disable());
    element.addEventListener('mouseout', () => this.map.dragging.enable());
  }

  private initializeBaseLayers(map: leaflet.Map, baseLayers: BaseLayer[]) {
    const attribution =
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' + 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
    const urlTemplate =
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    const attributionSetelitte = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    const urlTemplateSatelitte = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    const mapLayerDict: { [name: string]: leaflet.TileLayer } = {};
    if (baseLayers.includes('Grayscale')) {
      mapLayerDict['Grayscale'] = leaflet.tileLayer(urlTemplate, {
        id: 'mapbox/light-v9',
        tileSize: 512,
        zoomOffset: -1,
        attribution: attribution,
      });
    }
    if (baseLayers.includes('Streets')) {
      mapLayerDict['Streets'] = leaflet.tileLayer(urlTemplate, {
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        attribution: attribution,
      });
    }
    if (baseLayers.includes('Satelitte')) {
      mapLayerDict['Satelitte'] = leaflet.tileLayer(urlTemplateSatelitte, {
        id: 'mapbox.streets',
        attribution: attributionSetelitte,
      });
    }
    mapLayerDict[baseLayers[0]]?.addTo(map);
    this.layerControl.addTo(map);
    Object.entries(mapLayerDict).forEach(([name, layer]) => this.layerControl.addBaseLayer(layer, name));
  }

  private async updatePluginIndex(data: MainData) {
    const response = await fetch(this.serverFileAPIPath + data.pluginIndexUrl);
    this.pluginIndex = (await response.json()) as PluginIndex;
  }

  private updateTime(year: string, timestamp: string) {
    this.overlayLayers.forEach(([layer, layerInfo]) =>
      layer.setStyle(({ properties }) => {
        const averageValue = this.layerDataMap.get(layerInfo)[properties.id].data[year][timestamp].average;
        const color = this.obtainGeoJSONPolygonColor(layerInfo, averageValue);
        return {
          fillColor: color,
          // fillOpacity: 0.5,
        };
      }),
    );
  }

  private obtainGeoJSONPolygonColor(layerInfo: OverlayLayer, averageValue: number) {
    return layerInfo.colorMap.find(([min, max]) => averageValue > min && averageValue <= max)?.[2];
  }

  private selectPolygon(layer: OverlayLayer, id: string | number) {
    this.sidebarElement.data = { ...this.sidebarElement.data, selection: { layer, id }, yearRange: this.data.yearRange };
    this.longbarElement.data = { ...this.longbarElement.data, selection: { layer, id }, yearRange: this.data.yearRange };
    const selectedLayer = layer;
    this.overlayLayers.forEach(([layer, layerInfo]) =>
      layer.setStyle(({ properties }) => {
        let style;
        if (selectedLayer === layerInfo && properties.id === id) {
          layer
            .getLayers()
            .find(polygon => polygon['feature'].properties.id === id)
            ?.['bringToFront']();
          style = { color: 'red' };
        } else {
          style = { color: '#3388ff' };
        }
        return style;
      }),
    );
  }
}
