import { fetchOverpassData } from "../api";
import { createGeoJSONCircle } from "../helpers";
import Graph from "../models/Graph";

/**
 * @typedef {Object} OSMNode
 * @property {String} type
 * @property {Number} id
 * @property {Number} lat
 * @property {Number} lon
 */

/**
 * Fetches map data and converts them to graph structure
 * @param {Array} boundingBox array with 2 objects that have a latitude and longitude property 
 * @param {Number} startNodeId 
 * @returns 
 */
export async function getMapGraph(boundingBox) {
    const response = await fetchOverpassData(boundingBox, false);
    const data = await response.json();
    const elements = data.elements;
    
    const graph = new Graph();
    for(const element of elements) {
        if(element.type === "node") {
            graph.addNode(element.id, element.lat, element.lon);
        }
        else if(element.type === "way") {
            if(!element.nodes || element.nodes.length < 2) continue;

            for(let i = 0; i < element.nodes.length - 1; i++) {
                const node1 = graph.getNode(element.nodes[i]);
                const node2 = graph.getNode(element.nodes[i + 1]);

                if(!node1 || !node2) {
                    continue;
                }

                node1.connectTo(node2);
            }
        }
    }

    return graph;
}

/**
 * 
 * @param {Number[][]} polygon 
 * @returns {Array} array with 2 objects both containing latitude and longitude properties
 */
export function getBoundingBoxFromPolygon(polygon) {
    const boundingBox = { minLat: Number.MAX_VALUE, maxLat: -Number.MAX_VALUE, minLon: Number.MAX_VALUE, maxLon: -Number.MAX_VALUE };
    for(const coordinate of polygon) {
        if(coordinate[0] < boundingBox.minLon) boundingBox.minLon = coordinate[0];
        if(coordinate[0] > boundingBox.maxLon) boundingBox.maxLon = coordinate[0];
        if(coordinate[1] < boundingBox.minLat) boundingBox.minLat = coordinate[1];
        if(coordinate[1] > boundingBox.maxLat) boundingBox.maxLat = coordinate[1];
    }

    const formatted = [{ latitude: boundingBox.minLat, longitude: boundingBox.minLon }, { latitude: boundingBox.maxLat, longitude: boundingBox.maxLon }];
    return formatted;
}