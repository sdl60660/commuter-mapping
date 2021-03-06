import React, { useContext } from 'react';
import Select from 'react-select';
import { MapContext } from '../MapContext';


const MapControls = ({ cityData }) => {

    const { setFeaturedCity, setLargestCityDisplay } = useContext(MapContext)

    const options = cityData.map(msa => {
                        return ({
                            value: msa.MSA_ID,
                            label: msa.MSA,
                            display_city: msa.CITY
                        });
                    })
                    .sort((a, b) => (a.label < b.label) ? -1 : (a.label > b.label) ? 1 : 0)

    const onChange = (option) => {
        setFeaturedCity(option.value);
        setLargestCityDisplay(option.display_city);
    }

    return (
        <div className="map-controls">
            <Select
                defaultValue={options.find(option => option.display_city === "New York City")}
                className="map-controls__city-select"
                options={options}
                onChange={(values) => onChange(values)}
            />
        </div>
    )
}

export default MapControls;