import { Component, Host, h, ComponentInterface, Prop, State } from '@stencil/core';
import { Line } from 'chartist';
import { LongbarLineChartData } from '../../utils/data';

@Component({
  tag: 'vis-main-longbar-line-chart',
  styleUrl: 'vis-main-longbar-line-chart.css',
  shadow: true,
})
export class VisMainLongbarLineChart implements ComponentInterface {
  static readonly TAG_NAME = 'vis-main-longbar-line-chart';

  @Prop() data: LongbarLineChartData;

  @State() variable: string | number;

  render() {
    return (
      <Host>
        <div>{this.data?.title}</div>
        <select onChange={({ currentTarget }) => (this.variable = (currentTarget as HTMLSelectElement).value)}>
          {this.data?.variables?.map(variable => (
            <option value={variable}>{variable}</option>
          ))}
        </select>
        <div
          ref={el => {
            const variableAndTimeSeriesDataDicts = this.obtainVariableAndTimeSeriesDataDictForLocations();
            const data = variableAndTimeSeriesDataDicts?.map(dict =>
              Object.entries(dict[this.variable || this.data?.variables?.[0]] || {}).flatMap(([year, yearData]) =>
                Object.entries(yearData || {}).map(([timestamp, data]) => ({ year: +year, timestamp: +timestamp, value: data.average })),
              ),
            );
            const labels = data?.[0]?.map(({ year, timestamp }) => `${year}-${timestamp}`),
              series = data?.map(d => d.map(({ value }) => value));
            const lineChart = new Line(
              el,
              {
                labels,
                series,
              },
              {
                axisX: {
                  labelInterpolationFnc: value => (value.split('-')?.[1] === '0' ? value.split('-')?.[0] : ''),
                },
              },
            );
            lineChart.on('draw', context => {
              if (context.type === 'line' || context.type === 'point') {
                context.element.attr({
                  style: `stroke: ${[...this.data?.idAndColorMap.values()]?.[context.seriesIndex]}`,
                });
              }
            });
          }}
        ></div>
      </Host>
    );
  }

  private obtainVariableAndTimeSeriesDataDictForLocations() {
    return [...this.data?.idAndColorMap?.keys()]?.map(id => this.obtainVariableAndTimeSeriesDataDict(id));
  }

  private obtainVariableAndTimeSeriesDataDict(id: string | number) {
    const variableAndDataDict = this.data?.variables
      ? Object.fromEntries(
          [...this.data?.layerDataMap?.entries()].filter(([layer]) => this.data?.variables.includes(layer.variable)).map(([layer, data]) => [layer.variable, data]),
        )
      : Object.fromEntries([]);
    const variableAndTimeSeriesDataDict = Object.fromEntries(
      Object.entries(variableAndDataDict).map(([variable, data]) => {
        let timeSeriesData = data?.[id]?.data;
        const minYear = this.data?.yearRange?.[0];
        const maxYear = this.data?.yearRange?.[1];
        timeSeriesData = Object.fromEntries(Object.entries(timeSeriesData || {}).filter(([year]) => (!minYear || minYear <= +year) && (!maxYear || maxYear >= +year)));
        return [variable, timeSeriesData];
      }),
    );
    return variableAndTimeSeriesDataDict;
  }
}
