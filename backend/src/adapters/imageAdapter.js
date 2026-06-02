const { extractTextFromImage } = require("../services/groqService");
const fs = require("fs");
const path = require("path");

async function extractTextFromImageFile(filepath) {
    // read the uploaded file and convert to base64
    const absolutePath = path.resolve(filePath);
    const fileBuffer = fs.readFileSync(absolutePath);
    const base64Image = fileBuffer.toString("base64");

    // detect media type from file extension
    const ext = path.extname(filePath).toLowerCase();
    const mediaTypeMap = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    };
    const mediaType = mediaTypeMap[ext] || "image/jpeg";

    const extractedText = await extractTextFromImage(base64Image, mediaType);

    // clean up uploaded file after extraction
    fs.unlinkSync(absolutePath);

    return extractedText;
}

module.exports = { extractTextFromImageFile };