// Generate simple icon PNGs for the extension
const fs = require('fs');
const path = require('path');

// Simple SVG icon based on the Synapse logo
const createSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" fill="#6366f1"/>
  <path d="M12 4L4 8L12 12L20 8L12 4Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4 16L12 20L20 16" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4 12L12 16L20 12" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Check if we can use sharp for PNG conversion
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('sharp not installed, will create SVG files instead');
  console.log('To convert to PNG, install sharp: npm install sharp');
}

const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

async function generateIcons() {
  for (const size of sizes) {
    const svgContent = createSVG(size);
    const svgPath = path.join(iconsDir, `icon${size}.svg`);
    const pngPath = path.join(iconsDir, `icon${size}.png`);

    // Write SVG file
    fs.writeFileSync(svgPath, svgContent);
    console.log(`Created ${svgPath}`);

    // Convert to PNG if sharp is available
    if (sharp) {
      try {
        await sharp(Buffer.from(svgContent))
          .resize(size, size)
          .png()
          .toFile(pngPath);
        console.log(`Created ${pngPath}`);

        // Remove SVG file after successful conversion
        fs.unlinkSync(svgPath);
      } catch (error) {
        console.error(`Error converting icon${size}.png:`, error.message);
      }
    }
  }

  if (!sharp) {
    console.log('\n⚠️  SVG files created but could not convert to PNG.');
    console.log('Install sharp to convert: npm install sharp');
    console.log('Or use an online converter like: https://cloudconvert.com/svg-to-png');
  } else {
    console.log('\n✓ All icons generated successfully!');
  }
}

generateIcons().catch(console.error);
