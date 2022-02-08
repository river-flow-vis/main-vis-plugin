import { Component, Host, h, ComponentInterface, Prop } from '@stencil/core';
import * as d3 from 'd3';
import { SidebarChartData } from '../../utils/data';

const svgSize = 500;
const axisSize = 10;
const margin = 10;

@Component({
  tag: 'vis-main-sidebar-line-chart',
  styleUrl: 'vis-main-sidebar-line-chart.css',
  shadow: true,
})
export class VisMainSidebarLineChart implements ComponentInterface {
  static readonly TAG_NAME = 'vis-main-sidebar-line-chart';

  private axesGElement: SVGGElement;
  private xAxis: d3.Axis<d3.NumberValue>;
  private yAxis: d3.Axis<d3.NumberValue>;

  @Prop() data: SidebarChartData;

  componentDidRender() {
    this.axesGElement.innerHTML = '';
    d3.select(this.axesGElement)
      .append('g')
      .attr('transform', `translate(0, ${svgSize - margin - axisSize})`)
      .call(this.xAxis);
    d3.select(this.axesGElement)
      .append('g')
      .attr('transform', `translate(${margin + axisSize}, 0)`)
      .call(this.yAxis);
  }

  render() {
    const timeSeriesData = this.data?.layerDataMap?.get(this.data?.selection?.layer)?.[this.data?.selection?.id]?.data;
    const timeSeriesDataArray = Object.entries(timeSeriesData || {}).flatMap(([year, yearData]) =>
      Object.entries(yearData || {}).map(([timestamp, data]) => ({
        year,
        month: +timestamp + 1,
        value: data.average,
      })),
    );
    const timeSeriesValues = timeSeriesDataArray.map(d => d.value);
    const minValue = Math.min(...timeSeriesValues);
    const maxValue = Math.max(...timeSeriesValues);

    const xScale = d3
      .scaleLinear()
      .domain([0, timeSeriesDataArray.length - 1])
      .range([margin + axisSize, svgSize - margin]);
    const yScale = d3
      .scaleLinear()
      .domain([minValue, maxValue])
      .range([svgSize - margin - axisSize, margin]);
    this.xAxis = d3.axisBottom(xScale);
    this.yAxis = d3.axisLeft(yScale);

    const points = timeSeriesDataArray.map(({ value }, i) => [xScale(i), yScale(value)]);
    const pathD = `M${points.map(point => point.join(' ')).join(' L')}`;
    return (
      <Host>
        <div style={{ height: '2rem' }}>{this.data.title || 'Line Chart'}</div>
        <svg height="100%" width="calc(100% - 2rem)" viewBox={`0 0 ${svgSize} ${svgSize}`} preserveAspectRatio="xMidYMid meet">
          {points?.length && (
            <g>
              <path d={pathD} fill="none" stroke="black" stroke-width={2} />
              <g>
                {points.map(([x, y], i) => (
                  <circle cx={x} cy={y} r={3}>
                    <title>{`${timeSeriesDataArray[i].year}/${timeSeriesDataArray[i].month}: ${timeSeriesDataArray[i].value}`}</title>
                  </circle>
                ))}
              </g>
            </g>
          )}
          <g ref={el => (this.axesGElement = el as SVGGElement)}></g>
        </svg>
      </Host>
    );
  }
}
