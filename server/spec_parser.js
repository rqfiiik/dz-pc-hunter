/**
 * Parses a free-text search query and extracts standard PC specifications.
 * This is used to map user queries to the structured 'IntelligenceUnit' records.
 * 
 * @param {string} query - The raw user search string (e.g., "i5-1145G7 Iris Xe 16GB 512gb new")
 * @returns {Object} - An object containing extracted { cpu, gpu, ram, storage, condition }
 */
function parseSpecs(query) {
    if (!query || typeof query !== 'string') return {};

    const q = query.toLowerCase();
    const result = {
        cpu: null,
        gpu: null,
        ram: null,
        storage: null,
        condition: null
    };

    // 1. Extract RAM
    // Use matchAll to find all instances of digits followed by gb/g to prevent CPU models like "1145g7" from swallowing the first RAM match
    // Added word boundaries \b to prevent partial word matches like "12t" from "12th"
    const ramMatches = [...q.matchAll(/\b(\d+)\s*(gb|g|go)\b\s*(ram|memory)?/ig)];
    for (const match of ramMatches) {
        const val = parseInt(match[1]);
        if (val <= 128 && val >= 4) { // reasonable RAM sizes
            // make sure it isn't part of storage like 128gb or 256gb if the value is 128
            if (val !== 128 && val !== 256 && val !== 512) {
                result.ram = `${val}GB`;
                break;
            } else if (match[3] && (match[3].toLowerCase() === 'ram' || match[3].toLowerCase() === 'memory')) {
                // If it explicitly says 128gb ram, trust it
                result.ram = `${val}GB`;
                break;
            }
            // If it's 128/256/512 and doesn't say RAM, it's likely storage, so we skip and keep looking for RAM
        }
    }

    // 2. Extract Storage
    // Word boundaries to prevent "12th" from matching "12t" for 12TB or "2t" for 2TB
    const storageGbMatch = q.match(/\b(128|256|512)\s*(gb|g|go)\b\s*(ssd|hdd|nvme)?/i);
    const storageTbMatch = q.match(/\b([12])\s*(tb|t|to)\b\s*(ssd|hdd|nvme)?/i);

    if (storageTbMatch) {
        result.storage = `${storageTbMatch[1]}TB`;
    } else if (storageGbMatch) {
        result.storage = `${storageGbMatch[1]}GB`;
    }

    // 3. Extract Condition
    if (q.includes('new') || q.includes('neuf') || q.includes('cachete')) {
        result.condition = 'New';
    } else if (q.includes('used') || q.includes('cabah') || q.includes('occasion')) {
        result.condition = 'Used';
    }

    // Helper to format CPU suffix
    const formatCpuSuffix = (suffix) => {
        if (!suffix) return '';
        // If it's a generation like "12th", "10eme", "5 gen"
        if (suffix.match(/^[0-9]{1,2}(th|eme|ere|\s*gen)/i) || suffix.match(/^[0-9]{1,2}$/)) {
            const genNum = suffix.match(/^([0-9]{1,2})/)[1];
            return ` ${genNum}th Gen`;
        }
        return suffix.replace(/\s+/g, '').toUpperCase();
    };

    // 4. Extract CPU
    // Intel (Allow alphanumeric suffixes like G7, H, HK, P, or generations like 12th)
    const intelMatch = q.match(/(i[3579])(?:-?\s*([0-9]{4,5}[a-z0-9]{0,3}|\b[0-9]{1,2}(?:th|eme|ere)\b(?:\s*gen)?|\b[0-9]{1,2}\b\s*gen))?/i);
    if (intelMatch) {
        result.cpu = intelMatch[1].toUpperCase() + formatCpuSuffix(intelMatch[2]);
    }
    // AMD Ryzen
    const ryzenMatch = q.match(/ryzen\s*([3579])(?:-?\s*([0-9]{4}[a-z0-9]{0,3}|\b[0-9]{1,2}(?:th|eme|ere)\b(?:\s*gen)?|\b[0-9]{1,2}\b\s*gen))?/i);
    if (ryzenMatch) {
        result.cpu = `Ryzen ${ryzenMatch[1]}` + formatCpuSuffix(ryzenMatch[2]);
    }
    // Apple Silicon
    const appleMatch = q.match(/m([1234])(pro|max)?/i);
    if (appleMatch) {
        result.cpu = `M${appleMatch[1]}` + (appleMatch[2] ? ` ${appleMatch[2].charAt(0).toUpperCase() + appleMatch[2].slice(1)}` : '');
    }

    // 5. Extract GPU
    // Nvidia RTX
    const rtxMatch = q.match(/rtx\s*([2345]0[5-9]0)(ti|super|m)?/i);
    if (rtxMatch) {
        result.gpu = `RTX ${rtxMatch[1]}` + (rtxMatch[2] ? rtxMatch[2].toUpperCase() : '');
    }
    // Nvidia GTX
    const gtxMatch = q.match(/gtx\s*(1[06][5-8]0)(ti|super|m)?/i);
    if (gtxMatch) {
        result.gpu = `GTX ${gtxMatch[1]}` + (gtxMatch[2] ? gtxMatch[2].toUpperCase() : '');
    }
    // Intel Iris / UHD
    if (q.includes('iris') || q.includes('xe')) {
        result.gpu = 'Iris Xe';
    } else if (q.includes('uhd')) {
        result.gpu = 'UHD Graphics';
    }
    // AMD Radeon
    if (q.includes('radeon')) {
        result.gpu = 'Radeon Graphics';
    }

    // --- PHASE 2 EXPANSION PARSING ---

    // Phones (Apple)
    const iphoneMatch = q.match(/iphone\s*(\d{1,2})\s*(pro|max|plus|mini)?/i);
    if (iphoneMatch) {
        result.category = 'Phone';
        result.cpu = `iPhone ${iphoneMatch[1]}` + (iphoneMatch[2] ? ` ${iphoneMatch[2].charAt(0).toUpperCase() + iphoneMatch[2].slice(1)}` : '');
    }

    // Battery Health for Phones metadata
    const batteryMatch = q.match(/(bat|etat|health|batterie|battery)\s*:?\s*(\d{2,3})\s*%/i);
    if (batteryMatch && parseInt(batteryMatch[2]) <= 100) {
        result.metadata = result.metadata || {};
        result.metadata.batteryHealth = batteryMatch[2];
    }

    // Scooters
    if (q.includes('trottinette') || q.includes('scooter') || q.includes('xiaomi')) {
        result.category = 'Scooter';
        const xiaomiMatch = q.match(/xiaomi\s*(pro\s*2|pro\s*4|essential|1s|m365)/i);
        if (xiaomiMatch) {
            result.cpu = `Xiaomi ${xiaomiMatch[1].charAt(0).toUpperCase() + xiaomiMatch[1].slice(1)}`;
        }
    }

    // Mileage for Scooters metadata
    const mileageMatch = q.match(/(\d{1,5})\s*(km|kilometers|kilometrage)/i);
    if (mileageMatch && result.category === 'Scooter') {
        result.metadata = result.metadata || {};
        result.metadata.mileage = mileageMatch[1];
    }

    return result;
}

module.exports = { parseSpecs };
