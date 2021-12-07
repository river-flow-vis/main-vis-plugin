import { Component, Host, h, Prop, ComponentInterface } from '@stencil/core';
import leaflet from 'leaflet';

@Component({
  tag: 'vis-main',
  styleUrl: 'vis-main.css',
  shadow: true,
})
export class VisMain implements ComponentInterface {

  static readonly TAG_NAME = 'vis-main';

  private mapElement: HTMLDivElement;

  @Prop() data: any;

  componentDidLoad() {
    this.initializeMap();
  }

  render() {
    return (
      <Host>
        <div id="map" ref={el => this.mapElement = el}></div>
      </Host>
    );
  }

  private async initializeMap() {
    const attribution = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
    const urlTemplate = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    const attributionSetelitte = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    const urlTemplateSatelitte = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    const mapLayerDict: { [name: string]: leaflet.TileLayer; } = {};
    mapLayerDict["Grayscale"] = leaflet.tileLayer(
      urlTemplate,
      {
        id: 'mapbox/light-v9',
        tileSize: 512,
        zoomOffset: -1,
        attribution: attribution
      }
    );
    mapLayerDict["Streets"] = leaflet.tileLayer(
      urlTemplate,
      {
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        attribution: attribution
      }
    );
    mapLayerDict["Satelitte"] = leaflet.tileLayer(
      urlTemplateSatelitte,
      {
        id: 'mapbox.streets',
        attribution: attributionSetelitte
      }
    );
    const map = leaflet
      .map(this.mapElement)
      .setView([51.312588, -116.021118], 10);
    mapLayerDict['Grayscale'].addTo(map);
    leaflet.control.layers(mapLayerDict).addTo(map);
    map.zoomControl.setPosition('topright');

    leaflet.Control['Sidebar'] = leaflet.Control.extend({
      onAdd: () => {
        var sidebarElement = leaflet.DomUtil.create('vis-main-sidebar');
        sidebarElement.classList.add('leaflet-control-layers');
        return sidebarElement;
      }
    });
    leaflet.control['sidebar'] = function (opts) {
      return new leaflet.Control['Sidebar'](opts);
    }
    leaflet.control['sidebar']({ position: 'topleft' }).addTo(map);
  }

}
