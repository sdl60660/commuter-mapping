
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

// import Loader from './Loader'
import MapControls from './MapControls';
import MapLegend from './MapLegend';
import BackgroundMap from './BackgroundMap';
import TractMap from '../d3-components/TractMap';

import { MapContext } from '../MapContext';

import { filterGeoJSON } from '../utils.js';



let vis;

const MapWrapper = ({ tractGeo, MsaCityMappings, stateGeo, cityBoundaries, MCDBoundaries }) => {

    const [featuredCity, setFeaturedCity] = useState("35620")
    const [largestCityDisplay, setLargestCityDisplay] = useState("New York City")

    const refElement = useRef(null);

    const initialTracts = filterGeoJSON({ originalGeoJSON: tractGeo, MSA_ID: featuredCity });
    const initialBounds = d3.geoBounds(initialTracts);
    const initialCenter = d3.geoCentroid(initialTracts);

    useEffect(() => {
        // vis = new TractMap(refElement.current, { width: 1000, height: 800, tractGeo, stateGeo, cityBoundaries, MCDBoundaries, featuredCity, largestCityDisplay });
    }, [])

    useEffect(() => {
        // vis.renderCity({ MSA_ID: featuredCity })
        // vis.largestCityDisplay = largestCityDisplay;
    }, [featuredCity])

    return (
        <div className={"map-wrapper"}>
            <MapContext.Provider value={{ featuredCity, setFeaturedCity, largestCityDisplay, setLargestCityDisplay }}>
                <MapControls cityData={MsaCityMappings} />
                <BackgroundMap
                    className="map-wrapper__background-tile"
                    initialBounds={initialBounds}
                    initialCenter={initialCenter}
                    tractData={tractGeo}
                    mcdData={MCDBoundaries}
                    cityData={cityBoundaries}
                />
                <MapLegend cityName={largestCityDisplay} />
            </MapContext.Provider>
        </div>
    )
}

export default MapWrapper;

// <div ref={refElement} id={"viz-tile"} className={"map-wrapper__map"} />