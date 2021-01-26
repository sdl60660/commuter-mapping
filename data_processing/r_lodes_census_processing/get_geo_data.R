library(tigris)
library(tidycensus)
library(tidyverse)
library(purrr)
library(sf)
library(rgeos)
options(tigris_use_cache = TRUE)

# census_vars <- load_variables(2015, dataset="acs5", cache=T)

# Get list of US State abbreviations
us_states <- unique(fips_codes$state)[1:51]

# Get geodata for all US Census Tracts
us_tracts <- map_df(us_states, function(us_state) {
  tracts(state = us_state, cb = TRUE, year = 2018)
})
# tract_centroids <- gCentroid(spgeom = methods::as(object = us_tracts, Class = "Spatial" ), byid = TRUE )
tract_centroids <- st_centroid(us_tracts) %>%
  select(GEOID, geometry)

# Write to GeoJSON
st_write(us_tracts, '../data/us_tracts.geojson')

# Get geodata for MSAs
msa_geo <- core_based_statistical_areas(cb = TRUE, resolution = "500k", year= 2018)
# Get population data for MSAs and match name formatting to geodata
msa_acs_data <- get_acs("metropolitan statistical area/micropolitan statistical area", variables = "B00001_001", year = 2018)
msa_acs_data$NAME <- substr(msa_acs_data$NAME, 1, nchar(msa_acs_data$NAME)-11)

# Join geodata and population data by GEO_ID/NAME and filter by population
# (the population estimates here seem to be 10% of the real MSA population,
# I'm not sure why, but it doesn't necessarily matter, so long as the filter is scaled too)
msa_data <- merge(x = msa_geo, y = msa_acs_data, by = c("GEOID", "NAME")) %>%
  filter(estimate >= 25000) %>%
  # Rename the variable column to population
  rename(
    population = estimate
  ) %>%
  # Select only identifiers, population and geometry
  select(GEOID, NAME, population, geometry)

# Scale population correctly
msa_data$population <- 10*msa_data$population

# Spatial join tract centroids with MSAs
tracts_with_msas <- st_join(tract_centroids, msa_data, type = st_intersects) %>%
  rename( 
    MSA_ID = GEOID.y,
    GEOID = GEOID.x,
    MSA = NAME
  ) %>%
  select(MSA_ID, GEOID, MSA) %>%
  filter(MSA != "")

# Get Urban Areas
# cities <- urban_areas(cb = TRUE, year = 2018) %>%
#   rename(GEOID = GEOID10)
# cities_acs <- get_acs("urban area", variables = "B00001_001", year = 2018)


# subdivisions <- map_df(us_states, function(us_state) {
#   county_subdivisions(state = us_state, cb = TRUE, year = 2018)
# })
# subdivisions_acs <- map_df(us_states, function(us_state) {
#   get_acs("county subdivision", state = us_state, variables = "B00001_001", year = 2018)
# }) 
# subdivision_data <- merge(x = subdivisions, y = subdivisions_acs, by = "GEOID")

places <- map_df(us_states, function(us_state) {
  places(state = us_state, cb = TRUE, year = 2018)
})
places_acs <- map_df(us_states, function(us_state) {
  get_acs("place", state = us_state, variables = "B00001_001", year = 2018)
}) 
places_data <- merge(x = places, y = places_acs, by = "GEOID")


# Join city name to each tract
tracts_with_place_names <- st_join(tracts_with_msas, places_data, type = st_intersects) %>%
  rename(
    GEOID = GEOID.x,
    CITY = NAME.x,
    CITY_ID = GEOID.y
  ) %>%
  select(GEOID, MSA, MSA_ID, CITY, CITY_ID) %>%
  st_drop_geometry()

# Rejoin tract data with MSA/City to original polygon data
full_tract_data <- merge(tracts_with_place_names, us_tracts, by = "GEOID") %>%
  select(GEOID, MSA, MSA_ID, CITY, CITY_ID, STATEFP, COUNTYFP, geometry) %>%
  rename(
    STATE_ID = STATEFP,
    COUNTY_ID = COUNTYFP
  )


# Create dict of largest cities in each MSA
places_centroids <- st_centroid(places_data)
cities_with_msas <- st_join(places_centroids, msa_data, type = st_intersects) %>%
  st_drop_geometry() %>%
  group_by(NAME) %>% 
  top_n(1, estimate) %>% 
  rename(
    CITY = NAME.x,
    CITY_ID = GEOID.x,
    CITY_population = estimate,
    MSA = NAME,
    MSA_ID = GEOID.y,
    MSA_population = population,
  ) %>% 
  select(CITY, CITY_ID, CITY_population, MSA, MSA_ID, MSA_population)
cities_with_msas$CITY_population <- 10*cities_with_msas$CITY_population


# ggplot() + 
#   geom_sf(data = msa_geo)