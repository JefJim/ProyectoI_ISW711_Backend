// YouTube URL and Video ID Extraction Utility Functions
/**
 * extract id from a YouTube URL
 * @param {string} url - url from which to extract the video id
 * @returns {string|null} - id of the video or null if not found 
 */
const extractVideoId = (url) => {
    if (!url) return null;
    
    // patrons of YouTube URLs to match
    const patterns = [
        // standar format: https://www.youtube.com/watch?v=ID
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
        // short format: https://youtu.be/ID
        /youtu\.be\/([^"&?\/\s]{11})/i,
        // format embed: https://www.youtube.com/embed/ID
        /youtube\.com\/embed\/([^"&?\/\s]{11})/i,
        // format with aditional parameters: 
        /youtube\.com\/watch\?.*v=([^"&?\/\s]{11})/i
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
};

/**
 * validate if a URL is a valid YouTube URL
 * @param {string} url - URL a validar
 * @returns {boolean} - true if valid, false otherwise
 */
const isValidYouTubeUrl = (url) => {
    if (!url) return false;
    
    const youtubeDomains = [
        'youtube.com',
        'www.youtube.com',
        'm.youtube.com',
        'youtu.be',
        'www.youtu.be'
    ];

    try {
        const parsedUrl = new URL(url);
        const domain = parsedUrl.hostname.replace('www.', '');
        
        // verify if the domain is a YouTube domain
        if (!youtubeDomains.includes(domain)) {
            return false;
        }

        // extract the video ID from the URL to verify its existence
        const videoId = extractVideoId(url);
        return videoId !== null && videoId.length === 11;

    } catch (e) {
        return false;
    }
};

/**
 * get the thumbnail URL of a YouTube video
 * @param {string} videoId - ID from video
 * @param {string} [quality='default'] - quality of the thumbnail (default, medium, high, standard, maxres)
 * @returns {string|null} - URL of tghe thumbnail or null if invalid videoId
 */
const getYouTubeThumbnail = (videoId, quality = 'default') => {
    if (!videoId || videoId.length !== 11) return null;

    const qualities = {
        'default': 'default.jpg',
        'medium': 'mqdefault.jpg',
        'high': 'hqdefault.jpg',
        'standard': 'sddefault.jpg',
        'maxres': 'maxresdefault.jpg'
    };

    const selectedQuality = qualities[quality] || qualities.default;
    return `https://img.youtube.com/vi/${videoId}/${selectedQuality}`;
};

module.exports = {
    extractVideoId,
    isValidYouTubeUrl,
    getYouTubeThumbnail
};