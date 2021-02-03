import * as d3 from 'd3';
import d3Tip from "d3-tip";
import { tile } from 'd3-tile';
// import { path } from "d3-geo";
import * as chromatic from "d3-scale-chromatic";
import * as topojson from "topojson-client";


const url = (x, y, z) => `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/${z}/${x}/${y}${devicePixelRatio > 1 ?
    "@2x" :
    ""}?access_token=pk.eyJ1Ijoic2FtbGVhcm5lciIsImEiOiJja2IzNTFsZXMwaG44MzRsbWplbGNtNHo0In0.BmjC6OX6egwKdm0fAmN_Nw`


const filterGeoJSON = ({ originalGeoJSON, MSA_ID }) => {
    const selectedFeatures = originalGeoJSON.features.filter(feature => feature.properties.MSA_ID === MSA_ID)
    return { type: "FeatureCollection", features: selectedFeatures };
}


class TractMap {

    containerEl;
    props;

    constructor(containerEl, props) {
        this.containerEl = containerEl;
        const { width, height, tractGeo, stateGeo, cityBoundaries, MCDBoundaries, featuredCity, largestCityDisplay } = props;

        this.width = width;
        this.height = height;
        this.largestCityDisplay = largestCityDisplay;

        this.svg = d3.select(containerEl)
            .append("svg")
            .attr("viewBox", [0, 0, width, height]);
        
        // Tract layer will be on the bottom, but will be the only visible layer
        this.tractGroup = this.svg.append("g")
            .attr("class", "map-paths tract-map");

        // County subdivision (or MCD/CCD) layer goes under that, these are invisible, only triggering on mouseover,
        // but are under the places/cities layer, so mouseover will only trigger if on an area without census-designated place
        this.countySubdivisionGroup = this.svg.append("g")
            .attr("class", "map-paths mcd-map");

        // Finally, city layer goes on top, with polygons that are invisible, but with outline/tooltip on mouseover
        this.cityGroup = this.svg.append("g")
            .attr("class", "map-paths city-boundary-map");

        this.stateGroup = this.svg.append("g")
            .attr("class", "map-paths state-map");
        
        // Generate background map and projection
        this.tractGeoJSON = topojson.feature(tractGeo, tractGeo.objects["tracts_with_commuter_data"]);
        this.stateGeoJSON = topojson.feature(stateGeo, stateGeo.objects.states);
        this.cityGeoJSON = topojson.feature(cityBoundaries, cityBoundaries.objects.places)
        this.mcdGeoJSON = topojson.feature(MCDBoundaries, MCDBoundaries.objects.MCDs);

        // Specifically filter out the NYC place polygon, since the MCD data has more detailed data (boroughs). This isn't the case anywhere else.
        this.cityGeoJSON.features = this.cityGeoJSON.features.filter(place => place.properties.GEOID !== "3651000");

        console.log(this.mcdGeoJSON);
        
        const projection = d3.geoAlbersUsa()
            .fitExtent([[0, 0], [width, height]], this.tractGeoJSON);
        
        let image = this.svg.append("g")
            .attr("pointer-events", "none")
            .selectAll("image");

        const mapTile = tile()
            .extent([[0, 0], [width, height]])
            .tileSize(512);

        const zoomed = function(transform) {
            const tiles = mapTile(transform);

            // console.log(tiles);
            image = image.data(tiles, d => d).join("image")
                .attr("xlink:href", d => {
                    console.log(d);
                    console.log(...d);
                    return url(...d)
                })
                .attr("x", ([x]) => (x + tiles.translate[0]) * tiles.scale)
                .attr("y", ([, y]) => (y + tiles.translate[1]) * tiles.scale)
                .attr("width", tiles.scale)
                .attr("height", tiles.scale);


            // console.log(transform);
            d3.selectAll(".map-paths").attr("transform", transform);
        }

        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .translateExtent([[0, 0], [this.width, this.height]])
            .on("zoom", ({transform}) => zoomed(transform));
        
        const initialScale = 1 << 12
        const initialCenter = d3.geoCentroid(filterGeoJSON({ originalGeoJSON: this.tractGeoJSON, MSA_ID: featuredCity }))
        // const initialCenter = [0, 0];
        console.log(initialCenter, initialScale);
        console.log(projection(initialCenter));
        this.svg.call(zoom)
                // .call(zoom.transform, d3.zoomIdentity
                //     .translate(width / 2, height / 2)
                //     .scale(-initialScale)
                //     .translate(...projection(initialCenter))
                //     .scale(-1));
            // .on("wheel.zoom", null)
            // .on("wheel", event => event.preventDefault());
        
        // console.log(mapTile);

        this.setScales();
        this.initTooltip();

        // this.tractGeoJSON.features = this.tractGeoJSON.features.filter(feature => feature.properties.MSA_ID === "33860")
        // console.log(this.tractGeoJSON)
        
        // this.generateMap({ geoJSON: this.stateGeoJSON, projection, pathGroup: this.stateGroup, mapType: "state" });
        // this.generateMap({ geoJSON: this.tractGeoJSON, projection, pathGroup: this.tractGroup, mapType: "tract" });

        // this.zoom = d3.zoom().on("zoom", zoomed);
        // this.selection.call(.on("zoom", zoomed));
        
    }

    setScales = () => {
        this.colorScales =
            chromatic.schemeCategory10.map((color) => {
                return d3.scaleLinear()
                    .domain([0, 1])
                    .range(["white", color])
            })
           
    }


    initTooltip = () => {
        const getCommuterVal = (cityData) => {
            return cityData.main_city_commuters ?
                d3.format(".1%")(1.0*cityData.main_city_commuters/cityData.total_commuters) :
                'N/A';
        }

        this.tip = d3Tip()
            .attr('class', 'd3-tip')
            .html((d) => {   
                const cityData = d.properties;
                console.log(cityData);
                // const commuterPct = tractData.main_city_commuters / tractData.total_commuters;

                // <div>% Commuters to ${tractData.MSA}: ${d3.format(".1%")(commuterPct)}</div>
                // <div>Tract: ${tractData.GEOID}</div>
                return (
                    `<div class="d3-tip__grid">
                        <div class="d3-tip__header">${cityData.PLACE_NAME ? cityData.PLACE_NAME : cityData.MCD_NAME}, ${cityData.STATE_ABBREVIATION}<span class="mcd-callout">${cityData.MCD_NAME ? " (MCD)" : ""}</span></div>
                        <div>Job location in ${this.largestCityDisplay}: ${getCommuterVal(cityData)}</div>
                    </div>`
                )
            });

        this.svg.call(this.tip);
    };


    generateMap = ({ geoJSON, projection, pathGroup, mapType }) => {
        const vis = this;

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
                    // .style('stroke-width', mapType === "state" ? 0.5 : 0)
                    .style("stroke", "black")
                    // .style("stroke-width", mapType === "tract" ? 0 : 0.5)
                    .style("stroke-width", 0)
                    .style("fill-opacity", d => {
                        if (mapType !== "tract") {
                            return 0;
                        }
                        return d.properties.total_commuters > 0 ? 1.0*d.properties.main_city_commuters / d.properties.total_commuters : 0.0;
                    })
                    .on("mouseover", function(e, d) {
                        // console.log(d)
                        if (mapType !== "tract") {
                            d3.select(this).style("stroke-width", 1)
                            vis.tip.show(d, this);

                        }
                    })
                    .on("mouseout", function(e, d) {
                        if (mapType !== "tract") {
                            d3.select(this).style("stroke-width", 0)
                            vis.tip.hide();
                        }
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

        const cityTracts = filterGeoJSON({ originalGeoJSON: vis.tractGeoJSON, MSA_ID });
        const msaCities = filterGeoJSON({ originalGeoJSON: vis.cityGeoJSON, MSA_ID });
        const msaMCDs = filterGeoJSON({ originalGeoJSON: this.mcdGeoJSON, MSA_ID });

        const projection = d3.geoAlbersUsa()
            .fitExtent([[0, 0], [vis.width, vis.height]], cityTracts);

        // console.log(msaCitiesFeatures);

        this.generateMap({ geoJSON: cityTracts, projection, pathGroup: vis.tractGroup, mapType: "tract" });
        this.generateMap({ geoJSON: msaCities, projection, pathGroup: vis.cityGroup, mapType: "cities" });
        this.generateMap({ geoJSON: msaMCDs, projection, pathGroup: vis.countySubdivisionGroup, mapType: "county-subdivisions" });
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


// .style("fill-opacity", mapType === "state" ? 0 : 1)
// .style("fill", d => {
//     if (mapType === "state") {
//         return "white";
//     }
//     const scaleIndex = Math.round((parseInt(d.properties.MSA_ID) / 53)) % 10
//     const mainCityCommuterPct = d.properties.total_commuters > 0 ? 1.0*d.properties.main_city_commuters / d.properties.total_commuters : 0.0;
//     return this.colorScales[scaleIndex](mainCityCommuterPct)
// })