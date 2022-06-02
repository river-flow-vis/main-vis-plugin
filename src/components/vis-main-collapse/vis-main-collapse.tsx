import { Component, Host, h, ComponentInterface, Prop } from '@stencil/core';

@Component({
  tag: 'vis-main-collapse',
  styleUrl: 'vis-main-collapse.css',
  shadow: true,
})
export class VisMainCollapse implements ComponentInterface {
  @Prop() collapsed: boolean;

  render() {
    return (
      <Host>
        <input id="collapse-toggle" type="checkbox" checked={this.collapsed} />
        <label part="header" htmlFor="collapse-toggle">
          <slot name="header"></slot>
        </label>
        <div part="content">
          <slot></slot>
        </div>
      </Host>
    );
  }
}
