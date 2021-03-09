library("sf")
library("tidycensus")
library("tigris")


tract_geojson <- st_read('../data/combined_tracts_with_commuter_data.geojson')
largest_city_data <- read_csv("../data/msa_largest_cities.csv") %>%
  mutate(MSA_ID = as.character((MSA_ID))) %>%
  rename(LARGEST_CITY_ID = CITY_ID)

tracts_with_largest_city <- left_join(tract_geojson, largest_city_data, by="MSA_ID") %>%
  mutate(in_center_city=ifelse(LARGEST_CITY_ID!=CITY_ID | is.na(CITY_ID), F, T)) %>%
  rename (
    MSA = MSA.x,
    largest_city = CITY.y
  )

grouped_by_urban_location <- tracts_with_largest_city %>%
  st_drop_geometry() %>%
  group_by(MSA, MSA_ID, largest_city, in_center_city) %>%
  summarize(
    total_commuters_2018=sum(total_commuters), 
    main_city_commuters_2018=sum(main_city_commuters),
    suburban_commuters_2018=sum(suburban_commuters),
    outside_msa_commuters_2018=sum(outside_msa_commuters),
    total_commuters_2011=sum(total_commuters_2011),
    main_city_commuters_2011=sum(main_city_commuters_2011),
    suburban_commuters_2011=sum(suburban_commuters_2011),
    outside_msa_commuters_2011=sum(outside_msa_commuters_2011)
  ) %>%
  mutate(
    city_commuter_rate_2018 = main_city_commuters_2018/total_commuters_2018,
    city_commuter_rate_2011 = main_city_commuters_2011/total_commuters_2011,
    suburban_commuter_rate_2018 = suburban_commuters_2018/total_commuters_2018,
    suburban_commuter_rate_2011 = suburban_commuters_2011/total_commuters_2011,
    outside_msa_commuter_rate_2018 = outside_msa_commuters_2018/total_commuters_2018,
    outside_msa_commuter_rate_2011 = outside_msa_commuters_2011/total_commuters_2011
  )

grouped_overall <- tracts_with_largest_city %>%
  st_drop_geometry() %>%
  group_by(MSA, MSA_ID, largest_city) %>%
  summarize(
    total_commuters_2018=sum(total_commuters), 
    main_city_commuters_2018=sum(main_city_commuters),
    suburban_commuters_2018=sum(suburban_commuters),
    outside_msa_commuters_2018=sum(outside_msa_commuters),
    total_commuters_2011=sum(total_commuters_2011),
    main_city_commuters_2011=sum(main_city_commuters_2011),
    suburban_commuters_2011=sum(suburban_commuters_2011),
    outside_msa_commuters_2011=sum(outside_msa_commuters_2011)
  ) %>%
  mutate(
    city_commuter_rate_2018 = main_city_commuters_2018/total_commuters_2018,
    city_commuter_rate_2011 = main_city_commuters_2011/total_commuters_2011,
    suburban_commuter_rate_2018 = suburban_commuters_2018/total_commuters_2018,
    suburban_commuter_rate_2011 = suburban_commuters_2011/total_commuters_2011,
    outside_msa_commuter_rate_2018 = outside_msa_commuters_2018/total_commuters_2018,
    outside_msa_commuter_rate_2011 = outside_msa_commuters_2011/total_commuters_2011
  )

output <- bind_rows(grouped_by_urban_location, grouped_overall)

write_csv(output, "../data/metro_commuter_totals.csv")
  