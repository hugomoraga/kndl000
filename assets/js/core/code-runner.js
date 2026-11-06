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

  /*
   * Detecta si un bloque de código es JavaScript ejecutable.
   * - Si el markdown declara lenguaje explícito (language-c, language-python, etc.),
   *   solo es ejecutable cuando es javascript/js. C, Python, Ruby, etc. no.
   * - Si no hay clase de lenguaje, busca patrones estrictos que sólo aparecen
   *   en JS: `console.log`, `const/let/var =`, `=>`, `.map()`, `function name(`,
   *   `async/await`, `require(`, `import`, `document.`.
   *   Evita falsos positivos con `return`, `if`, `for`, `while` que se
   *   comparten con C/Python.
   */
  function isJavaScript(codeEl) {
    const cls = codeEl.className || '';

    const langMatch = cls.match(/(?:language|lang)-(\w+)/);
    if (langMatch) {
      const lang = langMatch[1].toLowerCase();
      return lang === 'javascript' || lang === 'js';
    }

    return looksLikeJavaScript((codeEl.textContent || '').trim());
  }

  function looksLikeJavaScript(text) {
    if (!text) return false;
    const strictPatterns = [
      /console\.(log|error|warn)/,
      /\b(const|let|var)\s+\w+\s*=/,
      /=>/,
      /\.(map|filter|reduce|forEach|then)\s*\(/,
      /\bfunction\s+\w+\s*\(/,
      /\basync\s+/,
      /\bawait\s+/,
      /\brequire\s*\(/,
      /\bimport\s+/,
      /\bdocument\./,
    ];
    return strictPatterns.some((p) => p.test(text));
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
      <span class="term__title">módulo</span>
      <span class="term__meta">
        <span class="term__lang">${escapeHtml(lang)}</span>
        <span class="term__status-wrap">
          <span class="term__status-dot" aria-hidden="true"></span>
          <span class="term__status">listo</span>
        </span>
      </span>
      <span class="term__steps" hidden>
        <button type="button" class="term__step" data-action="step-code" aria-pressed="false">código</button>
        <button type="button" class="term__step" data-action="step-output" aria-pressed="false">salida</button>
      </span>
      <span class="term__actions">
        <button type="button" class="term__btn term__btn--run" data-action="run">ejecutar</button>
        <button type="button" class="term__btn term__btn--reset" data-action="reset" title="reiniciar">reiniciar</button>
        <button type="button" class="term__btn term__btn--focus" data-action="focus" disabled>enfoque</button>
        <button type="button" class="term__btn term__btn--exit" data-action="close-fs" hidden>salir</button>
      </span>
    `;

    // Code section
    const codeSection = document.createElement('section');
    codeSection.className = 'term__section term__section--code';
    const codeLabel = document.createElement('span');
    codeLabel.className = 'term__label';
    codeLabel.textContent = 'código';
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
    inputLabel.textContent = 'entrada';
    const inputForm = document.createElement('div');
    inputForm.className = 'term__form';
    const inputHead = document.createElement('div');
    inputHead.className = 'term__output-head';
    const inputHint = document.createElement('span');
    inputHint.className = 'term__input-hint';
    inputHint.textContent = 'Esc para volver';
    inputHead.appendChild(inputLabel);
    inputHead.appendChild(inputHint);
    inputSection.appendChild(inputHead);
    inputSection.appendChild(inputForm);

    // Output section
    const outputSection = document.createElement('section');
    outputSection.className = 'term__section term__section--output';
    const outputHead = document.createElement('div');
    outputHead.className = 'term__output-head';
    const outputLabel = document.createElement('span');
    outputLabel.className = 'term__label';
    outputLabel.textContent = 'salida';
    const outputTools = document.createElement('span');
    outputTools.className = 'term__output-tools';
    const topBtn = document.createElement('button');
    topBtn.type = 'button';
    topBtn.className = 'term__tool';
    topBtn.dataset.action = 'output-top';
    topBtn.textContent = 'inicio';
    topBtn.setAttribute('aria-label', 'Ir al inicio de la salida');
    const bottomBtn = document.createElement('button');
    bottomBtn.type = 'button';
    bottomBtn.className = 'term__tool';
    bottomBtn.dataset.action = 'output-bottom';
    bottomBtn.textContent = 'fin';
    bottomBtn.setAttribute('aria-label', 'Ir al final de la salida');
    outputTools.appendChild(topBtn);
    outputTools.appendChild(bottomBtn);
    outputHead.appendChild(outputLabel);
    outputHead.appendChild(outputTools);
    const output = document.createElement('div');
    output.className = 'term__output';
    output.setAttribute('role', 'log');
    output.setAttribute('aria-live', 'polite');
    output.dataset.follow = 'false';
    outputSection.appendChild(outputHead);
    outputSection.appendChild(output);

    outputSection.hidden = true;

    wrapper.appendChild(header);
    wrapper.appendChild(codeSection);
    wrapper.appendChild(inputSection);
    wrapper.appendChild(outputSection);

    const container = pre.closest('figure.highlight') || pre;
    container.parentNode.insertBefore(wrapper, container);
    container.remove();

    return {
      wrapper,
      editor,
      codeSection,
      inputSection,
      inputForm,
      output,
      outputSection,
      steps: header.querySelector('.term__steps'),
      focusBtn: header.querySelector('[data-action="focus"]'),
      exitBtn: header.querySelector('[data-action="close-fs"]'),
      hasOutput: false,
      originalCode,
      originalHtml,
    };
  }

  /*
   * Auto-follow inteligente: solo scrollea al fondo si el usuario YA estaba
   * cerca del fondo antes de agregar la línea. Así:
   *   - Si el user está leyendo arriba o en el medio, el output aparece
   *     abajo pero la vista NO se mueve — puede seguir leyendo tranquilo.
   *   - Si el user está al fondo, sigue automáticamente el output nuevo.
   * El threshold de 30px cubre el "casi al fondo" (caso Langton, donde
   * podés estar a unos pixeles del borde sin estar exactamente encima).
   */
  const FOLLOW_THRESHOLD = 24;

  function isAtBottom(el) {
    return el.scrollHeight - el.scrollTop - el.clientHeight < FOLLOW_THRESHOLD;
  }

  function followOutput(output) {
    if (output.dataset.follow === 'false') return;

    output.scrollTop = output.scrollHeight;
  }

  function appendLine(output, text, kind) {
    const line = document.createElement('div');
    line.className = 'term__line';
    if (kind) line.classList.add('term__line--' + kind);
    if (text === '[CLEAR]') {
      while (output.firstChild) output.removeChild(output.firstChild);
      output.dataset.follow = 'true';
      return;
    }
    line.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
    output.appendChild(line);
    followOutput(output);
  }

  function appendNode(output, node) {
    output.appendChild(node);
    followOutput(output);
  }

  /*
   * Salida estructurada. El código puede llamar:
   *   output({ type: 'text', text: '...' })
   *   output({ type: 'error', text: '...' })
   *   output({ type: 'grid', data: '...' | [['#','.'], ...] | [[0.1, 0.8], ...] })
   *   output({ type: 'trace', points: [[0,0], [0.5,0.9], ...], label: '...' })
   *   output({ type: 'metric', label: '...', value: 42, unit: 'ms' })
   * El texto siempre se inserta con textContent; nunca se interpreta HTML.
   */
  const CELL_RAMP = ' .:-=+*#%@';

  function asText(value) {
    return value == null ? '' : String(value);
  }

  function gridAsText(payload) {
    const data =
      payload.data != null ? payload.data :
      payload.rows != null ? payload.rows :
      payload.text;
    if (typeof data === 'string') return data;
    if (!Array.isArray(data)) return asText(data);

    let hasNumber = false;
    let min = Infinity;
    let max = -Infinity;
    data.forEach((row) => {
      if (!Array.isArray(row)) return;
      row.forEach((cell) => {
        if (typeof cell === 'number' && isFinite(cell)) {
          hasNumber = true;
          if (cell < min) min = cell;
          if (cell > max) max = cell;
        }
      });
    });

    return data
      .map((row) => {
        if (!Array.isArray(row)) return asText(row);
        return row
          .map((cell) => {
            if (typeof cell === 'number' && isFinite(cell)) {
              const t = max === min ? 0 : (cell - min) / (max - min);
              const idx = Math.max(
                0,
                Math.min(CELL_RAMP.length - 1, Math.round(t * (CELL_RAMP.length - 1)))
              );
              return CELL_RAMP.charAt(idx);
            }
            return asText(cell);
          })
          .join('');
      })
      .join('\n');
  }

  function traceAsNode(payload) {
    const points = Array.isArray(payload.points) ? payload.points : [];
    const valid = [];
    points.forEach((point) => {
      const x = Array.isArray(point) ? Number(point[0]) : Number(point && point.x);
      const y = Array.isArray(point) ? Number(point[1]) : Number(point && point.y);
      if (isFinite(x) && isFinite(y)) valid.push({ x, y });
    });
    if (valid.length < 2) return null;

    const xs = valid.map((p) => p.x);
    const ys = valid.map((p) => p.y);
    const minX = Math.min.apply(null, xs);
    const maxX = Math.max.apply(null, xs);
    const minY = Math.min.apply(null, ys);
    const maxY = Math.max.apply(null, ys);
    const unit =
      minX >= 0 && maxX <= 1 && minY >= 0 && maxY <= 1;
    const ns = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'term__trace');
    svg.setAttribute('viewBox', '0 0 100 40');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('role', 'img');
    const label = asText(payload.label || 'traza de salida');
    svg.setAttribute('aria-label', label);
    const title = document.createElementNS(ns, 'title');
    title.textContent = label;
    svg.appendChild(title);

    const base = document.createElementNS(ns, 'line');
    base.setAttribute('x1', '0');
    base.setAttribute('y1', '40');
    base.setAttribute('x2', '100');
    base.setAttribute('y2', '40');
    base.setAttribute('class', 'term__trace-base');
    svg.appendChild(base);

    const poly = document.createElementNS(ns, 'polyline');
    poly.setAttribute('class', 'term__trace-line');
    poly.setAttribute('fill', 'none');
    poly.setAttribute('vector-effect', 'non-scaling-stroke');
    poly.setAttribute(
      'points',
      valid
        .map((p) => {
          const nx = unit
            ? p.x
            : maxX === minX
              ? 0.5
              : (p.x - minX) / (maxX - minX);
          const ny = unit
            ? p.y
            : maxY === minY
              ? 0.5
              : (p.y - minY) / (maxY - minY);
          return (nx * 100).toFixed(2) + ',' + ((1 - ny) * 40).toFixed(2);
        })
        .join(' ')
    );
    svg.appendChild(poly);
    return svg;
  }

  function structuredOutput(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
    const type = asText(payload.type).toLowerCase();

    if (type === 'text') return { text: asText(payload.text), kind: 'log' };
    if (type === 'error') {
      return { text: asText(payload.text || payload.message), kind: 'error' };
    }
    if (type === 'grid') {
      const pre = document.createElement('pre');
      pre.className = 'term__block term__block--grid';
      pre.textContent = gridAsText(payload);
      return { node: pre };
    }
    if (type === 'trace') {
      const svg = traceAsNode(payload);
      if (!svg) {
        return { text: 'traza inválida: se necesitan al menos 2 puntos finitos', kind: 'warn' };
      }
      const wrap = document.createElement('div');
      wrap.className = 'term__block term__block--trace';
      wrap.appendChild(svg);
      return { node: wrap };
    }
    if (type === 'metric') {
      const row = document.createElement('div');
      row.className = 'term__block term__block--metric';
      const label = document.createElement('span');
      label.className = 'term__metric-label';
      label.textContent = asText(payload.label);
      const value = document.createElement('span');
      value.className = 'term__metric-value';
      value.textContent = asText(payload.value);
      row.appendChild(label);
      row.appendChild(value);
      if (payload.unit != null) {
        const unit = document.createElement('span');
        unit.className = 'term__metric-unit';
        unit.textContent = asText(payload.unit);
        row.appendChild(unit);
      }
      return { node: row };
    }
    return null;
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
    const status = wrapper.querySelector('.term__status');
    if (!status) return;
    const labels = {
      idle: 'listo',
      input: 'entrada',
      running: 'ejecutando',
      ok: 'ok',
      error: 'error',
    };
    status.textContent = labels[state] || state;
  }

  function setStep(term, step) {
    const { codeSection, inputSection, outputSection, steps, focusBtn } = term;
    const code = step === 'code';
    const input = step === 'input';
    const output = step === 'output';

    if (codeSection) codeSection.hidden = !code;
    if (inputSection) inputSection.hidden = !input;
    if (outputSection) outputSection.hidden = !output;

    if (steps) {
      const show = term.hasOutput && (code || output);
      steps.hidden = !show;
      const codeBtn = steps.querySelector('[data-action="step-code"]');
      const outBtn = steps.querySelector('[data-action="step-output"]');
      if (codeBtn) {
        codeBtn.classList.toggle('is-active', code);
        codeBtn.setAttribute('aria-pressed', code ? 'true' : 'false');
      }
      if (outBtn) {
        outBtn.classList.toggle('is-active', output);
        outBtn.setAttribute('aria-pressed', output ? 'true' : 'false');
      }
    }

    if (focusBtn) focusBtn.disabled = !term.hasOutput;
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
      setTimeout(() => {
        try {
          input.focus({ preventScroll: true });
        } catch (e) {
          input.focus();
        }
        if (inputSection.scrollIntoView) {
          const reduce = window.matchMedia
            ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
            : false;
          inputSection.scrollIntoView({
            block: 'center',
            behavior: reduce ? 'auto' : 'smooth',
          });
        }
      }, 0);
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

  /*
   * Fullscreen: el banco ocupa todo el viewport. Se usa al ejecutar y como
   * modo de enfoque desde el inline. La barra sigue visible; el paso activo
   * (código, entrada o salida) llena el resto.
   */
  function enterFullscreen(term, force) {
    if (!force && !term.hasOutput) return;
    if (term.wrapper.classList.contains('term--fullscreen')) return;

    if (!force) setStep(term, 'output');
    term.wrapper.classList.add('term--fullscreen');
    document.body.classList.add('term-lock');

    if (term.focusBtn) term.focusBtn.hidden = true;
    if (term.exitBtn) {
      term.exitBtn.hidden = false;
      if (!force) {
        requestAnimationFrame(() => term.exitBtn.focus());
      }
    }

    if (!force) {
      requestAnimationFrame(() => {
        term.output.scrollTop = 0;
      });
    }
  }

  function exitFullscreen(term) {
    if (!term.wrapper.classList.contains('term--fullscreen')) return;
    term.wrapper.classList.remove('term--fullscreen');
    document.body.classList.remove('term-lock');
    if (term.focusBtn) term.focusBtn.hidden = false;
    if (term.exitBtn) term.exitBtn.hidden = true;

    const trigger =
      term.focusBtn && !term.focusBtn.disabled
        ? term.focusBtn
        : term.wrapper.querySelector('[data-action="run"]');
    if (trigger) trigger.focus();
  }

  function runCode(term) {
    const { wrapper, editor, inputSection, inputForm, output, outputSection } = term;
    const code = editor.innerText.replace(/\u00a0/g, ' ');

    term.hasOutput = false;
    setStep(term, 'run');
    setState(wrapper, 'running');
    enterFullscreen(term, true);

    while (output.firstChild) output.removeChild(output.firstChild);
    output.dataset.follow = 'false';
    inputForm.innerHTML = '';

    const prompts = [];
    const re = /\b(?:input|prompt)\(\s*(['"`])([^'"`]+)\1\s*\)/g;
    let m;
    while ((m = re.exec(code)) !== null) {
      prompts.push(m[2]);
    }

    const revealOutput = () => {
      if (!outputSection || outputSection.hidden || wrapper.classList.contains('term--fullscreen')) return;
      const rect = outputSection.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        const reduce = window.matchMedia
          ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
          : false;
        outputSection.scrollIntoView({
          block: 'nearest',
          behavior: reduce ? 'auto' : 'smooth',
        });
      }
    };

    const executeValues = (values) => {
      term.hasOutput = true;
      setStep(term, 'output');
      setState(wrapper, 'running');
      inputForm.innerHTML = '';
      appendPrompt(output, 'ejecutar');
      values.forEach((value, idx) => {
        appendLine(output, '› ' + prompts[idx] + ' ' + value, 'meta');
      });
      execute(code, output, values, (hadError) => {
        setState(wrapper, hadError ? 'error' : 'ok');
        output.dataset.follow = 'false';
        output.scrollTop = 0;
        revealOutput();
      });
      setTimeout(revealOutput, 0);
    };

    const finish = (values) => {
      if (values === null) {
        term.hasOutput = false;
        setStep(term, 'code');
        setState(wrapper, 'idle');
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
        setStep(term, 'output');
        showConfirm(
          output,
          msg,
          () => {
            executeValues(values);
          },
          () => {
            term.hasOutput = false;
            setStep(term, 'code');
            setState(wrapper, 'idle');
            inputForm.innerHTML = '';
          }
        );
        return;
      }

      executeValues(values);
    };

    if (prompts.length > 0) {
      setStep(term, 'input');
      setState(wrapper, 'input');
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
    let hadError = false;

    const flush = () => {
      scheduled = false;
      if (buf.length === 0) return;
      const chunk = buf;
      buf = [];
      chunk.forEach((entry) => {
        if (entry.node) appendNode(output, entry.node);
        else appendLine(output, entry.text, entry.kind);
      });
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
      Array.from(args)
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
      hadError = true;
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

    const queueNode = (node) => {
      buf.push({ node });
      if (!scheduled) {
        scheduled = true;
        Promise.resolve().then(flush);
      }
    };

    const outputFn = (content) => {
      if (content === '[CLEAR]') {
        flush();
        while (output.firstChild) output.removeChild(output.firstChild);
        if (output.dataset.follow !== 'true') output.scrollTop = 0;
        return;
      }

      const structured = structuredOutput(content);
      if (structured) {
        if (structured.kind === 'error') hadError = true;
        if (structured.node) queueNode(structured.node);
        else queue(structured.text, structured.kind);
        return;
      }

      if (content && typeof content === 'object') {
        try {
          queue(JSON.stringify(content), 'log');
        } catch (_) {
          queue(String(content), 'log');
        }
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
      if (typeof onDone === 'function') onDone(hadError);
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
      hadError = true;
      appendLine(output, err && err.message ? err.message : String(err), 'error');
      finishSafely();
    }
  }

  function scrollOutput(term, edge) {
    const reduce = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
    const top = edge === 'top' ? 0 : term.output.scrollHeight;
    if (term.output.scrollTo) {
      term.output.scrollTo({
        top,
        behavior: reduce ? 'auto' : 'smooth',
      });
    } else {
      term.output.scrollTop = top;
    }
    term.output.dataset.follow = edge === 'bottom' ? 'true' : 'false';
  }

  function resetCode(term) {
    if (term.wrapper.classList.contains('term--fullscreen')) {
      exitFullscreen(term);
    }
    term.editor.innerHTML = term.originalHtml;
    term.inputForm.innerHTML = '';
    term.hasOutput = false;
    setStep(term, 'code');
    while (term.output.firstChild) term.output.removeChild(term.output.firstChild);
    term.output.dataset.follow = 'false';
    setState(term.wrapper, 'idle');
  }

  function bind(term) {
    const { wrapper, editor } = term;

    wrapper.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (btn) {
        const action = btn.dataset.action;
        if (action === 'run') runCode(term);
        if (action === 'reset') resetCode(term);
        if (action === 'focus') enterFullscreen(term);
        if (action === 'step-code') setStep(term, 'code');
        if (action === 'step-output') setStep(term, 'output');
        if (action === 'output-top') scrollOutput(term, 'top');
        if (action === 'output-bottom') scrollOutput(term, 'bottom');
        if (action === 'close-fs') {
          exitFullscreen(term);
          return;
        }
        return;
      }

      // En fullscreen, solo cierra si el click es sobre el bar (no sobre el output).
      // Así el user puede leer, hacer scroll y seleccionar texto sin cerrar.
      if (
        wrapper.classList.contains('term--fullscreen') &&
        e.target.closest('.term__fs-bar')
      ) {
        exitFullscreen(term);
      }
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
      if (e.key === 'Escape' && wrapper.classList.contains('term--fullscreen')) {
        e.preventDefault();
        exitFullscreen(term);
      }
    });

    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && wrapper.classList.contains('term--fullscreen')) {
        e.preventDefault();
        exitFullscreen(term);
      }
    });

    const output = term.output;
    output.addEventListener('scroll', () => {
      output.dataset.follow = isAtBottom(output) ? 'true' : 'false';
    }, { passive: true });

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
