import { Component, Host, h, ComponentInterface, State, Prop, Watch, Element } from '@stencil/core';
import { SidebarData } from '../../utils/data';

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

  @Watch('data')
  dataChanged(data: SidebarData) {
    if (data.width) {
      this.hostElmenet.style.setProperty('--width', data.width);
    }
    this.updatePlugins(data);
    if (data.selectedId) {
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
          <button id="collapse-toggle-button" onClick={() => (this.collapsed = !this.collapsed)}>
            &#9776;
          </button>
        </div>
        <div id="right-section" class={this.collapsed ? 'collapsed' : ''}>
          <span id="header">Info for {this.data.selectedId || 'no selected ID'}</span>
          <div id="metadata-container">
            <h3>Metadata</h3>
            {Object.entries(this.data.layerMetadata?.[this.data.selectedId]?.data || {}).map(([key, value]) => (
              <span>
                {key}: {value}
                <br />
              </span>
            ))}
          </div>
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
          selectedId: data.selectedId,
          layerData: data.layerData,
          layerMetadata: data.layerMetadata,
        };
        this.chartsContainerElement.appendChild(pluginElement);
      }
    });
  }
}
