require([
    'esri/Map',
    // 'esri/views/MapView',
    'esri/views/SceneView',
    'dijit/form/Button',
    'esri/layers/FeatureLayer',
    //'esri/layers/Graphicslayer',
    'esri/Graphic',
    'esri/widgets/BasemapGallery',
    'esri/widgets/Expand',
    'esri/widgets/Legend'
    ], (Map, SceneView, Button, FeatureLayer, Graphic, GraphicsLayer, BasemapGallery, Expand, Legend) =>{
    
    const map1 = new Map({
        basemap: "topo-vector"
    });
    
    const view = new SceneView({
        map: map1,
        container: 'mapDiv',
        zoom: 10,
        center: [25,52]
    });
    
    const zoomIn = new Button({
        onClick: () => {
            view.zoom = view.zoom +1;
        }
    }, "ZoomIn");
    
    const zoomOut = new Button({
        onClick: () => {
            view.zoom = view.zoom - 1;
        }
    }, "zoomOut");
    
    //Warstwy
    const gl = new GraphicsLayer();
    
    const fl = new FeatureLayer({
        url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Hurricanes/MapServer/0"
    });

    const trzesienia = new FeatureLayer({
        url: "https://services.arcgis.com/ue9rwulIoeLEI9bj/ArcGIS/rest/services/Earthquakes/FeatureServer/0"
    });

    const states = new FeatureLayer({
         url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MApServer/1"
     })
    
    map1.add(fl);
    map1.add(gl);
    map1.add(trzesienia);
    // map1.add(states);
    

    const geom = {
        type: "polyline", //zamiast tworzenia klasy
        paths: [[-96.06326,33.759],[-97.06298,32.755]] //tablica wspolrzednych
    };
        // const geom = {
        //     type: "polyline",
        //     color: "blue",
        //     width: 2,
        //     style: "dash"
        // };
    
        // symbolizacja
    const sym = {
        type: "simple-line",
        color: "blue",
        width: 2,
        style: "dash"
    };
    
    //atrybuty, tworzenie atrybutu
    const attr = {
        country: "Polska",
        code: "POL"
    };
    
    const popTmpl = {
        title: "Obiekt Web_GIS",
        content: "Zaznaczony obiekt pochodzi z kraju {country}"
    }
    
    const graph = new Graphic({
        geometry: geom,
        symbol: sym,
        attributes: attr,
        popupTemplate: popTmpl
    });
    
    gl.add(graph);

     
    const bmWg = new BasemapGallery({
        view: view
     });

    
    const expandWg = new Expand({ 
        view: view,
        content: bmWg
    });
    
    view.ui.add(expandWg,{
        position: "top-right"
    });
    
    const legend = new Legend({
        view: view
    });
    
    view.ui.add(legend, {position: "bottom-right"});
    
    
    let query = fl.createQuery();
    query.where = "EVENTID = 'Alberto'";
    query.outFields =  ['*'];
    query.returnGeometry = true;
    
    fl.queryFeatures(query)
        .then(response => {
        console.log(response);
        getResult(response.features);
    })
    .catch(err => {
       console.log(err);
    })
    
    const getResults = (features) => {
        const symbol = {
            type: "simple-marker",
            size: 6,
            color: "red",
            style: "square"
       };
    
         features.map(elem => {
            elem.symbol = symbol
        });
    
        gl.addMany(features); //przyjmuje tablicę z grafikami czyli features
    };
        //rendering
    const simple = {
        type: "simple",
        symbol: {
            type: "point-3d",
            symbolLayers:[
        {
        type: "object",
            resource: {
                primitive: "cylinder"
            },
            width: 5000
        }
        ]
        },
        label: "Hurricane",
        visualVariables: [
        {
            type: "color",
            field: "PRESSURE",
            stops: [
            {
                value: 940,
                color: "blue"
            },
            {
            value: 990,
            color: "green"
            },
            {
                value: 1020,
                color: "red"
            }
            ]
            },
            {
            type: "size",
            field: "WINDSPEED",
            stops: [
            {
                value: 20,
                size: 5000
            },
            {
                value: 120,
                size: 150000
            }
            ]
            }
        ]
    };
    
    fl.renderer = simple;
});