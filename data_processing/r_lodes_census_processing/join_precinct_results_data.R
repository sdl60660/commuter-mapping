library(tigris)
library(tidycensus)
library(tidyverse)
library(sf)
library(rgeos)
library(ggplot2)
library(ggpubr)
options(tigris_use_cache = TRUE)


# Load geodata for precincts (with 2020 vote data)
precinct_geos <- st_read('../data/precincts-with-results.geojson')  %>% st_transform(4326)
# Load geodata for tracts (with commuter data (% of worker who commute to MSA's largest city))
tracts <- st_read('../data/tracts_with_commuter_data.geojson') %>% st_transform(4326)
# Load in dictionary of MSAs and largest cities in those MSAs
msa_city_dict <- read_csv('../data/msa_largest_cities.csv') %>%
  transform(MSA_ID = as.character(MSA_ID))
# Load in all places, but then filter to only include places in msa_city_dict (the major cities in MSAs)
places <- st_read('../data/places.geojson') %>%
  filter(GEOID %in% msa_city_dict$CITY_ID)
city_centroids <- st_centroid(places)
# Load overall commuter rates for MSAs
msa_commuter_rates <- read_csv("../data/metro_commuter_totals.csv") %>%
  filter(is.na(in_center_city)) %>%
  select(-c(MSA, largest_city, in_center_city))
# Append prefix to column names
colnames(msa_commuter_rates) <- paste("MSA", colnames(msa_commuter_rates), sep="_")
# Remove prefix from first column (MSA_ID) and cast it as character type
msa_commuter_rates <- msa_commuter_rates %>%
  rename(MSA_ID=MSA_MSA_ID) %>%
  mutate(MSA_ID=as.character(MSA_ID))
  

# Find the precinct centroids and spatial join them to census tracts
precinct_centroids <- st_centroid(precinct_geos)
precincts_with_tracts <- st_join(precinct_centroids, tracts, type=st_intersects)

# Find vote totals from all precincts within a given tract, summarize, re-calculate margin
tract_vote_totals <- precincts_with_tracts %>%
  st_drop_geometry() %>%
  group_by(GEOID.y) %>%
  summarize(
    votes_dem = votes_dem,
    votes_rep = votes_rep,
    votes_total = votes_total
  ) %>%
  rename(TRACT_ID = GEOID.y) %>%
  mutate(
    dem_lead = 100*((votes_dem / votes_total) - (votes_rep / votes_total))
  )

# Re-join tract vote totals to other tract data
full_tract_data <- left_join(tracts, tract_vote_totals, by=c("GEOID" = "TRACT_ID"))

# Filter out any tracts without vote totals
# (either because of the way precinct boundaries align or because the state totals weren't available)
filtered_tract_data <- full_tract_data %>%
  mutate(
    commuter_pct = main_city_commuters / total_commuters
  ) %>%
  filter(
    votes_total != "",
    MSA_ID != "",
    is.na(commuter_pct) == FALSE,
    is.na(dem_lead) == FALSE
  ) %>%
  left_join(msa_city_dict, by="MSA_ID") %>%
  rename(
    MSA_LARGEST_CITY=CITY.y,
    MSA_LARGEST_CITY_ID=CITY_ID.y,
    TRACT_CITY=CITY.x,
    TRACT_CITY_ID=CITY_ID.x,
    MSA=MSA.x,
    STATE_ID=STATE_ID.x
  ) %>%
  select(
    -c(MSA.y, STATE_ID.y)
  )

tract_data_with_MSA_totals <- filtered_tract_data %>%
  left_join(msa_commuter_rates, by="MSA_ID") %>%
  mutate(adjusted_commuter_rate = commuter_pct - MSA_city_commuter_rate_2018)

# Get tract census data to determine population density
us_states <- unique(fips_codes$state)[1:51]
census_vars <- load_variables(2018, dataset="acs5", cache=T)
us_tracts_pop <- map_df(us_states, function(us_state) {
  get_acs(state = us_state, geography="tract", variables="B00001_001", year=2018)
})
us_tracts_geo <- map_df(us_states, function(us_state) {
  tracts(state = us_state, cb = TRUE, year = 2018)
})
us_tracts <- us_tracts_pop %>%
  left_join(us_tracts_geo, by="GEOID") %>%
  select(GEOID, estimate, ALAND) %>%
  rename(population = estimate) %>%
  mutate(tract_population_density = population / ALAND)

# Attach population density numbers to full tract df for comparison between commuter rate and tract density
final_tract_data_df <- tract_data_with_MSA_totals %>%
  left_join(us_tracts, by="GEOID") %>%
  filter(!is.na(tract_population_density))

cor(final_tract_data_df$tract_population_density, final_tract_data_df$dem_lead)
ggplot(final_tract_data_df, aes(x=tract_population_density, y=dem_lead)) + geom_point(size = 0.4, alpha=0.4) + geom_smooth(method=lm)

mutated_df <- final_tract_data_df %>%
  mutate(
    rounded_commuter_pct = (round(adjusted_commuter_rate*10, digits=0))/10
  )

grouped_tracts <- mutated_df %>%
  group_by(rounded_commuter_pct) %>%
  summarize(mean_vote_gap = median(dem_lead, na.rm = TRUE))
ggplot(grouped_tracts, aes(x=rounded_commuter_pct, y=mean_vote_gap)) + geom_point(size = 0.4, alpha=0.4) + geom_smooth(method=lm)
cor(grouped_tracts$rounded_commuter_pct, grouped_tracts$mean_vote_gap)



non_urban_tracts <- left_join(filtered_tract_data, msa_city_dict, by="MSA_ID") %>%
  filter(
    CITY_ID.x != CITY_ID.y
  )
cor(non_urban_tracts$commuter_pct, non_urban_tracts$dem_lead)
ggplot(non_urban_tracts, aes(x=commuter_pct, y=dem_lead)) + geom_point(size = 0.4, alpha=0.4) + geom_smooth(method=lm)

