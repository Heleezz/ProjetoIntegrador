/* =====================================================
   VOziniak — script.js
   Menu, acessibilidade, disco de Newton, fluxograma e simulador
   ===================================================== */
"use strict";

/* ---------- Menu mobile ---------- */
const botaoMenu = document.getElementById("menu-botao");
const menu = document.getElementById("menu-principal");

botaoMenu.addEventListener("click", () => {
  const aberto = menu.classList.toggle("aberto");
  botaoMenu.setAttribute("aria-expanded", aberto);
});
menu.querySelectorAll("a").forEach(link =>
  link.addEventListener("click", () => {
    menu.classList.remove("aberto");
    botaoMenu.setAttribute("aria-expanded", "false");
  })
);

/* ---------- Acessibilidade: contraste e fonte ---------- */
const btnContraste = document.getElementById("btn-contraste");
const btnAumentar  = document.getElementById("btn-aumentar");
const btnDiminuir  = document.getElementById("btn-diminuir");
let fatorFonte = 100;

btnContraste.addEventListener("click", () => {
  const ativo = document.body.classList.toggle("contraste");
  btnContraste.setAttribute("aria-pressed", ativo);
  localStorage.setItem("voziniak-contraste", ativo ? "1" : "0");
});
btnAumentar.addEventListener("click", () => {
  fatorFonte = Math.min(130, fatorFonte + 10);
  aplicarFonte();
});
btnDiminuir.addEventListener("click", () => {
  fatorFonte = Math.max(90, fatorFonte - 10);
  aplicarFonte();
});
function aplicarFonte() {
  document.documentElement.style.fontSize = fatorFonte + "%";
  localStorage.setItem("voziniak-fonte", fatorFonte);
}
/* restaura preferências salvas */
if (localStorage.getItem("voziniak-contraste") === "1") {
  document.body.classList.add("contraste");
  btnContraste.setAttribute("aria-pressed", "true");
}
const fonteSalva = parseInt(localStorage.getItem("voziniak-fonte"), 10);
if (fonteSalva) { fatorFonte = fonteSalva; aplicarFonte(); }

/* ---------- Disco de Newton interativo ---------- */
const discoGiro  = document.getElementById("disco-giro");
const discoNevoa = document.getElementById("disco-nevoa");
const controleDisco = document.getElementById("velocidade-disco");
const saidaVel   = document.getElementById("velocidade-valor");
const discoExplicacao = document.getElementById("disco-explicacao");

controleDisco.addEventListener("input", () => {
  const v = parseInt(controleDisco.value, 10);
  saidaVel.value = v;
  if (v === 0) {
    discoGiro.style.animationPlayState = "paused";
    discoNevoa.style.opacity = 0;
    discoExplicacao.textContent = "Mova o controle para girar o disco e observar a mistura das cores.";
  } else {
    discoGiro.style.animationPlayState = "running";
    discoGiro.style.animationDuration = (60 / v) + "s"; // v = "rpm"
    discoNevoa.style.opacity = (v / 100) * 0.9;         // quanto mais rápido, mais branco
    if (v < 30) discoExplicacao.textContent = "As cores ainda são distinguíveis…";
    else if (v < 70) discoExplicacao.textContent = "As cores começam a se misturar!";
    else discoExplicacao.textContent = "Em alta rotação o disco parece quase branco: a luz branca é a soma de todas as cores!";
  }
});

/* ---------- Fluxograma animado (robótica) ---------- */
const nos = Array.from(document.querySelectorAll("#fluxograma .no"));
const btnCiclo = document.getElementById("btn-simular-ciclo");
const statusCiclo = document.getElementById("status-ciclo");
const passos = [
  "Lendo a temperatura da água: 26,4 °C…",
  "Comparando com a meta de 30 °C…",
  "26,4 °C < 30 °C → decisão: AQUECER.",
  "Acionando bomba e válvula (atuadores)…",
  "Água circulando pelas placas coletoras solares…",
  "Água retornou mais quente à piscina. Ciclo reiniciado ✔"
];
const dormir = ms => new Promise(r => setTimeout(r, ms));
let animando = false;

btnCiclo.addEventListener("click", async () => {
  if (animando) return;
  animando = true;
  btnCiclo.disabled = true;
  nos.forEach(n => n.classList.remove("ativo", "feito"));
  for (let i = 0; i < passos.length; i++) {
    nos[i].classList.add("ativo");
    statusCiclo.textContent = passos[i];
    await dormir(1200);
    nos[i].classList.remove("ativo");
    nos[i].classList.add("feito");
  }
  animando = false;
  btnCiclo.disabled = false;
});

/* ---------- Simulador de aquecimento ---------- */
const AREA_PLACA = 2;      // m² por placa
const EFICIENCIA = 0.65;   // 65% de absorção (superfície escura + vidro)
const MASSA_AGUA = 30000;  // kg (piscina de 30 m³)
const CALOR_AGUA = 4186;   // J/(kg·°C)
const META = 30;           // °C

const cRad   = document.getElementById("controle-radiacao");
const cPlac  = document.getElementById("controle-placas");
const cAmb   = document.getElementById("controle-ambiente");
const cCapa  = document.getElementById("controle-capa");
const oRad   = document.getElementById("saida-radiacao");
const oPlac  = document.getElementById("saida-placas");
const oAmb   = document.getElementById("saida-ambiente");
const rPot   = document.getElementById("res-potencia");
const rGanho = document.getElementById("res-ganho");
const rEq    = document.getElementById("res-equilibrio");
const rTempo = document.getElementById("res-tempo");
const rMsg   = document.getElementById("res-mensagem");
const barra  = document.getElementById("termometro-barra");

function calcular() {
  const rad = +cRad.value, n = +cPlac.value, tamb = +cAmb.value, capa = cCapa.checked;
  oRad.value = rad; oPlac.value = n; oAmb.value = tamb;

  const potencia = rad * AREA_PLACA * n * EFICIENCIA;              // Watts
  const ganho = (potencia * 3600) / (MASSA_AGUA * CALOR_AGUA);     // °C por hora
  const k = capa ? 0.02 : 0.06;                                    // perda por hora
  const tEq = Math.min(tamb + ganho / k, 60);                      // equilíbrio

  rPot.textContent   = (potencia / 1000).toFixed(1).replace(".", ",") + " kW";
  rGanho.textContent = "+" + ganho.toFixed(2).replace(".", ",") + " °C/h";
  rEq.textContent    = tEq.toFixed(1).replace(".", ",") + " °C";

  /* tempo aproximado até a meta (partindo de 24 °C) */
  const liquido = ganho - k * (24 - tamb);
  if (tEq >= META && liquido > 0) {
    rTempo.textContent = "≈ " + ((META - 24) / liquido).toFixed(1).replace(".", ",") + " horas";
  } else {
    rTempo.textContent = "—";
  }

  /* termômetro visual (escala 15–45 °C) */
  const pct = Math.max(0, Math.min(100, ((tEq - 15) / 30) * 100));
  barra.style.width = pct + "%";

  /* mensagem de diagnóstico */
  if (tEq >= META) {
    rMsg.textContent = "✔ Meta atingida! A piscina se mantém confortável com energia 100% solar.";
  } else if (!capa && (tamb + ganho / 0.02) >= META) {
    rMsg.textContent = "⚠ Ative a capa térmica para reduzir as perdas e atingir a meta.";
  } else {
    rMsg.textContent = "⚠ Aumente o número de placas ou verifique a radiação disponível.";
  }
}
[cRad, cPlac, cAmb].forEach(el => el.addEventListener("input", calcular));
cCapa.addEventListener("change", calcular);
calcular();

/* ---------- Ano automático no rodapé ---------- */
document.getElementById("ano").textContent = new Date().getFullYear();