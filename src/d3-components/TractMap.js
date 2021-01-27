import * as d3 from 'd3';
import d3Tip from "d3-tip"
import * as topojson from "topojson-client";


class TractMap {

    containerEl;
    props;

    constructor(containerEl, props) {
        this.containerEl = containerEl;
        const mapColor = "blue";
        const { width, height, geoData } = props;

        this.svg = d3.select(containerEl)
            .append("svg")
            .attr("viewBox", [0, 0, width, height]);

        this.setScales();
        
        // Generate background map and projection
        const geoJSON = topojson.feature(geoData, geoData.objects["tracts_with_commuter_data"]);
        const projection = d3.geoAlbersUsa()
            .fitExtent([[0, 15], [width-60, height-60]], geoJSON);
        this.generateMap({ geoJSON, projection, mapColor });

    }

    setScales = () => {
        this.colorScale =
            d3.scaleLinear()
                .domain([0, 1])
                .range(["white", "purple"])
    }

    generateMap = ({ geoJSON, projection, mapColor }) => {
        // "properties": {
        //     "GEOID": "01001020100",
        //     "MSA": "Montgomery, AL",
        //     "MSA_ID": "33860",
        //     "CITY": "Prattville",
        //     "CITY_ID": "0162328",
        //     "STATE_ID": "01",
        //     "COUNTY_ID": "001",
        //     "total_commuters": 689,
        //     "main_city_commuters": 283
        //   }

        let path = d3.geoPath()
            .projection(projection);
                
        this.mapPath = this.svg.append("g")
            .attr("class", "background-map")
            .selectAll("path");
        
        this.mapPath = this.mapPath.data( geoJSON.features.slice(1000), d => d)
            .join(
                enter => enter.append("path")
                    .attr("d", path)
                    .attr("class", "tract-path")
                    .style("opacity", 0.8)
                    // .style("stroke", "black")
                    // .style('stroke-width', 0.5)
                    .style("fill", d => {
                        const mainCityCommuterPct = 1.0*d.properties.main_city_commuters / d.properties.total_commuters;
                        return this.colorScale(mainCityCommuterPct)
                    })
            );
    };
}

export default TractMap;