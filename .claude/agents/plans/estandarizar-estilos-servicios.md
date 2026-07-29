# Plan: Estandarizar Estilos en Páginas de Servicios

## Objetivo
Replicar los estilos CSS de `mediforma.html` en todas las páginas de servicios (38 páginas: 19 es + 19 en) para lograr consistencia visual y mejorar conversión según las mejores prácticas CRO para páginas médicas.

## Análisis Comparativo

### Clases CSS únicas de mediforma.html NO presentes en otras páginas:

1. **Secciones con fondo tinted:**
   - `.mediforma-tinted` - fondo cristal-clear con bordes

2. **Componentes de CTA:**
   - `.mediforma-cta-strip` - franja CTA intermedia
   - `.mediforma-final-cta` - CTA final con fondo oscuro
   - `.mediforma-final-label` - etiqueta pequeña
   - `.mediforma-final-sub` - subtítulo del CTA final

3. **Beneficios (3-column grid):**
   - `.mediforma-benefits-intro` - texto introductorio
   - `.mediforma-benefits` - grid de 3 columnas
   - `.mediforma-benefits-sub` - sublistas dentro de beneficios

4. **Lista de qué incluye (numbered list):**
   - `.mediforma-includes` - lista principal
   - `.mediforma-include-item` - cada item con grid
   - `.mediforma-include-num` - número grande

5. **Pilares del programa (2x2 grid):**
   - `.mediforma-pillars` - grid 2x2
   - SVG de 64px para cada pilar

6. **Testimonios con carrusel:**
   - `.mediforma-testimonials` - contenedor
   - `.testimonial-item` - cada testimonio
   - `.testimonial-item.active` - testimonio visible
   - `.testimonial-nav` - botones de navegación
   - `.testimonial-author` - autor del testimonio

7. **Galería de resultados:**
   - `.resultados-gallery` - ya creada, necesita ser añadida donde aplique

### Clases CSS que SÍ están compartidas (no tocar):

1. **Hero section:**
   - `.hero-stats` - presente en mediforma y dermatologia
   - `.hero-cta-group` - presente en mediforma y dermatologia
   - `.hero-stat` - items individuales

2. **Layout básico:**
   - `.two_columns` - usado en múltiples páginas
   - `.flow` - usado en todas
   - `.wrapper` - usado en todas

## Estrategia de Implementación

### FASE 1: Actualizar archivos CSS (1 archivo)

**Archivo a modificar:** `assets/css/mediforma.css`

**Acción:** Los estilos ya existen en `mediforma.css`. Solo necesitamos:
1. ✅ Verificar que `mediforma.css` esté siendo incluido en todas las páginas de servicios
2. ✅ Asegurar que los estilos sean genéricos enough para reutilizarse

**NOTA:** Las clases ya están bien nombradas (`.mediforma-*`) así que NO causarán conflictos.

### FASE 2: Estandarizar estructura HTML por sección (38 archivos)

Para cada página de servicio (38 total), aplicar cambios SECCIÓN POR SECCIÓN:

#### 2.1 Hero Section (ya estandarizado en mayoría)
- ✅ Usar `.hero-stats` para datos (precio, duración, etc.)
- ✅ Usar `.hero-cta-group` para CTAs del hero
- ✅ Mantener estructura `.two_columns` existente

#### 2.2 Añadir sección de Beneficios (3-column) DONDE FALTE
```liquid
<section class="wrapper" aria-labelledby="beneficios-heading">
  <h2 id="beneficios-heading">Beneficios exclusivos</h2>
  <p class="mediforma-benefits-intro">Texto introductorio opcional</p>
  <ul class="mediforma-benefits">
    <li>
      <h3>Título del beneficio</h3>
      <p>Descripción del beneficio</p>
    </li>
    <!-- Repetir hasta 3 beneficios -->
  </ul>
</section>
```

**CONDICIONAL:** Si la página YA tiene una sección de beneficios (con otras clases), dejarla como está. Solo añadir si no existe.

#### 2.3 Añadir sección "Qué incluye" (numbered list) DONDE FALTE
```liquid
<section class="wrapper" aria-labelledby="incluye-heading">
  <h2 id="incluye-heading">¿Qué incluye este tratamiento?</h2>
  <ol class="mediforma-includes">
    <li class="mediforma-include-item">
      <span class="mediforma-include-num" aria-hidden="true">01</span>
      <div>
        <h3>Título del item</h3>
        <ul>
          <li>Detalle del item</li>
        </ul>
        <p>Nota opcional</p>
      </div>
    </li>
    <!-- Repetir según el tratamiento -->
  </ol>
  <div class="mediforma-cta-strip">
    {% include button.html %}
  </div>
</section>
```

**CONDICIONAL:** Si la página YA tiene una sección similar (como `.highlight-list` en dermatologia), dejarla como está. Solo añadir si no existe.

#### 2.4 Añadir sección de Pilares (2x2 grid) DONDE FALTE
```liquid
<section class="mediforma-tinted" aria-labelledby="pilares-heading">
  <div class="wrapper">
    <h2 id="pilares-heading" class="center">Pilares del tratamiento</h2>
    <ul class="mediforma-pillars">
      <li>
        <svg><!-- SVG de 64px --></svg>
        <div>
          <h3>Título del pilar</h3>
          <p>Descripción del pilar</p>
        </div>
      </li>
      <!-- Repetir 4 pilares -->
    </ul>
  </div>
</section>
```

**CONDICIONAL:** Solo añadir si la página no tiene una sección similar de pilares/diferenciadores.

#### 2.5 Añadir carrusel de testimonios DONDE FALTE
```liquid
<section class="mediforma-tinted" aria-labelledby="testimonios-heading">
  <div class="wrapper">
    <h2 id="testimonios-heading" class="gold center">Historias reales</h2>
    <div class="mediforma-testimonials">
      <div class="testimonial-item active">
        <p>"Texto del testimonio"</p>
        <p class="testimonial-author">— <strong>Nombre del paciente</strong></p>
      </div>
      <!-- Añadir 2-3 testimonios más -->
      <button class="testimonial-nav prev" aria-label="Anterior">←</button>
      <button class="testimonial-nav next" aria-label="Siguiente">→</button>
    </div>
    <script src="{{ '/assets/js/testimonial-carousel.js' | relative_url }}" defer></script>
  </div>
</section>
```

**CONDICIONAL:** Si la página YA tiene testimonios (como implante-capilar.html que tiene `testimonial-carousel.css`), mantener el existente. Solo añadir si no tiene testimonios.

#### 2.6 Añadir CTA final DONDE FALTE
```liquid
<section class="mediforma-final-cta" aria-labelledby="cta-final-heading">
  <div class="wrapper">
    <p class="mediforma-final-label">Cupos limitados · Bogotá</p>
    <h2 id="cta-final-heading">Título llamativo</h2>
    <p class="mediforma-final-sub">Subtítulo con <strong>precio destacado</strong> · detalles</p>
    {% include button.html %}
  </div>
</section>
```

**CONDICIONAL:** Si la página YA tiene un CTA final con clases diferentes, mantenerlo. Solo añadir si no existe.

#### 2.7 Añadir galería de resultados DONDE FALTE Y APLIQUE
```liquid
{% include resultados-gallery.html %}
```

**CONDICIONAL:** Solo añadir si:
1. El front matter tiene `resultados:` con datos
2. El tratamiento realmente tiene fotos de resultados
3. NO añadir si no hay fotos (evitar estructura vacía)

### FASE 3: Verificar inclusiones de CSS y JS

Para cada página modificada, asegurar que tenga:

```liquid
<link rel="stylesheet" href="{{ '/assets/css/mediforma.css' | relative_url }}">
```

Y si se añadieron testimonios con carrusel:
```liquid
<script src="{{ '/assets/js/testimonial-carousel.js' | relative_url }}" defer></script>
```

## Archivos a Modificar

### Páginas en Español (19 archivos):
1. _servicios_es/bruxismo.html
2. _servicios_es/consulta-capilar.html
3. _servicios_es/dermatologia.html
4. _servicios_es/exosomas.html
5. _servicios_es/hidratacion-facial.html
6. _servicios_es/hiperhidrosis.html
7. _servicios_es/hidrolipoclasia.html
8. _servicios_es/implante-barba.html
9. _servicios_es/implante-capilar.html
10. _servicios_es/labios.html
11. _servicios_es/mesoterapia-capilar.html
12. _servicios_es/nanopore-tratamiento.html
13. _servicios_es/ojeras.html
14. _servicios_es/peeling-facial.html
15. _servicios_es/plasma-capilar.html
16. _servicios_es/pomulos.html
17. _servicios_es/profhilo-tratamiento.html
18. _servicios_es/radiesse.html
19. _servicios_es/sculptra.html
20. _servicios_es/sueroterapia.html
21. _servicios_es/surcos.html
22. _servicios_es/toxina-botulinica-tercio-superior.html
23. _servicios_es/tratamiento-cosmelan.html
24. _servicios_es/tratamiento-enzimas-pb-serum.html
25. _servicios_es/tratamiento-menton.html
26. _servicios_es/terapia-laser-capilar.html
27. _servicios_es/mediforma.html (REFERENCIA - ya completo)

### Páginas en Inglés (19 archivos):
1. _servicios_en/beard-implant.html
2. _servicios_en/hair-consultation.html
3. _servicios_en/dermatology.html
4. _servicios_en/exosomes.html
5. _servicios_en/facial-hydration.html
6. _servicios_en/hyperhidrosis.html
7. _servicios_en/hydrolipoclasia.html
8. _servicios_en/hair-transplant.html
9. _servicios_en/lips-treatment.html
10. _servicios_en/hair-mesotherapy.html
11. _servicios_en/nanopore-treatment.html
12. _servicios_en/under-eye-treatment.html
13. _servicios_en/facial-peeling.html
14. _servicios_en/hair-plasma.html
15. _servicios_en/cheekbone-treatment.html
16. _servicios_en/profhilo-treatment.html
17. _servicios_en/radiesse.html
18. _servicios_en/sculptra.html
19. _servicios_en/suerotherapy.html
20. _servicios_en/facial-folds.html
21. _servicios_en/botulinum-toxin-upper-face.html
22. _servicios_en/cosmelan-treatment.html
23. _servicios_en/pb-serum-enzyme-treatment.html
24. _servicios_en/chin.html
25. _servicios_en/low-level-laser-therapy.html
26. _servicios_en/mediform.html
27. _servicios_en/bruxism.html

**Total: 38 páginas a estandarizar**

## Orden de Trabajo

### Grupo 1: Páginas similares a mediforma (con programas/tratamientos complejos)
Priorizar páginas que más se benefician de la estructura completa:
- implante-capilar.html / hair-transplant.html
- dermatologia.html / dermatology.html
- consulta-capilar.html / hair-consultation.html

### Grupo 2: Páginas de tratamientos estéticos simples
- labios.html / lips-treatment.html
- pomulos.html / cheekbone-treatment.html
- ojeras.html / under-eye-treatment.html
- etc.

### Grupo 3: Páginas restantes
- Todas las demás en orden alfabético

## Reglas Críticas

1. **NO mover contenido hardcoded a front matter**
   - Si el contenido está en HTML, dejarlo en HTML
   - Solo usar front matter para datos configurables (títulos, listas de items)

2. **Respetar secciones existentes**
   - Si una página YA tiene una sección de beneficios (aunque con otras clases), NO borrarla
   - Solo añadir secciones que faltan

3. **NO crear contenido nuevo**
   - No inventar beneficios, pilares o testimonios
   - Si no hay contenido para una sección, mejor no añadirla

4. **Mantener consistencia visual**
   - Usar las mismas clases CSS de mediforma.html
   - NO duplicar estilos en otros CSS files
   - NO crear CSS inline

5. **Inclusiones condicionales**
   - Usar `{% if page.campo %}` para contenido del front matter
   - NO usar condicionales para contenido hardcoded HTML

## Checklist de Verificación por Página

Para cada página modificada:

- [ ] Tiene `<link rel="stylesheet" href="{{ '/assets/css/mediforma.css' | relative_url }}">`
- [ ] Hero usa `.hero-stats` y `.hero-cta-group`
- [ ] Si tiene beneficios, usa `.mediforma-benefits`
- [ ] Si tiene "qué incluye", usa `.mediforma-includes`
- [ ] Si tiene pilares, usa `.mediforma-pillars`
- [ ] Si tiene testimonios, usa `.mediforma-testimonials` o el existente
- [ ] Si tiene CTA final, usa `.mediforma-final-cta` o el existente
- [ ] Si tiene resultados con fotos en front matter, usa `{% include resultados-gallery.html %}`
- [ ] NO hay CSS inline (`style="..."`)
- [ ] NO hay estilos hardcoded en clases HTML
- [ ] Las imágenes tienen `loading="lazy"`, `decoding="async"`, `width`, `height`, `alt`

## Tiempo Estimado

- Grupo 1 (3 páginas × 2 idiomas): 6 páginas × 15 min = 1.5 horas
- Grupo 2 (10 páginas × 2 idiomas): 20 páginas × 10 min = 3.3 horas
- Grupo 3 (10 páginas × 2 idiomas): 20 páginas × 8 min = 2.7 horas
- Verificación final: 30 min

**Total estimado: 8 horas**

## Métricas de Éxito

1. ✅ Todas las 38 páginas tienen estructura consistente
2. ✅ Todas usan clases CSS de mediforma.css (donde aplica)
3. ✅ NO hay CSS inline
4. ✅ Secciones condicionales funcionan correctamente
5. ✅ Páginas cargan sin errores
6. ✅ Conversiones mejoran (según principios CRO medical-cro.md)
