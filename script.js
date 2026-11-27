const APPS_SCRIPT_URL = "/api/form"

const FRETE = 6.81;
const PRECOS_BASE = { Classic: 225, Baloon: 265 };
let tamanhoSelecionado = "M";

const radiosModelo = document.querySelectorAll('input[name="modelo"]');
const checkboxes = document.querySelectorAll('.addon-chk');
const addCordinha = document.getElementById('addCordinha');
const rowCordinha = document.getElementById('rowCordinha');
const descCordinha = document.getElementById('descCordinha');
const addNome = document.getElementById('addNome');
const boxNomePeca = document.getElementById('boxNomePeca');
const totalDisplay = document.getElementById('totalDisplay');

// Seleção de tamanho
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach(b => {
      b.classList.remove('border-zinc-900', 'bg-zinc-900', 'text-white');
      b.classList.add('border-zinc-300', 'hover:bg-zinc-100');
    });
    btn.classList.remove('border-zinc-300', 'hover:bg-zinc-100');
    btn.classList.add('border-zinc-900', 'bg-zinc-900', 'text-white');
    tamanhoSelecionado = btn.dataset.size;
  });
});

// Mostrar/esconder campo de nome na peça
addNome.addEventListener('change', () => {
  boxNomePeca.classList.toggle('hidden', !addNome.checked);
  calcularTotal();
});

// Regra Classic vs Baloon
radiosModelo.forEach(radio => {
  radio.addEventListener('change', () => {
    const isBaloon = radio.value === 'Baloon';
    document.getElementById('cardClassic').className = isBaloon
      ? 'flex items-center justify-between p-3.5 rounded-xl border border-zinc-300 bg-white cursor-pointer transition'
      : 'flex items-center justify-between p-3.5 rounded-xl border-2 border-zinc-900 bg-zinc-50 cursor-pointer transition';
    document.getElementById('cardBaloon').className = isBaloon
      ? 'flex items-center justify-between p-3.5 rounded-xl border-2 border-zinc-900 bg-zinc-50 cursor-pointer transition'
      : 'flex items-center justify-between p-3.5 rounded-xl border border-zinc-300 bg-white cursor-pointer transition';

    if (isBaloon) {
      addCordinha.checked = false;
      addCordinha.disabled = true;
      rowCordinha.classList.add('opacity-40', 'pointer-events-none');
      descCordinha.textContent = "Indisponível no modelo Baloon";
    } else {
      addCordinha.disabled = false;
      rowCordinha.classList.remove('opacity-40', 'pointer-events-none');
      descCordinha.textContent = "Cordão personalizado no capuz";
    }
    calcularTotal();
  });
});

checkboxes.forEach(chk => chk.addEventListener('change', calcularTotal));

function formatarBRL(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcularTotal() {
  const modelo = document.querySelector('input[name="modelo"]:checked').value;
  let total = PRECOS_BASE[modelo] + FRETE;
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

  const modelo = document.querySelector('input[name="modelo"]:checked').value;
  const listaAdicionais = [];
  if (document.getElementById('addEstampas').checked) listaAdicionais.push("Todas as estampas");
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
    adicionais: listaAdicionais.length ? listaAdicionais.join(" + ") : "Sem adicionais",
    nomePeca: addNome.checked ? nomePeca : "",
    total: formatarBRL(total)
  };

  try {
    if (APPS_SCRIPT_URL !== "COLE_SUA_URL_DO_APPS_SCRIPT_AQUI") {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
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