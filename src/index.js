// React
import React from 'react';
import ReactDOM from 'react-dom';

// Outside Libraries
import { json, csv } from 'd3-fetch';
import * as topojson from "topojson-client";


// Styles
import './styles/styles.scss';

// React Components
import LoadSpinner from './components/LoadSpinner';
import Header from './components/Header';
import Intro from './components/Intro';
import Footer from './components/Footer';
import MapWrapper from './components/MapWrapper';
import CityComparisonWrapper from './components/CityComparisonWrapper';
import reportWebVitals from './reportWebVitals';


// Loader render while data is loading
ReactDOM.render(
  <div>
    <Header />
    <Intro />
    <LoadSpinner />
    <Footer githubLink={"https://github.com/sdl60660/commuter-mapping"} />
  </div>,
  document.getElementById('root')
);

const addCommuterRates = (rawGeoJson) => {
  rawGeoJson.features.forEach(feature => {
    feature.properties.city_commuter_rate_2018 = 1.0*feature.properties.main_city_commuters/feature.properties.total_commuters;
    feature.properties.suburban_commuter_rate_2018 = 1.0*feature.properties.suburban_commuters/feature.properties.total_commuters;
    feature.properties.outside_msa_commuter_rate_2018 = 1.0*feature.properties.outside_msa_commuters/feature.properties.total_commuters;

    // feature.properties.city_commuter_rate_2011 = 1.0*feature.properties.main_city_commuters_2011/feature.properties.total_commuters_2011;
    // feature.properties.city_commuter_rate_diff = feature.properties.commuter_rate - feature.properties.commuter_rate_2011;

    return feature;
  });

  return rawGeoJson;
}

// Begin loading datafiles
const promises = [
  json("data/simplified_tract_data.json"),
  csv("data/msa_largest_cities.csv"),
  json("data/us_states.json"),
  json("data/places.json"),
  json("data/MCDs.json"),
  csv("data/metro_commuter_totals.csv")
];

// Render React components (and inner d3 viz) on data load
Promise.all(promises).then((allData) => {

  let tractGeoJSON = addCommuterRates(topojson.feature(allData[0], allData[0].objects["combined_tracts_with_commuter_data"]));
  let stateGeoJSON = topojson.feature(allData[2], allData[2].objects.states);
  let cityGeoJSON = addCommuterRates(topojson.feature(allData[3], allData[3].objects.places));
  let mcdGeoJSON = addCommuterRates(topojson.feature(allData[4], allData[4].objects.MCDs));

  // Specifically filter out the NYC place polygon, since the MCD data has more detailed data (boroughs). This isn't the case anywhere else.
  cityGeoJSON.features = cityGeoJSON.features.filter(place => place.properties.GEOID !== "3651000");

  // Sort and filter commuter meta data
  let commuterRates = allData[5].filter(d => d.total_commuters_2018 > 0).sort((a, b) => b.total_commuters_2018 - a.total_commuters_2018)
  console.log(commuterRates);

  ReactDOM.render(
    <div>
      <Header />
      <Intro />
      <MapWrapper tractGeo={tractGeoJSON} MsaCityMappings={allData[1]} stateGeo={stateGeoJSON} cityBoundaries={cityGeoJSON} MCDBoundaries={mcdGeoJSON}/>
      <CityComparisonWrapper commuterRates={commuterRates} />
      <Footer githubLink={"https://github.com/sdl60660/commuter-mapping"} />
    </div>,
    document.getElementById('root')
  );
})

reportWebVitals();

