import { Component, Host, h, ComponentInterface, State } from '@stencil/core';

@Component({
  tag: 'vis-main-sidebar',
  styleUrl: 'vis-main-sidebar.css',
  shadow: true,
})
export class VisMainSidebar implements ComponentInterface {

  @State() collapsed = true;

  render() {
    return (
      <Host>
        <div id="left-section">
          <button
            id="collapse-toggle-button"
            onClick={() => this.collapsed = !this.collapsed}
          >&#9776;</button>
        </div>
        <div id="right-section" class={this.collapsed ? 'collapsed' : ''}>
          <span id="header">Info</span>
        </div>
      </Host>
    );
  }

}
