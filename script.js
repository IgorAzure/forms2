// COLE A URL DO SEU GOOGLE APPS SCRIPT ABAIXO:
const APPS_SCRIPT_URL = "api/form";

const FRETE = 6.81;
const PRECO_ESTAMPAS_OBRIGATORIO = 25;
const PRECOS_BASE = { Classic: 225, Balloon: 265 };
let tamanhoSelecionado = "M";

// Tabela oficial DNY 2026 (extraída do PDF)
const TABELA_MEDIDAS = {
  Classic: {
    tamanhos: ["PP", "P", "M", "G", "XG", "XXG"],
    campos: [
      { label: "A - Comprimento", valores: { PP: "61 cm", P: "64 cm", M: "69 cm", G: "70 cm", XG: "75 cm", XXG: "78 cm" } },
      { label: "B - Largura",     valores: { PP: "57 cm", P: "60 cm", M: "71 cm", G: "74 cm", XG: "79 cm", XXG: "82 cm" } },
      { label: "C - Ombro",       valores: { PP: "18 cm", P: "21 cm", M: "24 cm", G: "26 cm", XG: "27 cm", XXG: "29 cm" } },
      { label: "D - Manga",       valores: { PP: "49 cm", P: "52 cm", M: "56 cm", G: "58 cm", XG: "61 cm", XXG: "63 cm" } }
    ]
  },
  Balloon: {
    tamanhos: ["PP", "P", "M", "G", "XG"],
    campos: [
      { label: "A - Comprimento", valores: { PP: "54 cm", P: "58 cm", M: "60 cm", G: "63 cm", XG: "67 cm" } },
      { label: "B - Largura",     valores: { PP: "64 cm", P: "65 cm", M: "66 cm", G: "69 cm", XG: "71 cm" } },
      { label: "C - Ombro",       valores: { PP: "20 cm", P: "21 cm", M: "23 cm", G: "24 cm", XG: "24 cm" } },
      { label: "D - Cava",        valores: { PP: "27 cm", P: "30 cm", M: "31 cm", G: "33 cm", XG: "38 cm" } },
      { label: "E - Manga",       valores: { PP: "52 cm", P: "55 cm", M: "56 cm", G: "59 cm", XG: "62 cm" } }
    ]
  }
};

const radiosModelo = document.querySelectorAll('input[name="modelo"]');
const checkboxes = document.querySelectorAll('.addon-chk');
const addCordinha = document.getElementById('addCordinha');
const rowCordinha = document.getElementById('rowCordinha');
const descCordinha = document.getElementById('descCordinha');
const addNome = document.getElementById('addNome');
const boxNomePeca = document.getElementById('boxNomePeca');
const totalDisplay = document.getElementById('totalDisplay');
const btnXXG = document.getElementById('btnXXG');
const tamanhosContainer = document.getElementById('tamanhosContainer');

function getModeloSelecionado() {
  return document.querySelector('input[name="modelo"]:checked').value;
}

function atualizarBotoesTamanho(size) {
  tamanhoSelecionado = size;
  document.querySelectorAll('.size-btn').forEach(b => {
    const ativo = b.dataset.size === size;
    b.classList.toggle('border-zinc-900', ativo);
    b.classList.toggle('bg-zinc-900', ativo);
    b.classList.toggle('text-white', ativo);
    b.classList.toggle('border-zinc-300', !ativo);
    b.classList.toggle('hover:bg-zinc-100', !ativo);
  });
  renderizarMedidas();
}

function renderizarMedidas() {
  const modelo = getModeloSelecionado();
  const dados = TABELA_MEDIDAS[modelo];

  document.getElementById('tituloMedidaAtual').textContent =
    `Medidas do ${modelo} • Tamanho ${tamanhoSelecionado}`;

  const gridAtual = document.getElementById('gridMedidasAtual');
  gridAtual.className = modelo === "Balloon"
    ? "grid grid-cols-3 sm:grid-cols-5 gap-2 text-center"
    : "grid grid-cols-2 sm:grid-cols-4 gap-2 text-center";

  gridAtual.innerHTML = dados.campos.map(campo => `
    <div class="bg-white border border-zinc-200 rounded-lg p-2">
      <p class="text-[10px] text-zinc-500 font-medium">${campo.label}</p>
      <p class="text-sm font-bold text-zinc-900 mt-0.5">${campo.valores[tamanhoSelecionado]}</p>
    </div>
  `).join("");

  // Atualiza também a tabela completa expansível
  const thead = `
    <thead class="bg-zinc-100 text-zinc-700 font-semibold">
      <tr>
        <th class="p-2 text-left border-b border-zinc-200">Medida</th>
        ${dados.tamanhos.map(t => `<th class="p-2 border-b border-zinc-200 ${t === tamanhoSelecionado ? 'bg-zinc-900 text-white' : ''}">${t}</th>`).join("")}
      </tr>
    </thead>
  `;

  const tbody = `
    <tbody class="divide-y divide-zinc-200 bg-white">
      ${dados.campos.map(campo => `
        <tr>
          <td class="p-2 text-left font-medium text-zinc-700 whitespace-nowrap">${campo.label}</td>
          ${dados.tamanhos.map(t => `<td class="p-2 ${t === tamanhoSelecionado ? 'font-bold bg-zinc-50' : ''}">${campo.valores[t]}</td>`).join("")}
        </tr>
      `).join("")}
    </tbody>
  `;

  document.getElementById('tabelaCompleta').innerHTML = thead + tbody;
}

// Toggle tabela completa
document.getElementById('btnToggleTabela').addEventListener('click', (e) => {
  const wrapper = document.getElementById('tabelaCompletaWrapper');
  const oculta = wrapper.classList.toggle('hidden');
  e.target.textContent = oculta ? "Ver tabela completa" : "Ocultar tabela";
});

// Clique nos botões de tamanho
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => atualizarBotoesTamanho(btn.dataset.size));
});

// Mostrar/esconder campo de nome na peça
addNome.addEventListener('change', () => {
  boxNomePeca.classList.toggle('hidden', !addNome.checked);
  calcularTotal();
});

// Regra Classic vs Balloon
radiosModelo.forEach(radio => {
  radio.addEventListener('change', () => {
    const isBalloon = radio.value === 'Balloon';

    document.getElementById('cardClassic').className = isBalloon
      ? 'flex items-center justify-between p-3.5 rounded-xl border border-zinc-300 bg-white cursor-pointer transition'
      : 'flex items-center justify-between p-3.5 rounded-xl border-2 border-zinc-900 bg-zinc-50 cursor-pointer transition';

    document.getElementById('cardBaloon').className = isBalloon
      ? 'flex items-center justify-between p-3.5 rounded-xl border-2 border-zinc-900 bg-zinc-50 cursor-pointer transition'
      : 'flex items-center justify-between p-3.5 rounded-xl border border-zinc-300 bg-white cursor-pointer transition';

    // Controla cordinha e tamanho XXG no Balloon
    if (isBalloon) {
      addCordinha.checked = false;
      addCordinha.disabled = true;
      rowCordinha.classList.add('opacity-40', 'pointer-events-none');
      descCordinha.textContent = "Indisponível no modelo Balloon";

      btnXXG.classList.add('hidden');
      tamanhosContainer.classList.replace('grid-cols-6', 'grid-cols-5');
      if (tamanhoSelecionado === "XXG") {
        atualizarBotoesTamanho("XG");
      }
    } else {
      addCordinha.disabled = false;
      rowCordinha.classList.remove('opacity-40', 'pointer-events-none');
      descCordinha.textContent = "Cordão opcional no capuz";

      btnXXG.classList.remove('hidden');
      tamanhosContainer.classList.replace('grid-cols-5', 'grid-cols-6');
    }

    renderizarMedidas();
    calcularTotal();
  });
});

checkboxes.forEach(chk => chk.addEventListener('change', calcularTotal));

function formatarBRL(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcularTotal() {
  const modelo = getModeloSelecionado();
  let total = PRECOS_BASE[modelo] + PRECO_ESTAMPAS_OBRIGATORIO + FRETE;

  checkboxes.forEach(chk => {
    if (chk.checked && !chk.disabled) {
      total += Number(chk.dataset.price);
    }
  });

  totalDisplay.textContent = formatarBRL(total);
  return total;
}

// Envio para o Google Sheets
document.getElementById('btnEnviar').addEventListener('click', async () => {
  const nomeAluno = document.getElementById('nomeAluno').value.trim();
  const nomePeca = document.getElementById('nomePeca').value.trim();

  if (!nomeAluno) {
    alert("Por favor, digite seu nome completo.");
    return;
  }
  if (addNome.checked && !nomePeca) {
    alert("Você marcou 'Nome personalizado'. Digite o nome que quer na peça.");
    return;
  }

  const modelo = getModeloSelecionado();
  const listaAdicionais = ["Todas as estampas"];
  if (addCordinha.checked && !addCordinha.disabled) listaAdicionais.push("Cordinha");
  if (addNome.checked) listaAdicionais.push("Nome");
  if (document.getElementById('addZiper').checked) listaAdicionais.push("Zíper");

  const total = calcularTotal();
  const btn = document.getElementById('btnEnviar');
  btn.disabled = true;
  btn.textContent = "Enviando...";

  const payload = {
    nomeAluno,
    modelo,
    tamanho: tamanhoSelecionado,
    adicionais: listaAdicionais.join(" + "),
    nomePeca: addNome.checked ? nomePeca : "",
    total: formatarBRL(total)
  };

  try {
    if (APPS_SCRIPT_URL !== "COLE_SUA_URL_DO_APPS_SCRIPT_AQUI") {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }
    document.getElementById('resumoModal').innerHTML = `
      <strong>${nomeAluno}</strong> (${tamanhoSelecionado})<br>
      Moletom <strong>${modelo}</strong><br>
      ${payload.adicionais}<br><br>
      Valor total: <strong class="text-emerald-700 text-base">${payload.total}</strong>
    `;
    document.getElementById('modalSucesso').classList.remove('hidden');
  } catch (err) {
    alert("Erro ao enviar pedido. Tente novamente.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Confirmar Pedido";
  }
});

// Inicializa tabela de medidas e total na carga da página
renderizarMedidas();
calcularTotal();