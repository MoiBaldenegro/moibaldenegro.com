# Requisitos — Alinear el fixture del test del hero al dato real (feature 1)

REQ-01-01 El fixture EXPECTED_PROFILE del test hero-profile-repository.test.mjs SHALL declarar el campo image con la ruta absoluta /assets/moises-hero.jpg.
REQ-01-02 El valor del campo image del fixture SHALL coincidir exactamente con el campo image de src/data/hero.json.
REQ-01-03 WHEN el fixture declara la ruta absoluta, el test hero-profile-repository.test.mjs SHALL pasar en verde con node --test.
REQ-01-04 El ajuste del fixture SHALL limitarse al archivo tests/hero-profile-repository.test.mjs sin modificar src/.
