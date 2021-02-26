const filterGeoJSON = ({ originalGeoJSON, MSA_ID }) => {
    const selectedFeatures = originalGeoJSON.features.filter(feature => feature.properties.MSA_ID === MSA_ID)
    return { type: "FeatureCollection", features: selectedFeatures };
}

export { filterGeoJSON };