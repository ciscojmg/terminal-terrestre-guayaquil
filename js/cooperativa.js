/**
 * Terminal Terrestre Guayaquil - Página de detalle de cooperativa
 * Carga cooperativas.json, obtiene id de URL y renderiza detalle
 */

(function () {
  'use strict';

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  const elements = {
    content: document.getElementById('cooperativa-content'),
    errorState: document.getElementById('error-state'),
    nombreHeader: document.getElementById('cooperativa-nombre')
  };

  const iconMap = {
    ubicacion: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    piso: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>`,
    referencia: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>`,
    wifi: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13a10 10 0 0 1 14 0"></path><path d="M8.5 16.429a5 5 0 0 1 7 0"></path><path d="M12 20h.01"></path></svg>`,
    aire: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4"></path><path d="M12 18v4"></path><path d="m4.93 4.93 2.83 2.83"></path><path d="m16.24 16.24 2.83 2.83"></path><path d="M2 12h4"></path><path d="M18 12h4"></path><path d="m4.93 19.07 2.83-2.83"></path><path d="m16.24 7.76 2.83-2.83"></path><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0"></path></svg>`,
    pelicula: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>`,
    reclinable: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l3 3-3 3"></path><path d="M6 12h14"></path><path d="M21 9l-3 3 3 3"></path></svg>`,
    reloj: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    distancia: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    telefono: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
    web: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`
  };

  function parsePhoneForTel(phone) {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 9) {
      const withCountry = digits.length === 9 ? '593' + digits : digits;
      return 'tel:+' + withCountry;
    }
    return null;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderCooperativa(c) {
    const tel = parsePhoneForTel(c.contacto?.telefono);
    const horarios = c.horarios?.salidas || [];
    const ruta = c.rutaPrincipal || {};
    const ubic = c.ubicacion || {};

    const serviciosHtml = (c.servicios || []).map((s) => {
      let icon = iconMap.wifi;
      if (s.toLowerCase().includes('aire') || s.toLowerCase().includes('acond')) icon = iconMap.aire;
      else if (s.toLowerCase().includes('pelicula') || s.toLowerCase().includes('película')) icon = iconMap.pelicula;
      else if (s.toLowerCase().includes('reclinable')) icon = iconMap.reclinable;
      return `<div class="servicio-item">${icon}<span>${escapeHtml(s)}</span></div>`;
    }).join('');

    const horariosHtml = horarios
      .map((h) => `<span class="horario-chip">${escapeHtml(h)}</span>`)
      .join('');

    return `
      <div class="detail-banner">
        <img src="${c.imagen}" alt="${escapeHtml(c.nombre)}" width="400" height="225" loading="eager">
        ${c.tipoServicio ? `<span class="detail-banner-badge">${escapeHtml(c.tipoServicio)}</span>` : ''}
      </div>

      <section class="detail-section">
        <h3>Ubicación en el Terminal</h3>
        <div class="ubicacion-cards">
          <div class="ubicacion-card">
            ${iconMap.ubicacion}
            <div>
              <strong>Número de Agencia</strong><br>
              <span>Boletería #${ubic.boleteria ?? c.boleteria}</span>
            </div>
          </div>
          <div class="ubicacion-card">
            ${iconMap.piso}
            <div>
              <strong>Piso</strong><br>
              <span>${escapeHtml(ubic.piso || '—')}</span>
            </div>
          </div>
          <div class="ubicacion-card">
            ${iconMap.referencia}
            <div>
              <strong>Referencia</strong><br>
              <span>${escapeHtml(ubic.referencia || '—')}</span>
            </div>
          </div>
        </div>
      </section>

      ${serviciosHtml ? `
      <section class="detail-section">
        <h3>Servicios a Bordo</h3>
        <div class="servicios-grid">${serviciosHtml}</div>
      </section>
      ` : ''}

      ${ruta.destino ? `
      <section class="detail-section">
        <h3>Ruta Principal</h3>
        <div class="ruta-card">
          <p class="ruta-titulo">${escapeHtml(ruta.origen || '')} - ${escapeHtml(ruta.destino || '')}</p>
          ${ruta.tipo ? `<p class="ruta-tipo">${escapeHtml(ruta.tipo)}</p>` : ''}
          ${ruta.pasaje != null ? `<p class="ruta-pasaje-label">PASAJE</p><p class="ruta-pasaje">$${Number(ruta.pasaje).toFixed(2)}</p>` : ''}
          <div class="ruta-info">
            ${ruta.duracion ? `<span class="ruta-info-item">${iconMap.reloj} <strong>${escapeHtml(ruta.duracion)}</strong></span>` : ''}
            ${ruta.distancia ? `<span class="ruta-info-item">${iconMap.distancia} <strong>${escapeHtml(ruta.distancia)}</strong></span>` : ''}
          </div>
        </div>
      </section>
      ` : ''}

      ${horarios.length ? `
      <section class="detail-section">
        <h3>Horarios de Salida</h3>
        ${c.horarios?.descripcion ? `<p style="margin:0 0 12px 0; color: var(--color-text-muted); font-size: 0.9375rem;">${escapeHtml(c.horarios.descripcion)}</p>` : ''}
        <div class="horarios-grid">${horariosHtml}</div>
      </section>
      ` : ''}

      <section class="detail-section">
        <h3>Información de Contacto</h3>
        ${c.contacto?.oficina ? `
        <div class="contacto-item">
          ${iconMap.ubicacion}
          <div><strong>Oficina Principal</strong><br>${escapeHtml(c.contacto.oficina)}</div>
        </div>
        ` : ''}
        ${c.contacto?.telefono ? `
        <div class="contacto-item">
          ${iconMap.telefono}
          <div>
            <strong>Atención al Cliente</strong><br>
            ${tel ? `<a href="${tel}">${escapeHtml(c.contacto.telefono)}</a>` : escapeHtml(c.contacto.telefono)}
          </div>
        </div>
        ` : ''}
        ${c.contacto?.web ? `
        <div class="contacto-item">
          ${iconMap.web}
          <div>
            <strong>Sitio Web Oficial</strong><br>
            <a href="${c.contacto.web.startsWith('http') ? c.contacto.web : 'https://' + c.contacto.web}" target="_blank" rel="noopener noreferrer">${escapeHtml(c.contacto.web.replace(/^https?:\/\//, ''))}</a>
          </div>
        </div>
        ` : ''}
      </section>
    `;
  }

  async function init() {
    if (!id) {
      elements.content?.classList.add('hidden');
      elements.errorState?.classList.remove('hidden');
      return;
    }

    let cooperativas = [];
    try {
      const response = await fetch('data/cooperativas.json');
      const data = await response.json();
      cooperativas = data.cooperativas || [];
    } catch (err) {
      console.error('Error cargando cooperativas:', err);
    }

    const cooperativa = cooperativas.find((c) => c.id === id);

    if (!cooperativa) {
      elements.content?.classList.add('hidden');
      elements.errorState?.classList.remove('hidden');
      return;
    }

    if (elements.nombreHeader) elements.nombreHeader.textContent = cooperativa.nombre;
    if (elements.content) {
      elements.content.innerHTML = renderCooperativa(cooperativa);
      elements.content.classList.remove('hidden');
    }
    elements.errorState?.classList.add('hidden');

    document.title = `${cooperativa.nombre} - Terminal Terrestre Guayaquil`;
  }

  init();
})();
