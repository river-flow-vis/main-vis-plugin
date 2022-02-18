import { Component, Host, h, ComponentInterface, Prop, Element } from '@stencil/core';
import { SidebarData } from '../../utils/data';

@Component({
  tag: 'vis-main-longbar',
  styleUrl: 'vis-main-longbar.css',
  shadow: true,
})
export class VisMainLongbar implements ComponentInterface {
  private containerElement: HTMLDivElement;

  @Prop() data: SidebarData;

  componentDidUpdate() {
    this.updatePlgin();
  }

  render() {
    return (
      <Host>
        <div ref={el => (this.containerElement = el)}></div>
      </Host>
    );
  }

  private updatePlgin() {
    this.containerElement.innerHTML = '';
    const plugin = this.data?.plugins?.[0];
    const pluginTagName = this.data?.pluginIndex?.[plugin?.name]?.tagName;
    if (pluginTagName) {
      const pluginElement = document.createElement(pluginTagName);
      (pluginElement as any).data = {
        ...plugin,
        selection: this.data.selection,
        layerDataMap: this.data.layerDataMap,
        layerMetadataMap: this.data.layerMetadataMap,
        yearRange: this.data.yearRange,
      };
      const containerElement = document.createElement('div');
      containerElement.classList.toggle('chart-container', true);
      containerElement.appendChild(pluginElement);
      this.containerElement.appendChild(containerElement);
    }
  }
}
