function normalizePrice(text) {
    if (!text) return null;
    let cleanText = text.toLowerCase().replace(/\s/g, "").replace(/da/g, "").replace(/dzd/g, "");

    // Handle "6m" -> 6 million centimes -> 60,000 DA
    // Wait, typical Algerian "millions" usually means centimes. 
    // 1 million centimes = 10,000 DA.
    // The user said: "6m -> 60000". So 1m = 10000. Correct.
    if (cleanText.includes("m")) {
        const value = parseFloat(cleanText.replace("m", ""));
        return value * 10000;
    }

    // Handle "60k" -> 60,000
    if (cleanText.includes("k")) {
        const value = parseFloat(cleanText.replace("k", ""));
        return value * 1000;
    }

    // Handle "6" -> 6 millions (implied if small number?)
    // User logic: if (text.length <= 2) return parseInt(text) * 10000;
    // Example: "6" -> 60,000 DA
    if (cleanText.length <= 2 && !isNaN(cleanText)) {
        return parseInt(cleanText) * 10000;
    }

    // Default: parse as integer (e.g. "60000")
    // Remove non-numeric chars except needed? Actually just parse int.
    // But be careful of "60 000". replace \s was done.
    const val = parseInt(cleanText);
    return isNaN(val) ? null : val;
}

module.exports = { normalizePrice };
