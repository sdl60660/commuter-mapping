import React, { useContext } from 'react';
import Select from 'react-select';
import { MapContext } from '../MapContext';


const MapControls = ({ cityData }) => {

    const { setFeaturedCity, setLargestCityDisplay, setDisplayField } = useContext(MapContext)

    const options = cityData.map(msa => {
                        return ({
                            value: msa.MSA_ID,
                            label: msa.MSA,
                            display_city: msa.CITY
                        });
                    })
                    .sort((a, b) => (a.label < b.label) ? -1 : (a.label > b.label) ? 1 : 0)
    
    const fieldOptions = [
        {
            value: "city_commuter_rate_2018",
            label: "Largest City"
        },
        {
            value: "suburban_commuter_rate_2018",
            label: "Outside Largest City"
        },
        {
            value: "outside_msa_commuter_rate_2018",
            label: "Outside Metro Area"
        }
    ];

    const onChange = (option) => {
        setFeaturedCity(option.value);
        setLargestCityDisplay(option.display_city);
    }

    const onFieldChange = (option) => {
        setDisplayField(option.value);
    }

    return (
        <div className="map-controls">
            <div className="map-controls__header">Metro Area:</div>
            <Select
                defaultValue={options.find(option => option.display_city === "New York City")}
                className="map-controls__select"
                options={options}
                onChange={(values) => onChange(values)}
            />
            <div className="map-controls__header">Show Commuters To:</div>
            <Select
                defaultValue={fieldOptions.find(option => option.value === "city_commuter_rate_2018")}
                className="map-controls__select"
                options={fieldOptions}
                onChange={(values) => onFieldChange(values)}
            />
        </div>
    )
}

export default MapControls;