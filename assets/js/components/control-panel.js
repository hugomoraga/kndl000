import { html, css, LitElement } from 'https://cdn.skypack.dev/lit';

class ControlPanel extends LitElement {
  static styles = css`
    :host {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.8);
      padding: 10px;
      border-radius: 8px;
      color: white;
    }
    label, select, input, button {
      display: block;
      margin-bottom: 8px;
    }
  `;

  render() {
    return html`
      <label>Nota base:
        <select id="note">
          <option>C</option><option>D</option><option>E</option>
        </select>
      </label>
      <label>Modo:
        <select id="mode">
          <option value="major">Mayor</option>
          <option value="minor">Menor</option>
        </select>
      </label>
      <label>BPM:
        <input type="range" id="bpm" min="60" max="180" value="128">
      </label>
      <button @click=${() => this.dispatchEvent(new CustomEvent('start-audio'))}>Start</button>
      <button @click=${() => this.dispatchEvent(new CustomEvent('stop-audio'))}>Stop</button>
    `;
  }

  get settings() {
    return {
      root: this.renderRoot.querySelector('#note')?.value || 'C',
      mode: this.renderRoot.querySelector('#mode')?.value || 'major',
      bpm: parseInt(this.renderRoot.querySelector('#bpm')?.value) || 128
    };
  }
}

customElements.define('control-panel', ControlPanel);
