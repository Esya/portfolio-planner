const nxPreset = require('@nrwl/jest/preset');

console.log('NX PRESET ----------', nxPreset);
module.exports = { ...nxPreset, transformIgnorePatterns: ['/node_modules/(?!react-leaflet|@react-leaflet)'] }
