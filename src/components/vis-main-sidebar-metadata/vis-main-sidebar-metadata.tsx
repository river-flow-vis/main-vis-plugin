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
        <vis-main-collapse>
          <h3 slot="header">Metadata</h3>
          <div style={{ height: '10rem', width: '100%' }}>
            {Object.entries(this.data.layerMetadataMap?.get(this.data?.selection?.layer)?.[this.data?.selection?.id]?.data || {}).map(([key, value]) => (
              <span>
                {key}: {value}
                <br />
              </span>
            ))}
          </div>
        </vis-main-collapse>
      </Host>
    );
  }
}
