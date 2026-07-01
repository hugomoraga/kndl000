# Setup Checklist: Umbral Vision como submódulo y paquete npm

**Purpose**: Verificación final de prerequisitos administrativos antes de empezar el split.
**Created**: 2026-06-20
**Feature**: `specs/010-umbral-vision-as-npm-package/spec.md`

## GitHub account & repo

- [ ] CHK001 Cuenta `hugomoraga` existe en github.com y tiene al menos un repo público previo (verificación de "existe como usuario real")
- [ ] CHK002 `gh` CLI está autenticado (`gh auth status` retorna `Logged in to github.com as hugomoraga`)
- [ ] CHK003 Permisos para crear repos públicos bajo la organización o usuario personal
- [ ] CHK004 El repo `hugomoraga/umbral-vision` aún no existe (verificar con `gh repo view hugomoraga/umbral-vision` retorna error)
- [ ] CHK005 Nombre `umbral-vision` no choca con un fork, archived repo o transfer pending

## npm account & scope

- [ ] CHK006 Cuenta npmjs.com con username `hugomoraga` existe y está verificada por email
- [ ] CHK007 2FA está activo en npmjs.com (Settings → Two Factor Authentication)
- [ ] CHK008 El scope `@hugomoraga` existe o puede crearse (Settings → Organizations → Create: scope name `hugomoraga`, visibility public)
- [ ] CHK009 Token `NPM_TOKEN` se puede generar localmente: `npm token create --type=automation` (no commitear el token; guardar en password manager)
- [ ] CHK010 El token generado tiene scope de publish en `@hugomoraga` (verificar en `npmjs.com → Access Tokens → detail`)

## Local tooling

- [ ] CHK011 `git` ≥ 2.30 disponible (`git --version`)
- [ ] CHK012 `git subtree` funcional (`git subtree split --help` retorna help, no error de "command not found"; macOS lo trae built-in)
- [ ] CHK013 `node` ≥ 18 instalado (`node --version`)
- [ ] CHK014 `npm` ≥ 9 instalado (`npm --version`)
- [ ] CHK015 (Opcional) `git filter-repo` instalado vía pip si se elige esa ruta alternativa — **no aplica** porque usamos `subtree split`

## kndl000 precondiciones

- [ ] CHK016 Working tree limpio: `git status` sin cambios uncommitted en `kndl000`
- [ ] CHK017 Rama `main` actualizada con el remoto: `git fetch origin && git status` muestra `Your branch is up to date`
- [ ] CHK018 La carpeta `assets/js/umbral-vision/` está tracked (no gitignored): `git ls-files assets/js/umbral-vision | wc -l` ≥ 7
- [ ] CHK019 El sitio Jekyll construye en limpio: `rm -rf _site && bundle exec jekyll build` termina con código 0
- [ ] CHK020 `kndl000/package.json` existe y es válido JSON (`node -e "JSON.parse(require('fs').readFileSync('package.json'))"`)

## Documentación

- [ ] CHK021 Este checklist firmado (todos los items verificados) antes de empezar Phase 2
- [ ] CHK022 Backup manual del estado actual: `git tag pre-umbral-split` en `kndl000` por si hay que rollback

## Notes

- Marcar items con `[x]` al verificar
- Si algún CHK falla, resolver antes de continuar (la spec asume estos prerequisitos)
- El rollback completo está documentado en `plan.md` sección "Rollback plan"