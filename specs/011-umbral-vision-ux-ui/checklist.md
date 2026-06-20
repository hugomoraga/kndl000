# UX Review Checklist: Umbral Vision — Overhaul de UX/UI

**Purpose**: Verificación visual, de accesibilidad y de usabilidad tras implementar el overhaul.
**Created**: 2026-06-20
**Feature**: `specs/011-umbral-vision-ux-ui/spec.md`

## Visual design

- [ ] CHK001 Panel con glassmorphism se ve coherente en Chrome, Firefox y Safari (`backdrop-filter: blur()` funciona en los 3)
- [ ] CHK002 Tipografía `Newsreader` aplicada a todos los textos del panel (no fallback a sistema)
- [ ] CHK003 Color `--accent` del sitio usado consistentemente (botones, focus rings, thumbnails activos)
- [ ] CHK004 Border radius y paddings consistentes entre panel, modal de preset y toast
- [ ] CHK005 Spacing del grid de thumbnails uniforme (gap 0.5rem, alineación 4 columnas)
- [ ] CHK006 Tooltip de thumbnail legible sobre el efecto (no se sale del viewport)
- [ ] CHK007 Indicador de audio no tapa controles críticos (botón mic, fullscreen)
- [ ] CHK008 Toast aparece en posición fija (bottom-right) sin tapar contenido

## Responsividad

- [ ] CHK009 Mobile 375×667 (iPhone SE): panel pasa a bottom-sheet, altura ≤40vh
- [ ] CHK010 Mobile 375×667: thumbnails visibles sin scroll horizontal
- [ ] CHK011 Mobile 375×667: tap targets ≥44×44px (touch-friendly)
- [ ] CHK012 Tablet 768×1024 (iPad): layout mantiene panel a la izquierda o pasa a bottom-sheet según preferencia
- [ ] CHK013 Desktop 1440×900: panel no tapa más del 25% del canvas
- [ ] CHK014 Orientación landscape en mobile: panel no tapa el efecto
- [ ] CHK015 Swipe gesture en mobile: swipe up muestra panel, swipe down lo oculta

## Accesibilidad

- [ ] CHK016 Lighthouse Accessibility ≥95 en desktop y mobile
- [ ] CHK017 Todos los botones tienen `aria-label` descriptivo
- [ ] CHK018 Panel tiene `role="region"` con `aria-label="Controles del generador"`
- [ ] CHK019 Thumbnails son `<button>` con `aria-pressed="true|false"` según activo
- [ ] CHK020 Tab order es lógico: panel header → thumbnails → audio → presets → capture → share
- [ ] CHK021 Focus visible: outline de 2px en `--accent` al tabular
- [ ] CHK022 Modal de preset: focus trap, Esc cierra, devuelve focus al trigger
- [ ] CHK023 Onboarding: navegable por teclado (Tab + Enter para cerrar)
- [ ] CHK024 Contraste de texto en panel ≥4.5:1 (verificar con axe DevTools o Lighthouse)

## Reduced motion

- [ ] CHK025 Con `prefers-reduced-motion: reduce`, panel collapse es instantáneo
- [ ] CHK026 Con `prefers-reduced-motion: reduce`, hover lifts están desactivados
- [ ] CHK027 Con `prefers-reduced-motion: reduce`, scale del círculo de audio es instantáneo
- [ ] CHK028 Canvas sigue animando con reduced-motion (es contenido, no chrome)

## Shortcuts de teclado

- [ ] CHK029 `1` cambia al primer efecto (tunnel)
- [ ] CHK030 `2`–`9` cambian a efectos 2–9
- [ ] CHK031 `0` cambia al efecto 10
- [ ] CHK032 `-` cambia al efecto 11 (si existe)
- [ ] CHK033 `=` cambia al efecto 12 (si existe)
- [ ] CHK034 `←` `→` navegan con wrap-around
- [ ] CHK035 `Espacio` toggle auto-transición
- [ ] CHK036 `F` toggle fullscreen
- [ ] CHK037 `H` toggle panel
- [ ] CHK038 `M` toggle mic
- [ ] CHK039 `?` toggle onboarding
- [ ] CHK040 Shortcuts ignorados cuando focus está en `<input>`
- [ ] CHK041 Shortcuts no disparan si hay modifier (Ctrl/Meta/Alt)

## Audio indicator

- [ ] CHK042 Mic OFF: indicador oculto (sin layout shift)
- [ ] CHK043 Mic ON: círculo central late visible
- [ ] CHK044 Mic ON: 16 barras FFT se mueven con el espectro
- [ ] CHK045 Peak >0.9: círculo cambia a `--accent-warm` por 100ms
- [ ] CHK046 Permiso denegado: indicador muestra estado de error, no se rompe
- [ ] CHK047 Permiso revocado durante la sesión: indicador se apaga limpiamente

## Presets

- [ ] CHK048 Guardar preset: modal pide nombre, valida no vacío
- [ ] CHK049 Guardar preset: confirma con Enter, cancela con Esc
- [ ] CHK050 Preset aparece en dropdown tras guardar
- [ ] CHK051 Recargar página (F5): presets persisten desde `localStorage`
- [ ] CHK052 Cargar preset: restaura efecto + intervalo + estado mic
- [ ] CHK053 Renombrar preset: input inline en el dropdown
- [ ] CHK054 Duplicar preset: crea copia con timestamp en el nombre
- [ ] CHK055 Borrar preset: pide confirmación o undo por toast 5s
- [ ] CHK056 Modo incógnito Safari: fallback a memoria con toast informativo

## Onboarding

- [ ] CHK057 Primera visita (sin flag): overlay aparece 800ms post-load
- [ ] CHK058 Overlay no aparece ANTES del primer frame del canvas
- [ ] CHK059 Auto-cierre a los 6s si no hay interacción
- [ ] CHK060 Click en backdrop o tecla cierra + setea flag
- [ ] CHK061 Segunda visita: overlay no aparece
- [ ] CHK062 Link "¿Cómo funciona?" en panel reabre el overlay
- [ ] CHK063 Tips mostrados coinciden con shortcuts implementados (no menciona teclas inexistentes)

## Captura + share

- [ ] CHK064 Click 📸 descarga PNG con nombre `umbral-vision-{ISO}.png`
- [ ] CHK065 PNG descargado es idéntico al frame en pantalla (sin overlay de panel)
- [ ] CHK066 Click 🔗 copia URL al clipboard
- [ ] CHK067 URL copiada contiene `?effect=X&interval=Y&audio=Z`
- [ ] CHK068 Abrir URL copiada en otra pestaña/equipo: restaura efecto+interval+audio
- [ ] CHK069 Effect inválido en URL: fallback a tunnel + toast de aviso
- [ ] CHK070 Fallback clipboard: si `writeText` falla, modal muestra URL en input readonly

## Performance

- [ ] CHK071 Lighthouse Performance ≥85 en mobile (Moto G4 simulated)
- [ ] CHK072 Grid de thumbnails renderiza <500ms desde load
- [ ] CHK073 Shortcut response <50ms
- [ ] CHK074 Panel collapse animation 200ms (CSS transition)
- [ ] CHK075 `bundle exec jekyll build` sin warnings nuevos

## Cross-browser

- [ ] CHK076 Chrome desktop (última)
- [ ] CHK077 Firefox desktop (última): `backdrop-filter` requiere flag `-moz-element` o polyfill — verificar fallback
- [ ] CHK078 Safari desktop (última)
- [ ] CHK079 Safari iOS: tap targets, swipe gestures, audio API
- [ ] CHK080 Chrome Android
- [ ] CHK081 Firefox Android

## Notes

- Items numerados secuencialmente para referencia cruzada con tasks.md
- Marcar con `[x]` al verificar
- Si algún CHK falla, agregar task correctiva en `tasks.md` antes de mergear
- Para CHK077 (Firefox backdrop-filter): si falla, fallback es `background: rgba(0,0,0,0.85)` sin blur; degradar limpiamente