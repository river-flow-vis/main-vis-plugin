import { Component, Host, h, ComponentInterface, Prop } from '@stencil/core';
import { SidebarChartData } from '../../utils/data';

@Component({
  tag: 'vis-main-sidebar-line-chart',
  styleUrl: 'vis-main-sidebar-line-chart.css',
  shadow: true,
})
export class VisMainSidebarLineChart implements ComponentInterface {
  static readonly TAG_NAME = 'vis-main-sidebar-line-chart';

  @Prop() data: SidebarChartData;

  render() {
    const timeSeriesData = this.data.layerData?.[this.data.selectedId]?.data;
    const timeSeriesDataArray = Object.entries(timeSeriesData || {}).flatMap(([year, yearData]) =>
      Object.entries(yearData || {}).map(([timestamp, data]) => ({
        year,
        month: +timestamp + 1,
        value: data.average,
      })),
    );
    const timeSeriesDataCount = timeSeriesDataArray.length;
    const svgSize = 100;
    const perservedHeight = 5;
    const perservedWidth = 5;
    const barWidth = (svgSize - perservedWidth * 2) / timeSeriesDataCount;
    const timeSeriesValues = timeSeriesDataArray.map(d => d.value);
    const minValue = Math.min(...timeSeriesValues);
    const maxValue = Math.max(...timeSeriesValues);

    const points = timeSeriesDataArray.map(({ value }, i) => [
      i * barWidth + barWidth / 2 + perservedWidth,
      (svgSize - perservedHeight * 2) * (value / (maxValue - minValue)) + perservedHeight,
    ]);
    const pathD = `M${points.map(point => point.join(' ')).join(' L')}`;
    return (
      <Host>
        <div style={{ height: '2rem' }}>{this.data.title || 'Line Chart'}</div>
        <svg height="100%" width="calc(100% - 2rem)" viewBox={`0 0 ${svgSize} ${svgSize}`} preserveAspectRatio="xMidYMid meet">
          {points?.length && (
            <g>
              <path d={pathD} fill="none" stroke="black" stroke-width={.5} />
              <g>
                {points.map(([x, y], i) => (
                  <circle cx={x} cy={y} r={1}>
                    <title>{`${timeSeriesDataArray[i].year}/${timeSeriesDataArray[i].month}: ${timeSeriesDataArray[i].value}`}</title>
                  </circle>
                ))}
              </g>
            </g>
          )}
        </svg>
      </Host>
    );
  }
}
