/**
 * Code Runner - Ejecuta código JavaScript y muestra el output
 */

(function() {
  'use strict';

  // Interceptar console.log para capturar output
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  
  let outputBuffer = [];
  
  function captureOutput() {
    outputBuffer = [];
    
    console.log = function(...args) {
      originalLog.apply(console, args);
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      
      // Detectar si es un clear
      if (message.includes('[CLEAR]')) {
        outputBuffer.push({
          type: 'log',
          message: '[CLEAR]',
          timestamp: Date.now()
        });
        return;
      }
      
      outputBuffer.push({
        type: 'log',
        message: message,
        timestamp: Date.now()
      });
    };
    
    console.error = function(...args) {
      originalError.apply(console, args);
      outputBuffer.push({
        type: 'error',
        message: args.map(arg => String(arg)).join(' ')
      });
    };
    
    console.warn = function(...args) {
      originalWarn.apply(console, args);
      outputBuffer.push({
        type: 'warn',
        message: args.map(arg => String(arg)).join(' ')
      });
    };
  }
  
  function restoreConsole() {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
  }
  
  function extractCodeFromPre(preElement) {
    const codeElement = preElement.querySelector('code');
    if (!codeElement) return null;
    return codeElement.textContent || codeElement.innerText;
  }
  
  function createOutputModal() {
    const modal = document.createElement('div');
    modal.className = 'code-output-modal';
    modal.innerHTML = `
      <div class="code-output-container">
        <div class="code-output-header">
          <span class="code-output-title">Output</span>
          <button class="code-output-close" aria-label="Cerrar">×</button>
        </div>
        <div class="code-output-content">
          <pre class="code-output-text"></pre>
        </div>
      </div>
    `;
    
    const closeBtn = modal.querySelector('.code-output-close');
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
    
    // Cerrar al hacer click fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
    
    document.body.appendChild(modal);
    return modal;
  }
  
  function showOutput(output, modal, clearFirst = false) {
    const outputText = modal.querySelector('.code-output-text');
    
    if (clearFirst) {
      outputText.innerHTML = '';
    }
    
    if (output.length === 0 && !clearFirst) {
      outputText.textContent = '(sin output)';
      return;
    }
    
    // Si clearFirst, mostrar solo el último output
    const itemsToShow = clearFirst ? output.slice(-1) : output;
    
    outputText.innerHTML = '';
    itemsToShow.forEach(item => {
      const line = document.createElement('div');
      line.className = `code-output-line code-output-${item.type}`;
      line.textContent = item.message;
      outputText.appendChild(line);
    });
    
    modal.classList.add('active');
  }
  
  // Función para limpiar el output buffer (para actualizaciones dinámicas)
  function clearOutputBuffer() {
    outputBuffer = [];
  }
  
  function createInputModal(promptText, callback) {
    const inputModal = document.createElement('div');
    inputModal.className = 'code-input-modal';
    inputModal.innerHTML = `
      <div class="code-input-container">
        <div class="code-input-header">
          <span class="code-input-title">Input</span>
          <button class="code-input-close" aria-label="Cancelar">×</button>
        </div>
        <div class="code-input-content">
          <label style="display: block; margin-bottom: 0.5rem; color: #5fa8a0; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem;">${promptText}</label>
          <input type="text" class="code-input-field" placeholder="Escribe aquí..." autofocus>
        </div>
        <div class="code-input-footer">
          <button class="code-input-submit">Ejecutar</button>
          <button class="code-input-cancel">Cancelar</button>
        </div>
      </div>
    `;
    
    const closeBtn = inputModal.querySelector('.code-input-close');
    const cancelBtn = inputModal.querySelector('.code-input-cancel');
    const submitBtn = inputModal.querySelector('.code-input-submit');
    const inputField = inputModal.querySelector('.code-input-field');
    
    function close() {
      inputModal.classList.remove('active');
      setTimeout(() => inputModal.remove(), 300);
    }
    
    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);
    
    inputModal.addEventListener('click', (e) => {
      if (e.target === inputModal) close();
    });
    
    submitBtn.addEventListener('click', () => {
      const value = inputField.value;
      close();
      callback(value);
    });
    
    inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        submitBtn.click();
      }
    });
    
    document.body.appendChild(inputModal);
    setTimeout(() => inputModal.classList.add('active'), 10);
    
    return inputModal;
  }
  
  function createWarningModal(message, onConfirm, onCancel) {
    const warningModal = document.createElement('div');
    warningModal.className = 'code-input-modal';
    warningModal.innerHTML = `
      <div class="code-input-container">
        <div class="code-input-header">
          <span class="code-input-title">⚠️ Advertencia</span>
          <button class="code-input-close" aria-label="Cancelar">×</button>
        </div>
        <div class="code-input-content">
          <div style="color: #8b7a4a; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; line-height: 1.6;">
            ${message}
          </div>
        </div>
        <div class="code-input-footer">
          <button class="code-input-submit" style="background: rgba(139, 74, 74, 0.2); border-color: rgba(139, 74, 74, 0.5); color: #8b4a4a;">Sí, asumo los riesgos</button>
          <button class="code-input-cancel">Cancelar</button>
        </div>
      </div>
    `;
    
    const closeBtn = warningModal.querySelector('.code-input-close');
    const cancelBtn = warningModal.querySelector('.code-input-cancel');
    const submitBtn = warningModal.querySelector('.code-input-submit');
    
    function close() {
      warningModal.classList.remove('active');
      setTimeout(() => {
        warningModal.remove();
        if (onCancel) onCancel();
      }, 300);
    }
    
    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);
    
    warningModal.addEventListener('click', (e) => {
      if (e.target === warningModal) close();
    });
    
    submitBtn.addEventListener('click', () => {
      warningModal.classList.remove('active');
      setTimeout(() => {
        warningModal.remove();
        if (onConfirm) onConfirm();
      }, 300);
    });
    
    document.body.appendChild(warningModal);
    setTimeout(() => warningModal.classList.add('active'), 10);
    
    return warningModal;
  }
  
  function validateInput(value, expectedType = 'any', onHighValue = null) {
    if (expectedType === 'integer') {
      const num = parseInt(value);
      if (isNaN(num)) {
        return { valid: false, error: 'Debe ser un número entero válido.' };
      }
      if (value.trim() !== num.toString()) {
        return { valid: false, error: 'Debe ser un número entero (sin decimales).' };
      }
      if (num < 0) {
        return { valid: false, error: 'Debe ser un número positivo o cero.' };
      }
      if (num > 100) {
        // Retornar un objeto especial que indica que necesita confirmación
        return { 
          valid: true, 
          value: num, 
          needsConfirmation: true,
          warning: `Estás intentando ejecutar ${num} iteraciones. Esto puede causar:\n\n• Alto consumo de CPU\n• Posible bloqueo del navegador\n• Timeout de ejecución\n• Pérdida de datos no guardados\n\nLa validación te resguarda, pero tú asumes los riesgos.\n\n¿Estás seguro de romper los límites?`
        };
      }
      return { valid: true, value: num };
    }
    return { valid: true, value: value };
  }
  
  function executeCodeWithValue(code, modal, inputValues) {
    // inputValues puede ser un valor único o un array de valores
    const inputArray = Array.isArray(inputValues) ? inputValues : [inputValues];
    let inputIndex = 0;
    
    captureOutput();
    
    const outputText = modal.querySelector('.code-output-text');
    modal.classList.add('active'); // Mostrar modal inmediatamente
    
    // Función para actualizar directamente el DOM
    function updateOutputDirectly(content) {
      if (content === '[CLEAR]') {
        outputText.innerHTML = '';
        return;
      }
      
      // Si es un string, crear un div con el contenido
      const line = document.createElement('div');
      line.className = 'code-output-line code-output-log';
      // Preservar saltos de línea y espacios
      const message = String(content).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
      line.innerHTML = message;
      outputText.appendChild(line);
      
      // Auto-scroll al final
      outputText.scrollTop = outputText.scrollHeight;
    }
    
    // Función para actualizar el output desde el buffer (fallback para console.log)
    function updateOutputFromBuffer() {
      if (outputBuffer.length > 0) {
        // Buscar el último [CLEAR] y mostrar solo después de él
        let lastClearIndex = -1;
        for (let i = outputBuffer.length - 1; i >= 0; i--) {
          if (outputBuffer[i].message.includes('[CLEAR]')) {
            lastClearIndex = i;
            break;
          }
        }
        
        if (lastClearIndex !== -1) {
          // Mostrar solo los mensajes después del último [CLEAR]
          const itemsToShow = outputBuffer.slice(lastClearIndex + 1);
          outputText.innerHTML = '';
          itemsToShow.forEach(item => {
            const line = document.createElement('div');
            line.className = `code-output-line code-output-${item.type}`;
            const message = item.message.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
            line.innerHTML = message;
            outputText.appendChild(line);
          });
        } else {
          // Mostrar todo el output
          outputText.innerHTML = '';
          outputBuffer.forEach(item => {
            const line = document.createElement('div');
            line.className = `code-output-line code-output-${item.type}`;
            const message = item.message.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
            line.innerHTML = message;
            outputText.appendChild(line);
          });
        }
      }
    }
    
    // Actualizar output cada 100ms para ver cambios en tiempo real (solo para console.log fallback)
    const updateInterval = setInterval(updateOutputFromBuffer, 100);
    
    // Actualizar inmediatamente
    updateOutputFromBuffer();
    
    try {
      // Almacenar la referencia del elemento en una variable global temporal
      // para que el código ejecutado pueda acceder a ella
      const tempOutputId = 'code-output-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      outputText.setAttribute('data-output-id', tempOutputId);
      
      // Crear funciones globales temporales que el código puede usar
      window['__codeOutput_' + tempOutputId] = function(content) {
        const outputEl = document.querySelector(`[data-output-id="${tempOutputId}"]`);
        if (!outputEl) return;
        
        if (content === '[CLEAR]') {
          outputEl.innerHTML = '';
          return;
        }
        const line = document.createElement('div');
        line.className = 'code-output-line code-output-log';
        const message = String(content).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
        line.innerHTML = message;
        outputEl.appendChild(line);
        outputEl.scrollTop = outputEl.scrollHeight;
      };
      
      // Crear el código con las funciones disponibles
      const codeWithInput = `
        (function() {
          const outputElementId = ${JSON.stringify(tempOutputId)};
          const outputFn = window['__codeOutput_' + outputElementId];
          const inputValues = ${JSON.stringify(inputArray)};
          let inputIndex = 0;
          
          function input(prompt) {
            if (inputIndex >= inputValues.length) {
              throw new Error('No hay más valores de input disponibles. Se esperaban ' + inputValues.length + ' inputs.');
            }
            const value = inputValues[inputIndex++];
            return value;
          }
          
          function output(content) {
            outputFn(content);
          }
          
          ${code}
          
          // Limpiar la función global al finalizar
          delete window['__codeOutput_' + outputElementId];
        })();
      `;
      
      // Ejecutar el código
      const result = eval(codeWithInput);
      if (result !== undefined) {
        const line = document.createElement('div');
        line.className = 'code-output-line code-output-result';
        line.textContent = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
        outputText.appendChild(line);
      }
      
      // IMPORTANTE: NO restaurar la consola inmediatamente
      // Mantenerla activa para que los setTimeout puedan seguir capturando output
      // Calcular tiempo total: usar un tiempo generoso por defecto
      // Si el primer input es un número, podría ser generaciones, pero no asumimos eso
      const firstInputNum = inputArray.length > 0 && !isNaN(parseInt(inputArray[0])) ? parseInt(inputArray[0]) : 0;
      const totalTime = (firstInputNum * 3000) + 25000; // generaciones * 3s + 25s margen (si aplica)
      
      // Verificar si hay timeouts pendientes monitoreando el output
      let lastOutputSize = outputText.children.length;
      let stableCount = 0;
      let lastUpdateTime = Date.now();
      let executionStartTime = Date.now();
      
      const checkCompletion = setInterval(() => {
        const currentSize = outputText.children.length;
        const now = Date.now();
        
        // Forzar actualización del output desde buffer en cada check (fallback)
        updateOutputFromBuffer();
        
        if (currentSize !== lastOutputSize) {
          // Hay cambios, resetear contador
          stableCount = 0;
          lastOutputSize = currentSize;
          lastUpdateTime = now;
        } else {
          // No hay cambios, incrementar contador
          stableCount++;
          // Si no hay cambios por 12 segundos después del último update Y han pasado al menos 5 segundos desde el inicio
          const timeSinceStart = now - executionStartTime;
          const timeSinceLastUpdate = now - lastUpdateTime;
          if (stableCount > 240 && timeSinceLastUpdate > 12000 && timeSinceStart > 5000) {
            clearInterval(checkCompletion);
            clearInterval(updateInterval);
            restoreConsole();
            updateOutputFromBuffer();
          }
        }
      }, 50);
      
      // Timeout de seguridad máximo - esperar suficiente tiempo para todas las generaciones
      setTimeout(() => {
        clearInterval(checkCompletion);
        clearInterval(updateInterval);
        restoreConsole();
        updateOutputFromBuffer();
      }, Math.min(totalTime, 300000)); // Máximo 300 segundos (5 minutos)
      
    } catch (error) {
      clearInterval(updateInterval);
      const errorLine = document.createElement('div');
      errorLine.className = 'code-output-line code-output-error';
      errorLine.textContent = `Error: ${error.message}`;
      outputText.appendChild(errorLine);
      restoreConsole();
      updateOutputFromBuffer();
    }
  }
  
  function executeCodeWithTimeout(code, modal, timeoutMs = 5000) {
    captureOutput();
    
    // Crear un timeout para detener la ejecución
    const timeoutId = setTimeout(() => {
      outputBuffer.push({
        type: 'error',
        message: `⏱️ Timeout: El código fue detenido después de ${timeoutMs/1000} segundos para evitar bloqueo.`
      });
      restoreConsole();
      showOutput(outputBuffer, modal);
    }, timeoutMs);
    
    try {
      const result = eval(code);
      
      // Si llegamos aquí, el código terminó (no debería pasar con loops infinitos)
      clearTimeout(timeoutId);
      if (result !== undefined) {
        outputBuffer.push({
          type: 'result',
          message: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)
        });
      }
      restoreConsole();
      showOutput(outputBuffer, modal);
    } catch (error) {
      clearTimeout(timeoutId);
      outputBuffer.push({
        type: 'error',
        message: `Error: ${error.message}`
      });
      restoreConsole();
      showOutput(outputBuffer, modal);
    }
    
    // Nota: Con loops infinitos, el timeout se ejecutará y detendrá el código
  }
  
  function executeCode(code, modal, inputValue = null) {
    captureOutput();
    
    try {
      // Si el código tiene una función que espera input, inyectarla
      if (inputValue !== null) {
        // Detectar el tipo esperado basado en el contexto del código
        let expectedType = 'any';
        if (code.includes('limite') || code.includes('limit') || code.includes('contador') || code.includes('count')) {
          expectedType = 'integer';
        }
        
        // Validar el input
        const validation = validateInput(inputValue, expectedType);
        
        if (!validation.valid) {
          outputBuffer.push({
            type: 'error',
            message: validation.error
          });
          restoreConsole();
          showOutput(outputBuffer, modal);
          return;
        }
        
        // Si necesita confirmación (número muy alto)
        if (validation.needsConfirmation) {
          createWarningModal(
            validation.warning.replace(/\n/g, '<br>'),
            () => {
              // Usuario confirmó, ejecutar con el valor alto
              executeCodeWithValue(code, modal, validation.value);
            },
            () => {
              // Usuario canceló, mostrar mensaje
              outputBuffer.push({
                type: 'warn',
                message: 'Ejecución cancelada. La prudencia es sabia.'
              });
              restoreConsole();
              showOutput(outputBuffer, modal);
            }
          );
          return;
        }
        
        // Ejecutar normalmente
        executeCodeWithValue(code, modal, validation.value);
      } else {
        // Verificar si el código usa input()
        if (code.includes('input(') || code.includes('prompt(')) {
          // Extraer TODOS los prompts del código
          const inputMatches = code.matchAll(/input\(['"]([^'"]+)['"]\)/g);
          const promptMatches = code.matchAll(/prompt\(['"]([^'"]+)['"]\)/g);
          
          const allPrompts = [];
          for (const match of inputMatches) {
            allPrompts.push(match[1]);
          }
          for (const match of promptMatches) {
            allPrompts.push(match[1]);
          }
          
          // Si hay múltiples inputs, pedirlos secuencialmente
          if (allPrompts.length > 0) {
            const inputValues = [];
            let currentPromptIndex = 0;
            
            function askNextInput() {
              if (currentPromptIndex >= allPrompts.length) {
                // Todos los inputs recopilados, ejecutar código
                executeCodeWithValue(code, modal, inputValues);
                return;
              }
              
              const promptText = allPrompts[currentPromptIndex];
              const promptNumber = allPrompts.length > 1 ? ` (${currentPromptIndex + 1}/${allPrompts.length})` : '';
              
              createInputModal(promptText + promptNumber, (value) => {
                inputValues.push(value);
                currentPromptIndex++;
                askNextInput();
              });
            }
            
            askNextInput();
            restoreConsole();
            return; // No ejecutar todavía, esperar inputs
          } else {
            // Fallback: un solo input sin prompt detectado
            const promptText = 'Ingresa un valor:';
            createInputModal(promptText, (value) => {
              executeCode(code, modal, value);
            });
            restoreConsole();
            return;
          }
        }
        
        // Detectar loops infinitos peligrosos
        const hasInfiniteLoop = /while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)|while\s*\(\s*1\s*\)|for\s*\(\s*.*\s*;\s*.*\s*;\s*\)\s*\{[^}]*while\s*\(\s*true\s*\)/.test(code);
        
        if (hasInfiniteLoop) {
          createWarningModal(
            `⚠️ LOOP INFINITO DETECTADO<br><br>` +
            `Este código contiene un loop infinito (while(true) o similar).<br><br>` +
            `Ejecutarlo causará:<br>` +
            `• Bloqueo inmediato del navegador<br>` +
            `• Consumo extremo de CPU<br>` +
            `• Necesitarás cerrar la pestaña/ventana<br>` +
            `• Posible pérdida de datos no guardados<br><br>` +
            `La validación te resguarda, pero tú asumes los riesgos.<br><br>` +
            `¿Estás seguro de ejecutar el infinito?`,
            () => {
              // Usuario confirmó, ejecutar con timeout de seguridad
              executeCodeWithTimeout(code, modal, 5000); // 5 segundos máximo
            },
            () => {
              outputBuffer.push({
                type: 'warn',
                message: 'Ejecución cancelada. El infinito puede esperar.'
              });
              restoreConsole();
              showOutput(outputBuffer, modal);
            }
          );
          return;
        }
        
        // Ejecutar el código normalmente
        const result = eval(code);
        if (result !== undefined) {
          outputBuffer.push({
            type: 'result',
            message: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)
          });
        }
      }
    } catch (error) {
      outputBuffer.push({
        type: 'error',
        message: `Error: ${error.message}`
      });
    } finally {
      if (inputValue !== null || !code.includes('input(') && !code.includes('prompt(')) {
        restoreConsole();
        showOutput(outputBuffer, modal);
      }
    }
  }
  
  function addRunButton(preElement) {
    // Verificar si ya tiene botón
    if (preElement.querySelector('.code-run-button')) {
      return;
    }
    
    const button = document.createElement('button');
    button.className = 'code-run-button';
    button.textContent = '▶ Run';
    button.setAttribute('aria-label', 'Ejecutar código');
    
    // Crear modal si no existe
    let modal = document.querySelector('.code-output-modal');
    if (!modal) {
      modal = createOutputModal();
    }
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const code = extractCodeFromPre(preElement);
      if (code) {
        button.disabled = true;
        button.textContent = '⏳ Running...';
        
        // Pequeño delay para feedback visual
        setTimeout(() => {
          executeCode(code, modal);
          button.disabled = false;
          button.textContent = '▶ Run';
        }, 100);
      }
    });
    
    // Insertar botón antes del pre
    preElement.parentNode.insertBefore(button, preElement);
  }
  
  function isJavaScriptCode(codeElement) {
    // Verificar por clase
    const className = codeElement.className || '';
    const classMatch = className.match(/language-(javascript|js)/i) || 
                       className.match(/lang-(javascript|js)/i);
    
    if (classMatch) return true;
    
    // Verificar por contenido del código
    const codeText = (codeElement.textContent || codeElement.innerText || '').trim();
    
    // Patrones comunes de JavaScript
    const jsPatterns = [
      /console\.(log|error|warn)/,
      /function\s+\w+\s*\(/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /=>\s*{/,
      /\.(map|filter|reduce|forEach)\s*\(/,
      /if\s*\(.*\)\s*{/,
      /while\s*\(/,
      /for\s*\(/,
      /return\s+/,
      /undefined/,
      /null/
    ];
    
    // Si tiene al menos 1 patrón de JavaScript, probablemente es JS
    // (reducido de 2 a 1 para detectar mejor códigos simples)
    const matches = jsPatterns.filter(pattern => pattern.test(codeText)).length;
    return matches >= 1;
  }
  
  function init() {
    // Buscar todos los bloques de código en páginas de código
    const codeBlocks = document.querySelectorAll('.codigo-page pre code, pre code');
    
    codeBlocks.forEach((codeElement) => {
      const preElement = codeElement.closest('pre');
      if (preElement) {
        // Verificar si ya tiene botón
        if (preElement.previousElementSibling && 
            preElement.previousElementSibling.classList.contains('code-run-button')) {
          return;
        }
        
        // Verificar si es JavaScript
        if (isJavaScriptCode(codeElement)) {
          addRunButton(preElement);
        }
      }
    });
  }
  
  // Inicializar cuando el DOM esté listo
  function startInit() {
    // Esperar un poco para que el contenido se renderice completamente
    setTimeout(() => {
      init();
      // Intentar de nuevo después de un momento por si el contenido se carga dinámicamente
      setTimeout(init, 500);
    }, 100);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startInit);
  } else {
    startInit();
  }
  
  // También intentar después de que todo se cargue
  window.addEventListener('load', () => {
    setTimeout(init, 300);
  });
  
  // Usar MutationObserver para detectar cuando se agregan nuevos bloques de código
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      init();
    });
    
    // Observar cambios en el body
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }
})();

