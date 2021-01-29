import React, { useEffect } from 'react';
import * as d3 from 'd3';


const MapLegend = ({ cityName, gradientcolor }) => {
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
                        <stop offset="100%" stopColor={gradientcolor} />
                    </linearGradient>
                </defs>
            </svg>
            <div className={"legend__message"}>Tract residents working in {cityName} (%)</div>
        </div>
    )
}

export default MapLegend;