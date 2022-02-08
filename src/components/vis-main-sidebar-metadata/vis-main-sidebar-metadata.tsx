import { Component, Host, h, ComponentInterface, Prop } from '@stencil/core';
import { SidebarMetadataData } from '../../utils/data';

@Component({
  tag: 'vis-main-sidebar-metadata',
  styleUrl: 'vis-main-sidebar-metadata.css',
  shadow: true,
})
export class VisMainSidebarMetadata implements ComponentInterface {
  static readonly TAG_NAME = 'vis-main-sidebar-metadata';

  @Prop() data: SidebarMetadataData;

  render() {
    return (
      <Host>
        <div style={{ height: '10rem', width: '100%' }}>
          <h3>Metadata</h3>
          {Object.entries(this.data.layerMetadataMap?.get(this.data?.selection?.layer)?.[this.data?.selection?.id]?.data || {}).map(([key, value]) => (
            <span>
              {key}: {value}
              <br />
            </span>
          ))}
        </div>
      </Host>
    );
  }
}
