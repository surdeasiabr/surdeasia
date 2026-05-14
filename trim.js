const sharp = require('sharp');
const path = require('path');

async function trimLogos() {
    try {
        await sharp(path.join(__dirname, 'images', 'logo-transparent.png'))
            .trim()
            .toFile(path.join(__dirname, 'images', 'logo-transparent-trimmed.png'));
        
        await sharp(path.join(__dirname, 'images', 'logo-white.png'))
            .trim()
            .toFile(path.join(__dirname, 'images', 'logo-white-trimmed.png'));
            
        console.log("Trimmed successfully!");
    } catch (e) {
        console.error("Error trimming:", e);
    }
}
trimLogos();
