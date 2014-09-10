Proj4js.defs['EPSG:28992']='+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs';
OpenLayers.ImgPath='images/openlayers_api_img/';
var map = null;
var startPosition = {x: 170000, y: 470000, z: 2};
var state = 'loading';
var loadErrorShown = false;

if(typeof console === 'undefined') {
    console = {
        log: function(e) { },
        debug: function(e) { },
        warn: function(e) { },
        error: function(e) { }
    };
}

var layers = {
//    Topografie: {
//        layertype: 'WMTS',
//        name: 'BRT Achtergrondkaart Grijs tijdelijk (WMTS)',
//        url: 'http://geodata.nationaalgeoregister.nl/wmts/',
//        layer: 'brtachtergrondkaartgrijstijdelijk',
//        style: null,
//        matrixSet: 'EPSG:28992',
//        visibility: true,
//        isBaseLayer: true,
//        attribution: '(c) OSM & Kadaster'
//    },
    Topografie:	{
        name: 'Topografie',
        url: 'http://168.63.99.2/arcgis/rest/services/Topografie/MapServer',
        config: null,
        layer: null
    },
    Vegetatievlakken_Vrijstelling_DTB: {
        layertype: 'arcgis',
        name: 'Vegetatievlakken_Vrijstelling_DTB',
        url: 'http://168.63.99.2/arcgis/rest/services/Vegetatievlakken_plus/MapServer',
        config: null,
        layer: null
    },
    Percelen: {
        layertype: 'arcgis',
        name: 'Percelen',
        url: 'http://168.63.99.2/arcgis/rest/services/Percelen/MapServer',
        config: null,
        layer: null
    },
    Boom_Heg: {
        layertype: 'arcgis',
        name: 'Boom_Heg',
        url: 'http://168.63.99.2/arcgis/rest/services/Boom_Heg/MapServer',
        config: null,
        layer: null
    }
};


function loadAllLayers(layersToLoad) {
    for(var i in layersToLoad) {
        loadLayerConfig(layers[i], function(layerInfo) {
            loadAllLayers(layersToLoad);
        });
        delete layersToLoad[i];
        return;
    }
    layers.Topografie.layer.isBaseLayer = true;
    initMap();
}

function loadLayerConfig(layer, callback) {
    var jsonp = new OpenLayers.Protocol.Script();
    var loaded = false;
    var errorTimeout = setTimeout((function() {
        if(loaded || loadErrorShown) return;
        loadErrorShown = true;
        var modal = $('<div />').addClass('popup-modal').appendTo('body');
        var popup = $('<div />').addClass('popup').appendTo('body');
        var popupContent = $('<div />').appendTo(popup);
        var closeButton = $('<a />').attr('href', '#').attr('title', 'Verberg deze popup').text('[X]').addClass('closeButton').appendTo(popup);
        function closePopup() {
            $(popup).fadeOut('normal', function() { $(popup).remove(); $(closeButton).remove(); });
            $(modal).fadeOut('normal', function() { $(modal).remove(); });
        }

        $(closeButton).click(function(e){ e.preventDefault(); closePopup(); });

        $('<h3 />').text('Er is iets mis gegaan').appendTo(popupContent);
        $('<p />').text('Een of meerdere kaartlagen konden niet worden geladen. Hierdoor is de kaart niet volledig en missen er onderdelen.').appendTo(popupContent);
        $('<p />').text('Wij zullen er alles aan doen om dit probleem op te lossen. Probeer het later nog eens. Sorry voor het ongemak.').appendTo(popupContent);

        if(typeof callback === 'function')
            callback({});
    }), 20000);
    jsonp.createRequest(layer.url, 
        {
            f: 'pjson'
	}, 
        function(layerInfo) {
            loaded = true;
            clearTimeout(errorTimeout);
            layer.config = layerInfo;
            layer.layer = new OpenLayers.Layer.ArcGISCache("AGSCache", layer.url, { layerInfo: layer.config, isBaseLayer:false });
            if(typeof callback === 'function')
                callback(layerInfo);
        }
    );
}

$( document ).ready(function() {
    loadAllLayers($.extend({}, layers));
});

function initMap() {
    $('div#map').css('background', 'transparent');

    /*
    * Make sure our baselayer and our map are synced up
    */
    var controls = [
        new OpenLayers.Control.PanZoom(),
        new OpenLayers.Control.PinchZoom(),
        new OpenLayers.Control.Navigation(),
        new OpenLayers.Control.Attribution(),
        new OpenLayers.Control.MousePosition({numDigits: 0})
    ];

    map = new OpenLayers.Map({
        restrictedExtent: layers.Topografie.layer.maxExtent,
        maxExtent: layers.Topografie.layer.maxExtent,
        units: layers.Topografie.layer.units,
        resolutions: layers.Topografie.layer.resolutions,
        numZoomLevels: layers.Topografie.layer.numZoomLevels,
        tileSize: layers.Topografie.layer.tileSize,
        displayProjection: layers.Topografie.layer.displayProjection,
        div: 'map',
        controls: controls,
        zoomMethod: null,
        theme: null
    });
    if(layers.Topografie.layer !== null) map.addLayer(layers.Topografie.layer);
    if(layers.Vegetatievlakken_Vrijstelling_DTB.layer !== null) map.addLayer(layers.Vegetatievlakken_Vrijstelling_DTB.layer);
    if(layers.Boom_Heg && layers.Boom_Heg.layer !== null) map.addLayer(layers.Boom_Heg.layer);
    if(layers.Percelen && layers.Percelen.layer !== null) map.addLayer(layers.Percelen.layer);

    map.setCenter(new OpenLayers.LonLat(startPosition.x,startPosition.y), startPosition.z);

    initFeatures();
    state = 'viewing';
};


function goToLocation(coordinates) {
    if(map !== null) {
        map.setCenter(new OpenLayers.LonLat(coordinates.x, coordinates.y), coordinates.z);
    } else {
        startPosition = coordinates;
    }
}
