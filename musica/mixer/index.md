---
layout: default
title: Mixer Generativo
nav: true
nav_order: 5
---

# 🎛️ Mixer Generativo

<div id="mixer-container" style="margin: 2rem 0;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
    <button id="transport-play" style="padding: 0.75rem 2rem; background: #333; color: #fff; border: 1px solid #555; cursor: pointer; font-size: 1rem; min-height: 44px;">▶ Reproducir</button>
    <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <label style="color: #999;">Preset:</label>
        <select id="preset-select" style="padding: 0.5rem; background: #333; color: #fff; border: 1px solid #555; border-radius: 3px; cursor: pointer;">
          <option value="-1">Seleccionar...</option>
        </select>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <label style="color: #999;">BPM:</label>
        <input type="range" id="bpm-control" min="80" max="160" value="120" style="width: 150px;">
        <span id="bpm-value" style="color: #fff; min-width: 40px;">120</span>
      </div>
    </div>
  </div>

  <div id="mixer-channels" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
    <!-- Los canales se generarán dinámicamente -->
  </div>

  <div id="master-controls" style="background: #222; padding: 1.5rem; border: 1px solid #444; border-radius: 4px;">
    <h3 style="margin: 0 0 1rem 0; color: #fff; font-size: 1rem;">Master</h3>
    <div style="display: flex; align-items: center; gap: 1rem;">
      <label style="color: #999; min-width: 60px;">Volumen:</label>
      <input type="range" id="master-volume" min="-20" max="0" value="-4" step="0.5" style="flex: 1;">
      <span id="master-volume-value" style="color: #fff; min-width: 50px;">-4 dB</span>
    </div>
  </div>
</div>

<style>
  .mixer-channel {
    background: #222;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 1rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    width: 100%;
    box-sizing: border-box;
    overflow-x: auto;
    overflow-y: hidden;
    max-width: 100%;
    min-height: 120px;
  }

  .channel-label {
    color: #fff;
    font-size: 0.9rem;
    font-weight: 500;
    text-align: center;
    margin: 0;
    min-width: 80px;
    max-width: 80px;
    flex-shrink: 0;
  }

  .channel-fader-container {
    position: relative;
    width: 50px;
    height: 100px;
    background: #111;
    border: 1px solid #333;
    border-radius: 2px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 4px;
    flex-shrink: 0;
  }

  .channel-fader {
    width: 100%;
    height: 100%;
    writing-mode: vertical-lr;
    direction: rtl;
    background: transparent;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  .channel-fader::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 30px;
    height: 12px;
    background: #666;
    border: 1px solid #888;
    border-radius: 2px;
    cursor: pointer;
  }

  .channel-fader::-moz-range-thumb {
    width: 30px;
    height: 12px;
    background: #666;
    border: 1px solid #888;
    border-radius: 2px;
    cursor: pointer;
  }

  .channel-controls {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
    justify-content: center;
  }

  .channel-btn {
    padding: 0.4rem 0.6rem;
    background: #333;
    color: #fff;
    border: 1px solid #555;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.75rem;
    min-width: 35px;
  }

  .channel-btn:hover {
    background: #444;
  }

  .channel-btn.active {
    background: #666;
  }

  .channel-btn.muted {
    background: #822;
  }

  .channel-btn.solo {
    background: #262;
  }

  .channel-value {
    color: #999;
    font-size: 0.75rem;
    text-align: center;
    min-width: 50px;
    max-width: 50px;
    flex-shrink: 0;
  }

  .channel-effects {
    min-width: 150px;
    max-width: 150px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-left: 1rem;
    border-left: 1px solid #333;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .effect-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    min-width: 0;
  }

  .effect-label {
    color: #999;
    font-size: 0.7rem;
    min-width: 28px;
    max-width: 28px;
    text-align: left;
    flex-shrink: 0;
  }

  .effect-slider {
    flex: 1;
    min-width: 0;
    height: 4px;
    background: #333;
    border-radius: 2px;
    outline: none;
    -webkit-appearance: none;
    max-width: 100%;
  }

  .effect-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    background: #666;
    border: 1px solid #888;
    border-radius: 50%;
    cursor: pointer;
  }

  .effect-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: #666;
    border: 1px solid #888;
    border-radius: 50%;
    cursor: pointer;
  }

  .effect-value {
    color: #999;
    font-size: 0.7rem;
    min-width: 32px;
    max-width: 32px;
    text-align: right;
    flex-shrink: 0;
  }

  .pattern-container {
    flex: 1;
    min-width: 300px;
    max-width: 100%;
    padding-left: 1rem;
    border-left: 2px solid #444;
    box-sizing: border-box;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .pattern-editor {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .pattern-label {
    color: #aaa;
    font-size: 0.7rem;
    margin-bottom: 0.4rem;
    text-align: left;
    font-weight: 500;
  }

  .pattern-steps {
    display: flex;
    flex-direction: row;
    gap: 0.2rem;
    margin-bottom: 0.5rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    flex-wrap: wrap;
  }

  .pattern-step {
    width: 24px;
    height: 24px;
    background: #111;
    border: 1px solid #333;
    border-radius: 3px;
    color: #666;
    font-size: 0.6rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .pattern-step:hover {
    background: #222;
    border-color: #555;
  }

  .pattern-step.active {
    background: #666;
    border-color: #888;
    color: #fff;
  }

  .pattern-step.current {
    border-color: #fff;
    box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
  }

  .pattern-step.active.current {
    background: #888;
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
  }

  .pattern-controls {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-start;
    margin-top: 0.3rem;
  }

  .pattern-btn {
    padding: 0.3rem 0.6rem;
    background: #333;
    color: #fff;
    border: 1px solid #555;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.7rem;
  }

  .pattern-btn:hover {
    background: #444;
  }
</style>

<script src="https://cdn.jsdelivr.net/npm/tone@14.7.77/build/Tone.js"></script>
<!-- Mixer app - usa módulos ES6 -->
<script type="module" src="{{ '/assets/js/features/mixer.js' | relative_url }}"></script>

