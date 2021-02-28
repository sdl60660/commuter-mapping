library(tidycensus)

tract_geojson <- st_read('../data/tracts_with_commuter_data.geojson')
tract_2011_rates <- read_csv('../data/2011_tract_commuter_totals.csv')

combined_geojson <- left_join(tract_geojson, tract_2011_rates, by=c("GEOID" = "tract_id")) %>%
  rename(
    main_city_commuters = main_city_commuters.x,
    total_commuters = total_commuters.x,
    main_city_commuters_2011 = main_city_commuters.y,
    total_commuters_2011 = total_commuters.y
  )


st_write(combined_geojson, '../data/combined_tracts_with_commuter_data.geojson')
