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
    feature.properties.commuter_rate = 1.0*feature.properties.main_city_commuters/feature.properties.total_commuters;
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
  json("data/MCDs.json")
];

// Render React components (and inner d3 viz) on data load
Promise.all(promises).then((allData) => {

  let tractGeoJSON = addCommuterRates(topojson.feature(allData[0], allData[0].objects["combined_tracts_with_commuter_data"]));
  let stateGeoJSON = topojson.feature(allData[2], allData[2].objects.states);
  let cityGeoJSON = addCommuterRates(topojson.feature(allData[3], allData[3].objects.places));
  let mcdGeoJSON = addCommuterRates(topojson.feature(allData[4], allData[4].objects.MCDs));

  // Specifically filter out the NYC place polygon, since the MCD data has more detailed data (boroughs). This isn't the case anywhere else.
  cityGeoJSON.features = cityGeoJSON.features.filter(place => place.properties.GEOID !== "3651000");

  console.log(tractGeoJSON);

  ReactDOM.render(
    <div>
      <Header />
      <Intro />
      <MapWrapper tractGeo={tractGeoJSON} MsaCityMappings={allData[1]} stateGeo={stateGeoJSON} cityBoundaries={cityGeoJSON} MCDBoundaries={mcdGeoJSON}/>
      <Footer githubLink={"https://github.com/sdl60660/commuter-mapping"} />
    </div>,
    document.getElementById('root')
  );
})

reportWebVitals();
