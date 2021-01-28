import React from 'react';
import Select from 'react-select';


const MapControls = ({ setCity, cityData }) => {

    const options = cityData.map(msa => {
                        return ({
                            value: msa.MSA_ID,
                            label: msa.CITY
                        });
                    })
                    .sort((a, b) => (a.label < b.label) ? -1 : (a.label > b.label) ? 1 : 0)

    const onChange = (option) => {
        setCity(option.value);
    }

    return (
        <div className="map-controls">
            <Select
                defaultInputValue="New York"
                className="map-controls__city-select"
                options={options}
                onChange={(values) => onChange(values)}
            />
        </div>
    )
}

export default MapControls;