import { Component, Host, h, Prop, ComponentInterface, Watch } from '@stencil/core';
import leaflet from 'leaflet';
import { BaseLayer, DataIndex, GeoJSONData, LayerData, LayerMetadata, MainData, PluginIndex } from '../../utils/data';
import { mockData } from './mock-data';

@Component({
  tag: 'vis-main',
  styleUrl: 'vis-main.css',
  shadow: true,
})
export class VisMain implements ComponentInterface {
  static readonly TAG_NAME = 'vis-main';

  private readonly SERVER_FILE_API_PATH = 'http://localhost:5000/files/';

  private mapElement: HTMLDivElement;
  private map: leaflet.Map;
  private sidebar: leaflet.Control;
  private sidebarElement: HTMLVisMainSidebarElement;
  private layerData: LayerData = {};
  private layerMetadata: LayerMetadata = {};
  private pluginIndex: PluginIndex = {};

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
      this.initializeMap();
      this.initializeOverlayLayers(this.data);
      this.initializeSidebar();
    }
  }

  render() {
    return (
      <Host>
        <div id="map" ref={el => (this.mapElement = el)}></div>
      </Host>
    );
  }

  private initializeOverlayLayers(data: MainData) {
    data.overlayLayers.forEach(async layerInfo => {
      let response = await fetch(this.SERVER_FILE_API_PATH + layerInfo.dataIndexUrl);
      const dataIndex = (await response.json()) as DataIndex;
      const dataIndexDirectoryPath = layerInfo.dataIndexUrl.split('/').slice(0, -1).join('/') + '/';
      response = await fetch(this.SERVER_FILE_API_PATH + dataIndexDirectoryPath + dataIndex.geoJSONUrl);
      const geoJSONData = (await response.json()) as GeoJSONData;
      const layerIds = geoJSONData.features.map(({ properties }) => properties.id);
      for (const id of layerIds) {
        const layerDataUrl = dataIndex.dataUrlTemplate.replace('{VARIABLE}', layerInfo.variable).replace('{GRANULARITY}', 'monthly').replace('{ID}', id);
        let response = await fetch(this.SERVER_FILE_API_PATH + dataIndexDirectoryPath + layerDataUrl);
        const layerDataForId = await response.json();
        this.layerData[id] = layerDataForId;

        const layerMetadataUrl = dataIndex.metadataUrlTemplate.replace('{ID}', id);
        response = await fetch(this.SERVER_FILE_API_PATH + dataIndexDirectoryPath + layerMetadataUrl);
        const layerMetadataForId = await response.json();
        this.layerMetadata[id] = layerMetadataForId;
      }
      const layer = leaflet.geoJSON(geoJSONData, {
        style: ({ properties }) => {
          const averageValue = this.layerData[properties.id].data[data.yearRange[0]][0].average;
          const color = layerInfo.colorMap.find(([min, max]) => averageValue > min && averageValue <= max)?.[2];
          return {
            fillColor: color,
            fillOpacity: 0.5,
          };
        },
        onEachFeature: (feature, layer) => {
          layer.on('click', () => {
            this.sidebarElement.data = { ...this.sidebarElement.data, selectedId: feature.properties.id };
          });
        },
      });
      layer.addTo(this.map);
    });
  }

  private async initializeMap() {
    this.map = leaflet.map(this.mapElement).setView([51.312588, -116.021118], 10);
    this.initializeBaseLayers(this.map, this.data.baseLayers);
    this.map.zoomControl.setPosition('topright');
  }

  private initializeSidebar() {
    const sidebarPlugin = this.data.plugins?.find(plugin => plugin.name === 'Sidebar');
    if (sidebarPlugin) {
      leaflet.Control['Sidebar'] = leaflet.Control.extend({
        onAdd: () => {
          this.sidebarElement = leaflet.DomUtil.create('vis-main-sidebar');
          this.sidebarElement.classList.add('leaflet-control-layers');
          this.sidebarElement.data = { ...sidebarPlugin, layerData: this.layerData, layerMetadata: this.layerMetadata, pluginIndex: this.pluginIndex };
          return this.sidebarElement;
        },
      });
      leaflet.control['sidebar'] = function (opts) {
        return new leaflet.Control['Sidebar'](opts);
      };
      this.sidebar = leaflet.control['sidebar']({ position: 'topleft' });
      this.sidebar.addTo(this.map);
    }
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
    leaflet.control.layers(mapLayerDict).addTo(map);
  }

  private async updatePluginIndex(data: MainData) {
    const response = await fetch(this.SERVER_FILE_API_PATH + data.pluginIndexUrl);
    this.pluginIndex = (await response.json()) as PluginIndex;
  }
}
