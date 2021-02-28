library(tidycensus)
library(tidyverse)
library(tigris)
library(sf)
options(tigris_use_cache = TRUE)

# Get list of states
us_states <- unique(fips_codes$state)[1:51]

# Get all MCD geo data
MCDs <- map_df(us_states, function(us_state) {
  county_subdivisions(state = us_state, cb = TRUE, year = 2018)
})
MCD_centroids <- st_centroid(MCDs) %>%
  select(GEOID, geometry)


# Get MSA geo data
msa_geo <- core_based_statistical_areas(cb = TRUE, resolution = "500k", year= 2018)


# Spatial join MCD centroids with MSAs
MCDs_with_msas <- st_join(MCD_centroids, msa_geo, type = st_intersects) %>%
  rename( 
      GEOID = GEOID.x,
      MSA_ID = GEOID.y
  ) %>%
  select(GEOID, MSA_ID) %>%
  st_drop_geometry()

# Join spatially joined MCD/MSA mappings back to the MSA geo data
MCD_data_with_msa <- left_join(MCDs, MCDs_with_msas, by="GEOID") %>%
  rename(
    STATE_ID = STATEFP
  ) %>%
  select(GEOID, MSA_ID, STATE_ID, NAME, geometry)

# Get state data and join state names and abbreviations to MCD data
state_data <- states(cb = TRUE, year = 2018) %>%
  st_drop_geometry()
all_MCD_data <- left_join(MCD_data_with_msa, state_data, by = c("STATE_ID" = "GEOID")) %>%
  rename(
    MCD_NAME = NAME.x,
    STATE_NAME = NAME.y,
    STATE_ABBREVIATION = STUSPS
  ) %>%
  select(GEOID, MCD_NAME, MSA_ID, STATE_ID, STATE_NAME, STATE_ABBREVIATION, geometry) %>%
  filter(MSA_ID != "")


# Get tract data, spatial join by tract centroid within places, group by place and sum commuter numbers
# tract_geos <- st_read('../data/tracts_with_commuter_data.geojson')
tract_geos <- st_read('../data/combined_tracts_with_commuter_data.geojson')
tract_centroids <- st_centroid(tract_geos)
tracts_with_MCDs <- st_join(tract_centroids, all_MCD_data, type = st_intersects) %>%
  rename(
    MCD_ID = GEOID.y
  ) %>%
  filter (MCD_NAME != "") %>%
  st_drop_geometry() %>%
  group_by(MCD_ID) %>%
  # summarize(total_commuters = sum(total_commuters), main_city_commuters = sum(main_city_commuters))
  summarize(
    total_commuters = sum(total_commuters),
    main_city_commuters = sum(main_city_commuters),
    total_commuters_2011 = sum(total_commuters_2011),
    main_city_commuters_2011 = sum(main_city_commuters_2011)
  )


final_MCD_data <- left_join(all_MCD_data, tracts_with_MCDs, by=c("GEOID" = "MCD_ID"))

# Write tract data to geojson
st_write(final_MCD_data, '../data/MCDs.geojson')
