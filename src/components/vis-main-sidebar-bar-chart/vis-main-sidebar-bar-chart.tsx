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
    const timeSeriesData = this.data?.layerDataMap?.get(this.data?.selection?.layer)?.[this.data?.selection?.id]?.data;
    const timeSeriesDataArray = Object.entries(timeSeriesData || {}).flatMap(([year, yearData]) =>
      Object.entries(yearData || {}).map(([timestamp, data]) => ({
        year,
        month: timestamp + 1,
        value: data.average,
      })),
    );
    const timeSeriesDataCount = timeSeriesDataArray.length;
    const svgSize = 100;
    const barWidth = 100 / timeSeriesDataCount;
    const timeSeriesValues = timeSeriesDataArray.map(d => d.value);
    const minValue = Math.min(...timeSeriesValues);
    const maxValue = Math.max(...timeSeriesValues);

    return (
      <Host>
        <div style={{ height: '2rem' }}>{this.data.title || 'Bar Chart'}</div>
        <svg height="100%" width="calc(100% - 2rem)" viewBox={`0 0 ${svgSize} ${svgSize}`} preserveAspectRatio="xMidYMid meet">
          {timeSeriesDataArray.map(({ year, month, value }, i) => (
            <rect x={i * barWidth} width={barWidth} y={svgSize * (1 - value / (maxValue - minValue))} height={(svgSize * value) / (maxValue - minValue)} fill="blue">
              <title>{`${year}/${month}: ${value}`}</title>
            </rect>
          ))}
        </svg>
      </Host>
    );
  }
}
