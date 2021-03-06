import React, { useState, useEffect, useContext } from 'react';
import Select from 'react-select';
import { StackedBarContext } from '../StackedBarContext';


const onChange = (value, setFunction) => {
    setFunction(value.value);
}

const CityComparisonControls = () => {
    const { year, mode, setYear, setMode, setTractLocation, selectedSortVal, setSelectedSortVal, sortDirection, setSortDirection }
        = useContext(StackedBarContext);

    const yearOptions = ['2011', '2018'].map(year => ({ value: year, label: year }));
    const modeOptions = ["Percentages", "Totals"].map(mode => ({ value: mode.toLowerCase(), label: mode }));
    const tractLocationOptions = [
        {
            label: "Full Metro Area",
            value: "NA"
        },
        {
            label: "Largest City Only",
            value: "TRUE"
        },
        {
            label: "Outside of Largest City Only",
            value: "FALSE"
        }
    ];

    const sortChange = (e) => {
        setSortDirection(e.target.id !== selectedSortVal ? "down" : sortDirection === "down" ? "up" : "down");
        setSelectedSortVal(e.target.id);
    }

    const arrowString = (elementId) => {
        return elementId !== selectedSortVal ? "" : sortDirection === "down" ? " ▼" : " ▲";
    }

    return (
        <div className="stacked-bar-chart__header">
            <div className="stacked-bar-chart__control-grid">
                <Select
                    defaultValue={modeOptions.find(option => option.value === mode)}
                    className="stacked-bar-chart__control"
                    options={modeOptions}
                    onChange={(value) => onChange(value, setMode)}
                />
                <Select
                    defaultValue={yearOptions.find(option => option.value === year)}
                    className="stacked-bar-chart__control"
                    options={yearOptions}
                    onChange={(value) => onChange(value, setYear)}
                />
                <Select
                    defaultValue={tractLocationOptions.find(option => option.value === "NA")}
                    className="stacked-bar-chart__control"
                    options={tractLocationOptions}
                    onChange={(value) => onChange(value, setTractLocation)}
                />
            </div>
            <div className="stacked-bar-chart__sort-grid">
                <div className="stacked-bar-chart__sort-by" id="city" onClick={(e) => sortChange(e)}>Work in Largest City{arrowString("city")}</div>
                <div className="stacked-bar-chart__sort-by" id="suburban" onClick={(e) => sortChange(e)}>Work Outside of Largest City{arrowString("suburban")}</div>
                <div className="stacked-bar-chart__sort-by" id="outside-msa" onClick={(e) => sortChange(e)}>Work Outside of Metro Area{arrowString("outside-msa")}</div>
            </div>
        </div>
    )
}

export { CityComparisonControls as default }


// const { setFeaturedCity, setLargestCityDisplay } = useContext(MapContext)

//     const options = cityData.map(msa => {
//                         return ({
//                             value: msa.MSA_ID,
//                             label: msa.MSA,
//                             display_city: msa.CITY
//                         });
//                     })
//                     .sort((a, b) => (a.label < b.label) ? -1 : (a.label > b.label) ? 1 : 0)

//     const onChange = (option) => {
//         setFeaturedCity(option.value);
//         setLargestCityDisplay(option.display_city);
//     }

//     return (
//         <div className="map-controls">
//             <Select
//                 defaultValue={options.find(option => option.display_city === "New York City")}
//                 className="map-controls__city-select"
//                 options={options}
//                 onChange={(values) => onChange(values)}
//             />
//         </div>
//     )