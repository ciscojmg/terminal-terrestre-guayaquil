/**
 * Terminal Terrestre Guayaquil - Página principal
 * Carga cooperativas, extrae destinos únicos, renderiza listado y búsqueda
 */

(function () {
  'use strict';

  let cooperativas = [];
  let destinoSeleccionado = null;

  const elements = {
    cooperativasGrid: document.getElementById('cooperativas-grid'),
    noResults: document.getElementById('no-results'),
    searchInput: document.getElementById('search'),
    contribuidoresGrid: document.getElementById('contribuidores-grid'),
    destinosGrid: document.getElementById('destinos-grid'),
    verTodosBtn: document.getElementById('ver-todos-destinos')
  };

  const ICONOS_DESTINO = {
    salinas: 'beach_access',
    manta: 'sailing',
    quito: 'landscape',
    cuenca: 'church',
    ibarra: 'terrain',
    playas: 'beach_access',
    'baños': 'water_drop',
    machala: 'warehouse',
    esmeraldas: 'water_drop',
    ambato: 'landscape',
    loja: 'church',
    manabí: 'sailing',
    default: 'location_on'
  };

  function getIconoDestino(nombre) {
    const clave = (nombre || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return ICONOS_DESTINO[clave] || ICONOS_DESTINO.default;
  }

  function extraerDestinosUnicos(coops) {
    const conteo = {};
    for (const c of coops) {
      const dest = c.rutaPrincipal?.destino?.trim();
      if (dest) {
        const clave = dest.toLowerCase();
        if (!conteo[clave]) conteo[clave] = { nombre: dest, count: 0 };
        conteo[clave].count += 1;
      }
    }
    return Object.values(conteo)
      .sort((a, b) => b.count - a.count || a.nombre.localeCompare(b.nombre))
      .map((d) => ({ nombre: d.nombre, slug: d.nombre.toLowerCase() }));
  }

  function renderDestinos(destinos) {
    if (!elements.destinosGrid) return;
    elements.destinosGrid.innerHTML = destinos
      .map(
        (d) => `
        <button type="button" class="destino-card flex flex-col items-center gap-2 min-w-[80px] shrink-0 bg-transparent border-none cursor-pointer p-0" data-destino="${escapeHtml(d.slug)}">
          <div class="destino-icon-wrapper size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-colors">
            <span class="material-symbols-outlined text-3xl">${getIconoDestino(d.nombre)}</span>
          </div>
          <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">${escapeHtml(d.nombre)}</span>
        </button>
      `
      )
      .join('');
  }

  async function loadCooperativas() {
    try {
      const response = await fetch('data/cooperativas.json');
      const data = await response.json();
      cooperativas = data.cooperativas || [];
      const destinos = extraerDestinosUnicos(cooperativas);
      renderDestinos(destinos);
    } catch (err) {
      console.error('Error cargando cooperativas:', err);
      cooperativas = [];
      renderDestinos([]);
    }
  }

  async function loadContribuidores() {
    try {
      const response = await fetch('CONTRIBUTORS.json');
      const data = await response.json();
      renderContribuidores(data.contributors || []);
    } catch (err) {
      console.error('Error cargando contribuidores:', err);
      renderContribuidores([]);
    }
  }

  function renderContribuidores(contributors) {
    if (!elements.contribuidoresGrid) return;

    if (!contributors || contributors.length === 0) {
      elements.contribuidoresGrid.innerHTML =
        '<p class="text-sm text-slate-600 dark:text-slate-400">Aún no hay contribuidores. ¡Sé el primero en hacer un <a href="https://github.com/ciscojmg/terminal-terrestre-guayaquil" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">pull request</a>!</p>';
      return;
    }

    elements.contribuidoresGrid.innerHTML = contributors
      .map(
        (c) => `
        <a href="${c.html_url || 'https://github.com/' + c.login}" 
           class="block w-12 h-12 rounded-full overflow-hidden hover:opacity-80 transition-opacity" 
           target="_blank" 
           rel="noopener noreferrer"
           title="${c.login}">
          <img src="${c.avatar_url}?s=96" alt="Avatar de ${c.login}" width="48" height="48" loading="lazy" class="w-full h-full object-cover">
        </a>
      `
      )
      .join('');
  }

  function filtrarCooperativas() {
    const query = (elements.searchInput?.value || '').trim().toLowerCase();
    const filtradas = cooperativas.filter((c) => {
      const coincideDestino =
        !destinoSeleccionado ||
        (c.rutaPrincipal?.destino || '').toLowerCase().includes(destinoSeleccionado.toLowerCase());
      const coincideBusqueda =
        !query ||
        c.nombre.toLowerCase().includes(query) ||
        (c.ubicacion?.referencia || '').toLowerCase().includes(query) ||
        (c.rutaPrincipal?.destino || '').toLowerCase().includes(query) ||
        (c.rutaPrincipal?.origen || '').toLowerCase().includes(query);
      return coincideDestino && coincideBusqueda;
    });
    return filtradas;
  }

  function renderCooperativas(lista) {
    if (!elements.cooperativasGrid) return;

    if (lista.length === 0) {
      elements.cooperativasGrid.innerHTML = '';
      if (elements.noResults) {
        const destName = destinoSeleccionado ? (destinoSeleccionado.charAt(0).toUpperCase() + destinoSeleccionado.slice(1)) : '';
        elements.noResults.textContent = destinoSeleccionado
          ? `No hay cooperativas con ruta a ${destName}.`
          : 'No se encontraron cooperativas.';
        elements.noResults.classList.remove('hidden');
      }
      return;
    }

    elements.noResults?.classList.add('hidden');
    elements.cooperativasGrid.innerHTML = lista
      .map(
        (c) => `
        <a href="cooperativa.html?id=${encodeURIComponent(c.id)}" class="flex flex-col gap-2">
          <div class="relative aspect-[4/3] rounded-xl overflow-hidden">
            <img class="w-full h-full object-cover" src="${c.imagen}" alt="${escapeHtml(c.nombre)}" width="200" height="150" loading="lazy">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div class="absolute bottom-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
              Boletería #${c.boleteria}
            </div>
          </div>
          <p class="text-sm font-bold text-slate-800 dark:text-slate-200">${escapeHtml(c.nombre)}</p>
        </a>
      `
      )
      .join('');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function actualizarVista() {
    const filtradas = filtrarCooperativas();
    renderCooperativas(filtradas);
  }

  function initDestinos() {
    elements.destinosGrid?.addEventListener('click', (e) => {
      e.preventDefault();
      const card = e.target.closest('.destino-card');
      if (!card) return;
      const destino = card.dataset.destino;
      if (!destino) return;

      destinoSeleccionado = destinoSeleccionado === destino ? null : destino;
      elements.destinosGrid?.querySelectorAll('.destino-card').forEach((c) => {
        const wrapper = c.querySelector('.destino-icon-wrapper');
        const isActive = c.dataset.destino === destinoSeleccionado;
        wrapper?.classList.toggle('ring-2', isActive);
        wrapper?.classList.toggle('ring-primary', isActive);
        wrapper?.classList.toggle('bg-primary/20', isActive);
        if (isActive) wrapper?.classList.remove('bg-primary/10');
        else wrapper?.classList.add('bg-primary/10');
      });
      if (elements.searchInput) elements.searchInput.value = '';
      actualizarVista();
    });

    elements.verTodosBtn?.addEventListener('click', () => {
      destinoSeleccionado = null;
      elements.destinosGrid?.querySelectorAll('.destino-card').forEach((c) => {
        const wrapper = c.querySelector('.destino-icon-wrapper');
        wrapper?.classList.remove('ring-2', 'ring-primary', 'bg-primary/20');
        wrapper?.classList.add('bg-primary/10');
      });
      if (elements.searchInput) elements.searchInput.value = '';
      actualizarVista();
    });
  }

  function initSearch() {
    elements.searchInput?.addEventListener('input', () => {
      actualizarVista();
    });
  }

  async function init() {
    await loadCooperativas();
    await loadContribuidores();
    initDestinos();
    initSearch();
    actualizarVista();
  }

  init();
})();
