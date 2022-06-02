import { Component, Host, h, ComponentInterface, Prop } from '@stencil/core';
import { Line } from 'chartist';
import { SidebarChartData } from '../../utils/data';

@Component({
  tag: 'vis-main-sidebar-line-chart',
  styleUrl: 'vis-main-sidebar-line-chart.css',
  shadow: true,
})
export class VisMainSidebarLineChart implements ComponentInterface {
  static readonly TAG_NAME = 'vis-main-sidebar-line-chart';

  @Prop() data: SidebarChartData;

  componentDidLoad() {}

  render() {
    return (
      <Host>
        <vis-main-collapse>
          <div slot="header">{this.data?.title}</div>
          <div
            ref={el => {
              const variableAndTimeSeriesDataDict = this.obtainVariableAndTimeSeriesDataDict();
              const data = Object.fromEntries(
                Object.entries(variableAndTimeSeriesDataDict || {})?.map(([variable, variableData]) => [
                  variable,
                  Object.entries(variableData || {}).flatMap(([year, yearData]) =>
                    Object.entries(yearData || {}).map(([timestamp, data]) => ({ year: +year, timestamp: +timestamp, value: data.average })),
                  ),
                ]),
              );
              setTimeout(() => {
                new Line(
                  el,
                  {
                    labels: Object.values(data)?.[0]?.map(({ year, timestamp }) => `${year}-${timestamp}`),
                    series: Object.values(data)?.map(d => d.map(({ value }) => value)),
                  },
                  {
                    axisX: {
                      labelInterpolationFnc: value => (value.split('-')?.[1] === '0' ? value.split('-')?.[0] : ''),
                    },
                  },
                );
              }, 100 /* TODO this is a temp fix */);
            }}
          ></div>
        </vis-main-collapse>
      </Host>
    );
  }

  private obtainVariableAndTimeSeriesDataDict() {
    const variableAndDataDict = this.data?.variables
      ? Object.fromEntries(
          [...this.data?.layerDataMap?.entries()].filter(([layer]) => this.data?.variables.includes(layer.variable)).map(([layer, data]) => [layer.variable, data]),
        )
      : Object.fromEntries([[this.data?.selection.layer.variable, this.data?.layerDataMap?.get(this.data?.selection?.layer)]]);
    const variableAndTimeSeriesDataDict = Object.fromEntries(
      Object.entries(variableAndDataDict).map(([variable, data]) => {
        let timeSeriesData = data?.[this.data?.selection?.id]?.data;
        const minYear = this.data?.yearRange?.[0];
        const maxYear = this.data?.yearRange?.[1];
        timeSeriesData = Object.fromEntries(Object.entries(timeSeriesData || {}).filter(([year]) => (!minYear || minYear <= +year) && (!maxYear || maxYear >= +year)));
        return [variable, timeSeriesData];
      }),
    );
    return variableAndTimeSeriesDataDict;
  }
}
