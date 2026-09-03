// Anuncios recompensados ("mira un anuncio para desbloquear X").
//
// AHORA MISMO ES UN SIMULACRO: espera unos segundos y concede la recompensa.
// No existe un producto de "rewarded ads" para webs normales en AdSense
// (eso es AdMob para apps, o Google Ad Manager, o redes de terceros para
// web). Cuando se elija un proveedor real, se implementa SOLO aquí dentro
// de `showRewardedAd` y el resto de la app no cambia.

const MOCK_DURATION_MS = 4000;

export function isRealAdsConfigured() {
  return false; // -> true cuando haya un SDK real integrado
}

// Reproduce un anuncio recompensado para `category`.
// Opcional: `onTick(msLeft)` para pintar una cuenta atrás.
// Resuelve { rewarded: boolean, category, mock? }.
export function showRewardedAd(category, { onTick } = {}) {
  // ---------------------------------------------------------------------
  // Simulacro
  // ---------------------------------------------------------------------
  return new Promise((resolve) => {
    const start = Date.now();
    const timer = setInterval(() => {
      const left = Math.max(0, MOCK_DURATION_MS - (Date.now() - start));
      onTick?.(left);
      if (left <= 0) {
        clearInterval(timer);
        resolve({ rewarded: true, category, mock: true });
      }
    }, 200);
  });

  // ---------------------------------------------------------------------
  // Integración real (pendiente de elegir proveedor). Esquema con
  // Google Ad Manager rewarded (googletag):
  //
  //   return new Promise((resolve) => {
  //     googletag.cmd.push(() => {
  //       const slot = googletag.defineOutOfPageSlot(REWARDED_UNIT,
  //         googletag.enums.OutOfPageFormat.REWARDED);
  //       if (!slot) return resolve({ rewarded: false, category });
  //       slot.addService(googletag.pubads());
  //       googletag.pubads().addEventListener("rewardedSlotGranted", () =>
  //         resolve({ rewarded: true, category }));
  //       googletag.pubads().addEventListener("rewardedSlotClosed", () =>
  //         resolve({ rewarded: false, category }));
  //       googletag.pubads().addEventListener("rewardedSlotReady", (e) =>
  //         e.makeRewardedVisible());
  //       googletag.enableServices();
  //       googletag.display(slot);
  //     });
  //   });
  // ---------------------------------------------------------------------
}
