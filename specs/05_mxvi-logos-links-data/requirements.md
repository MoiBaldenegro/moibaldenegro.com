# Requisitos — mxvi-logos-links-data (feature 5)

## Requisitos

REQ-05-01 El archivo src/data/mxvi-logos.json SHALL declarar un array "logos" con exactamente 4 entradas en el orden mxvi-m, mxvi-x, mxvi-v, mxvi-i.
REQ-05-02 Cada entrada de src/data/mxvi-logos.json SHALL declarar los campos id, letter, viewBox, href y label como textos no vacíos.
REQ-05-03 Las 4 entradas de src/data/mxvi-logos.json SHALL declarar href "https://github.com/MoiBaldenegro".
REQ-05-04 Las entradas de src/data/mxvi-logos.json SHALL declarar los label "MXVI M — GitHub", "MXVI X — GitHub", "MXVI V — GitHub" y "MXVI I — GitHub" en ese orden.
REQ-05-05 Las entradas de src/data/mxvi-logos.json SHALL declarar los viewBox "0 0 717 716", "0 0 805 716", "0 0 795 716" y "0 0 190 716" en ese orden.
REQ-05-06 La entidad MxviLogo de src/domain/entities/mxvi-logo.ts SHALL exponer los campos readonly id, letter, viewBox, href y label.
REQ-05-07 WHEN se llama a getLogos(), MxviLogosRepository SHALL devolver las entidades MxviLogo en el orden del JSON.
REQ-05-08 MxviLogosRepository SHALL aceptar un loader inyectable que entrega el JSON crudo como texto.
REQ-05-09 IF el loader lanza o entrega un texto que no es JSON, THEN MxviLogosRepository SHALL lanzar MxviLogosDataError con un mensaje que contiene mxvi-logos.json.
REQ-05-10 IF el JSON no tiene el array "logos" o tiene un número de entradas distinto de 4, THEN MxviLogosRepository SHALL lanzar MxviLogosDataError con un mensaje que contiene mxvi-logos.json.
REQ-05-11 IF una entrada no tiene un campo obligatorio o lo tiene vacío o de tipo distinto de texto, THEN MxviLogosRepository SHALL lanzar MxviLogosDataError con un mensaje que contiene mxvi-logos.json el índice de la entrada y el campo.
REQ-05-12 IF un href no empieza por https://, THEN MxviLogosRepository SHALL lanzar MxviLogosDataError con un mensaje que contiene mxvi-logos.json y el índice de la entrada.
REQ-05-13 IF un viewBox no tiene la forma "0 0 <ancho> <alto>" con enteros positivos, THEN MxviLogosRepository SHALL lanzar MxviLogosDataError con un mensaje que contiene mxvi-logos.json y el índice de la entrada.
REQ-05-14 Cada archivo nuevo de la feature SHALL tener como máximo 100 líneas.
