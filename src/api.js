const highWayExclude = ["footway", "street_lamp", "steps", "pedestrian", "track", "path"];

const ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://z.overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
];

let currentEndpointIndex = 0;

/**
 * 
 * @param {Array} boundingBox array with 2 objects that have a latitude and longitude property 
 * @returns {Promise<Response>}
 */
export async function fetchOverpassData(boundingBox) {
    const exclusion = highWayExclude.map(e => `[highway!="${e}"]`).join("");
    const query = `
    [out:json][timeout:25];(
        way[highway]${exclusion}[footway!="*"]
        (${boundingBox[0].latitude},${boundingBox[0].longitude},${boundingBox[1].latitude},${boundingBox[1].longitude});
        node(w);
    );
    out skel qt;`;

    for (let attempts = 0; attempts < ENDPOINTS.length; attempts++) {
        const endpoint = ENDPOINTS[currentEndpointIndex];
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                body: query
            });

            if (response.ok) {
                return response;
            } else if (response.status === 429 || response.status >= 500) {
                // If rate limited or server error, switch to the next endpoint
                currentEndpointIndex = (currentEndpointIndex + 1) % ENDPOINTS.length;
                // Wait a moment so we don't spam too fast
                await new Promise(r => setTimeout(r, 1000));
            } else {
                return response; // Return other HTTP errors directly
            }
        } catch (error) {
            // In case of a network error, try the next endpoint
            currentEndpointIndex = (currentEndpointIndex + 1) % ENDPOINTS.length;
            if (attempts === ENDPOINTS.length - 1) throw error;
        }
    }
    
    throw new Error("All Overpass API endpoints are failing or rate-limiting requests.");
}