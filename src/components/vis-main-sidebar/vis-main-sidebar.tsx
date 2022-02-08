import { Component, Host, h, ComponentInterface, State, Prop, Watch, Element } from '@stencil/core';
import { LayerData, OverlayLayer, SidebarData, SidebarSelection } from '../../utils/data';
import { objectsEqual } from '../../utils/object-equal';

@Component({
  tag: 'vis-main-sidebar',
  styleUrl: 'vis-main-sidebar.css',
  shadow: true,
})
export class VisMainSidebar implements ComponentInterface {
  static readonly TAG_NAME = 'vis-main-sidebar';

  private chartsContainerElement: HTMLDivElement;

  @Element() hostElmenet: HTMLVisMainElement;

  @Prop() data: SidebarData;
  @Prop() pins: SidebarSelection[] = [];

  @Watch('data')
  dataChanged(data: SidebarData) {
    if (data.width) {
      this.hostElmenet.style.setProperty('--width', data.width);
    }
    this.updatePlugins(data);
    if (data.selection) {
      this.collapsed = false;
    }
  }

  @State() collapsed = true;

  componentDidRender() {
    this.updatePlugins(this.data);
  }

  render() {
    return (
      <Host>
        <div id="left-section">
          <button onClick={() => (this.collapsed = !this.collapsed)}>&#9776;</button>
          {this.pins?.map(pin => (
            <button
              class={objectsEqual(this.data?.selection, pin) ? 'selected' : ''}
              title={`${pin?.layer?.name},${pin?.id}`}
              onClick={() => this.data?.updateSelection(pin)}
              onContextMenu={event => {
                event.preventDefault();
                this.pins = this.pins.filter(p => p !== pin);
              }}
            >
              📍
            </button>
          ))}
          <button onClick={() => (this.pins = [...this.pins, this.data?.selection])}>+</button>
        </div>
        <div id="right-section" class={this.collapsed ? 'collapsed' : ''}>
          <span id="header">Info for {this.data.selectedId || 'no selected ID'}</span>
          <div id="charts-container" ref={el => (this.chartsContainerElement = el)}></div>
        </div>
      </Host>
    );
  }

  private updatePlugins(data: SidebarData) {
    this.chartsContainerElement.innerHTML = '';
    data.plugins?.forEach(plugin => {
      const pluginTagName = this.data.pluginIndex?.[plugin.name]?.tagName;
      if (pluginTagName) {
        const pluginElement = document.createElement(pluginTagName);
        (pluginElement as any).data = {
          ...plugin,
          selection: data.selection,
          layerDataMap: data.layerDataMap,
          layerMetadataMap: data.layerMetadataMap,
        };
        const containerElement = document.createElement('div');
        containerElement.classList.toggle('chart-container', true);
        containerElement.appendChild(pluginElement);
        this.chartsContainerElement.appendChild(containerElement);
      }
    });
  }
}
