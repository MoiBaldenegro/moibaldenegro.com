# Requisitos — game-of-life-engine

REQ-14-01 El módulo src/utils/game-of-life.ts SHALL exponer una función que crea una cuadrícula vacía de celdas con dimensiones configurables.
REQ-14-02 El módulo src/utils/game-of-life.ts SHALL exponer una función que calcula la siguiente generación de una cuadrícula aplicando las reglas del Juego de la Vida.
REQ-14-03 WHEN una célula viva tiene menos de 2 vecinas, la siguiente generación SHALL marcar la célula como muerta.
REQ-14-04 WHEN una célula viva tiene 2 o 3 vecinas, la siguiente generación SHALL conservar la célula viva.
REQ-14-05 WHEN una célula viva tiene más de 3 vecinas, la siguiente generación SHALL marcar la célula como muerta.
REQ-14-06 WHEN una célula muerta tiene exactamente 3 vecinas, la siguiente generación SHALL marcar la célula como viva.
REQ-14-07 El cómputo de vecinos SHALL tratar la cuadrícula como envolvente, WHERE los bordes opuestos se consideran adyacentes.
REQ-14-08 IF una cuadrícula no contiene celdas vivas, THEN la siguiente generación SHALL devolver una cuadrícula vacía.
REQ-14-09 El módulo src/utils/game-of-life.ts SHALL respetar el límite de 100 líneas del arnés.
