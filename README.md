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
```text
.
├── index.html
├── style.css
├── map.js
├── main.js
└── data/
    ├── ECS163Project.R
    ├── final_natality_data.csv
    └── final_labor_force_data.csv
```

- **index.html** — Main page layout and HTML structure
- **style.css** — Styling, colors, layout, legends, tooltips, and historical snapshots
- **map.js** — Core D3 visualization logic (interactive map and historical snapshots)
- **main.js** — Loads datasets and initializes visualizations
- **ECS163Project.R** — Cleans and merges raw source data
- **final_natality_data.csv** — Processed CDC natality data
- **final_labor_force_data.csv** — Processed FRED labor force data
## Data Sources
1. CDC Wonder Natality Data
- File Created: final_natality_data.csv
- Source: [CDC Wonder Natality Database](https://wonder.cdc.gov/)
- Covers: 1995-2024, all 50 US States separated by mother education level
- Important Column: Births: the total count per state, year and eductation level.
The R script harmonizes the education labels and codes across all three time periods, and then combines them into a single file.
2. FRED: Women's Labor Force Participation
- File Created: final_labor_force_data.csv
- Source: [Federal Reserve Economic Data (FRED)](https://fred.stlouisfed.org/)
- Covers: 1995-2024 for all 50 states
The R script harmonizes all the csv files
3. Abortion Law Classifications
- Manually compiled from legal records, hardcoded in map.js as law_data
- Additions for the full Law Atlas dataset is one of the possible improvements
## Data Cleaning
- Data cleaning documentation can be found here: [Data Cleaning Documentation](https://docs.google.com/document/d/1AIRKfxMM1eNJDtPFeTcF6zDW4Fc6d2XHnLKaXUT3PzE/edit?usp=sharing)
# Interactive Map
- Built with D3.js
- Uses a tile grid layout so all states are represent equally regardless of political standing.
There are three toggle buttons on the legend:
- Birth Rate: Red scale births per 1000 women aged 15-44
- Labor Force: Blue scale labor force participation
- Education: Teal scale percentage of women that have bachelor's degree
This visualization also includes a hover tooltips that depicts the the number of births and the abortion law category for each state.
# Static Historical Snapshot Map
- Three maps at the bottom of the page depicting 1995 2008, and 2022
- Using the same color scale as the birthrate section of the interactive map
## How to Run
1. Clone the repository
2. Use the pre-cleaned versions of the data in the repo
3. Open index.html and run the live server
## Built With
- D3.js: SVG rendering, scales, and transitions
- R & Tidyvers: Data cleaning and merging
- CDC Wonder: Natality Source Data
- FRED: Labor Force Participation Data
- HTML/CSS: Page layout and styling

