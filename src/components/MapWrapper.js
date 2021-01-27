
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as chromatic from "d3-scale-chromatic";

// import Loader from './Loader'
import MapControls from './MapControls';
import TractMap from '../d3-components/TractMap';


let vis;

const MapWrapper = ({ tractGeo, MsaCityMappings, stateGeo }) => {

    const [featuredCity, setFeaturedCity] = useState("35620")

    const refElement = useRef(null);

    useEffect(() => {
        vis = new TractMap(refElement.current, { width: 1400, height: 800, tractGeo, stateGeo });
    }, [])

    useEffect(() => {
        vis.renderCity({ MSA_ID: featuredCity })
    }, [featuredCity])

    return (
        <div>
            <MapControls cityData={MsaCityMappings} setCity={setFeaturedCity}/>
            <div ref={refElement} id={"viz-tile"} />
        </div>
    )
}

export default MapWrapper;
