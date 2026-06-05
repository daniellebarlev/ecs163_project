# 50 Years of U.S. (In)Fertility
Understanding the relationship between birth rates, women's labor force participtation, and abortion policy across the United States.
## Overview
This is an interactive data visualization exploring how major changes in abortion law, specficially Roe v. Wade and the reversal Dobbs v. Jackson relate to the birth rates and labor force participation in all 50 US states from 1995-2024.
The visualization is a heat map of the United States including
- A user selected metric (birth rate, labor force participation, or women's education attainment)
- Tile borders that encode each state's abortion law category at the chosen year
- A scrubber that allows the user to select specific years and observe the change over time
- A static snapshot section that compares the start of the dataset 1995, through 2008, and 2002 as political turning points.
## Project Structure
├── index.html                //  M# Main page layout and HTML structure
├── style.css                 //  All styles, colors, layout, legend, tooltips, and historical snapshots
├── map.js                    //  Core D3 visualization logic (interactive map + static historical snapshots)
├── main.js                   //  Data loading entry point, gets CSVs and calls map.js
└── data/
    ├── ECS163Project.R      //   R# R script for cleaning and merging the raw source data
    ├─final_natality_data.csv   //  Cleaned CDC natality data (output of R script)
    └── final_labor_force_data.c// v # Cleaned FRED labor force data (output of R script)
[Link to Data Cleaning Instructions](https://docs.google.com/document/d/1AIRKfxMM1eNJDtPFeTcF6zDW4Fc6d2XHnLKaXUT3PzE/edit?usp=sharing)
## Data Sources
1. CDC Wonder Natality Data
- File Created: final_natality_data.csv
- Source: [CDC Wonder Natality Database](https://wonder.cdc.gov/)
- Covers: 1995-2024, all 50 US States separated by mother education level
- Important Column: Births: the total count per state, year and eductation level.

