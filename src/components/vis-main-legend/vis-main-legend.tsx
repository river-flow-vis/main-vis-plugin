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
        <vis-main-collapse>
          <b slot="header">{this.data.variable}</b>
          {this.renderLegend()}
        </vis-main-collapse>
      </Host>
    );
  }

  private renderLegend() {
    if (this.data.continuous) {
      const valueColorPairs = this.data.valueColorPairs;
      const min = Math.min(...valueColorPairs.map(([value]) => value));
      const max = Math.max(...valueColorPairs.map(([value]) => value));
      return (
        <div>
          <div
            style={{
              display: 'inline-block',
              height: '1rem',
              width: '100%',
              background: `linear-gradient(to right, ${valueColorPairs?.map(([value, color]) => `${color} ${(value - min) / (max - min) * 100}%`).join(', ')})`,
            }}
          ></div>
          <span style={{ float: 'left' }}>{valueColorPairs?.[0]?.[0]}</span>
          <span style={{ float: 'right' }}>{valueColorPairs?.[valueColorPairs.length - 1]?.[0]}</span>
        </div>
      );
    } else {
      return this.data.colorMap?.map(([min, max, color, name]) => (
        <div>
          <div style={{ height: '1em', width: '1em', background: color, display: 'inline-block', marginRight: '1em' }}></div>
          {name || `${min} to ${max}`}
        </div>
      ));
    }
  }
}
