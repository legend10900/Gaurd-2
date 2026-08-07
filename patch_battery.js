const fs = require('fs');
let code = fs.readFileSync('src/screens/BatteryCoolerScreen.tsx', 'utf8');
code = code.replace(
  /Device\.getBatteryInfo\(\)\.then\(info => setBatteryInfo\(info\)\);/g,
  'Device.getBatteryInfo().then(info => setBatteryInfo(info)).catch(e => console.warn("Battery info not available:", e));'
);
fs.writeFileSync('src/screens/BatteryCoolerScreen.tsx', code);
