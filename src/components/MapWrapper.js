
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as chromatic from "d3-scale-chromatic";

// import Loader from './Loader'
import MapControls from './MapControls';
import MapLegend from './MapLegend';
import TractMap from '../d3-components/TractMap';


let vis;

const MapWrapper = ({ tractGeo, MsaCityMappings, stateGeo, cityBoundaries }) => {

    const [featuredCity, setFeaturedCity] = useState("35620")
    const [largestCityDisplay, setLargestCityDisplay] = useState("New York City")

    const refElement = useRef(null);

    useEffect(() => {
        vis = new TractMap(refElement.current, { width: 1000, height: 800, tractGeo, stateGeo, cityBoundaries });
    }, [])

    useEffect(() => {
        vis.renderCity({ MSA_ID: featuredCity })
    }, [featuredCity])

    return (
        <div className={"map-wrapper"}>
            <MapControls
                cityData={MsaCityMappings}
                setCity={setFeaturedCity}
                setCityDisplay={setLargestCityDisplay}
            />
            <div ref={refElement} id={"viz-tile"} className={"map-wrapper__map"} />
            <MapLegend cityName={largestCityDisplay} gradientcolor={chromatic.schemeCategory10[Math.round(parseInt(featuredCity) / 72) % 10]}/>
        </div>
    )
}

export default MapWrapper;
