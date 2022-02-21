import { Component, Host, h, ComponentInterface, Prop, Element } from '@stencil/core';
import { LegendData } from '../../utils/data';

@Component({
  tag: 'vis-main-legend',
  styleUrl: 'vis-main-legend.css',
  shadow: true,
})
export class VisMainLegend implements ComponentInterface {
  static readonly TAG_NAME = 'vis-main-legend';

  @Element() hostElement: HTMLVisMainLegendElement;

  @Prop() data: LegendData;

  render() {
    if (this.data?.width) {
      this.hostElement.style.setProperty('--width', this.data.width);
    }
    return (
      <Host>
        <div style={{ padding: '1rem' }}>
          <h3>{this.data.variable}</h3>
          {this.data.colorMap?.map(([min, max, color, name]) => (
            <div>
              <div style={{ height: '1em', width: '1em', background: color, display: 'inline-block', marginRight: '1em' }}></div>
              {name || `${min} to ${max}`}
            </div>
          ))}
        </div>
      </Host>
    );
  }
}
