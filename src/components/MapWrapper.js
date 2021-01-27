
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as chromatic from "d3-scale-chromatic";
// import Loader from './Loader'

import TractMap from '../d3-components/TractMap';


let vis;

const MapWrapper = ({ geoData }) => {

    const refElement = useRef(null);

    useEffect(() => {
        vis = new TractMap(refElement.current, { width: 1400, height: 800, geoData });
    }, [])

    return (
        <div ref={refElement} id={"viz-tile"} />
    )
}

export default MapWrapper;
