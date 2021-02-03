// React
import React from 'react';
import ReactDOM from 'react-dom';

// Outside Libraries
import { json, csv } from 'd3-fetch';

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
  ReactDOM.render(
    <div>
      <Header />
      <Intro />
      <MapWrapper tractGeo={allData[0]} MsaCityMappings={allData[1]} stateGeo={allData[2]} cityBoundaries={allData[3]} MCDBoundaries={allData[4]}/>
      <Footer githubLink={"https://github.com/sdl60660/commuter-mapping"} />
    </div>,
    document.getElementById('root')
  );
})

reportWebVitals();
