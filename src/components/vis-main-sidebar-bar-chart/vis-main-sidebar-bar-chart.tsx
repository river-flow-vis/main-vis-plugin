import { Component, Host, h, ComponentInterface, Prop } from '@stencil/core';
import { SidebarChartData } from '../../utils/data';

@Component({
  tag: 'vis-main-sidebar-bar-chart',
  styleUrl: 'vis-main-sidebar-bar-chart.css',
  shadow: true,
})
export class VisMainSidebarBarChart implements ComponentInterface {

  static readonly TAG_NAME = 'vis-main-sidebar-bar-chart';

  @Prop() data: SidebarChartData;

  render() {
    return (
      <Host>
        <div style={{ height: '10rem', width: '100%' }}>
          <h1>Bar Chart</h1>
          <p>It should show data for ID {this.data?.selectedId}</p>
        </div>
      </Host>
    );
  }

}
