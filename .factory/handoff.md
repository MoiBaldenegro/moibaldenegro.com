# Handoff

Estado en que quedó la última corrida y qué sigue. Cada corrida lo reescribe al terminar.

- Estado: issue #2 (update-projects) implementado. `src/data/about.json` lista ahora 11 proyectos destacados: los 5 previos más Article-Voice, MXVI-Engineering, MXVI-Design, Cinnamon, SO/Deck y WoW Armory, tomados del README de presentación de GitHub (MoiBaldenegro/MoiBaldenegro).
- Tests: `pnpm test` en verde (129/129), incluido el nuevo `tests/about-projects.test.mjs`.
- Se arregló `tests/mxvi-foundation.test.mjs` para Windows (normaliza CRLF a LF y separadores `\` a `/`); antes fallaba por el checkout CRLF, no por contenido.
- Build: `IN_MAINTENANCE=false pnpm build` termina en verde y `/whoami` renderiza los 7 proyectos esperados. `pnpm build` sin la variable falla porque el env schema de Astro exige `IN_MAINTENANCE` (público, no secreto).
- Siguiente paso: definir `IN_MAINTENANCE` (p. ej. `false`) en el entorno de build o documentarlo para que `./init.sh` pase sin prefijo manual.
