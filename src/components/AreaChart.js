import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';


const AreaChart = ({ cityCommuterRates, tip, height=300, width=300 }) => {
    const wrapper = useRef(null);

    const data = [
        { year: 2011, key: "City", value: cityCommuterRates.city_commuter_rate_2011 },
        { year: 2011, key: "Suburbs/Exurbs", value: cityCommuterRates.suburban_commuter_rate_2011 },
        { year: 2011, key: "Outside of Metro Area", value: cityCommuterRates.outside_msa_commuter_rate_2011 },
        { year: 2018, key: "City", value: cityCommuterRates.city_commuter_rate_2018 },
        { year: 2018, key: "Suburbs/Exurbs", value: cityCommuterRates.suburban_commuter_rate_2018 },
        { year: 2018, key: "Outside of Metro Area", value: cityCommuterRates.outside_msa_commuter_rate_2018 }
    ]

    const keys = Array.from(d3.group(data, d => d.key).keys());
    
    const values = Array.from(d3.rollup(data, ([d]) => d.value, d => d.year, d => d.key))
    
    const series = d3.stack()
        .keys(keys)
        .value(([, values], key) => values.get(key))(values)

    const margin = { top: 10, bottom: 30, left: 10, right: 10 };

    const x = d3.scaleLinear()
        .domain([2011, 2018])
        .range([margin.left, width - margin.right])
    
    const y = d3.scaleLinear()
        .domain([0.0, 1.0])
        .range([height - margin.bottom, margin.top])

    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeCategory10)

    const area = d3.area()
        .x(d => x(d.data[0]))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));

    useEffect(() => {
        d3.select(wrapper.current)
            .selectAll("svg").remove()

        const svg = d3.select(wrapper.current)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            // .attr("viewbox", [0, 0, width, height]);
        
        svg.call(tip);
        
        svg.append("g")
            .on("mouseover", function(e) {
                tip.html(
                    `<div class="tip-grid">
                        <div></div><div class="year-header">2011</div><div class="year-header">2018</div>
                        <div id="outside-metro-header">Outside Metro Area</div><div>${d3.format(".1%")(cityCommuterRates.outside_msa_commuter_rate_2011)}</div><div>${d3.format(".1%")(cityCommuterRates.outside_msa_commuter_rate_2018)}</div>
                        <div id="suburban-header">Suburbs/Exurbs</div><div>${d3.format(".1%")(cityCommuterRates.suburban_commuter_rate_2011)}</div><div>${d3.format(".1%")(cityCommuterRates.suburban_commuter_rate_2018)}</div>
                        <div id="urban-header">In City Limits</div><div>${d3.format(".1%")(cityCommuterRates.city_commuter_rate_2011)}</div><div>${d3.format(".1%")(cityCommuterRates.city_commuter_rate_2018)}</div>
                    </div>`
                )
                tip.show(this);
            })
            .on("mousemove", function(e) {
                const tipDimensions = d3.select(".d3-tip").node().getBoundingClientRect();

                tip.style("position", "fixed")
                    .style("top", `${e.clientY - tipDimensions.height - 8}px`)
                    .style("left", `${e.clientX - (tipDimensions.width / 2)}px`)
            })
            .on("mouseout", (e, d) => tip.hide())
            .selectAll("path")
            .data(series)
            .join("path")
                .attr("fill", ({key}) => color(key))
                .attr("d", area)
            .append("title")
                .text(({key}) => key);
        
        svg.append("text")
            .attr("y", height - (margin.bottom / 2))
            .attr("x", width / 2)
            .style("text-anchor", "middle")
            .style("font-size", 14)
            .style("max-width", width)
            .style("word-wrap", "normal")
            .text(cityCommuterRates.MSA)
        
        // svg.append("g")
        //     .call(xAxis);
        
        // svg.append("g")
        //     .call(yAxis);
        
        
    }, [])

    return (
        <div className={"area-chart"} ref={wrapper}>
        </div>
    )
}

export { AreaChart as default }