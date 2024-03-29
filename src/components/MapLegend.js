import React, { useEffect, useContext, useRef } from 'react';
import * as d3 from 'd3';
import * as chromatic from "d3-scale-chromatic";
import { MapContext } from '../MapContext';

const MapLegend = () => {
    const { featuredCity, largestCityDisplay, displayField } = useContext(MapContext);
    const legendMessage = useRef(`Job location in ${largestCityDisplay} (%)`)

    const gradientColor = chromatic.schemeCategory10[Math.round(parseInt(featuredCity) / 72) % 10]
    

    const rectHeight = 20;
    const rectWidth = 300;
    const xMargin = 15;
    const yMargin = 15;

    const xScale = d3.scaleLinear()
        .range([0, rectWidth])
        .domain([0, 1]);
    
    const xAxis = d3.axisBottom(xScale)
        .tickSize(rectHeight * 1.1)
        // .ticks(4)
        .tickFormat(x => d3.format(".0%")(x))
        .tickValues([0, 0.25, 0.5, 0.75, 1.0]);

    useEffect(() => {
        d3.select(".legend__axis")
            .call(xAxis)
            .select(".domain").remove();
    }, [])

    return (
        <div className="legend">
            <svg className="legend__svg" height={rectHeight + yMargin} width={rectWidth + 2*xMargin}>
                <rect className="legend__rect" height={rectHeight} width={rectWidth} style={{fill: "url(#gradient)", transform: `translate(${xMargin}px, 0)`}}></rect>
                <g className="legend__axis" style={{ transform: `translate(${xMargin}px, 0)` }}/>
                <defs>
                    <linearGradient className="legend__gradient" id={"gradient"}>
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor={gradientColor} />
                    </linearGradient>
                </defs>
            </svg>
            <div className={"legend__message"}>{
                displayField.startsWith('city') ? `Job location in ${largestCityDisplay} (%)` :
                displayField.startsWith('suburban') ? `Job location in metro, outside ${largestCityDisplay} (%)` :
                `Job location outside of metro area (%)`
            }</div>
        </div>
    )
}

export default MapLegend;