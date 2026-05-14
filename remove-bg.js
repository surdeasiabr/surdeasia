const sharp = require('sharp');
const path = require('path');

async function removeBg() {
    const inputPath = path.join(__dirname, 'images', 'logo.png');

    // Read the image
    const image = sharp(inputPath);
    const { width, height, channels } = await image.metadata();

    // Get raw pixel data
    const raw = await image.ensureAlpha().raw().toBuffer();

    // Process pixels: make white/near-white pixels transparent
    const threshold = 230; // pixels with R,G,B all above this become transparent
    for (let i = 0; i < raw.length; i += 4) {
        const r = raw[i];
        const g = raw[i + 1];
        const b = raw[i + 2];
        if (r > threshold && g > threshold && b > threshold) {
            raw[i + 3] = 0; // set alpha to 0 (transparent)
        }
    }

    // Save transparent version (blue logo)
    await sharp(raw, { raw: { width, height, channels: 4 } })
        .png()
        .toFile(path.join(__dirname, 'images', 'logo-transparent.png'));

    console.log('✅ logo-transparent.png created');

    // Save white version (for dark backgrounds)
    // Invert all non-transparent pixels to white
    const rawWhite = Buffer.from(raw);
    for (let i = 0; i < rawWhite.length; i += 4) {
        if (rawWhite[i + 3] > 0) {
            rawWhite[i] = 255;     // R
            rawWhite[i + 1] = 255; // G
            rawWhite[i + 2] = 255; // B
        }
    }

    await sharp(rawWhite, { raw: { width, height, channels: 4 } })
        .png()
        .toFile(path.join(__dirname, 'images', 'logo-white.png'));

    console.log('✅ logo-white.png created');
}

removeBg().catch(err => console.error('Error:', err));
