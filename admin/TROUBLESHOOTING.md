# 🔍 Diagnóstico del problema de login

## Verificaciones necesarias:

### 1. Verificar la OAuth App en GitHub

Ve a: **https://github.com/settings/developers**

Busca tu OAuth App (debería tener el Client ID: `Ov23liM5Ca4jHPL9jR6K`)

**Verifica que tenga:**
- ✅ **Authorization callback URL**: `https://kundala000.com/admin/` (con la barra final `/`)
- ✅ **Homepage URL**: `https://kundala000.com`

**Si no coincide exactamente, edítala y guarda.**

### 2. Verificar que el archivo config.yml sea accesible

Abre en tu navegador: `https://kundala000.com/admin/config.yml`

**Deberías ver** el contenido del archivo YAML. Si sale 404, el problema es que el archivo no se está desplegando.

### 3. Verificar la consola del navegador

1. Abre `https://kundala000.com/admin/`
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña **Console**
4. Intenta hacer login
5. **Copia cualquier error** que aparezca

### 4. Verificar permisos del repositorio

Asegúrate de que tu cuenta de GitHub tenga permisos de escritura en el repositorio `hugomoraga/kndl000`.

## Posibles problemas y soluciones:

### Problema: "404" al hacer click en "Login with GitHub"
**Solución**: La Authorization callback URL en GitHub debe ser exactamente `https://kundala000.com/admin/`

### Problema: "Error: redirect_uri_mismatch"
**Solución**: Verifica que la callback URL en GitHub coincida exactamente con la URL del admin

### Problema: No aparece el botón de login
**Solución**: Verifica que `admin/config.yml` sea accesible en `/admin/config.yml`

### Problema: El login se completa pero vuelve a pedir login
**Solución**: Puede ser un problema de permisos. Verifica que tengas acceso de escritura al repositorio.

## Próximos pasos:

1. Verifica la OAuth App en GitHub (paso 1)
2. Verifica que config.yml sea accesible (paso 2)
3. Revisa la consola del navegador (paso 3)
4. Si sigue sin funcionar, comparte los errores de la consola

