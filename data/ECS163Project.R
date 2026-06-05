library(readr)
library(tidyverse)
library(dplyr)
library(lubridate)

# CDC Wonder natality data
Natality1 <- read_csv("Documents/ECS163/1995-2002.csv")
Natality1 <- Natality1 |>
  filter(!is.na(`Mother's Education Code`))
write_csv(Natality1, "Documents/ECS163/1995-2002.csv")
  
Natality2 <- read_csv("Documents/ECS163/2003-2006.csv")
Natality2 <- Natality2 |>
  filter(is.na(Notes))
write_csv(Natality2, "Documents/ECS163/2003-2006.csv")
  
Natality3 <- read_csv("Documents/ECS163/2007-2024.csv")
Natality3 <- Natality3 |>
  filter(!is.na(`Mother's Education Code`)) |>
  mutate(`Mother's Education` = case_when(`Mother's Education` == "8th grade or less" ~ "0 -  8 years", 
                                          `Mother's Education` == "9th through 12th grade with no diploma" ~ "9 - 11 years",
                                          `Mother's Education` == "High school graduate or GED completed" ~ "12 years",
                                          `Mother's Education` == "Associate degree (AA, AS)" ~ "13 - 15 years",
                                          `Mother's Education` == "Some college credit, but not a degree" ~ "13 - 15 years",
                                          `Mother's Education` == "Unknown or Not Stated" ~ "Not stated/Not on certificate",
                                          `Mother's Education` == "Bachelor's degree (BA, AB, BS)" ~ "16 years and over",
                                          `Mother's Education` == "Master's degree (MA, MS, MEng, MEd, MSW, MBA)" ~ "16 years and over",
                                          `Mother's Education` == "Doctorate (PhD, EdD) or Professional Degree (MD, DDS, DVM, LLB, JD)" ~ "16 years and over",
                                          `Mother's Education` == "Excluded" ~ "Excluded"))

Natality3 <- Natality3 |>
  mutate(`Mother's Education Code` = case_when(`Mother's Education Code` == "1" ~ "19176",
                                               `Mother's Education Code` == "2" ~ "19177",
                                               `Mother's Education Code` == "3" ~ "19178",
                                               `Mother's Education Code` == "4" ~ "19179",
                                               `Mother's Education Code` == "5" ~ "19179",
                                               `Mother's Education Code` == "6" ~ "16+",
                                               `Mother's Education Code` == "7" ~ "16+",
                                               `Mother's Education Code` == "8" ~ "16+",
                                               `Mother's Education Code` == "Unk" ~ "NR",
                                               `Mother's Education Code` == "Exc" ~ "999"))
write_csv(Natality3, "Documents/ECS163/2007-2024.csv")

files <- list.files(path = "Documents/ECS163", pattern = "*.csv", full.names = TRUE)

df_combined <- files %>% 
  map_df(~read_csv(.))

write_csv(df_combined, "Documents/ECS163/final_natality_data.csv")

# FRED labor force participation data
# combine all the states' data into one dataframe
df1 <- read.csv("Documents/ECS163/FRED/fredgraph.csv")
df2 <- read.csv("Documents/ECS163/FRED/fredgraph-2.csv")

combined_df <- full_join(df1, df2, by = "observation_date")
df3 <- read.csv("Documents/ECS163/FRED/fredgraph-3.csv")

combined_df <- full_join(combined_df, df3, by = "observation_date")
df4 <- read.csv("Documents/ECS163/FRED/fredgraph-4.csv")

combined_df <- full_join(combined_df, df4, by = "observation_date")
df5 <- read.csv("Documents/ECS163/FRED/fredgraph-5.csv")

combined_df <- full_join(combined_df, df5, by = "observation_date")

# append state names
colnames(combined_df) <- c("Date", 
                           "Alabama", 
                           "Alaska",
                           "Arizona",
                           "Arkansas",
                           "California",
                           "Colorado",
                           "Connecticut",
                           "Delaware",
                           "District of Columbia",
                           "Florida",
                           "Georgia",
                           "Hawaii",
                           "Idaho",
                           "Illinois",
                           "Indiana",
                           "Iowa",
                           "Kansas",
                           "Kentucky",
                           "Louisiana",
                           "Maine",
                           "Maryland",
                           "Massachusetts",
                           "Michigan",
                           "Minnesota",
                           "Mississippi",
                           "Missouri",
                           "Montana",
                           "Nebraska",
                           "Nevada",
                           "New Hampshire",
                           "New Jersey",
                           "New Mexico",
                           "New York",
                           "North Carolina",
                           "North Dakota",
                           "Ohio",
                           "Oklahoma",
                           "Oregon",
                           "Pennsylvania",
                           "Rhode Island",
                           "South Carolina",
                           "South Dakota",
                           "Tennessee",
                           "Texas",
                           "Utah",
                           "Vermont",
                           "Virginia",
                           "Washington",
                           "West Virginia",
                           "Wisconsin",
                           "Wyoming")

# need 1995 - 2024
# only January 1 of each year
combined_df$Date <- as.Date(combined_df$Date)
filtered_df <- combined_df |>
  filter(month(Date) == 1 & day(Date) == 1 & year(Date) > 1994 & year(Date) < 2025)

filtered_df$Date <- format(filtered_df$Date, "%Y")

write_csv(filtered_df, "Documents/ECS163/FRED/final_labor_force_data.csv")

