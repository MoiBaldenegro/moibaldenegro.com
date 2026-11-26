// Proyectos destacados de /whoami: about.json debe listar los proyectos actuales
// del repositorio de presentación de GitHub (MoiBaldenegro/MoiBaldenegro).
// node:test, sin dependencias. TDD: rojo antes de actualizar src/data/about.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AboutRepository } from '../src/domain/repositories/about-repository.ts';

// Proyectos que el README de presentación muestra y que faltaban en about.json.
const NUEVOS = [
  ['Article-Voice', 'https://moibaldenegro.github.io/article-voice/'],
  ['MXVI-Engineering', 'https://moibaldenegro.github.io/mxvi-engineering-system/'],
  ['MXVI-Design', 'https://moibaldenegro.github.io/mxvi-design-system/'],
  ['Cinnamon', 'https://cinnamon.ai'],
  ['SO/Deck', 'https://moibaldenegro.github.io/lamar_sistemas_operativos/'],
  ['WoW Armory', 'https://wow-armory-ovbq.vercel.app/'],
];

const projects = () => new AboutRepository().getProfile().projects;

test('los proyectos nuevos del README de GitHub aparecen con su URL', () => {
  const byName = new Map(projects().map((p) => [p.name, p]));
  for (const [name, href] of NUEVOS) {
    assert.ok(byName.has(name), `falta el proyecto "${name}"`);
    assert.equal(byName.get(name).href, href, `href incorrecto para "${name}"`);
  }
});

test('los proyectos que ya existían se conservan', () => {
  const names = new Set(projects().map((p) => p.name));
  for (const name of ['Raúl', 'MFinance', 'Testimo', 'mouter-router', 'Harness Kit']) {
    assert.ok(names.has(name), `se perdió el proyecto "${name}"`);
  }
});

test('cada proyecto tiene nombre, descripción y URL https válidos', () => {
  for (const project of projects()) {
    assert.ok(project.name.trim() !== '', 'nombre vacío');
    assert.ok(project.description.trim() !== '', `descripción vacía en "${project.name}"`);
    assert.match(project.href, /^https:\/\/[^\s]+$/, `href inválido en "${project.name}"`);
  }
});

test('no hay proyectos duplicados por nombre ni por URL', () => {
  const list = projects();
  assert.equal(new Set(list.map((p) => p.name)).size, list.length, 'nombres duplicados');
  assert.equal(new Set(list.map((p) => p.href)).size, list.length, 'URLs duplicadas');
});
