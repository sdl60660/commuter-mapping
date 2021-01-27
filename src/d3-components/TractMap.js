import * as d3 from 'd3';
import d3Tip from "d3-tip"
import * as chromatic from "d3-scale-chromatic";
import * as topojson from "topojson-client";


class TractMap {

    containerEl;
    props;

    constructor(containerEl, props) {
        this.containerEl = containerEl;
        const { width, height, tractGeo, stateGeo } = props;

        this.width = width;
        this.height = height;

        this.svg = d3.select(containerEl)
            .append("svg")
            .attr("viewBox", [0, 0, width, height]);

        this.setScales();

        this.tractGroup = this.svg.append("g")
            .attr("class", "tract-map");
            // selectAll("path");

        this.stateGroup = this.svg.append("g")
            .attr("class", "state-map");
            // .selectAll("path");
        
        // Generate background map and projection
        this.tractGeoJSON = topojson.feature(tractGeo, tractGeo.objects["tracts_with_commuter_data"]);
        this.stateGeoJSON = topojson.feature(stateGeo, stateGeo.objects.states);

        // this.tractGeoJSON.features = this.tractGeoJSON.features.filter(feature => feature.properties.MSA_ID === "33860")
        // console.log(this.tractGeoJSON)

        // const projection = d3.geoAlbersUsa()
        //     .fitExtent([[25, 25], [width-25, height-25]], this.tractGeoJSON);
        
        // this.generateMap({ geoJSON: this.stateGeoJSON, projection, pathGroup: this.stateGroup, mapType: "state" });
        // this.generateMap({ geoJSON: this.tractGeoJSON, projection, pathGroup: this.tractGroup, mapType: "tract" });
        
    }

    setScales = () => {
        this.colorScales =
            chromatic.schemeCategory10.map((color) => {
                return d3.scaleLinear()
                    .domain([0, 1])
                    .range(["white", color])
            })
           
    }


    generateMap = ({ geoJSON, projection, pathGroup, mapType }) => {
        let path = d3.geoPath()
            .projection(projection);

        
        pathGroup
            .selectAll("path")
            .data( geoJSON.features, d => d.properties.GEOID)
            .join(
                enter => enter.append("path")
                    .attr("d", path)
                    .attr("class", `${mapType}-path`)
                    .style("opacity", 1.0)
                    .style("stroke", "black")
                    .style('stroke-width', mapType === "state" ? 0.5 : 0)
                    // .style("fill-opacity", mapType === "state" ? 0 : 1)
                    // .style("fill", d => {
                    //     if (mapType === "state") {
                    //         return "white";
                    //     }
                    //     const scaleIndex = Math.round((parseInt(d.properties.MSA_ID) / 53)) % 10
                    //     const mainCityCommuterPct = d.properties.total_commuters > 0 ? 1.0*d.properties.main_city_commuters / d.properties.total_commuters : 0.0;
                    //     return this.colorScales[scaleIndex](mainCityCommuterPct)
                    // })
                    .style("fill-opacity", d => {
                        if (mapType === "state") {
                            return 0;
                        }
                        return d.properties.total_commuters > 0 ? 1.0*d.properties.main_city_commuters / d.properties.total_commuters : 0.0;
                    })
                    .style("fill", d => {
                        if (mapType === "state") {
                            return "white";
                        }
                        const scaleIndex = Math.round((parseInt(d.properties.MSA_ID) / 72)) % 10
                        return chromatic.schemeCategory10[scaleIndex];
                    }),

                exit => exit.remove()
            );
    };


    renderCity = ({ MSA_ID }) => {
        const vis = this;

        const cityFeatures = vis.tractGeoJSON.features.filter(feature => feature.properties.MSA_ID === MSA_ID)
        const cityTracts = { type: "FeatureCollection", features: cityFeatures };

        const projection = d3.geoAlbersUsa()
            .fitExtent([[25, 25], [vis.width-25, vis.height-25]], cityTracts);
        
        this.generateMap({ geoJSON: cityTracts, projection, pathGroup: vis.tractGroup, mapType: "tract" });
    }

}

export default TractMap;


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
