/** @param {import('karma').Config} config */
module.exports = config => config.set({
  client: {
    captureConsole: false,
  },
  browserDisconnectTimeout: 15000000,
});
