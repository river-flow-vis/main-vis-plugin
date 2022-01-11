import { Component, Host, h, ComponentInterface, Prop, State, Watch } from '@stencil/core';
import { TimeControlData } from '../../utils/data';

const MS_IN_SECOND = 1000;

@Component({
  tag: 'vis-main-time-control',
  styleUrl: 'vis-main-time-control.css',
  shadow: true,
})
export class VisMainTimeControl implements ComponentInterface {
  static readonly TAG_NAME = 'vis-main-legend';

  private timestamps: { year: string; timestamp: string }[];
  private animationTimer: NodeJS.Timer;

  @State() playing = false;
  @State() timestampsPerSecond = 2;

  @State() timestamp: { year: string; timestamp: string };

  @Watch('timestamp')
  timestampChanged(timestamp: { year: string; timestamp: string }) {
    this.data?.updateTime?.(timestamp?.year, timestamp?.timestamp);
  }

  @Prop() data: TimeControlData;

  @Watch('data')
  dataChanged(data: TimeControlData) {
    const years: string[] = [];
    const yearRange = data?.yearRange;
    for (let i = yearRange?.[0]; i <= yearRange?.[1]; i++) {
      years.push(i.toString());
    }
    this.timestamps = years.flatMap(year => Object.keys(data?.layerData?.[Object.keys(data?.layerData)[0]]?.data[year] || {}).map(timestamp => ({ year, timestamp })));
  }

  componentWillLoad() {
    this.dataChanged(this.data);
    const year = this.data?.yearRange?.[0].toString();
    this.timestamp = { year, timestamp: '0' };
  }

  render() {
    return (
      <Host>
        <h3>{`Year: ${this.timestamp?.year}, Timestamp: ${this.timestamp?.timestamp}`}</h3>
        <input
          id="timestamp-slider"
          type="range"
          min={0}
          max={this.timestamps.length}
          value={this.timestamps.findIndex(t => t.year === this.timestamp.year && t.timestamp === this.timestamp.timestamp)}
          onInput={event => {
            const value = (event.currentTarget as HTMLInputElement).value;
            this.timestamp = this.timestamps[+value];
          }}
        />
        <button
          disabled={this.playing}
          onClick={() => {
            clearInterval(this.animationTimer);
            this.animationTimer = setInterval(() => this.play(), MS_IN_SECOND / this.timestampsPerSecond);
            this.playing = true;
          }}
        >
          Play
        </button>
        <button
          disabled={!this.playing}
          onClick={() => {
            clearInterval(this.animationTimer);
            this.playing = false;
          }}
        >
          Pause
        </button>
        <div>
          <label>Timestamp/Second</label>
          <input type="number" value={this.timestampsPerSecond} onChange={event => (this.timestampsPerSecond = +(event.currentTarget as HTMLInputElement).value)} />
        </div>
      </Host>
    );
  }

  private play() {
    const currentIndex = this.timestamps.indexOf(this.timestamp);
    let nextIndex = currentIndex + 1;
    if (currentIndex >= this.timestamps.length - 1) {
      nextIndex = 0;
    }
    this.timestamp = this.timestamps[nextIndex];
  }
}
