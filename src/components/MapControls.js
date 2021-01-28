import React from 'react';
import Select from 'react-select';


const MapControls = ({ setCity, cityData, setCityDisplay }) => {

    const options = cityData.map(msa => {
                        return ({
                            value: msa.MSA_ID,
                            label: msa.MSA,
                            display_city: msa.CITY
                        });
                    })
                    .sort((a, b) => (a.label < b.label) ? -1 : (a.label > b.label) ? 1 : 0)

    const onChange = (option) => {
        setCity(option.value);
        setCityDisplay(option.display_city);
    }

    return (
        <div className="map-controls">
            <Select
                defaultInputValue="New York-Newark-Jersey City, NY-NJ-PA"
                className="map-controls__city-select"
                options={options}
                onChange={(values) => onChange(values)}
            />
        </div>
    )
}

export default MapControls;