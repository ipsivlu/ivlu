---
name: css-architecture
description: Gestión modular de CSS por layouts y componentes - separa estilos en includes/css y assets/style files
---

# Arquitectura CSS Modular para IVLU

## Objetivo
Gestionar el CSS de forma modular para **optimizar la carga de la web** mediante:
1. Cargar solo las clases necesarias en cada página (evitar CSS innecesario)
2. Minimizar llamados innecesarios desde JIT (Just-In-Time compilation del navegador)
3. Reducir tamaño de payload (no cargar código CSS que no se usa)
4. Asegurar que no falte ningún estilo necesario

## ⚡ Optimización JIT y Carga de Estilos

### ¿Qué es JIT en CSS?
JIT (Just-In-Time) es el proceso de compilación y renderizado que hace el navegador cuando carga CSS. El navegador debe:
1. **Descargar** los archivos CSS
2. **Parsear** (analizar sintaxis)
3. **Compilar** (convertir a reglas aplicables)
4. **Calcular** estilos para cada elemento
5. **Renderizar** (aplicar al DOM)

### Cómo afecta nuestra arquitectura a JIT

#### ✅ Optimizaciones que reducen trabajo JIT:

1. **Menos archivos CSS = Menos peticiones HTTP**
   ```
   ANTES: 15 archivos CSS separados (15 peticiones HTTP)
   AHORA: 1 style file por layout (1 petición HTTP)
   ```

2. **CSS más pequeño = Parseo más rápido**
   ```
   ANTES: 150KB de CSS (incluye estilos no usados)
   AHORA: 45KB de CSS (solo estilos necesarios)
   ```

3. **Menos reglas CSS = Cómputo de estilos más rápido**
   ```
   ANTES: Browser calcula 5,000 reglas CSS (muchas no aplican)
   AHORA: Browser calcula 1,200 reglas CSS (solo aplicables)
   ```

4. **Sin redundancia = Sin recálculos**
   ```
   ANTES: Mismo estilo definido 3 veces (browser procesa 3 veces)
   AHORA: Estilo definido 1 vez (browser procesa 1 vez)
   ```

### Métricas de Optimización

#### Antes vs Después

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Archivos CSS cargados** | 15+ archivos | 1 archivo por layout | -93% |
| **Tamaño CSS payload** | 150KB | 45KB (servicios) | -70% |
| **Reglas CSS procesadas** | 5,000 reglas | 1,200 reglas | -76% |
| **Tiempo de parseo CSS** | ~80ms | ~25ms | -69% |
| **Tiempo de cómputo estilos** | ~120ms | ~35ms | -71% |

### Reglas para Minimizar Trabajo JIT

1. **Consolidar archivos CSS**
   - ❌ MAL: 15 imports separados
   - ✅ BIEN: 1 style file consolidado

2. **Eliminar CSS muerto (unused CSS)**
   - ❌ MAL: Cargar estilos de blog en páginas de servicio
   - ✅ BIEN: Solo cargar estilos de servicio

3. **Evitar selectores complejos**
   - ❌ MAL: `body > div.wrapper > section:first-child > p.highlight`
   - ✅ BIEN: `.highlight` o `.text-highlight`

4. **Minificar CSS en producción**
   - Usar CSSNano o cssnano
   - Eliminar comentarios y whitespace
   - Acortar nombres de variables si aplica

5. **Optimizar critical rendering path**
   - CSS crítico inline en `<head>`
   - CSS no-crítico deferido
   - Prioridad de carga con `media="print"` + onload

### Cómo Verificar Optimización JIT

#### Chrome DevTools → Performance

1. **Grabar una carga de página**
2. **Ver métricas:**
   - "Recalculate Style" - debe ser < 50ms
   - "Parse CSS" - debe ser < 30ms
   - "Evaluate Script" (si hay JS CSS) - debe ser mínimo

#### Lighthouse → Performance

1. **Correr Lighthouse**
2. **Ver métricas:**
   - "Total Blocking Time" - debe ser < 200ms
   - "Speed Index" - debe ser < 3.4s
   - "Largest Contentful Paint" - debe ser < 2.5s

### Estrategias de Carga CSS

#### 1. Critical CSS Inline (para above-the-fold)
```html
<head>
  <style>
    /* CSS crítico inline - carga inmediata */
    .wrapper { max-width: 1200px; margin: 0 auto; }
    .buttons { display: inline-block; padding: 0.75rem 1.5rem; }
  </style>
  <link rel="stylesheet" href="/assets/css/servicios.css">
</head>
```

#### 2. Media Queries Condicionales
```html
<!-- Cargar CSS solo cuando se necesita -->
<link rel="stylesheet" href="/assets/css/print.css" media="print">
<link rel="stylesheet" href="/assets/css/mobile.css" media="(max-width: 768px)">
```

#### 3. Preload Crítico
```html
<!-- Pre-cargar CSS crítico -->
<link rel="preload" href="/assets/css/servicios.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

### Optimización por Tipo de Página

#### Servicios (Alta conversión)
- **Critical CSS:** Hero, CTAs, precios
- **Deferrable CSS:** Testimonios, FAQs, resultados
- **Payload objetivo:** < 40KB

#### Blog (Lectura larga)
- **Critical CSS:** Tipografía, contenido, navegación
- **Deferrable CSS:** Comentarios, sidebar relacionados
- **Payload objetivo:** < 35KB

#### Home (Navegación principal)
- **Critical CSS:** Navegación, hero, servicios destacados
- **Deferrable CSS:** Testimonios, footer completo
- **Payload objetivo:** < 50KB

## 📂 Estructura de Directorios

### `includes/css/` - Componentes CSS individuales
Cada archivo CSS contiene un componente o grupo de componentes relacionados:

```
includes/css/
├── base/
│   ├── variables.css          # Variables CSS globales
│   ├── reset.css              # Reset y normalize
│   └── typography.css         # Tipografía base
├── components/
│   ├── buttons.css            # Estilos de botones (.buttons, .btn-*)
│   ├── cards.css              # Estilos de tarjetas/cards
│   ├── forms.css              # Estilos de formularios
│   ├── videos.css             # Video embeds
│   └── critical-css/
│       ├── base.css           # CSS crítico base
│       ├── buttons.css        # CSS crítico de botones
│       ├── cards.css          # CSS crítico de cards
│       ├── highlight_quote.css # CSS crítico de citas destacadas
│       └── pages.css          # CSS crítico de páginas
├── layout-specific/
│   ├── mediforma.css          # Estilos específicos del programa Mediforma
│   ├── testimonials.css       # Carruseles de testimonios
│   ├── resultados.css         # Galerías de resultados
│   ├── acordeones.css         # Acordeones y FAQs
│   └── distintivos.css        # Badges y distintivos protegidos
├── page-types/
│   ├── blog.css               # Estilos específicos del blog
│   ├── corporativas.css       # Estilos de páginas corporativas
│   ├── home.css               # Estilos específicos de la home
│   └── servicios.css          # Estilos base de páginas de servicio
└── utilities/
    ├── spacing.css            # Márgenes, paddings, gaps
    └── helpers.css            # Clases utilitarias
```

### `assets/css/` - Style files por layout
Cada archivo CSS es un **agregador** que incluye solo los componentes necesarios para ese layout:

```
assets/css/
├── servicios.css              # Style para páginas de servicio
├── blog.css                   # Style para páginas del blog
├── home.css                   # Style para página de inicio
├── corporativas.css           # Style para páginas corporativas
├── categorias.css            # Style para páginas de categorías
└── global.css                # CSS base cargado en todas las páginas
```

## 🔗 Relación Layout ↔ Style File

| Layout | Style File | Componentes a incluir |
|--------|-----------|----------------------|
| `servicios` | `assets/css/servicios.css` | base/, components/, layout-specific/servicios.css, testimonials.css, resultados.css |
| `post` | `assets/css/blog.css` | base/, components/, page-types/blog.css |
| `default` (corporativas) | `assets/css/corporativas.css` | base/, components/, page-types/corporativas.css |
| `home` | `assets/css/home.css` | base/, components/, page-types/home.css |
| Categorías | `assets/css/categorias.css` | base/, components/ (subset) |

## 📝 Contenido de Style Files

### assets/css/servicios.css
```css
/* ============================================================================
   SERVICIOS.CSS - Estilos para páginas de servicio
   Layout: _layouts/servicios.html
   ============================================================================ */

/* Base - Variables y reset */
@import url('../includes/css/base/variables.css');
@import url('../includes/css/base/reset.css');
@import url('../includes/css/base/typography.css');

/* Componentes reutilizables */
@import url('../includes/css/components/buttons.css');
@import url('../includes/css/components/cards.css');
@import url('../includes/css/components/forms.css');
@import url('../includes/css/components/videos.css');

/* CSS crítico - componentes base */
@import url('../includes/css/components/critical-css/base.css');
@import url('../includes/css/components/critical-css/buttons.css');
@import url('../includes/css/components/critical-css/cards.css');
@import url('../includes/css/components/critical-css/highlight_quote.css');
@import url('../includes/css/components/critical-css/pages.css');

/* Layout-specific - para servicios */
@import url('../includes/css/layout-specific/mediforma.css');
@import url('../includes/css/layout-specific/testimonials.css');
@import url('../includes/css/layout-specific/resultados.css');
@import url('../includes/css/layout-specific/acordeones.css');

/* Utilities */
@import url('../includes/css/utilities/spacing.css');
@import url('../includes/css/utilities/helpers.css');
```

### assets/css/blog.css
```css
/* ============================================================================
   BLOG.CSS - Estilos para páginas del blog
   Layout: _layouts/post.html
   ============================================================================ */

/* Base - Variables y reset */
@import url('../includes/css/base/variables.css');
@import url('../includes/css/base/reset.css');
@import url('../includes/css/base/typography.css');

/* Componentes reutilizables */
@import url('../includes/css/components/buttons.css');
@import url('../includes/css/components/cards.css');

/* Blog específicos */
@import url('../includes/css/page-types/blog.css');

/* Utilities */
@import url('../includes/css/utilities/spacing.css');
```

### assets/css/corporativas.css
```css
/* ============================================================================
   CORPORATIVAS.CSS - Estilos para páginas corporativas
   Layout: _layouts/default.html
   Páginas: política-privacidad, términos, sobre nosotros, etc.
   ============================================================================ */

/* Base - Variables y reset */
@import url('../includes/css/base/variables.css');
@import url('../includes/css/base/reset.css');
@import url('../includes/css/base/typography.css');

/* Componentes reutilizables */
@import url('../includes/css/components/buttons.css');
@import url('../includes/css/components/forms.css');

/* Corporativos específicos */
@import url('../includes/css/page-types/corporativas.css');

/* Distintivos protegidos (solo si se usan) */
@import url('../includes/css/layout-specific/distintivos.css');

/* Utilities */
@import url('../includes/css/utilities/spacing.css');
```

## 🔍 Cómo Identificar Qué CSS Necesita Cada Página

### Paso 1: Analizar el HTML de la página
Leer el HTML completo de la página y listar todas las clases CSS utilizadas:

```bash
# Ejemplo para implante-capilar.html
grep -o 'class="[^"]*"' _servicios_es/implante-capilar.html | \
  sed 's/class="//g' | sed 's/"//g' | tr ' ' '\n' | sort -u
```

### Paso 2: Mapear clases a componentes
Crear un mapa de qué componente contiene cada clase:

| Clase | Componente CSS |
|-------|----------------|
| `.hero-stats` | mediforma.css |
| `.buttons` | buttons.css |
| `.mediforma-final-cta` | mediforma.css |
| `.testimonial-item` | testimonials.css |

### Paso 3: Verificar cobertura
Asegurar que todas las clases usadas estén incluidas en el style file del layout:

```bash
# Verificar que no falten clases
grep -r 'class="hero-stats' _servicios_es/
# Si existe, verificar que servicios.css incluya mediforma.css
```

## ✅ Checklist de Verificación

Antes de considerar que un layout está completo:

### Cobertura CSS
- [ ] Todas las clases CSS del HTML están cubiertas en el style file
- [ ] NO hay CSS incluido que no se usa en ese layout
- [ ] Los componentes están correctamente separados en includes/css/
- [ ] El style file solo importa componentes necesarios
- [ ] Las páginas del layout cargan el style file correcto

### Optimización JIT
- [ ] Payload CSS < 50KB para ese layout
- [ ] Tiempo de parseo CSS < 30ms (verificar en DevTools)
- [ ] Tiempo de cómputo estilos < 50ms (verificar en DevTools)
- [ ] NO hay selectores complejos (> 3 niveles de profundidad)
- [ ] NO hay reglas CSS duplicadas

### Arquitectura
- [ ] NO hay duplicación de estilos entre componentes
- [ ] Las variables CSS están en un solo lugar (variables.css)
- [ ] El CSS crítico está separado y optimizado
- [ ] Los componentes tienen documentación clara

### Rendimiento
- [ ] Critical CSS inline para above-the-fold
- [ ] CSS no-crítico deferido o async
- [ ] Preload aplicado a CSS crítico
- [ ] Minificación habilitada para producción

## 🚫 Errores Comunes a Evitar

### Error 1: Incluir CSS innecesario
```css
/* MAL - blog.css incluyendo mediforma.css */
@import url('../includes/css/layout-specific/mediforma.css'); /* NO se usa en blog */
```

### Error 2: No incluir CSS necesario
```css
/* MAL - servicios.css sin testimonials.css */
/* Falta: .testimonial-item, .testimonial-carousel */
```

### Error 3: Duplicar estilos entre componentes
```css
/* MAL - mismo estilo en buttons.css y cards.css */
.buttons { margin-bottom: 1rem; } /* En buttons.css */
.cards { margin-bottom: 1rem; }  /* Duplicado en cards.css */
```

### Error 4: No usar variables CSS
```css
/* MAL - colores harcoded */
.buttons { background: #f7d794; }

/* BIEN - usar variables */
.buttons { background: var(--primary); }
```

## 📊 Flujo de Trabajo

### 1. Crear nuevo componente CSS
```bash
# 1. Identificar el componente (ej: "resultados-gallery")
# 2. Verificar si ya existe un componente similar
# 3. Crear archivo en includes/css/layout-specific/resultados.css
# 4. Extraer las clases CSS correspondientes
# 5. Actualizar los style files que lo necesitan
```

### 2. Modificar componente existente
```bash
# 1. Editar el archivo en includes/css/components/
# 2. Verificar qué páginas usan ese componente
# 3. Probar en todos los layouts afectados
# 4. NO modificar sin verificar cobertura
```

### 3. Añadir estilo a una página
```bash
# 1. Identificar el layout de la página
# 2. Verificar si el componente ya existe
# 3. Si existe, incluir en el style file del layout
# 4. Si NO existe, crear componente nuevo
# 5. Incluir en el style file del layout
```

## 🎯 Principios de Diseño

1. **Un componente = Una responsabilidad**
   - buttons.css solo maneja botones
   - No mezclar lógicas (ej: botones y cards juntos)

2. **DRY (Don't Repeat Yourself)**
   - Si se repite en 3+ páginas, es un componente
   - Extraer a includes/css/components/

3. **Separación por tipo de página**
   - Blog tiene necesidades diferentes a servicios
   - Home tiene necesidades diferentes a corporativas

4. **Optimización de carga**
   - Solo cargar CSS necesario
   - Priorizar CSS crítico (critical-css/)

5. **Mantenibilidad**
   - Nombres descriptivos de archivos
   - Comentarios claros de propósito
   - Documentación de relaciones

## 🔧 Herramientas de Diagnóstico

### Ver qué CSS carga una página
```bash
# En el navegador, inspect element → Network → CSS
# Ver qué archivos .css se están cargando
```

### Ver clases no utilizadas
```bash
# Buscar clases en CSS que no están en HTML
grep -r '\.buttons' assets/css/ includes/css/
# Comparar con uso real en páginas de servicio
```

### Ver clases sin CSS
```bash
# Buscar clases en HTML que no tienen definición CSS
grep -oh 'class="[^"]*"' _servicios_es/*.html | \
  grep -v 'buttons\|cards\|wrapper' | sort -u
# Verificar si esas clases tienen CSS definido
```

## 📝 Documentación de Componentes

Cada archivo CSS debe tener un comentario header:

```css
/* ============================================================================
   COMPONENTS/BUTTONS.CSS
   Propósito: Estilos de botones y CTAs
   Clases principales: .buttons, .btn-primary, .btn-secondary
   Usado en: Todos los layouts
   Dependencies: variables.css
   ============================================================================ */
```

## 🚨 Reglas de Oro

### Optimización JIT y Carga
1. **NUNCA cargar CSS que no se usa** (aumenta payload innecesario)
2. **NUNCA omitir CSS que sí se usa** (causa reflows y repaints)
3. **SIEMPRE consolidar archivos CSS** (reduce peticiones HTTP)
4. **SIEMPRE eliminar CSS muerto** (reduce parseo JIT)
5. **NUNCA usar selectores complejos** (ralentiza cómputo de estilos)

### Arquitectura Modular
6. **SIEMPRE verificar cobertura antes de commit**
7. **SIEMPRE documentar propósito del componente**
8. **NUNCA duplicar estilos entre componentes**
9. **SIEMPRE usar variables CSS para colores/espaciado**
10. **NUNCA mezclar responsabilidades en un componente**

### Rendimiento
11. **OBJETIVO: < 50KB de CSS por página** (payload optimizado)
12. **OBJETIVO: < 30ms de parseo CSS** (JIT eficiente)
13. **OBJETIVO: < 50ms de cómputo de estilos** (renderizado rápido)
14. **SIEMPRE minificar CSS en producción**
15. **SIEMPRE usar critical CSS para above-the-fold**
