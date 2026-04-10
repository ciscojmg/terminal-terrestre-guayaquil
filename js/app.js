document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const themeToggle = document.getElementById('theme-toggle');
  const searchInput = document.getElementById('search-input');
  const destinationsGrid = document.getElementById('destinations-grid');
  const coopsGrid = document.getElementById('cooperativas-grid');
  const btnClearFilters = document.getElementById('btn-clear-filters'); // inside side panel
  const noResults = document.getElementById('no-results');
  const btnOpenDests = document.getElementById('btn-open-dests');
  const paginationControls = document.getElementById('pagination-controls');
  const filterIndicator = document.getElementById('filter-indicator');
  const filterText = filterIndicator.querySelector('.filter-text');
  const btnClearMainFilter = document.getElementById('btn-clear-main-filter');
  
  // Dest Panel Elements
  const destPanel = document.getElementById('dest-panel');
  const btnCloseDestPanel = document.getElementById('btn-close-dest-panel');

  // Panel Elements
  const sidePanel = document.getElementById('side-panel');
  const panelOverlay = document.getElementById('panel-overlay');
  const btnClosePanel = document.getElementById('btn-close-panel');
  const panelCoopName = document.getElementById('panel-coop-name');
  const panelBoleteria = document.getElementById('panel-boleteria');
  const panelDestinations = document.getElementById('panel-destinations');
  const panelSchedules = document.getElementById('panel-schedules');
  const panelContact = document.getElementById('panel-contact');

  let cooperativasData = [];
  let uniqueDestinations = [];
  let currentDestinationFilter = null;
  let currentSearchQuery = '';
  
  let currentPage = 1;
  const itemsPerPage = 12;
  let currentFiltered = [];

  function getPreferredImage() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    return theme === 'dark' ? 'assets/bus-placeholder-dark.png' : 'assets/bus-placeholder-light.png';
  }

  const ICON_MAP = {
    'playas': 'beach_access',
    'salinas': 'beach_access',
    'manta': 'sailing',
    'esmeraldas': 'water_drop',
    'quito': 'landscape',
    'cuenca': 'church',
    'machala': 'warehouse',
    'baños': 'water_drop',
    'default': 'location_on'
  };

  function getDestIcon(destName) {
    const key = destName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return ICON_MAP[key] || ICON_MAP.default;
  }

  // Initialization
  initTheme();
  loadData();

  // --- Theme ---
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(currentTheme === 'light' ? 'dark' : 'light');
    });
  }

  function setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.querySelector('.dark-icon').classList.add('hidden');
      themeToggle.querySelector('.light-icon').classList.remove('hidden');
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.querySelector('.dark-icon').classList.remove('hidden');
      themeToggle.querySelector('.light-icon').classList.add('hidden');
    }
    
    // Update images based on new theme
    document.querySelectorAll('.card-img').forEach(img => img.src = getPreferredImage());
    const panelImg = document.querySelector('.panel-banner img');
    if (panelImg) panelImg.src = getPreferredImage();

    // Update popular destination heroic cards
    document.querySelectorAll('.dest-hero-card').forEach(card => {
      const dest = card.dataset.dest.toLowerCase();
      const img = card.querySelector('img');
      img.src = theme === 'dark' ? `assets/${dest}_noche.png` : `assets/${dest}.png`;
    });

    localStorage.setItem('theme', theme);
  }

  // --- Data Loading ---
  async function loadData() {
    try {
      const res = await fetch('data/cooperativas.json');
      if (!res.ok) throw new Error('Failed to load JSON');
      const rawData = await res.json();
      const entries = Array.isArray(rawData) ? rawData : (rawData.cooperativas || []);
      
      processCooperativas(entries);
      renderDestinations();
      filterAndRender();
    } catch (e) {
      console.error(e);
      noResults.querySelector('p').textContent = 'Error al cargar los datos. Estás usando un servidor local? (npx serve)';
      noResults.classList.remove('hidden');
    }
  }

  function processCooperativas(entries) {
    const grouped = new Map();
    
    entries.forEach(e => {
      if(!e.cooperativa) return;
      const id = e.cooperativa.trim();
      if(!grouped.has(id)) {
        grouped.set(id, {
          nombre: e.cooperativa,
          boleteria: e.boleteria || null,
          destinosSet: new Set(),
          viajes: [],
          telefonos: new Set(),
          web: null
        });
      }
      
      const g = grouped.get(id);
      if(e.ciudad_destino) g.destinosSet.add(e.ciudad_destino.trim());
      if(e.telefono) g.telefonos.add(e.telefono.trim());
      if(e.whatsapp) g.telefonos.add(e.whatsapp.trim());
      if(e.pagina_web && !g.web) g.web = e.pagina_web.trim();
      
      g.viajes.push(e);
    });

    const destCount = {};

    cooperativasData = Array.from(grouped.values()).map(g => {
      const destinos = Array.from(g.destinosSet);
      destinos.forEach(d => {
        const k = d.toLowerCase();
        destCount[k] = (destCount[k] || { name: d, count: 0 });
        destCount[k].count++;
      });
      
      // Flatten schedules
      let todosHorarios = new Set();
      g.viajes.forEach(v => {
        if(v.horarios && Array.isArray(v.horarios)) {
          v.horarios.forEach(h => todosHorarios.add(h));
        }
      });
      
      return {
        ...g,
        destinos,
        horarios: Array.from(todosHorarios).sort(),
        telefonos: Array.from(g.telefonos)
      };
    });

    uniqueDestinations = Object.values(destCount)
      .sort((a,b) => b.count - a.count)
      .map(v => v.name);
  }

  // --- Render ---
  function renderDestinations() {
    const popularNames = ['quito', 'cuenca', 'ambato'];
    const secondaryDests = uniqueDestinations.filter(d => !popularNames.includes(d.toLowerCase()));
    
    // Render secondary panel
    destinationsGrid.innerHTML = secondaryDests.map(dest => `
      <button class="dest-card glass-card" data-dest="${dest}">
        <div class="dest-icon"><span class="material-symbols-rounded">${getDestIcon(dest)}</span></div>
        <span class="dest-name">${dest}</span>
      </button>
    `).join('');

    // Attach events to secondary
    destinationsGrid.querySelectorAll('.dest-card').forEach(card => bindDestCardEvent(card));
    
    // Attach events to Hero popular cards
    document.querySelectorAll('.dest-hero-card').forEach(card => bindDestCardEvent(card));
  }

  function bindDestCardEvent(card) {
    card.addEventListener('click', () => {
      const d = card.dataset.dest;
      if(currentDestinationFilter === d) {
        currentDestinationFilter = null;
        card.classList.remove('active');
      } else {
        document.querySelectorAll('.dest-card, .dest-hero-card').forEach(c => c.classList.remove('active'));
        currentDestinationFilter = d;
        card.classList.add('active');
      }
      filterAndRender();
      
      // Close the dest panel if it was open
      closeDestPanel();
      
      // Scroll down directly to results if a filter was successfully applied
      if (currentDestinationFilter) {
        setTimeout(() => {
          const filterIndicator = document.getElementById('filter-indicator');
          const target = filterIndicator.classList.contains('hidden') ? document.getElementById('cooperativas-grid') : filterIndicator;
          if (target) {
            // subtract a little bit of pixels for the navbar height
            const top = target.getBoundingClientRect().top + window.scrollY - 90;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }, 300); // 300ms to allow panel sliding transition to end
      }
    });
  }

  function filterAndRender() {
    let filtered = cooperativasData;

    // By Destination
    if (currentDestinationFilter) {
      const q = currentDestinationFilter.toLowerCase();
      filtered = filtered.filter(c => c.destinos.some(d => d.toLowerCase() === q));
    }

    // By Search
    if (currentSearchQuery) {
      const q = currentSearchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.nombre.toLowerCase().includes(q) || 
        c.destinos.some(d => d.toLowerCase().includes(q))
      );
    }
    
    // Status Indicator Copy
    let msg = '';
    if (currentDestinationFilter && currentSearchQuery) {
      msg = `Resultados para <strong>"${currentSearchQuery}"</strong> con destino a <strong>${currentDestinationFilter}</strong>`;
    } else if (currentDestinationFilter) {
      msg = `Mostrando cooperativas con destino a <strong>${currentDestinationFilter}</strong>`;
    } else if (currentSearchQuery) {
      msg = `Resultados de búsqueda para <strong>"${currentSearchQuery}"</strong>`;
    }

    if (msg) {
      filterText.innerHTML = msg;
      filterIndicator.classList.remove('hidden');
    } else {
      filterIndicator.classList.add('hidden');
    }

    renderPage(filtered, 1);
  }

  function renderPage(filteredArray, targetPage=1) {
    currentFiltered = filteredArray;
    currentPage = targetPage;
    const totalPages = Math.ceil(currentFiltered.length / itemsPerPage);
    if(currentPage < 1) currentPage = 1;
    if(currentPage > totalPages && totalPages > 0) currentPage = totalPages;

    if (currentFiltered.length === 0) {
      coopsGrid.innerHTML = '';
      noResults.classList.remove('hidden');
      paginationControls.innerHTML = '';
    } else {
      noResults.classList.add('hidden');
      
      const start = (currentPage - 1) * itemsPerPage;
      const paginatedItems = currentFiltered.slice(start, start + itemsPerPage);
      
      coopsGrid.innerHTML = paginatedItems.map((c) => {
        const destString = c.destinos.length > 0 ? c.destinos.slice(0,3).join(' • ') + (c.destinos.length > 3 ? '...' : '') : 'Múltiples destinos';
        // Need global index for opening the panel correctly
        const globalIndex = cooperativasData.indexOf(c);
        return `
          <div class="coop-card glass-card" data-index="${globalIndex}">
            <div class="card-img-wrapper">
              ${c.boleteria ? `<div class="badge">Boletería ${c.boleteria}</div>` : ''}
              <img src="${getPreferredImage()}" class="card-img" alt="${c.nombre}" loading="lazy">
              <div class="card-overlay"></div>
              <div class="card-content">
                <h3 class="card-title">${c.nombre}</h3>
                <span class="card-routes"><span class="material-symbols-rounded" style="font-size:14px;vertical-align:middle;margin-right:4px;">route</span>${destString}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      coopsGrid.querySelectorAll('.coop-card').forEach(card => {
        card.addEventListener('click', () => {
          openPanel(cooperativasData[parseInt(card.dataset.index)]);
        });
      });
      
      renderPaginationControls(totalPages);
    }
  }

  function renderPaginationControls(totalPages) {
    if (totalPages <= 1) {
      paginationControls.innerHTML = '';
      return;
    }
    paginationControls.innerHTML = `
      <button class="btn-page" id="btn-prev" ${currentPage <= 1 ? 'disabled' : ''}>Anterior</button>
      <span class="page-info">Página ${currentPage} de ${totalPages}</span>
      <button class="btn-page" id="btn-next" ${currentPage >= totalPages ? 'disabled' : ''}>Siguiente</button>
    `;
    
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if (btnPrev) btnPrev.addEventListener('click', () => renderPage(currentFiltered, currentPage - 1));
    if (btnNext) btnNext.addEventListener('click', () => renderPage(currentFiltered, currentPage + 1));
  }

  // --- Events ---
  searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value.trim();
    filterAndRender();
  });

  btnClearFilters.addEventListener('click', () => {
    currentDestinationFilter = null;
    currentSearchQuery = '';
    searchInput.value = '';
    document.querySelectorAll('.dest-card, .dest-hero-card').forEach(c => c.classList.remove('active'));
    filterAndRender();
    closeDestPanel();
  });
  
  btnClearMainFilter.addEventListener('click', () => {
    currentDestinationFilter = null;
    currentSearchQuery = '';
    searchInput.value = '';
    document.querySelectorAll('.dest-card, .dest-hero-card').forEach(c => c.classList.remove('active'));
    filterAndRender();
  });

  // --- Dest Panel ---
  function openDestPanel() {
    destPanel.classList.add('open');
    panelOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeDestPanel() {
    destPanel.classList.remove('open');
    // only remove overlay if side panel is also closed
    if (!sidePanel.classList.contains('open')) {
      panelOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  btnOpenDests.addEventListener('click', openDestPanel);
  btnCloseDestPanel.addEventListener('click', closeDestPanel);

  // --- Side Panel ---
  function openPanel(coop) {
    // Populate
    panelCoopName.textContent = coop.nombre;
    
    // Banner Image
    const panelImg = document.querySelector('.panel-banner img');
    if (panelImg) panelImg.src = getPreferredImage();
    
    if(coop.boleteria) {
      panelBoleteria.textContent = `Boletería #${coop.boleteria}`;
      panelBoleteria.classList.remove('hidden');
    } else {
      panelBoleteria.classList.add('hidden');
    }

    // Destinations
    panelDestinations.innerHTML = coop.destinos.map(d => `<span class="route-tag">${d}</span>`).join('');
    
    // Schedules
    if (coop.horarios.length > 0) {
      panelSchedules.innerHTML = coop.horarios.map(h => `<span class="time-chip">${h}</span>`).join('');
      panelSchedules.parentElement.classList.remove('hidden');
    } else {
      panelSchedules.parentElement.classList.add('hidden');
    }

    // Contact
    let contactHtml = '';
    coop.telefonos.forEach(t => {
      contactHtml += `<li class="contact-item"><span class="material-symbols-rounded contact-icon">call</span><span>${t}</span></li>`;
    });
    if (coop.web) {
      contactHtml += `<li class="contact-item"><span class="material-symbols-rounded contact-icon">language</span><a href="${coop.web.startsWith('http') ? coop.web : 'https://'+coop.web}" target="_blank">${coop.web}</a></li>`;
    }
    if(contactHtml) {
      panelContact.innerHTML = contactHtml;
      panelContact.parentElement.classList.remove('hidden');
    } else {
      panelContact.parentElement.classList.add('hidden');
    }

    // Show
    sidePanel.classList.add('open');
    panelOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    sidePanel.classList.remove('open');
    if (!destPanel.classList.contains('open')) {
      panelOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  btnClosePanel.addEventListener('click', closePanel);
  panelOverlay.addEventListener('click', () => {
    closePanel();
    closeDestPanel();
  });
});
