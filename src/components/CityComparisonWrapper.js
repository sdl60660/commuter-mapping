import React, { useState, useEffect } from 'react';
import d3Tip from 'd3-tip';

import CityComparisonControls from './CityComparisonControls';
import StackedBar from './StackedBar';

import { StackedBarContext } from '../StackedBarContext';


const CityComparisonWrapper = ({ commuterRates }) => {

    const [commuterRateData, setCommuterRateData] = useState([...commuterRates]);
    const [year, setYear] = useState("2018");
    const [mode, setMode] = useState("totals");
    const [tractLocation, setTractLocation] = useState("NA");
    const [selectedSortVal, setSelectedSortVal] = useState(null);
    const [sortDirection, setSortDirection] = useState(null);
    const [showItems, setShowItems] = useState(50)

    const tip = d3Tip()
        .attr("class", "d3-tip");

    return (
        <div className={"stacked-bar-chart-tile"}>
            <StackedBarContext.Provider value={{ year, setYear, mode, setMode, tractLocation, setTractLocation, selectedSortVal, setSelectedSortVal, sortDirection, setSortDirection, showItems }}>
                <CityComparisonControls />
                <StackedBar cityCommuterRates={commuterRateData} tip={tip} />
                <button className="stacked-bar-chart__show-more" onClick={() => setShowItems(showItems === 50 ? null : 50)}>
                    Show { showItems === 30 ? "All" : "Less" }
                </button>
            </StackedBarContext.Provider>
        </div>
    )
}

export { CityComparisonWrapper as default }

// {commuterRateData.map((metro, i) => {
    // return <StackedBar key={i} cityCommuterRates={metro} tip={tip} />
// })}