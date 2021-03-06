import React, { useEffect, useRef, useState, useContext } from 'react';
import * as d3 from 'd3';

import { StackedBarContext } from '../StackedBarContext';

const formatData = (data, mode, year, centerCity, selectedSortVal, sortDirection) => {
    return data.map(d => ({
        ...d,
        "City": mode === "totals" ? +d[`main_city_commuters_${year}`] : +d[`city_commuter_rate_${year}`],
        "Suburbs/Exurbs": mode === "totals" ? +d[`suburban_commuters_${year}`] : +d[`suburban_commuter_rate_${year}`],
        "Outside of Metro Area": mode === "totals" ? +d[`outside_msa_commuters_${year}`] : +d[`outside_msa_commuter_rate_${year}`]
    }))
        .filter(d => d.in_center_city === centerCity)
        .sort((a, b) => {
            const sortKey = selectedSortVal === null ? `total_commuters_${year}` : selectedSortVal === "city" ? "City" : selectedSortVal === "suburban" ? "Suburbs/Exurbs" : "Outside of Metro Area";
            if (sortDirection === "up") {
                return a[sortKey] - b[sortKey];
            }
            else {
                return b[sortKey] - a[sortKey];
            }
            
        })

}


const StackedBar = ({ cityCommuterRates, tip, height=3000, width=900 }) => {
    const wrapper = useRef(null);
    const data = useRef(cityCommuterRates);
    const svg = useRef(null);

    const { year, mode, tractLocation, selectedSortVal, sortDirection } = useContext(StackedBarContext);

    data.current = formatData(cityCommuterRates, mode, year, tractLocation, selectedSortVal, sortDirection)

    const keys = ["City", "Suburbs/Exurbs", "Outside of Metro Area"];

    const series = d3.stack()
        .keys(keys)(data.current)
        .map(d => (d.forEach(v => v.key = d.key), d))

    const margin = { top: 20, bottom: 30, left: 140, right: 0 };

    const y = d3.scaleBand()
        .domain(data.current.map(d => d.MSA))
        .range([margin.top, height-margin.bottom])
        .paddingInner(0.3)

    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeCategory10);


    useEffect(() => {
        console.log(year, mode, tractLocation);
        // data.current = formatData(cityCommuterRates, mode, year, tractLocation);
        // console.log(data.current)

        if (svg.current === null) {
            d3.select(wrapper.current)
                .selectAll("svg").remove();

            svg.current = d3.select(wrapper.current)
                .append("svg")
                .attr("class", "stacked-bar__svg")
                .attr("height", height)
                .attr("width", width)
                // .attr("viewBox", `0 0 ${width} ${height}`)
                // .attr("preserveAspectRatio", "xMinYMin meet");
        }
        
        const xDomain = mode === "totals" ? [0, d3.max(data.current, d => +d[`total_commuters_${year}`])] : [0, 1];
        const x = d3.scaleLinear()
            .domain(xDomain)
            .range([margin.left, width - margin.right]);
        
        svg.current.call(tip);

        svg.current.selectAll("g")
            .data(series)
            .join("g")
            .attr("class", "rect-series");
        
        svg.current.selectAll(".rect-series")
            .selectAll("rect")
            .data(d => d, d => `${d.data.MSA}-${d.data.key}`)
            .join("rect")
                .transition()
                .attr("x", d => x(d[0]))
                .attr("y", d => y(d.data.MSA))
                .attr("width", d => x(d[1]) - x(d[0]))
                .attr("height", y.bandwidth())
                .attr("fill", d => color(d.key))
                            
        svg.current.append("g")
            .selectAll("text")
            .data(data.current, d => d.MSA)
            .join("text")
                .attr("class", "stacked-bar__label")
                .attr("x", d => margin.left - 5)
                .attr("y", d => y(d.MSA) + y.bandwidth())
                .style("text-anchor", "end")
                .text(d => d.largest_city);

    }, [year, mode, tractLocation, selectedSortVal, sortDirection])


    // useEffect(() => {
        
    // }, [year, mode]);

    return (
        <div className={"stacked-bar-chart"}>
            <div className={"stacked-bar-chart__label"}>{cityCommuterRates.MSA}</div>
            <div ref={wrapper} />
        </div>
    )
}

export { StackedBar as default }