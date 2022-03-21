import React, { useRef, useEffect, useState, useContext } from "react";
import mapboxgl from "mapbox-gl/dist/mapbox-gl-csp";
// eslint-disable-next-line
import MapboxWorker from "worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker";
import * as chromatic from "d3-scale-chromatic";
import * as d3 from "d3";

import { filterGeoJSON } from "../utils.js";
import { MapContext } from "../MapContext";

mapboxgl.workerClass = MapboxWorker;
mapboxgl.accessToken =
  "pk.eyJ1Ijoic2FtbGVhcm5lciIsImEiOiJja2IzNTFsZXMwaG44MzRsbWplbGNtNHo0In0.BmjC6OX6egwKdm0fAmN_Nw";
let hoverIds = {
  cities: [],
  MCDs: [],
};
let cityHoverActive = false;
const popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false,
});

const addTractLayer = ({ map, featuredTracts, featuredCity, displayField }) => {
  const scaleIndex = Math.round(parseInt(featuredCity) / 72) % 10;
  const stopColor = chromatic.schemeCategory10[scaleIndex];

  map.addSource("tracts", {
    type: "geojson",
    data: featuredTracts,
  });

  map.addLayer({
    id: "tracts",
    type: "fill",
    source: "tracts",
    layout: {},
    paint: {
      "fill-color": {
        property: displayField,
        stops: [
          [0, "#fff"],
          [1, stopColor],
        ],
      },
      "fill-opacity": 0.7,
    },
  });
};

const addHoverLayer = ({
  map,
  geoData,
  largestCityDisplay,
  displayField,
  layerId,
  nameAccessor,
}) => {
  map.addSource(layerId, {
    type: "geojson",
    data: geoData,
    generateId: true,
  });

  map.addLayer({
    id: layerId,
    type: "fill",
    source: layerId,
    layout: {},
    paint: {
      // 'line-width': 1,
      "fill-color": "rgba(0,0,0,0)",
      // 'fill-outline-color': 'rgba(0,0,0,1)'
      "fill-outline-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        "rgba(0,0,0,1)",
        "rgba(0,0,0,0)",
      ],
    },
  });

  map.on("mousemove", layerId, (e) => {
    if (hoverIds[layerId].length > 0) {
      hoverIds[layerId].forEach((id) => {
        map.setFeatureState({ source: layerId, id }, { hover: false });
      });
      hoverIds[layerId] = [];
    }

    if (e.features.length > 0) {
      if (layerId === "cities") {
        cityHoverActive = true;
      }
      e.features.forEach(({ id }) => {
        map.setFeatureState(
          { source: layerId, id },
          { hover: layerId === "MCDs" && cityHoverActive ? false : true }
        );
        hoverIds[layerId].push(id);
      });

      const featureProps = e.features[0].properties;
      const displayVal =
        featureProps[displayField] === "null"
          ? "N/A"
          : d3.format(".1%")(featureProps[displayField]);
      const displayText = displayField.startsWith("city")
        ? `Job Location in ${largestCityDisplay}: ${displayVal}`
        : displayField.startsWith("suburban")
        ? `Job Location Outside of ${largestCityDisplay}: ${displayVal}`
        : `Job Location Outside of Metro Area: ${displayVal}`;

      map.getCanvas().style.cursor = "pointer";
      popup
        .setLngLat(e.lngLat)
        .setHTML(
          `  <strong>${featureProps[nameAccessor]}, ${featureProps.STATE_ABBREVIATION}${
            layerId === "MCDs" ? " (MCD)" : ""
          }</strong>
                            <br>
                            <div>${displayText}</div>`
        )
        .addTo(map);

      const element = popup.getElement();
      element.style.position = "fixed";
      element.style.transform = "translate(-50%, -100%)";
      element.style.top = `${e.originalEvent.clientY - 30}px`;
      element.style.left = `${e.originalEvent.clientX}px`;
    }
  });

  map.on("mouseleave", layerId, function () {
    if (hoverIds[layerId].length > 0) {
      hoverIds[layerId].forEach((id) => {
        map.setFeatureState({ source: layerId, id }, { hover: false });
      });
    }
    hoverIds[layerId] = [];
    if (layerId === "cities") {
      cityHoverActive = false;
    }

    map.getCanvas().style.cursor = "";

    popup.remove();
  });
};

const clearMap = ({ map }) => {
  ["tracts", "cities", "MCDs"].forEach((layerId) => {
    map.removeLayer(layerId);
    map.removeSource(layerId);
  });
};

const BackgroundMap = ({ initialBounds, initialCenter, tractData, mcdData, cityData }) => {
  const mapContainer = useRef();
  const firstRender = useRef(true);
  const displayMap = useRef(null);

  const [lng, setLng] = useState(initialCenter[1]);
  const [lat, setLat] = useState(initialCenter[0]);
  const [zoom, setZoom] = useState(9);

  const { featuredCity, largestCityDisplay, displayField } = useContext(MapContext);

  const featuredTracts = filterGeoJSON({ originalGeoJSON: tractData, MSA_ID: featuredCity });
  const featuredMCDs = filterGeoJSON({ originalGeoJSON: mcdData, MSA_ID: featuredCity });
  const featuredCities = filterGeoJSON({ originalGeoJSON: cityData, MSA_ID: featuredCity });

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v10",
      center: [lng, lat],
      zoom: zoom,
      // renderWorldCopies: false
    });

    // disable map rotation using right click + drag
    map.dragRotate.disable();

    // disable map rotation using touch rotation gesture
    map.touchZoomRotate.disableRotation();

    map.fitBounds(initialBounds, { animate: false, padding: 20 });
    map.setMaxBounds(map.getBounds());

    map.on("load", () => {
      addTractLayer({ map, featuredTracts, featuredCity, displayField });
      addHoverLayer({
        map,
        geoData: featuredMCDs,
        largestCityDisplay,
        displayField,
        layerId: "MCDs",
        nameAccessor: "MCD_NAME",
      });
      addHoverLayer({
        map,
        geoData: featuredCities,
        largestCityDisplay,
        displayField,
        layerId: "cities",
        nameAccessor: "PLACE_NAME",
      });
    });

    map.on("zoom", () => {
      popup.remove();
    });

    displayMap.current = map;

    return () => map.remove();
  }, []);

  useEffect(() => {
    if (!firstRender.current) {
      clearMap({ map: displayMap.current });

      addTractLayer({ map: displayMap.current, featuredTracts, featuredCity, displayField });
      addHoverLayer({
        map: displayMap.current,
        geoData: featuredMCDs,
        largestCityDisplay,
        displayField,
        layerId: "MCDs",
        nameAccessor: "MCD_NAME",
      });
      addHoverLayer({
        map: displayMap.current,
        geoData: featuredCities,
        largestCityDisplay,
        displayField,
        layerId: "cities",
        nameAccessor: "PLACE_NAME",
      });

      displayMap.current.setMaxBounds(null);
      displayMap.current.fitBounds(d3.geoBounds(featuredTracts), { animate: false, padding: 40 });
      displayMap.current.setMaxBounds(displayMap.current.getBounds());
    } else {
      firstRender.current = false;
    }
  }, [featuredCity, displayField]);

  return (
    <div>
      <div className={"map-container"} ref={mapContainer} />
    </div>
  );
};

export { BackgroundMap as default };
