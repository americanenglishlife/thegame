let frasesArr = [], fraseIndex = 0;
let acertosTotais = 0, errosTotais = 0, tentativasTotais = 0;
let pastaAtual = 1;
let bloqueado = false;
let mostrarPt = true;
let mostrarEn = true;
const TOTAL_FRASES = 24;

function falar(texto, lang) {
  const utter = new SpeechSynthesisUtterance(texto);
  utter.lang = lang === 'pt' ? 'pt-BR' : 'en-US';
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

function iniciarVisor() {
  document.getElementById("visor").style.display = "flex";
  document.getElementById("nivel-indicador").innerText = `Nível ${pastaAtual}`;
  carregarFrases();

  const input = document.getElementById("pt");
  const botaoEnviar = document.getElementById("botao-enviar");
  botaoEnviar.onclick = () => verificarResposta();
  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      verificarResposta();
    }
  });
}

function carregarFrases() {
  let principais = [], anteriores = [];
  if (pastas[pastaAtual]) {
    principais = pastas[pastaAtual].trim().split("\n").map(l => l.split("#"));
  }
  if (pastaAtual > 1) {
    for (let i = 1; i < pastaAtual; i++) {
      if (pastas[i]) {
        const frases = pastas[i].trim().split("\n").map(l => l.split("#"));
        anteriores = anteriores.concat(frases);
      }
    }
  }
  const qtdPrincipais = Math.round(TOTAL_FRASES * 0.7);
  const qtdAnteriores = TOTAL_FRASES - qtdPrincipais;
  frasesArr = [].concat(
    embaralhar(principais).slice(0, qtdPrincipais),
    embaralhar(anteriores).slice(0, qtdAnteriores)
  );
  frasesArr = embaralhar(frasesArr);
  fraseIndex = 0;
  acertosTotais = 0;
  errosTotais = 0;
  tentativasTotais = 0;
  setTimeout(() => mostrarFrase(), 300);
  atualizarBarraProgresso();
}

function mostrarFrase() {
  if (fraseIndex >= frasesArr.length) fraseIndex = 0;
  const [pt, en] = frasesArr[fraseIndex];
  document.getElementById("pt").value = "";
  document.getElementById("pt").disabled = false;
  document.getElementById("texto-exibicao").textContent = mostrarPt ? pt : "";
  if (mostrarEn) falar(en, 'en');
  bloqueado = false;
}

function verificarResposta() {
  if (bloqueado) return;
  const input = document.getElementById("pt");
  const resposta = input.value.trim();
  const [pt, en] = frasesArr[fraseIndex];

  const norm = t => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, "").toLowerCase();
  const correto = norm(resposta) === norm(pt);
  const resultado = document.getElementById("resultado");
  const acertosDiv = document.getElementById("acertos");
  tentativasTotais++;

  if (correto) {
    document.getElementById("somAcerto").play();
    acertosTotais++;
    resultado.textContent = "✔ Correto";
    resultado.style.color = "lime";
    continuar();
  } else {
    document.getElementById("somErro").play();
    errosTotais++;
    resultado.textContent = "✘ Errado";
    resultado.style.color = "red";
    input.value = pt;
    input.style.color = "red";
    input.disabled = true;
    bloqueado = true;
    setTimeout(() => {
      input.style.color = "white";
      resultado.textContent = "";
      input.disabled = false;
      bloqueado = false;
      continuar();
    }, 3000);
  }
  atualizarBarraProgresso();
  acertosDiv.textContent = `Acertos: ${acertosTotais} / ${tentativasTotais}`;
}

function continuar() {
  fraseIndex++;
  if (tentativasTotais >= TOTAL_FRASES) {
    if (acertosTotais >= 22) {
      pastaAtual++;
      document.getElementById("somLevelUp").play();
    } else if (acertosTotais < 17) {
      pastaAtual = Math.max(1, pastaAtual - 1);
    }
    document.getElementById("nivel-indicador").innerText = `Nível ${pastaAtual}`;
    carregarFrases();
  } else {
    mostrarFrase();
  }
}

function atualizarBarraProgresso() {
  const verde = document.querySelector(".barra-verde");
  const vermelho = document.querySelector(".barra-vermelha");
  const total = tentativasTotais;
  const perc = total > 0 ? (acertosTotais / total) * 100 : 0;
  verde.style.width = `${perc}%`;
  vermelho.style.width = `${100 - perc}%`;
}

function embaralhar(array) {
  return array.sort(() => Math.random() - 0.5);
}

function reivindicarPonto() {
  if (tentativasTotais > 0 && errosTotais > 0) {
    errosTotais--;
    acertosTotais++;
    atualizarBarraProgresso();
    document.getElementById("acertos").textContent = `Acertos: ${acertosTotais} / ${tentativasTotais}`;
  }
}

function avancarNivel() {
  pastaAtual++;
  document.getElementById("nivel-indicador").innerText = `Nível ${pastaAtual}`;
  carregarFrases();
}

function voltarNivel() {
  pastaAtual = Math.max(1, pastaAtual - 1);
  document.getElementById("nivel-indicador").innerText = `Nível ${pastaAtual}`;
  carregarFrases();
}

function togglePt() {
  mostrarPt = !mostrarPt;
  mostrarFrase();
}

function toggleEn() {
  mostrarEn = !mostrarEn;
}

function falarFrase() {
  const [, en] = frasesArr[fraseIndex];
  falar(en, 'en');
}

function falarPt() {
  const [pt] = frasesArr[fraseIndex];
  falar(pt, 'pt');
}

window.onload = iniciarVisor;
