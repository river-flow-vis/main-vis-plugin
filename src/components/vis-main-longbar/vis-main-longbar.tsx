import { Component, Host, h, ComponentInterface, Prop, Element, Watch } from '@stencil/core';
import { LongbarData } from '../../utils/data';

@Component({
  tag: 'vis-main-longbar',
  styleUrl: 'vis-main-longbar.css',
  shadow: true,
})
export class VisMainLongbar implements ComponentInterface {
  static readonly TAG_NAME = 'vis-main-longbar';

  private containerElement: HTMLDivElement;

  @Element() hostElement: HTMLVisMainLongbarElement;

  @Prop() data: LongbarData;

  @Watch('data')
  dataChanged(data: LongbarData) {
    if (data.width) {
      this.hostElement.style.setProperty('--width', data.width);
    }
  }

  componentDidUpdate() {
    this.updatePlgin();
  }

  render() {
    return (
      <Host>
        <vis-main-collapse>
          <h3 slot="header">Some header go here</h3>
          <div ref={el => (this.containerElement = el)}></div>
        </vis-main-collapse>
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
        pinAndColorMap: this.data.pinAndColorMap,
      };
      const containerElement = document.createElement('div');
      containerElement.classList.toggle('chart-container', true);
      containerElement.appendChild(pluginElement);
      this.containerElement.appendChild(containerElement);
    }
  }
}
