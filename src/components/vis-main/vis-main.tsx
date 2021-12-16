import { Component, Host, h, Prop, ComponentInterface, Watch } from '@stencil/core';
import leaflet from 'leaflet';
import { BaseLayer, MainData } from '../../utils/data';
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

  @Prop() data: MainData = mockData;

  @Watch('data')
  dataChanged(data: MainData) {
    this.initializeOverlayLayers(data);
  }

  componentDidLoad() {
    if (!this.map) {
      this.initializeMap();
      this.initializeOverlayLayers(this.data);
      this.initializeSidebar();
    }
  }

  render() {
    return (
      <Host>
        <div id="map" ref={el => this.mapElement = el}></div>
      </Host>
    );
  }

  private initializeOverlayLayers(data: MainData) {
    data.overlayLayers.forEach(layer => {
      const l = leaflet.geoJSON(layer.geoJSONData, {
        style: { fillOpacity: .5 },
        onEachFeature: (feature, layer) => {
          layer.on('click', () => {
            this.sidebarElement.data = { ...this.sidebarElement.data, selectedId: feature.properties.id }
          })
        }
      });
      l.addTo(this.map);
    });
  }

  private async initializeMap() {
    this.map = leaflet
      .map(this.mapElement)
      .setView([51.312588, -116.021118], 10);
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
          this.sidebarElement.data = { plugins: sidebarPlugin.plugins };
          return this.sidebarElement;
        }
      });
      leaflet.control['sidebar'] = function (opts) {
        return new leaflet.Control['Sidebar'](opts);
      };
      this.sidebar = leaflet.control['sidebar']({ position: 'topleft' });
      this.sidebar.addTo(this.map);
    }
  }

  private initializeBaseLayers(map: leaflet.Map, baseLayers: BaseLayer[]) {
    const attribution = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
    const urlTemplate = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    const attributionSetelitte = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    const urlTemplateSatelitte = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    const mapLayerDict: { [name: string]: leaflet.TileLayer; } = {};
    if (baseLayers.includes('Grayscale')) {
      mapLayerDict['Grayscale'] = leaflet.tileLayer(
        urlTemplate,
        {
          id: 'mapbox/light-v9',
          tileSize: 512,
          zoomOffset: -1,
          attribution: attribution
        }
      );
    }
    if (baseLayers.includes('Streets')) {
      mapLayerDict['Streets'] = leaflet.tileLayer(
        urlTemplate,
        {
          id: 'mapbox/streets-v11',
          tileSize: 512,
          zoomOffset: -1,
          attribution: attribution
        }
      );
    }
    if (baseLayers.includes('Satelitte')) {
      mapLayerDict['Satelitte'] = leaflet.tileLayer(
        urlTemplateSatelitte,
        {
          id: 'mapbox.streets',
          attribution: attributionSetelitte
        }
      );
    }
    mapLayerDict[baseLayers[0]]?.addTo(map);
    leaflet.control.layers(mapLayerDict).addTo(map);
  }
}
