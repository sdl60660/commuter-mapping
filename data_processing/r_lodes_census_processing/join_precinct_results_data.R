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
  left_join(msa_city_dict, by="MSA_ID")


cor(filtered_tract_data$commuter_pct, filtered_tract_data$dem_lead)
ggplot(filtered_tract_data, aes(x=commuter_pct, y=dem_lead)) + geom_point(size = 0.4, alpha=0.4) + geom_smooth(method=lm)

mutated_df <- filtered_tract_data %>%
  mutate(
    rounded_commuter_pct = (round(commuter_pct*20, digits=0))/20
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

