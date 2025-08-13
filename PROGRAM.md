PROGRAM.md – LCARS Mission Control

En samlet projektbeskrivelse til SvelteKit‐appen i LCARS‑stil. Dokumentet fungerer som kontrakt mellem idé, design og implementering, og er optimeret til at give en GPT‑5 eller anden AI maksimal kontekst.

1. Formål

Giv et hurtigt overblik over projekter ("missioner"), deadlines og prioritet.

Muliggør oprettelse og vedligehold af missioner og opgaver uden backend.

Vise RED ALERT når kritiske forhold opstår (fx forfaldne missioner).

2. Scope

In scope

Lokal persistens (localStorage)

Flere sider: Mission Control, Project Operations, Crew Roster, Mission Logs, Sensor Analysis

LCARS‑UI komponenter og tema

Out of scope

Server‑API, auth/brugere, realtime sync

Avanceret rettighedsstyring

3. Målgrupper & use cases

Koordinator ser status på tværs af missioner og eskalerer ved risiko.

Udfører ser sine opgaver og prioriterer arbejdet.

User stories

Opret mission med navn, afdeling, prioritet, status og deadline.

Se RED ALERT ved forfaldne missioner.

Tilføj opgaver til mission og markér dem som Done.

Filtrér opgaver i kanbanvisning.

Administrér crew og mission logs.

Acceptkriterier

Data persisteres på tværs af sessions.

RED ALERT vises ved ≥1 forfalden mission.

CRUD på missioner/opgaver fungerer.

4. Arkitektur

Framework: SvelteKit

State: Svelte stores

Persistens: localStorage (lcars-missions-v1, lcars-crew, lcars-logs)

Routing: filbaseret (src/routes)

Styling: ren CSS (src/lib/styles/lcars.css)

5. Datamodel

export type Task = { id: string; title: string; status: 'To Do'|'In Progress'|'Done' };
export type Mission = {
  id: string;
  name: string;
  dept: 'Engineering'|'Science'|'Command';
  priority: 1|2|3|4;
  status: 'Active'|'Hold'|'Done';
  due: string;
  tasks: Task[];
};

Derived metrics

Status-, prioritet-, opgave- og overdue‑tællinger

redAlert = overdue > 0

6. Sidematrix & filansvar

/layout: global header/nav, RED ALERT
/+page: Mission Control dashboard
/operations: Kanban
/crew: Crew Roster
/logs: Mission Logs
/sensors: Sensor Analysis

7. Sidebeskrivelser

Mission Control: KPI’er, kort med missioner, søgning, modals for mission/opgave.

Project Operations: 3 statuskolonner, filter efter afdeling.

Crew Roster: CRUD for crew.

Mission Logs: Liste over logs.

Sensor Analysis: SVG‑grafer over status og prioritet.

8. Komponenter & styling

LcarsHeader: LCARS‑header med stardate

Modal: Modalvindue

lcars.css: Farver, radius, badges, knapper, paneler, alerts

9. Ydelse & kvalitet

Ingen eksterne UI‑pakker

Lokal datalagring

Klar til udbygning med DnD, backend, eksport

10. Tilgængelighed

Semantiske elementer, høje kontraster, labels til farvekoder

11. Dataeksempel

{
  "id": "NX-01",
  "name": "Warp Field Test",
  "dept": "Engineering",
  "priority": 1,
  "status": "Active",
  "due": "2025-08-13T00:00:00.000Z",
  "tasks": [
    { "id": "t1", "title": "Calibrate coils", "status": "In Progress" }
  ]
}

12. Versionering & nøgler

lcars-missions-v1 – opdater suffiks ved breaking changes

Changelog i CHANGELOG.md

13. Kørsel

npm run dev
npm run build
npm run preview

14. Fremtidigt arbejde

DnD i kanban

Backend + auth

Eksport/import

Tastaturgenveje

15. AI‑venlig kontekst

Formål og Scope står øverst

Datamodel med typer inkluderet

Alle sider og komponenter kort beskrevet

JSON‑eksempel viser kontrakt

Mulige fremtidige features nævnt

Klare persistensnøgler og versioneringsstrategi

Dette gør det nemt for en AI (fx GPT‑5) at forstå hele projektet uden at åbne kildekoden.



15. For AI‑reviewere (GPT‑5) – arbejdsguide

Formål: Gør det let for en AI at forstå mål, grænser og hvordan der sikkert kan udvides.

15.1 Kontrakt & invarianter

Ingen eksterne UI‑afhængigheder. Bevar ren Svelte/SVG/CSS.

Persistens via localStorage (ingen netværkskald).

Datatyper må ikke brydes uden at bump’e nøgleversion (lcars-missions-vN).

LCARS‑stil: afrundede bjælker, begrænset farvepalet, mono til tal/ID’er.

15.2 Kodestandard (kort)

TypeScript i routes/lib; streng typebrug i stores.

Komponenter skal være små og rene; løft state til stores ved genbrug.

SVG til grafer; ingen seaborn/Chart libs.

Funktionsnavne imperative: addMission, toggleTask, quickCompleteMission.

15.3 Udvidelser – sikre mønstre

Ny side: opret mappe i src/routes/<navn>/+page.svelte, brug LcarsHeader fra layout.

Ny metrik: tilføj felt i metrics derived store; opdater Sensor‑siden.

Nyt felt på Mission: tilføj til type + migrér i load() ved at indskyde default (ikke bryde gammel data).

15.4 Performance‑mål

First interaction < 150ms på moderne laptop.

Liste render uden mærkbar jank; undgå O(n²) i hot‑paths.

15.5 Testbarheds‑krav

UI‑handlinger skal kunne rammes via ROLE/tekst (tilgængelige selektorer).

Skriv E2E som “levende specifikation”.

15.6 Ikke‑funktionelle krav

A11y: kontrast > 4.5:1; labels på inputs; fokus synligt.

I18n‑parathed: ingen hardcoded datoformater i tekst (brug ISO i data, præsentér lokalt).

15.7 Prompthjælp (til kode‑agent)

System‑intention (kort):

Du arbejder i en client‑only SvelteKit app i LCARS‑stil. Hold dig til CSS/SVG. Ændr ikke dataskema uden migration. Skriv små, typed komponenter og opdater PROGRAM.md, CHANGELOG.md og ADR’er ved større valg.

Eksempel‑opgave: “Tilføj drag‑and‑drop i Kanban”

Installer ingen pakker; brug HTML5 DnD.

Tilføj order på Task; persistér migrationen.

Opdater operations/+page.svelte til DnD og reordrer i store.

E2E‑test der trækker en opgave til ny position og reflekteres efter refresh.

15.8 Kvalitets‑tjekliste (pull request)



16. Design Tokens (til AI og temaer)

{
  "color": {
    "bg": "#000000",
    "line": "#f4a340",
    "line2": "#f6d06b",
    "blue": "#5b8bbf",
    "blue2": "#3e6b9a",
    "text": "#ffe6c7",
    "dim": "#9fb8d3"
  },
  "radius": { "xl": 22, "lg": 16, "md": 12 },
  "space": { "gap": 14, "pad": 12 },
  "font": { "mono": "ui-monospace, Menlo, Consolas, monospace", "sans": "ui-sans-serif, system-ui" }
}

17. ADR‑skabelon (Architecture Decision Record)

# ADR <nummer>: <emne>
Dato: <YYYY-MM-DD>
Beslutning: <Hvad valgte vi>
Baggrund: <Hvorfor var dette nødvendigt>
Alternativer: <A vs B>
Konsekvenser: <Fordele/ulemper, migrering>
Koblede sager: <issues/PRs>

ADR‑01 forslag: “Client‑only persistens (localStorage) fremfor backend i v1”.

18. Playwright E2E – living spec (uddrag)

import { test, expect } from '@playwright/test';

test('create mission triggers metrics & persists', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '+ Ny mission' }).click();
  await page.getByLabel('Navn').fill('Dilithium Audit');
  await page.getByLabel('Afdeling').selectOption('Engineering');
  await page.getByRole('button', { name: 'Opret' }).click();
  await expect(page.getByText('Dilithium Audit')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Dilithium Audit')).toBeVisible();
});

19. Risici & afbødning

Data‑korruption ved schema‑ændring → versioner nøgle og migrér.

Overdreven bundle‑størrelse → ingen eksterne deps; del komponenter.

UI‑drift fra LCARS → tokens og visuel tjekliste i PR.

20. Udvidelsesidéer til GPT‑5

Generér CHANGELOG.md automatisk fra commits (Conventional Commits).

Foreslå migrationskode ved skemaskift (læse/skriv vN → vN+1).

Generér a11y‑rapport (axe‑core) og foreslå rettelser.

Tilføj undo/redo i stores med tidsrejse‑debug (kun client).

