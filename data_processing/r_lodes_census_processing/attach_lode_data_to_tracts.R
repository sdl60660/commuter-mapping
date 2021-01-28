library(tigris)
library(tidycensus)
library(tidyverse)
library(purrr)
library(sf)
library(rgeos)
options(tigris_use_cache = TRUE)


# Load lodes commuter data, as well as MSA/largest city mapping and tract data (with geography, city, MSA)
lodes_data <- read_csv('../data/2010_lodes_data.csv')
msa_city_dict <- read_csv('../data/msa_largest_cities.csv')
tract_data <- st_read('../data/2010_full_tract_data.geojson')

# Join city/MSA tract data to lodes tracts
no_geo_tract_data <- st_drop_geometry(tract_data)
lodes_with_places_mid <- merge(x = lodes_data, y = no_geo_tract_data, by.x = "h_tract", by.y = "GEOID") %>%
  rename(
    h_MSA = MSA_ID,
    h_CITY = CITY_ID
  ) %>%
  select(h_tract, h_MSA, h_CITY, w_tract, total_commuters)

# Join city/MSA data for workplace tract
lodes_with_places <- merge(x = lodes_with_places_mid, y = no_geo_tract_data, by.x = "w_tract", by.y = "GEOID") %>%
  rename(
    w_MSA = MSA_ID,
    w_CITY = CITY_ID
  ) %>%
  select(h_tract, h_MSA, h_CITY, w_tract, w_MSA, w_CITY, total_commuters)
  # filter(h_MSA != "")

# Attach largest MSA city key to each row to use in iterator (this might be less efficient than looking it up on iteration?)
simple_msa_city_dict <- msa_city_dict %>% select(MSA_ID, CITY_ID)
lodes_final <- merge(x = lodes_with_places, y = simple_msa_city_dict, by.x = "h_MSA", by.y = "MSA_ID") %>%
  rename(largest_MSA_city = CITY_ID)


# For each tract in tract data, get subset of lode data with matching home tracts
# Then find the total number of commuters across all lode rows in that home tract
# And the total number of commuters commuting to tracts in the MSA's main city
# Return these with the tract_id as a row in the new dataframe (us_tracts), to be joined with tract geoJSON
# This takes a *very* long time to run in full, run it with a sample to test
us_tracts <- map_dfr(tract_data$GEOID, function(tract) {
  print(tract)
  subset <- lodes_final[lodes_final$h_tract == tract,]
  # print(subset)
  
  total_commuters <- sum(subset$total_commuters)
  # print(total_commuters)
  
  main_city_commuters_subset <- filter(subset, w_CITY == largest_MSA_city)
  main_city_commuters <- sum(main_city_commuters_subset$total_commuters)
  # print(main_city_commuters)
  
  # print(sum(subset[subset$w_CITY == subset$largest_MSA_city,]$total_commuters))
  output_df <- tibble(
                  tract_id = tract, 
                  total_commuters = total_commuters,
                  main_city_commuters = main_city_commuters
                )
  # print(output_df)
  return(output_df)
})

# Write tract commuter data to CSV
write_csv(us_tracts, '../data/2010_tract_commuter_totals.csv')

# Join tract commuter data to existing tract geoJSON and save it
commuter_geojson <- left_join(tract_data, us_tracts, by = c("GEOID" = "tract_id"))
st_write(commuter_geojson, '../data/2010_tracts_with_commuter_data.geojson')


