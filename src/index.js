Error.stackTraceLimit = 30;

"use strict";

const services = require("./services");

async function farmUpdater() {
  await Promise.allSettled([
    Promise.all(services.getPlatforms().getFunctionAwaits('getFarms', [true])),
    Promise.all(services.getPolygonPlatforms().getFunctionAwaits('getFarms', [true])),
    Promise.all(services.getFantomPlatforms().getFunctionAwaits('getFarms', [true])),
  ]);
}

async function priceUpdater() {
  await Promise.allSettled([
    services.getCronjobs().cronInterval(),
    services.getCronjobs().polygonCronInterval(),
    services.getCronjobs().fantomCronInterval(),
  ]);
}

// warmup
setTimeout(async () => {
  setInterval(async () => {
    await priceUpdater();
  }, 1000 * 60 * 5);

  console.log('application init started')
  await priceUpdater();

  console.log("\x1b[32m" + "price init done" + "\x1b[0m");

  await farmUpdater();
  console.log("\x1b[32m" + "farms init done" + "\x1b[0m");

  services.getHttp().start(process.argv[2] || 3000)
}, 1);

// farm update interval
setInterval(async () => {
  await farmUpdater();

  // collecting farm data to have historically data
  await Promise.allSettled([
    services.getDb().updateFarmPrices(),
    services.getDb().updateAddressMaps(),
    services.getDb().updateLpInfoMaps(),
    services.getPolygonDb().updateFarmPrices(),
    services.getPolygonDb().updateAddressMaps(),
    services.getPolygonDb().updateLpInfoMaps(),
    services.getFantomDb().updateFarmPrices(),
    services.getFantomDb().updateAddressMaps(),
    services.getFantomDb().updateLpInfoMaps(),
  ]);
}, 1000 * 60 * 4);
