/**
 * Code Runner — Terminal inline
 * Ejecuta JavaScript con output visible debajo del bloque.
 * - Código editable (contenteditable)
 * - Atajo: Cmd/Ctrl + Enter
 * - input() inline en el área de output
 */

(function () {
  'use strict';

  const PROMPT = '$';
  const CMD_PROMPT = '›';
  const LANG_CLASS = /language-(javascript|js)|lang-(javascript|js)/i;

  function isJavaScript(codeEl) {
    if (LANG_CLASS.test(codeEl.className || '')) return true;
    const text = (codeEl.textContent || '').trim();
    if (!text) return false;
    const patterns = [
      /console\.(log|error|warn)/,
      /function\s+\w+\s*\(/,
      /\b(const|let|var)\s+\w+\s*=/,
      /=>/,
      /\.(map|filter|reduce|forEach)\s*\(/,
      /\bif\s*\(/,
      /\bwhile\s*\(/,
      /\bfor\s*\(/,
      /\breturn\s+/,
    ];
    return patterns.some((p) => p.test(text));
  }

  function detectLang(codeEl) {
    const cls = codeEl.className || '';
    const m = cls.match(/(?:language|lang)-(\w+)/);
    if (m) {
      const raw = m[1].toLowerCase();
      return raw === 'javascript' ? 'js' : raw;
    }
    return 'js';
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function buildTerminal(codeEl) {
    const pre = codeEl.closest('pre');
    if (!pre) return null;

    const originalCode = codeEl.textContent || '';
    const originalHtml = codeEl.innerHTML.trim();

    const wrapper = document.createElement('div');
    wrapper.className = 'term';
    wrapper.dataset.state = 'idle';

    const header = document.createElement('div');
    header.className = 'term__bar';
    const lang = detectLang(codeEl);
    header.innerHTML = `
      <span class="term__dots" aria-hidden="true"><span></span><span></span><span></span></span>
      <span class="term__title">snippet</span>
      <span class="term__lang">${escapeHtml(lang)}</span>
      <span class="term__actions">
        <button type="button" class="term__btn term__btn--run" data-action="run">run</button>
        <button type="button" class="term__btn term__btn--reset" data-action="reset" title="restaurar">↺</button>
      </span>
    `;

    // Code section
    const codeSection = document.createElement('section');
    codeSection.className = 'term__section term__section--code';
    const codeLabel = document.createElement('span');
    codeLabel.className = 'term__label';
    codeLabel.textContent = 'code';
    const editor = document.createElement('div');
    editor.className = 'term__editor highlight';
    editor.setAttribute('contenteditable', 'true');
    editor.setAttribute('spellcheck', 'false');
    editor.setAttribute('autocapitalize', 'off');
    editor.setAttribute('autocomplete', 'off');
    editor.setAttribute('autocorrect', 'off');
    editor.setAttribute('data-gramm', 'false');
    editor.setAttribute('data-gramm_editor', 'false');
    editor.setAttribute('data-enable-grammarly', 'false');
    editor.innerHTML = originalHtml;
    codeSection.appendChild(codeLabel);
    codeSection.appendChild(editor);

    // Input section (hidden by default)
    const inputSection = document.createElement('section');
    inputSection.className = 'term__section term__section--input';
    inputSection.hidden = true;
    const inputLabel = document.createElement('span');
    inputLabel.className = 'term__label';
    inputLabel.textContent = 'input';
    const inputForm = document.createElement('div');
    inputForm.className = 'term__form';
    inputSection.appendChild(inputLabel);
    inputSection.appendChild(inputForm);

    // Output section
    const outputSection = document.createElement('section');
    outputSection.className = 'term__section term__section--output';
    const outputLabel = document.createElement('span');
    outputLabel.className = 'term__label';
    outputLabel.textContent = 'output';
    const output = document.createElement('div');
    output.className = 'term__output';
    output.setAttribute('role', 'log');
    output.setAttribute('aria-live', 'polite');
    outputSection.appendChild(outputLabel);
    outputSection.appendChild(output);

    wrapper.appendChild(header);
    wrapper.appendChild(codeSection);
    wrapper.appendChild(inputSection);
    wrapper.appendChild(outputSection);

    const container = pre.closest('figure.highlight') || pre;
    container.parentNode.insertBefore(wrapper, container);
    container.remove();

    return { wrapper, editor, inputSection, inputForm, output, originalCode, originalHtml };
  }

  function appendLine(output, text, kind) {
    const line = document.createElement('div');
    line.className = 'term__line';
    if (kind) line.classList.add('term__line--' + kind);
    if (text === '[CLEAR]') {
      while (output.firstChild) output.removeChild(output.firstChild);
      return;
    }
    line.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function appendPrompt(output, label) {
    const line = document.createElement('div');
    line.className = 'term__line term__line--prompt';
    line.innerHTML =
      `<span class="term__ps1">${PROMPT}</span> ` +
      `<span class="term__cmd">${escapeHtml(label)}</span>`;
    output.appendChild(line);
  }

  function setState(wrapper, state) {
    wrapper.dataset.state = state;
  }

  function askInputs(prompts, inputForm, inputSection, onReady) {
    const inputs = new Array(prompts.length).fill(null);
    let i = 0;

    const renderStep = () => {
      if (i >= prompts.length) {
        onReady(inputs);
        return;
      }
      inputSection.hidden = false;

      const label = document.createElement('label');
      label.className = 'term__field';
      label.innerHTML =
        `<span class="term__ps1">${CMD_PROMPT}</span> ` +
        `<span class="term__field-label">${escapeHtml(prompts[i])}</span>` +
        `<input type="text" class="term__input" autocomplete="off" autocorrect="off" spellcheck="false" />`;
      inputForm.appendChild(label);
      const input = label.querySelector('input');

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const value = input.value;
          inputs[i] = value;
          label.classList.add('term__field--filled');
          input.disabled = true;
          i++;
          renderStep();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          inputForm.innerHTML = '';
          inputSection.hidden = true;
          onReady(null);
        }
      });
      setTimeout(() => input.focus(), 0);
    };

    renderStep();
  }

  /*
   * Guard: si hay inputs numéricos muy grandes, mostramos una confirmación
   * inline antes de ejecutar. Evita que un valor tipo 1000×1000×100 cuelgue
   * el navegador.
   */
  const MAX_INPUT_VALUE = 500;

  function showConfirm(output, message, onYes, onNo) {
    const wrap = document.createElement('div');
    wrap.className = 'term__confirm';
    const line = document.createElement('div');
    line.className = 'term__line term__line--warn';
    line.textContent = message;
    wrap.appendChild(line);
    const buttons = document.createElement('div');
    buttons.className = 'term__confirm-actions';
    buttons.innerHTML = `
      <button type="button" class="term__btn term__btn--yes" data-confirm="yes">sí, continuar</button>
      <button type="button" class="term__btn term__btn--no" data-confirm="no">no, abortar</button>
    `;
    wrap.appendChild(buttons);
    output.appendChild(wrap);

    buttons.querySelector('[data-confirm="yes"]').addEventListener('click', () => {
      wrap.remove();
      onYes();
    });
    buttons.querySelector('[data-confirm="no"]').addEventListener('click', () => {
      wrap.remove();
      onNo();
    });
  }

  function runCode(term) {
    const { wrapper, editor, inputSection, inputForm, output, originalCode } = term;
    const code = editor.innerText.replace(/\u00a0/g, ' ');

    setState(wrapper, 'running');

    while (output.firstChild) output.removeChild(output.firstChild);
    inputForm.innerHTML = '';
    inputSection.hidden = true;
    appendPrompt(output, 'run');

    const prompts = [];
    const re = /\b(?:input|prompt)\(\s*(['"`])([^'"`]+)\1\s*\)/g;
    let m;
    while ((m = re.exec(code)) !== null) {
      prompts.push(m[2]);
    }

    const finish = (values) => {
      if (values === null) {
        appendLine(output, '— cancelado', 'meta');
        setState(wrapper, 'idle');
        inputSection.hidden = true;
        inputForm.innerHTML = '';
        return;
      }

      // Guard de inputs extremos
      const extreme = values
        .map((v, idx) => ({ idx, n: parseInt(v, 10), raw: v }))
        .filter((x) => /^-?\d+$/.test(x.raw) && !isNaN(x.n) && Math.abs(x.n) > MAX_INPUT_VALUE);

      if (extreme.length > 0) {
        const list = extreme.map((x) => `prompt[${x.idx}]=${x.n}`).join(', ');
        const msg =
          `⚠ valor${extreme.length > 1 ? 'es' : ''} grande${extreme.length > 1 ? 's' : ''}: ${list} ` +
          `(max recomendado ${MAX_INPUT_VALUE}). ` +
          `Puede congelar el navegador o producir mucho output.`;
        showConfirm(
          output,
          msg,
          () => execute(code, output, values, () => setState(wrapper, 'idle')),
          () => {
            appendLine(output, '— cancelado', 'meta');
            setState(wrapper, 'idle');
          }
        );
        return;
      }

      execute(code, output, values, () => setState(wrapper, 'idle'));
    };

    if (prompts.length > 0) {
      askInputs(prompts, inputForm, inputSection, finish);
    } else {
      finish([]);
    }
  }

  /*
   * Cap de output: tope de 500K chars en total para que el DOM no se infle
   * y congele el navegador. Una vez alcanzado, dejamos de aceptar más output
   * y dejamos un aviso.
   */
  const MAX_OUTPUT_CHARS = 500000;
  const MAX_LINE_CHARS = 50000;

  function execute(code, output, inputValues, onDone) {
    let index = 0;
    let buf = [];
    let scheduled = false;
    let done = false;
    let outputChars = 0;
    let truncated = false;

    const flush = () => {
      scheduled = false;
      if (buf.length === 0) return;
      const chunk = buf;
      buf = [];
      chunk.forEach((entry) => appendLine(output, entry.text, entry.kind));
    };

    const queue = (text, kind) => {
      if (truncated) return;

      let safeText = String(text);
      if (safeText.length > MAX_LINE_CHARS) {
        safeText = safeText.slice(0, MAX_LINE_CHARS) + '\n[… truncado …]';
      }

      if (outputChars + safeText.length > MAX_OUTPUT_CHARS) {
        truncated = true;
        buf.push({
          text: `— output truncado (límite ${MAX_OUTPUT_CHARS} chars alcanzado) —`,
          kind: 'meta'
        });
        if (!scheduled) {
          scheduled = true;
          Promise.resolve().then(flush);
        }
        return;
      }

      outputChars += safeText.length;
      buf.push({ text: safeText, kind });
      if (!scheduled) {
        scheduled = true;
        Promise.resolve().then(flush);
      }
    };

    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const fmt = (args) =>
      args
        .map((a) => {
          if (typeof a === 'string') return a;
          try {
            return JSON.stringify(a);
          } catch (_) {
            return String(a);
          }
        })
        .join(' ');

    console.log = function () {
      const text = fmt(arguments);
      originalLog.apply(console, arguments);
      queue(text, 'log');
    };
    console.error = function () {
      const text = fmt(arguments);
      originalError.apply(console, arguments);
      queue(text, 'error');
    };
    console.warn = function () {
      const text = fmt(arguments);
      originalWarn.apply(console, arguments);
      queue(text, 'warn');
    };

    const inputFn = (label) => {
      if (index >= inputValues.length) {
        throw new Error('No hay más valores de input. Se esperaban ' + inputValues.length + '.');
      }
      return inputValues[index++];
    };

    const outputFn = (content) => {
      if (content === '[CLEAR]') {
        while (output.firstChild) output.removeChild(output.firstChild);
        return;
      }
      queue(String(content), 'log');
    };

    const restore = () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };

    const finishSafely = () => {
      if (done) return;
      done = true;
      flush();
      restore();
      if (typeof onDone === 'function') onDone();
    };

    try {
      const fn = new Function('input', 'output', 'console', code);
      const result = fn(inputFn, outputFn, console);
      if (result !== undefined) {
        const text = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
        appendLine(output, text, 'result');
      }
      finishSafely();
    } catch (err) {
      appendLine(output, err && err.message ? err.message : String(err), 'error');
      finishSafely();
    }
  }

  function resetCode(term) {
    term.editor.innerHTML = term.originalHtml;
    term.inputForm.innerHTML = '';
    term.inputSection.hidden = true;
    while (term.output.firstChild) term.output.removeChild(term.output.firstChild);
    appendPrompt(term.output, '— listo —');
    setState(term.wrapper, 'idle');
  }

  function bind(term) {
    const { wrapper, editor } = term;

    wrapper.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'run') runCode(term);
      if (action === 'reset') resetCode(term);
    });

    editor.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode(term);
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('insertText', false, '  ');
      }
    });

    editor.addEventListener('focus', () => wrapper.classList.add('is-focused'));
    editor.addEventListener('blur', () => wrapper.classList.remove('is-focused'));
  }

  function init() {
    const scope = document.querySelector('.codigo-page') || document.body;
    const blocks = scope.querySelectorAll('pre code');
    blocks.forEach((codeEl) => {
      if (!isJavaScript(codeEl)) return;
      if (codeEl.closest('.term')) return;
      const term = buildTerminal(codeEl);
      if (term) {
        bind(term);
        appendPrompt(term.output, '— listo —');
      }
    });
  }

  function start() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(init, 0));
    } else {
      init();
    }
    window.addEventListener('load', () => setTimeout(init, 50));
  }

  start();
})();
