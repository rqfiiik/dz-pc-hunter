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
    const ramMatch = q.match(/(\d+)\s*(gb|g)\s*(ram|memory)?/i);
    // Be careful to distinguish between RAM and Storage (Storage is usually 128, 256, 512, 1000, or TB)
    if (ramMatch) {
        const val = parseInt(ramMatch[1]);
        if (val <= 64 && val >= 4) { // reasonable RAM sizes
            result.ram = `${val}GB`;
        }
    }

    // 2. Extract Storage
    const storageGbMatch = q.match(/(128|256|512)\s*(gb|g)\s*(ssd|hdd|nvme)?/i);
    const storageTbMatch = q.match(/([12])\s*(tb|t)\s*(ssd|hdd|nvme)?/i);

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

    // 4. Extract CPU
    // Intel
    const intelMatch = q.match(/(i[3579])(-?\s*[0-9]{4,5}[a-z]{0,2})?/i);
    if (intelMatch) {
        result.cpu = intelMatch[1].toUpperCase() + (intelMatch[2] ? intelMatch[2].replace(/\s+/g, '') : '');
    }
    // AMD Ryzen
    const ryzenMatch = q.match(/ryzen\s*([3579])(-?\s*[0-9]{4}[a-z]{0,2})?/i);
    if (ryzenMatch) {
        result.cpu = `Ryzen ${ryzenMatch[1]}` + (ryzenMatch[2] ? ryzenMatch[2].replace(/\s+/g, '') : '');
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

    return result;
}

module.exports = { parseSpecs };
