window.ULS_DATABASE = (() => {

  const API_URL =
    'https://script.google.com/macros/s/AKfycbx_7zRpxqK6amreP53BsHf2LYZ29dH9DwNQlf0rGi6tdkelcXh24bbXBpgnKDDtVWyp/exec';

  const clientCache = new Map();
  const CLIENT_CACHE_MS = 5 * 60 * 1000;

  function readCachedClient(cleanPhone) {
    const cached = clientCache.get(cleanPhone);
    if (cached && Date.now() - cached.time < CLIENT_CACHE_MS) {
      return cached.data;
    }

    try {
      const raw = sessionStorage.getItem('uls_client_' + cleanPhone);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.time && Date.now() - parsed.time < CLIENT_CACHE_MS) {
        clientCache.set(cleanPhone, { time: parsed.time, data: parsed.data });
        return parsed.data;
      }
    } catch (e) {}

    return null;
  }

  function writeCachedClient(cleanPhone, data) {
    const time = Date.now();
    clientCache.set(cleanPhone, { time, data });
    try {
      sessionStorage.setItem('uls_client_' + cleanPhone, JSON.stringify({ time, data }));
    } catch (e) {}
  }

  async function getClient(phone) {

    const cleanPhone = String(phone || '')
      .replace(/\s/g, '')
      .replace(/\+/g, '');

    if (!cleanPhone) {
      throw new Error('Numéro de téléphone manquant');
    }

    const cached = readCachedClient(cleanPhone);
    if (cached) {
      return cached;
    }

    const now = Date.now();
    const url =
      API_URL +
      '?phone=' +
      encodeURIComponent(cleanPhone) +
      '&t=' +
      now;

    const response = await fetch(url, {
      method: 'GET',
      cache: 'force-cache'
    });

    if (!response.ok) {
      throw new Error(
        'Impossible de contacter le serveur.'
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(
        data.error || 'Erreur inconnue.'
      );
    }

    writeCachedClient(cleanPhone, data);
    return data;
  }

  function normalizeDate(v) {
    if (!v && v !== 0) return null;
    const s = String(v).trim();
    if (!s) return null;
    const d = s.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
  }

  function normalizeAptKey(value) {
    if (!value && value !== 0) return '';
    const s = String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

    return s
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function resolveAptId(row) {
    const candidates = [
      row.aptId,
      row.apartmentId,
      row.propertyId,
      row.id,
      row.logementId,
      row.logement,
      row.logementName,
      row.nomLogement,
      row.nom_du_logement,
      row.nom,
      row.name,
      row.apartment,
      row.property,
      row.type,
      row.home,
      row.unit,
      row.logement_nom,
      row.logement_name
    ];

    for (const candidate of candidates) {
      const value = String(candidate || '').trim();
      if (!value) continue;
      return normalizeAptKey(value);
    }

    return '';
  }

  let cachedBlockedDates = null;
  let blockedDatesRequest = null;

  async function getBlockedDates(force = false) {
    if (!force && cachedBlockedDates) return cachedBlockedDates;
    if (!force && blockedDatesRequest) return blockedDatesRequest;
    if (force) {
      cachedBlockedDates = null;
      blockedDatesRequest = null;
    }

    const url = API_URL + '?action=bookings&t=' + Date.now();
    blockedDatesRequest = fetch(url, {
      method: 'GET',
      cache: 'no-store'
    })
      .then(async (response) => {
        if (!response.ok) {
          return {};
        }

        const data = await response.json();
        const rows = Array.isArray(data)
          ? data
          : (data.bookings || data.blockedDates || data.reservations || data.data || data.rows || data.result || []);

        if (!Array.isArray(rows) || rows.length === 0) {
          return {};
        }

        const byProperty = {};

        rows.forEach((row) => {
          if (!row || typeof row !== 'object') return;

          const aptId = resolveAptId(row);
          const from = normalizeDate(
            row.from || row.start || row.arrival || row.checkin || row.dateFrom || row.date_start || row.startDate || row.arrivee || row.date_arrivee
          );

          const to = normalizeDate(
            row.to || row.end || row.departure || row.checkout || row.dateTo || row.date_end || row.endDate || row.depart || row.date_depart
          );

          if (!aptId || !from || !to) return;

          byProperty[aptId] = byProperty[aptId] || [];
          byProperty[aptId].push({ from, to });
        });

        cachedBlockedDates = Object.keys(byProperty).length > 0 ? byProperty : {};
        return cachedBlockedDates;
      })
      .catch(() => ({}))
      .finally(() => {
        blockedDatesRequest = null;
      });

    return blockedDatesRequest;
  }

  return {
    getClient,
    getBlockedDates
  };

})();