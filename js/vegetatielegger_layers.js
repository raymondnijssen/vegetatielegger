/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var Pdok = Pdok || {};
window.Pdok = Pdok;
Pdok.Configuration = {
    tms: {
        tileOrigin: new OpenLayers.LonLat(-285401.920, 22598.080),
        matrixSet: 'EPSG:28992',
        tileFullExtent: new OpenLayers.Bounds(-285401.92, 22598.08, 595401.92, 903401.92),
        serverResolutions: [3440.640, 1720.320, 860.160, 430.080, 215.040, 107.520, 53.760, 26.880, 13.440, 6.720, 3.360, 1.680, 0.840, 0.420, 0.210, 0.105, 0.0525],
        matrixIds: new Array(15),
        zoomOffset: 2
    },
    resolutions: [3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88, 13.44, 6.72, 3.36, 1.68, 0.84, 0.42, 0.210, 0.105, 0.0525, 0.02625, 0.013125, 0.0065625]
};
Pdok.Api.prototype.defaultLayers = {
    OPENBASISKAART: {
        layertype: 'TMS',
        name: 'Openbasiskaart',
        url: 'http://openbasiskaart.nl/mapcache/tms/',
        layer: 'oms@rd',
        type: 'png',
        serviceVersion: '1.0.0',
        gutter: 0,
        buffer: 0,
        style: null,
        matrixSet: Pdok.Configuration.tms.matrixSet,
        visibility: true,
        isBaseLayer: true,
        transitionEffect: 'resize',
        tileOrigin: Pdok.Configuration.tms.tileOrigin,
        resolutions: Pdok.Configuration.resolutions,
        zoomOffset: 0,
        units: "m",
        maxExtent: Pdok.Configuration.tms.tileFullExtent,
        projection: new OpenLayers.Projection("EPSG:28992"),
        sphericalMercator: false,
        attribution: "OpenStreetMap"
    },
    BRTGRIJSTIJDELIJK: {
        layertype: 'WMTS',
        name: 'BRT Achtergrondkaart Grijs tijdelijk (WMTS)',
        url: 'http://geodata.nationaalgeoregister.nl/wmts/',
        layer: 'brtachtergrondkaartgrijstijdelijk',
        style: null,
        matrixSet: 'EPSG:28992',
        visibility: true,
        isBaseLayer: true,
        attribution: '&copy OSM & Kadaster'
    },
    rwsvl_basisgroep: {
        layertype: 'WMS',
        name: 'Basisgroep',
        url: 'http://intranet.rijkswaterstaat.nl/services/geoservices/rws_vegetatielegger?',
        layers: 'BG',
        transparent: 'true',
        format: 'image/png',
        visibility: true,
        isBaseLayer: false,
        attribution: '&copy Rijkswaterstaat',
        singleTile: true
    },
    rwsvl_boomheg: {
        layertype: 'WMS',
        name: 'rwsvl_boomheg',
        url: 'http://intranet.rijkswaterstaat.nl/services/geoservices/rws_vegetatielegger?',
        layers: 'rwsvl_bomen,rwsvl_heggen',
        transparent: 'true',
        format: 'image/png',
        visibility: true,
        isBaseLayer: false,
        attribution: '&copy Rijkswaterstaat',
        singleTile: true
    },
    rwsvl_boom: {
        layertype: 'WMS',
        name: 'Boom 6000',
        url: 'http://intranet.rijkswaterstaat.nl/services/geoservices/rws_vegetatielegger?',
        layers: 'rwsvl_bomen',
        transparent: 'true',
        format: 'image/png',
        visibility: true,
        isBaseLayer: false,
        singleTile: true
    },
    rwsvl_heg: {
        layertype: 'WMS',
        name: 'Heg 6000 - 12000',
        url: 'http://intranet.rijkswaterstaat.nl/services/geoservices/rws_vegetatielegger?',
        layers: 'rwsvl_heggen',
        transparent: 'true',
        format: 'image/png',
        visibility: true,
        isBaseLayer: false,
        singleTile: true
    },
    rwsvl_rivkm: {
        layertype: 'WMS',
        name: 'Rivierkilometer',
        url: 'http://intranet.rijkswaterstaat.nl/services/geoservices/rws_vegetatielegger?',
        layers: 'rwsvl_kmmarkeringen',
        transparent: 'true',
        format: 'image/png',
        visibility: true,
        isBaseLayer: false,
        singleTile: true
    },

    rwsvl_bhg: {
        layertype: 'WMS',
        name: 'Beheergrens 1500 - 12000',
        url: 'http://intranet.rijkswaterstaat.nl/services/geoservices/rws_vegetatielegger?',
        layers: 'rwsvl_begrenzing',
        transparent: 'true',
        format: 'image/png',
        visibility: true,
        isBaseLayer: false,
        singleTile: true
    },
    rwsvl_vvgw: {
        layertype: 'WMS',
        name: 'Vrijstelling vergunningplicht gebruik waterstaatswerken',
        url: 'http://intranet.rijkswaterstaat.nl/services/geoservices/rws_vegetatielegger?',
        layers: 'rwsvl_vrijstelgeb',
        transparent: 'true',
        format: 'image/png',
        visibility: true,
        isBaseLayer: false,
        singleTile: true
    },
    rwsvl_vegvlak: {
        layertype: 'WMS',
        name: 'Vegetatie-vlakken',
        url: 'http://intranet.rijkswaterstaat.nl/services/geoservices/rws_vegetatielegger?',
        layers: 'rwsvl_vegvlak',
        transparent: 'true',
        format: 'image/png',
        visibility: true,
        isBaseLayer: false,
        singleTile: true
    },
    rwsvl_perc: {
        layertype: 'WMS',
        name: 'Kadastrale percelen',
        url: 'http://intranet.rijkswaterstaat.nl/services/geoservices/rws_vegetatielegger?',
        layers: 'rwsvl_kadaster',
        transparent: 'true',
        format: 'image/png',
        visibility: true,
        isBaseLayer: false,
        attribution: '&copy Rijkswaterstaat',
        singleTile: true
    }
};

