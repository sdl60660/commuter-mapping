library(tigris)
library(ggplot2)
library(tidycensus)
library(lehdr)
library(tidyverse)
library(purrr)
options(tigris_use_cache = TRUE)

# census_vars <- load_variables(2015, dataset="acs5", cache=T)

us_states <- unique(fips_codes$state)[1:51]

col_names_flag <- TRUE
for(type in c("main", "aux")) {
  for(state in us_states) {
    try({
        lodes <- grab_lodes(state = state, year = 2018, lodes_type = "od", job_type = "JT01",
                   segment = "S000", state_part = type, agg_geo = "tract") %>%
        select(year, state, h_tract, w_tract, S000)
        
        # Append lode data for state and type (intra/inter-state commutes) to CSV
        write_csv(lodes, "../data/lodes_data.csv", append = TRUE, col_names = col_names_flag)
        # Write header if this is first file, then turn off flag
        col_names <- FALSE
      })
  }
}


# joined_lodes <- map_dfr(c("main", "aux"), function(type) {
#   map_dfr(us_states[1:3], function(state) {
#     try({
#       grab_lodes(state = state, year = 2018, lodes_type = "od", job_type = "JT01",
#                  segment = "S000", state_part = type, agg_geo = "tract") %>%
#         select(year, state, h_tract, w_tract, S000)
#     })
#   })
# })

# write_csv(joined_lodes, "../data/lodes_data.csv", append = TRUE)
  
  
# joined <- x %>%
#   rbind(y)