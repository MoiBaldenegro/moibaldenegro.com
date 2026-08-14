# Requisitos — Restauración de la degradación elegante de la sección HTB (feature 34)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-34-<xx>.
# Keywords en mayúsculas. Sin verbos vagos.

## Requisitos

REQ-34-01 El componente htb-stadistics.astro SHALL condicionar la sección de estadísticas con el patrón {profile && ...}.
REQ-34-02 WHEN getProfileOrNull resuelve null, THEN el componente SHALL no renderizar el contenido de la sección.
REQ-34-03 WHEN el perfil existe, THEN el componente SHALL mostrar los seis campos con el texto N/D para los valores ausentes.
REQ-34-04 El frontmatter del componente SHALL no contener lógica de negocio ni llamadas a console.
REQ-34-05 El componente htb-stadistics.astro SHALL no superar las 100 líneas.
REQ-34-06 El componente SHALL consumir el perfil únicamente a través de getProfileOrNull.
