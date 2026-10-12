# Investigación: perfil público de Moisés Baldenegro Melendez (para /about)

Fecha: 2026-10-12. Alcance: solo información pública, enlazada desde fuentes del propio
autor (GitHub, sitio, YouTube, npm). No se incluyen datos sensibles.

> Nota de método: el buscador web se negó a hacer búsquedas por nombre de persona
> (p. ej. LinkedIn + nombre) y devolvió ruido en búsquedas de handle. Por eso todo
> lo verificado parte de **fuentes controladas por el propio autor**, enlazadas entre sí
> (GitHub → LinkedIn/YouTube/npm; sitio → X). LinkedIn (HTTP 999) y X (HTTP 402)
> bloquearon la lectura: su contenido **no** se pudo verificar.

## Resumen

Ingeniero de software mexicano (Guadalajara, Jalisco; el README de GitHub dice
"Jalisco ↔ Sonora"), autodenominado "Rustacean". Enfoque declarado: desarrollo seguro
(OWASP), sistemas distribuidos, Rust/WebAssembly, AI engineering, DevOps y nube
(AWS/Azure), arquitectura hexagonal y DDD. Lema: "Deterministic Engineering in an
Agentic World". Estudia/estudió Cybersecurity Engineering en "Lamar" (repo de
coursework). Crea contenido en español: blog de arquitectura de software y sistemas
operativos, y un curso de Rust desde cero en YouTube. Proyectos OSS propios: Raúl
(framework MVC TS), mouter-router (npm), MFinance (Tauri+React), Testimo (hackathon),
Harness Kit (flujo de agentes IA con TDD).

## Perfiles y enlaces

| Perfil | URL | Confianza | Fuente de verificación |
|---|---|---|---|
| GitHub `MoiBaldenegro` (nombre "Moi Baldenegro", bio "Rustacean 🦀", ubicación "Guadalajara, Jalisco, Mexico", creado 2023-02-08, ~141 repos públicos) | https://github.com/MoiBaldenegro | Alto | https://api.github.com/users/MoiBaldenegro ; remoto `origin` de este repo |
| Sitio personal | https://moisesbaldenegro.com (también /about) | Alto | Fetch directo; autor "Moises Baldenegro Melendez" en posts |
| moibaldenegro.com | — | — | **No resuelve DNS** (ENOTFOUND) al 2026-10-12 |
| LinkedIn `/in/moibaldenegro` | https://www.linkedin.com/in/moibaldenegro/ | Alto (enlace) / sin contenido | Enlazado desde README de perfil GitHub; contenido no legible (HTTP 999) |
| YouTube `@moibaldenegro` (canal "Moises Baldenegro Melendez") | https://www.youtube.com/@moibaldenegro | Alto | oEmbed de https://youtu.be/0oDS-zmCFrA y https://youtu.be/B6XORAt7Dfg devuelve author_url `@moibaldenegro` |
| X `@moibaldenegro` | https://x.com/moibaldenegro | Alto (enlace) / sin contenido | Enlazado en `src/data/hero.json` y en el sitio; contenido no legible (HTTP 402) |
| npm `moibaldenegro` | https://www.npmjs.com/package/mouter-router | Alto | https://registry.npmjs.org/mouter-router (maintainer `moibaldenegro`) |
| Hack The Box | (perfil vía API, id en env) | Medio | El sitio consume `labs.hackthebox.com/api/v4/user/profile/basic` (`src/domain/repositories/htb-profile-repository.ts`); URL pública del perfil no confirmada |
| dev.to / Medium | — | — | No encontrados (dev.to API 404; Medium 403). No hay evidencia de perfil |

## Trayectoria/experiencia

- **Rol:** "Software Engineer" (README de perfil GitHub,
  https://github.com/MoiBaldenegro/MoiBaldenegro). Sitio: "AI Engineering" como primera
  etiqueta (https://moisesbaldenegro.com). Confianza alta.
- **Empleador actual:** **no público** en las fuentes leídas (GitHub `company: null`; README
  no lista empresa). LinkedIn podría tenerlo pero no se pudo leer. **No inventar.**
- **Posible relación con Salud Digna:** repo `sd_web_astro` descrito en la API de GitHub como
  "Web app for ultrasound results (Salud Digna), built with Astro"
  (https://api.github.com/users/MoiBaldenegro/repos). El README es el template de Astro.
  Confianza **baja** sobre que sea empleo: puede ser proyecto personal/cliente. No publicar
  sin confirmación del autor.
- **Formación:** Cybersecurity Engineering, institución indicada solo como "Lamar"
  (descripción del repo: "Lamar University"),
  https://github.com/MoiBaldenegro/lamar-activities . Confianza media (no hay fechas ni
  grado/estado). Confirmar con el autor antes de publicar.
- **Ubicación:** Guadalajara, Jalisco, México (GitHub API); "Jalisco ↔ Sonora" (README).
  Confianza alta (pública por el propio autor).

## Stack y habilidades

Declarado por el autor:
- Sitio/hero: AI Engineering, Rust, WebAssembly, Full Stack, DevOps, AWS, Azure,
  Security First, OWASP (`src/data/hero.json`; https://moisesbaldenegro.com).
- README GitHub: Rust, TypeScript, JavaScript, Claude (Anthropic), CLI tooling, web;
  arquitectura hexagonal + DDD con foco en OWASP Top 10.
- Observado en repos (https://api.github.com/users/MoiBaldenegro/repos): TypeScript,
  Rust, Java (coursework), Astro, React, Tauri v2, NestJS/TypeORM/PostgreSQL, Vite,
  Docker/Traefik (Testimo), Cloudflare Workers (este sitio, `wrangler.jsonc`), GSAP.

## Proyectos y contenido

Proyectos (todos con confianza alta de autoría salvo nota):
- **Raúl** — framework HTTP/MVC educativo para Node.js en TypeScript, inspirado en las
  rutas de Laravel, sin dependencias, con `HttpServerAdapter` intercambiable. Estado
  temprano. https://github.com/MoiBaldenegro/raul-framework
- **mouter-router** — librería de routing ligera y tipada para React (v0.0.6, abr-2026).
  https://www.npmjs.com/package/mouter-router
- **MFinance** — app de finanzas personales con Tauri v2 + React 19 (Rust).
  https://github.com/MoiBaldenegro/mfinance
- **Testimo** — SaaS de testimonios (NestJS, React, Web Components SDK, Docker), hecho en
  un hackathon (no se nombra el evento en el README).
  https://github.com/MoiBaldenegro/cubepath-cms-hackaton
- **Harness Kit / harness-engineering** — kit para trabajo con agentes IA: una feature a la
  vez, TDD, specs EARS, `init.sh` (el mismo arnés de este repo).
  https://github.com/MoiBaldenegro/harness-engineering
- **distributed-systems-architectures**, **reactive-programming**, **software-architecture**,
  **testing-ai-asaaii-demo** (caso de estudio de unit testing asistido por IA) — repos de
  estudio/demos. https://github.com/MoiBaldenegro?tab=repositories
- **Cinnamon** — listado en el README como "runtime JS/TS de alto rendimiento en Rust" con
  enlace a cinnamon.ai. **Ojo:** cinnamon.ai es de Cinnamon Inc. (empresa japonesa de IA),
  sin relación. Confianza baja en el enlace; no usarlo en /about hasta que el autor dé la URL
  correcta.
- "Recognition: neww relic" en el README — ambiguo, no usar.

Contenido:
- **Blog** (https://moisesbaldenegro.com): "Diseño Arquitectónico vs. Diseño Detallado",
  "El Rol de la Arquitectura en el Ciclo de Vida del Software", "Procesos y memoria"
  (serie de Sistemas Operativos).
- **YouTube** (@moibaldenegro): "Curso de Rust desde Cero" (p. ej. #010 stdin,
  https://youtu.be/0oDS-zmCFrA; bucles, https://youtu.be/S4CWw38PAOk) y
  "RUST es vulnerable en el KERNEL DE LINUX" (https://youtu.be/B6XORAt7Dfg). En español.
- El sitio menciona Twitch entre sus tecnologías/canales; no se verificó un canal.
- Charlas/conferencias: **no se encontró evidencia**.

## Datos dudosos/homónimos

- **YouTube `@moisesbaldenegro1546` ("Moises Baldenegro")**: ingeniero y docente sobre
  temas agropecuarios/zootecnia. **Otra persona casi con certeza** (temática distinta,
  handle distinto). No enlazar. https://www.youtube.com/@moisesbaldenegro1546
- **Isidro Baldenegro López** (activista rarámuri, Premio Goldman 2005) aparece en las
  búsquedas por apellido: sin relación. https://en.wikipedia.org/wiki/Isidro_Baldenegro_L%C3%B3pez
- Búsqueda "moibaldenegro" devuelve resultados de Montenegro (ruido), sin hallazgos.
- Empleador (Salud Digna), institución/fechas de Lamar, enlace de Cinnamon, "neww relic":
  confianza baja/media; requieren confirmación del autor.
- LinkedIn y X: existencia alta, contenido no verificado.

## Propuesta de contenido para la página About

**Bio corta (≈40 palabras):**
> Soy Moisés Baldenegro, ingeniero de software en Guadalajara, México. Trabajo en la
> intersección de arquitectura de software, seguridad y Rust: diseño sistemas
> deterministas en un mundo de agentes de IA. Aquí escribo sobre arquitectura,
> sistemas operativos y lo que voy construyendo.

**Bio larga:**
> Soy Moisés Baldenegro Melendez, ingeniero de software mexicano y rustacean. Mi trabajo
> gira en torno a tres ejes: arquitectura (hexagonal, DDD, sistemas distribuidos y
> event-driven), seguridad desde el diseño (OWASP Top 10, formación en Cybersecurity
> Engineering) y rendimiento con Rust y WebAssembly, del hardware a la nube (AWS, Azure,
> DevOps). Me interesa la "ingeniería determinista en un mundo agéntico": usar IA para
> construir software, pero con procesos verificables — specs, tests primero y una feature
> a la vez. Construyo herramientas propias como Raúl (un framework MVC en TypeScript con
> fines didácticos), mouter-router (routing ligero para React) y MFinance (finanzas
> personales con Tauri y React). También enseño Rust desde cero en YouTube, en español.

**Secciones sugeridas:**
1. Hero: foto (`/assets/moises-hero.jpg`), nombre, handle `@moibaldenegro`, bio corta.
2. Qué hago / enfoque: Arquitectura · Seguridad · Rust/Wasm · AI engineering · Cloud/DevOps.
3. Filosofía: "Deterministic Engineering in an Agentic World" (harness, TDD, specs).
4. Proyectos destacados: Raúl, mouter-router, MFinance, Testimo, Harness Kit (enlaces GitHub/npm).
5. Contenido: blog (Arquitectura, Sistemas Operativos) + curso de Rust en YouTube.
6. Formación (solo si el autor confirma): Cybersecurity Engineering — Lamar University.
7. Seguridad ofensiva: estadísticas de Hack The Box (ya existe integración en el sitio).
8. Contacto/redes: GitHub, LinkedIn, X, YouTube (solo los handles verificados arriba).

## Pendientes (no investigados en esta sesión)

- Confirmar con el autor: empleador actual, institución/fechas de Lamar, URL real de
  Cinnamon, significado de "neww relic", canal de Twitch, URL pública de HTB.
- Estado del dominio moibaldenegro.com (no resuelve DNS) vs. moisesbaldenegro.com.
