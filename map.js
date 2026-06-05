// map.js
// Draws the interactive US birth rate tile map using D3
// Each state is a colored square, fill = birth rate (per 1,000 women aged 15-44), border = abortion law status

// birth rate color scale (light = low births, dark = high births)
const rate_colors = ['#FED0BB', '#FCB9B2', '#B23A48', '#8C2F39', '#461220'];
// make sure text colors over the tiles are readable when colors change through the gradient
const rate_text_colors = ['#555', '#555', '#fff', '#fff', '#fff'];

// labor force color scale (blue gradient, light = low participation, dark = high)
const labor_colors = ['#E3F2FD', '#90CAF9', '#42A5F5', '#1E88E5', '#1565C0'];
const labor_text_colors = ['#555', '#555', '#fff', '#fff', '#fff'];

// education color scale (teal gradient, light = low attainment, dark = high)
const education_colors = ['#E0F2F1', '#80CBC4', '#26A69A', '#00897B', '#00695C'];
const education_text_colors = ['#555', '#555', '#fff', '#fff', '#fff'];

// metadata for each fill mode — keeps the toggle/legend/tooltip logic in one place
const fill_modes = {
  'birth-rate': {
    label: 'Birth Rate',
    legend_title: 'Birth rate',
    tooltip_unit: 'per 1,000 women',
    value_format: v => v.toFixed(1),
    sidebar_heading: 'Top 5 Highest Birth Rates',
    sidebar_note: 'Births per 1,000 women aged 15-44. Higher rates indicate more births relative to the reproductive-age population.'
  },
  'labor-force': {
    label: 'Labor Force',
    legend_title: 'Labor force participation',
    tooltip_unit: 'participation',
    value_format: v => v.toFixed(1) + '%',
    sidebar_heading: 'Top 5 Highest Labor Force Participation',
    sidebar_note: 'Share of working-age women in the labor force (employed or actively seeking work). Source: FRED.'
  },
  'education': {
    label: 'Education',
    legend_title: "Women with bachelor's degree",
    tooltip_unit: "with bachelor's",
    value_format: v => v.toFixed(1) + '%',
    sidebar_heading: "Top 5 Highest Bachelor's Attainment",
    sidebar_note: "Share of women aged 25+ with a bachelor's degree or higher. Static 2020 snapshot — does not vary by year yet."
  }
};

// border colors for each abortion law category
// matches the green/light-green/orange/purple scheme from the proposal/progress report
const law_colors = {
  'protective': '#2E7D32',
  'some-limits': '#A5D6A7',
  'restrictive': '#FB8C00',
  'near-total-ban': '#7B1FA2'
};

// readable labels for each abortion law category
const law_labels = {
  'protective': 'Protective',
  'some-limits': 'Some limits',
  'restrictive': 'Restrictive',
  'near-total-ban': 'Near-total ban'
};

// grid positions for all 50 states
// col = horizontal position, row = vertical position on the tile map
// svg stores as (col, row)
const state_grid = [
  { abbr: 'AK', col: 0,  row: 0 }, { abbr: 'ME', col: 11, row: 0 },
  { abbr: 'VT', col: 10, row: 1 }, { abbr: 'NH', col: 11, row: 1 },
  { abbr: 'WA', col: 1,  row: 2 }, { abbr: 'ID', col: 2,  row: 2 },
  { abbr: 'MT', col: 3,  row: 2 }, { abbr: 'ND', col: 4,  row: 2 },
  { abbr: 'MN', col: 5,  row: 2 }, { abbr: 'WI', col: 6,  row: 2 },
  { abbr: 'MI', col: 8,  row: 2 }, { abbr: 'NY', col: 9,  row: 2 },
  { abbr: 'MA', col: 10, row: 2 },
  { abbr: 'OR', col: 1,  row: 3 }, { abbr: 'UT', col: 2,  row: 3 },
  { abbr: 'WY', col: 3,  row: 3 }, { abbr: 'SD', col: 4,  row: 3 },
  { abbr: 'IA', col: 5,  row: 3 }, { abbr: 'IL', col: 6,  row: 3 },
  { abbr: 'IN', col: 7,  row: 3 }, { abbr: 'OH', col: 8,  row: 3 },
  { abbr: 'PA', col: 9,  row: 3 }, { abbr: 'NJ', col: 10, row: 3 },
  { abbr: 'CT', col: 11, row: 3 }, { abbr: 'RI', col: 12, row: 3 },
  { abbr: 'CA', col: 1,  row: 4 }, { abbr: 'NV', col: 2,  row: 4 },
  { abbr: 'CO', col: 3,  row: 4 }, { abbr: 'NE', col: 4,  row: 4 },
  { abbr: 'MO', col: 5,  row: 4 }, { abbr: 'KY', col: 6,  row: 4 },
  { abbr: 'WV', col: 7,  row: 4 }, { abbr: 'VA', col: 8,  row: 4 },
  { abbr: 'MD', col: 9,  row: 4 }, { abbr: 'DE', col: 10, row: 4 },
  { abbr: 'AZ', col: 2,  row: 5 }, { abbr: 'NM', col: 3,  row: 5 },
  { abbr: 'KS', col: 4,  row: 5 }, { abbr: 'AR', col: 5,  row: 5 },
  { abbr: 'TN', col: 6,  row: 5 }, { abbr: 'NC', col: 7,  row: 5 },
  { abbr: 'SC', col: 8,  row: 5 },
  { abbr: 'HI', col: 0,  row: 6 },
  { abbr: 'OK', col: 4,  row: 6 }, { abbr: 'LA', col: 5,  row: 6 },
  { abbr: 'MS', col: 6,  row: 6 }, { abbr: 'AL', col: 7,  row: 6 },
  { abbr: 'GA', col: 8,  row: 6 },
  { abbr: 'TX', col: 4,  row: 7 }, { abbr: 'FL', col: 9,  row: 7 }
];

// the CSV uses full state names so we need to convert them to abbreviations
const state_name_to_abbr = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD', 'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY'
};

// female population aged 15-44 by state (approximate 2020 census values, in thousands)
// used as the denominator to convert raw birth counts into "births per 1,000 women"
// TODO: replace with year-varying Census ACS data so the denominator changes over time
//       (held constant for now, which slightly distorts rates in early and late years)
const state_pop_15_44 = {
  'AL': 935,  'AK': 154,  'AZ': 1500, 'AR': 580,  'CA': 8050, 'CO': 1200, 'CT': 660,  'DE': 175,
  'FL': 4040, 'GA': 2120, 'HI': 270,  'ID': 380,  'IL': 2515, 'IN': 1335, 'IA': 615,  'KS': 575,
  'KY': 855,  'LA': 920,  'ME': 240,  'MD': 1180, 'MA': 1395, 'MI': 1900, 'MN': 1100, 'MS': 580,
  'MO': 1185, 'MT': 195,  'NE': 390,  'NV': 625,  'NH': 250,  'NJ': 1740, 'NM': 410,  'NY': 3895,
  'NC': 2020, 'ND': 155,  'OH': 2240, 'OK': 760,  'OR': 800,  'PA': 2455, 'RI': 215,  'SC': 985,
  'SD': 175,  'TN': 1310, 'TX': 6160, 'UT': 695,  'VT': 115,  'VA': 1660, 'WA': 1490, 'WV': 340,
  'WI': 1100, 'WY': 110
};

// approximate share of women aged 25+ with a bachelor's degree or higher (percent)
// static snapshot based on ~2020 Census ACS estimates
// TODO: replace with year-varying World Population Review / Census ACS data so the
//       education overlay actually changes across the scrubber's 30-year range
const education_attainment = {
  'AL': 27.5, 'AK': 31.2, 'AZ': 31.5, 'AR': 24.5, 'CA': 36.0, 'CO': 43.5, 'CT': 41.5, 'DE': 34.2,
  'FL': 32.5, 'GA': 33.7, 'HI': 35.5, 'ID': 30.2, 'IL': 37.7, 'IN': 28.5, 'IA': 31.0, 'KS': 35.0,
  'KY': 26.0, 'LA': 26.5, 'ME': 35.5, 'MD': 42.5, 'MA': 47.5, 'MI': 31.5, 'MN': 39.5, 'MS': 24.5,
  'MO': 32.0, 'MT': 35.0, 'NE': 34.0, 'NV': 27.0, 'NH': 40.5, 'NJ': 42.0, 'NM': 30.5, 'NY': 39.5,
  'NC': 34.5, 'ND': 32.0, 'OH': 30.5, 'OK': 27.5, 'OR': 37.0, 'PA': 35.0, 'RI': 36.5, 'SC': 31.0,
  'SD': 31.5, 'TN': 30.5, 'TX': 33.5, 'UT': 36.0, 'VT': 41.0, 'VA': 42.0, 'WA': 39.5, 'WV': 22.5,
  'WI': 32.5, 'WY': 30.5
};

// abortion law data structured as year-varying periods per state
// each state has an array of [start_year, category] tuples in chronological order
// the lookup finds the latest entry where start_year <= the requested year
// NOTE: these categorizations are approximate based on broad historical patterns
// (Roe-era restrictions, the 2011+ TRAP-law wave, Dobbs trigger laws in 2022).
// TODO: replace with the actual LawAtlas dataset once it's cleaned per state-year.
const law_data = {
  // West / Pacific
  'CA': [[1995, 'protective']],
  'OR': [[1995, 'protective']],
  'WA': [[1995, 'protective']],
  'HI': [[1995, 'protective']],
  'AK': [[1995, 'protective']],

  // Northeast
  'CT': [[1995, 'protective']],
  'MA': [[1995, 'protective']],
  'NY': [[1995, 'protective']],
  'NJ': [[1995, 'protective']],
  'VT': [[1995, 'protective']],
  'ME': [[1995, 'some-limits'], [2019, 'protective']],
  'RI': [[1995, 'some-limits'], [2019, 'protective']],
  'NH': [[1995, 'some-limits']],

  // Mid-Atlantic
  'MD': [[1995, 'protective']],
  'DE': [[1995, 'some-limits'], [2017, 'protective']],
  'PA': [[1995, 'some-limits']],
  'VA': [[1995, 'some-limits'], [2020, 'protective']],
  'WV': [[1995, 'some-limits'], [2022, 'near-total-ban']],

  // Upper Midwest
  'IL': [[1995, 'some-limits'], [2017, 'protective']],
  'MN': [[1995, 'some-limits'], [2023, 'protective']],
  'WI': [[1995, 'some-limits'], [2011, 'restrictive'], [2022, 'near-total-ban'], [2023, 'restrictive']],
  'MI': [[1995, 'some-limits'], [2022, 'restrictive'], [2023, 'protective']],
  'IA': [[1995, 'some-limits'], [2017, 'restrictive']],
  'OH': [[1995, 'some-limits'], [2011, 'restrictive']],
  'IN': [[1995, 'some-limits'], [2011, 'restrictive'], [2022, 'near-total-ban']],

  // Mountain / Plains
  'AZ': [[1995, 'some-limits'], [2011, 'restrictive'], [2022, 'near-total-ban'], [2024, 'restrictive']],
  'UT': [[1995, 'some-limits'], [2011, 'restrictive']],
  'NM': [[1995, 'some-limits'], [2021, 'protective']],
  'CO': [[1995, 'some-limits'], [2022, 'protective']],
  'NV': [[1995, 'some-limits'], [2019, 'protective']],
  'WY': [[1995, 'some-limits'], [2011, 'restrictive']],
  'MT': [[1995, 'some-limits'], [2023, 'restrictive']],
  'ID': [[1995, 'some-limits'], [2011, 'restrictive'], [2022, 'near-total-ban']],
  'ND': [[1995, 'some-limits'], [2011, 'restrictive'], [2022, 'near-total-ban']],
  'SD': [[1995, 'some-limits'], [2005, 'restrictive'], [2022, 'near-total-ban']],
  'NE': [[1995, 'some-limits'], [2010, 'restrictive']],
  'KS': [[1995, 'some-limits'], [2011, 'restrictive']],

  // South
  'TX': [[1995, 'some-limits'], [2003, 'restrictive'], [2022, 'near-total-ban']],
  'OK': [[1995, 'some-limits'], [2011, 'restrictive'], [2022, 'near-total-ban']],
  'AR': [[1995, 'some-limits'], [2011, 'restrictive'], [2022, 'near-total-ban']],
  'LA': [[1995, 'some-limits'], [2011, 'restrictive'], [2022, 'near-total-ban']],
  'MS': [[1995, 'restrictive'], [2022, 'near-total-ban']],
  'AL': [[1995, 'some-limits'], [2011, 'restrictive'], [2022, 'near-total-ban']],
  'TN': [[1995, 'some-limits'], [2011, 'restrictive'], [2022, 'near-total-ban']],
  'KY': [[1995, 'some-limits'], [2011, 'restrictive'], [2022, 'near-total-ban']],
  'NC': [[1995, 'some-limits'], [2013, 'restrictive']],
  'SC': [[1995, 'some-limits'], [2011, 'restrictive']],
  'GA': [[1995, 'some-limits'], [2011, 'restrictive']],
  'FL': [[1995, 'some-limits'], [2022, 'restrictive']],
  'MO': [[1995, 'restrictive'], [2022, 'near-total-ban']]
};

// returns the abortion law category string for a given state and year
function get_law_category(abbr, year) {
  const history = law_data[abbr];
  if (!history) return 'unknown';
  // periods are sorted ascending, so walk forward until start_year exceeds the requested year
  let category = history[0][1];
  for (const [start_year, cat] of history) {
    if (start_year <= year) category = cat;
    else break;
  }
  return category;
}

// global variables used across functions
let birth_data = {}; // { stateAbbr: { year: birthRate } }
let labor_data = {}; // { stateAbbr: { year: participationPct } }
let edu_data = {};   // { stateAbbr: { year: bachelorsPct } }
let all_years = [];
let current_year;
let current_fill = 'birth-rate'; // which dataset drives the tile fill ('birth-rate' | 'labor-force' | 'education')
let scales = {}; // { 'birth-rate': {color, text}, 'labor-force': {color, text}, 'education': {color, text} }
let state_tiles; // d3 selection of all state tile groups

// called from main.js once both CSVs are loaded
function init_map(natality_data, labor_force_data) {
  console.log('loaded natality data:', natality_data.length, 'rows');
  console.log('loaded labor force data:', labor_force_data.length, 'rows');

  // aggregate births by state and year
  // the CSV has multiple rows per state/year (one per education level) so we sum them
  natality_data.forEach(d => {
    const abbr = state_name_to_abbr[d['State']];
    // converts year and birth counts from string to number
    const year = +d['Year'];
    const births = +d['Births'];

    // skip any rows with missing/invalid data
    if (!abbr || isNaN(year) || isNaN(births)) return;

    if (!birth_data[abbr]) birth_data[abbr] = {};
    if (!birth_data[abbr][year]) birth_data[abbr][year] = 0;
    birth_data[abbr][year] += births;
  });

  // convert raw birth totals into "births per 1,000 women aged 15-44"
  // divides by the female reproductive-age population so large states don't dominate
  Object.keys(birth_data).forEach(abbr => {
    const pop = state_pop_15_44[abbr];
    if (!pop) return; // skip states without a population entry (shouldn't happen, but just in case)
    Object.keys(birth_data[abbr]).forEach(yr => {
      // pop is in thousands so dividing gives births per 1,000 women directly
      birth_data[abbr][yr] = birth_data[abbr][yr] / pop;
    });
  });

  // labor force CSV is in wide format: one row per year, one column per state
  // reshape it into the same { abbr: { year: value } } shape as birth_data so everything downstream is uniform
  labor_force_data.forEach(row => {
    const year = +row['Date'];
    if (isNaN(year)) return;
    Object.keys(row).forEach(state_name => {
      if (state_name === 'Date') return;
      const abbr = state_name_to_abbr[state_name];
      const val = +row[state_name];
      if (!abbr || isNaN(val)) return;
      if (!labor_data[abbr]) labor_data[abbr] = {};
      labor_data[abbr][year] = val;
    });
  });

  // get the sorted list of all years in the dataset (using natality as the canonical range)
  all_years = [...new Set(natality_data.map(d => +d['Year']))]
    .filter(y => !isNaN(y))
    .sort((a, b) => a - b);

  current_year = all_years[0];

  // education data is currently a static lookup — populate it as state x year so update_map can stay generic
  // every year gets the same value until year-varying data is wired in
  Object.keys(education_attainment).forEach(abbr => {
    edu_data[abbr] = {};
    all_years.forEach(yr => {
      edu_data[abbr][yr] = education_attainment[abbr];
    });
  });

  // build color + text scales for each fill mode using the same quantile-bucketing approach
  scales['birth-rate']  = make_scales(birth_data, rate_colors, rate_text_colors);
  scales['labor-force'] = make_scales(labor_data, labor_colors, labor_text_colors);
  scales['education']   = make_scales(edu_data, education_colors, education_text_colors);

  draw_map();
  draw_legend();
  setup_slider();
  setup_fill_toggle();
}

// helper: builds a {color, text} pair of quantile scales over all values in a state x year dataset
function make_scales(dataset, color_range, text_range) {
  const values = [];
  Object.keys(dataset).forEach(abbr => {
    Object.keys(dataset[abbr]).forEach(yr => {
      values.push(dataset[abbr][yr]);
    });
  });
  return {
    color: d3.scaleQuantile().domain(values).range(color_range),
    text:  d3.scaleQuantile().domain(values).range(text_range)
  };
}

// creates the SVG and draws all state tiles
function draw_map() {
  const tile_size = 54;
  const gap = 7;
  const step = tile_size + gap;
  const width = 13 * step;
  const height = 8 * step;
  const padding = 4; // extra space so borders on edge tiles don't get clipped

  // constrain the slider to the same width as the map
  const map_wrapper = document.querySelector('.map-and-slider');
  if (map_wrapper) map_wrapper.style.maxWidth = width + 'px';

  // creates SVG elements and groups for each state tile based on grid position
  // viewBox has extra padding to not cut off borders on edge tiles
  // preserveAspectRatio makes sure the whole map fits within the container and scales down on smaller screens maintaining shape
  const svg = d3.select('#map-container')
    .append('svg')
    .attr('viewBox', `-${padding} -${padding} ${width + padding * 2} ${height + padding * 2}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('max-width', width + 'px');

  // all tiles go into group to make it easier to transform/move everything together
  const g = svg.append('g');

  // create a <g> group for each state (holds the rect + text)
  state_tiles = g.selectAll('.state-tile')
    .data(state_grid)
    .join('g')
    .attr('class', 'state-tile')
    .attr('transform', d => `translate(${d.col * step}, ${d.row * step})`);

  // add the colored square with rounded corners and a border whose color depends on the abortion law category
  state_tiles.append('rect')
    .attr('width', tile_size)
    .attr('height', tile_size)
    .attr('rx', 4)
    .attr('ry', 4)
    .attr('stroke-width', 3);

  // add the state abbreviation label
  state_tiles.append('text')
    .attr('x', tile_size / 2)
    .attr('y', tile_size / 2 + 1)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', '13px')
    .attr('font-family', 'sans-serif')
    .attr('font-weight', 'bold')
    .attr('pointer-events', 'none');

  // create tooltip div (hidden until hover)
  const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'map-tooltip');

  // show tooltip on hover with the active fill's value and abortion law info for that state and year
  state_tiles.on('mouseover', function(event, d) {
    const ds = active_dataset();
    const val = ds[d.abbr] ? ds[d.abbr][current_year] : null;
    const mode = fill_modes[current_fill];
    const cat = get_law_category(d.abbr, current_year);

    // position tooltip near mouse cursor and populate with info for the state when hovered
    tooltip.classed('visible', true)
      .html(
        `<strong>${d.abbr}</strong><br>` +
        `${val != null ? mode.value_format(val) + ' ' + mode.tooltip_unit : 'No data'}<br>` +
        `<span style="color:${law_colors[cat] || '#999'}">${law_labels[cat] || cat}</span>`
      );
  });

  // tooltip position when mouse moves within the tile (follows cursor with offset)
  state_tiles.on('mousemove', function(event) {
    tooltip
      .style('left', (event.pageX + 14) + 'px')
      .style('top', (event.pageY - 36) + 'px');
  });

  // hides tooltip when mouse leaves tile
  state_tiles.on('mouseout', function() {
    tooltip.classed('visible', false);
  });

  // color everything for the first year
  update_map();
}

// re-colors all tiles based on the current year and active fill mode
// called on initial draw, whenever the slider moves, and whenever the fill toggle changes
function update_map() {
  if (!state_tiles) return;

  // pick the dataset + scales for the active fill mode
  const ds = active_dataset();
  const scale = scales[current_fill].color;
  const text_scale = scales[current_fill].text;

  // color each tile based on the active variable's value for that state and year
  // smooth transition between years so color changes feel like motion, not a cut
  state_tiles.select('rect')
    .transition()
    .duration(200)
    .attr('fill', d => {
      const val = ds[d.abbr] ? ds[d.abbr][current_year] : null;
      return val != null ? scale(val) : '#ccc';
    })
    // set border color based on abortion law category for that state and year
    .attr('stroke', d => {
      const cat = get_law_category(d.abbr, current_year);
      return law_colors[cat] || '#999';
    });

  // make text white on dark tiles and dark on light tiles
  state_tiles.select('text')
    .attr('fill', d => {
      const val = ds[d.abbr] ? ds[d.abbr][current_year] : null;
      return val != null ? text_scale(val) : '#333';
    })
    .text(d => d.abbr);

  // update the big year number on the right
  const year_label = document.getElementById('year-label');
  if (year_label) year_label.textContent = current_year;

  update_top_states();
}

// helper: returns the dataset object that corresponds to the active fill mode
function active_dataset() {
  if (current_fill === 'labor-force') return labor_data;
  if (current_fill === 'education')   return edu_data;
  return birth_data;
}

// updates the "Top 5" ranking on the right side of the page based on the active fill mode
function update_top_states() {
  const container = document.getElementById('top-states');
  if (!container) return;

  const ds = active_dataset();
  const mode = fill_modes[current_fill];

  // build a list of all states with data for this year/fill
  const state_list = state_grid.map(s => ({
    abbr: s.abbr,
    val: ds[s.abbr] ? ds[s.abbr][current_year] : null
  }));

  // sort by value and take the top 5
  const top_5 = state_list
    .filter(s => s.val != null)
    .sort((a, b) => b.val - a.val)
    .slice(0, 5);

  // builds the sidebar list using the heading/format from the active fill mode
  let html = `<p class="sidebar-heading"> ${mode.sidebar_heading} </p>`;

  // add each of the top 5 states with the appropriate formatted value
  top_5.forEach((s, i) => {
    html += `<div class="sidebar-item">
      <span class="sidebar-rank">${i + 1}</span>
      <span class="sidebar-state">${s.abbr}</span>
      <span class="sidebar-value">${mode.value_format(s.val)}</span>
    </div>`;
  });

  // add a note explaining what the values represent for this fill mode
  html += `<p class="sidebar-note">${mode.sidebar_note}</p>`;

  container.innerHTML = html;
}

// wires up the year slider and adds tick marks below it
function setup_slider() {
  // set slider min/max/initial values based on the years in the dataset
  const slider = document.getElementById('year-slider');
  if (!slider) return;

  slider.min = all_years[0];
  slider.max = all_years[all_years.length - 1];
  slider.value = current_year;

  // updates years as slider moves and updates map with correct colors
  slider.addEventListener('input', function(e) {
    current_year = +e.target.value;
    update_map();
  });

  // add a year label every 5 years as tick marks under the slider
  const ticks_container = document.getElementById('slider-ticks');
  if (!ticks_container) return;

  // get total range of years to calculate even number of ticks between years
  const year_range = all_years[all_years.length - 1] - all_years[0];

  // convert the year to percentage along the slider
  all_years.filter(y => y % 5 === 0).forEach(y => {
    const pct = ((y - all_years[0]) / year_range) * 100;
    // creates element for each tick, position it at the right percentage along slider and add the year label
    const tick = document.createElement('span');
    tick.className = 'tick';
    tick.style.left = pct + '%';
    tick.textContent = y;
    ticks_container.appendChild(tick);
  });
}

// draws the legend (fill-mode gradient bar + law color key) and stores hooks for live updates
function draw_legend() {
  // the law color key only needs to be drawn once — it doesn't change with the fill mode
  const abortion_law_legend = document.getElementById('legend-law');
  if (abortion_law_legend) {
    Object.keys(law_colors).forEach(cat => {
      const item = document.createElement('div');
      item.className = 'legend-law-item';
      item.innerHTML =
        `<div class="legend-swatch" style="border-color: ${law_colors[cat]}"></div>` +
        `<span>${law_labels[cat]}</span>`;
      abortion_law_legend.appendChild(item);
    });
  }

  // the fill gradient bar swaps colors when the toggle changes, so draw it through update_legend
  update_legend();
}

// updates the fill-rate legend section (gradient + title) for the active fill mode
function update_legend() {
  const mode = fill_modes[current_fill];

  // swap the legend group title to match the active variable
  const group_title = document.getElementById('legend-rate-title');
  if (group_title) group_title.textContent = mode.legend_title;

  // pick the color ramp that matches the active fill
  const ramp =
    current_fill === 'labor-force' ? labor_colors :
    current_fill === 'education'   ? education_colors :
                                     rate_colors;

  // gradient bar showing the active variable's color range
  const birth_rate_legend = document.getElementById('legend-rate');
  if (birth_rate_legend) {
    birth_rate_legend.innerHTML =
      `<div class="legend-gradient" style="background: linear-gradient(to right, ${ramp.join(', ')})"></div>` +
      `<div class="legend-gradient-labels"><span>lower</span><span>higher</span></div>`;
  }
}

// wires up the three fill-mode buttons (Birth Rate / Labor Force / Education)
// clicking one swaps the active dataset, recolors the map, and updates the legend + sidebar
function setup_fill_toggle() {
  const buttons = document.querySelectorAll('.fill-btn');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', function() {
      const target = btn.getAttribute('data-fill');
      if (!target || target === current_fill) return;

      current_fill = target;

      // update which button looks active
      buttons.forEach(b => b.classList.toggle('active', b === btn));

      // redraw map + legend with the new fill
      update_map();
      update_legend();
    });
  });
}

// expose init_map globally so main.js can call it after loading the CSV
const birth_rate_map = { init: init_map };

//Draws three static maps for historical turning point years, 1995, 2008, and 2022

//Birth rates per 1,000 women aged 15-44 from the final_natality_data.csv
//using the same denominators from the above map
const historicalSnapShotBirthRates = {
  AK: {1995: 66.5, 2008: 74.3, 2022: 60.8}, AL: {1995: 64.5, 2008: 69.0, 2022: 62.2}, AR: {1995: 60.6, 2008: 70.1, 2022: 61.2}, AZ: {1995: 48.3, 2008: 66.3, 2022: 52.4},
  CA: {1995: 68.6, 2008: 68.5, 2022: 52.1}, CO: {1995: 45.3, 2008: 58.4, 2022: 52.0}, CT: {1995: 67.2, 2008: 61.2, 2022: 53.5}, DE: {1995: 58.7, 2008: 69.1, 2022: 61.8},
  FL: {1995: 46.7, 2008: 57.3, 2022: 55.6}, GA: {1995: 53.0, 2008: 69.2, 2022: 59.5}, HI: {1995: 68.9, 2008: 72.2, 2022: 57.5}, IA: {1995: 59.9, 2008: 65.4, 2022: 59.4},
  ID: {1995: 47.5, 2008: 66.2, 2022: 58.9}, IL: {1995: 73.9, 2008: 70.3, 2022: 51.0}, IN: {1995: 62.0, 2008: 66.5, 2022: 59.7}, KS: {1995: 64.7, 2008: 72.8, 2022: 59.8},
  KY: {1995: 61.3, 2008: 68.3, 2022: 61.2}, LA: {1995: 71.3, 2008: 70.9, 2022: 61.4}, MA: {1995: 58.5, 2008: 55.2, 2022: 49.2}, MD: {1995: 61.4, 2008: 65.5, 2022: 58.3},
  ME: {1995: 57.9, 2008: 56.7, 2022: 50.4}, MI: {1995: 70.9, 2008: 63.8, 2022: 53.9}, MN: {1995: 57.5, 2008: 65.8, 2022: 58.2}, MO: {1995: 61.6, 2008: 68.3, 2022: 58.2},
  MS: {1995: 71.3, 2008: 77.5, 2022: 59.8}, MT: {1995: 57.1, 2008: 64.6, 2022: 57.3}, NC: {1995: 50.3, 2008: 64.8, 2022: 60.2}, ND: {1995: 54.7, 2008: 57.7, 2022: 61.7},
  NE: {1995: 59.6, 2008: 69.2, 2022: 62.4}, NH: {1995: 58.7, 2008: 54.7, 2022: 48.3}, NJ: {1995: 66.0, 2008: 64.8, 2022: 59.1}, NM: {1995: 65.7, 2008: 73.6, 2022: 52.7},
  NV: {1995: 40.1, 2008: 63.2, 2022: 53.1}, NY: {1995: 69.7, 2008: 64.3, 2022: 53.3}, OH: {1995: 68.8, 2008: 66.4, 2022: 57.2}, OK: {1995: 60.1, 2008: 72.1, 2022: 63.6},
  OR: {1995: 53.5, 2008: 61.4, 2022: 49.4}, PA: {1995: 61.9, 2008: 60.8, 2022: 53.1}, RI: {1995: 59.4, 2008: 56.0, 2022: 47.8}, SC: {1995: 51.7, 2008: 64.0, 2022: 58.7},
  SD: {1995: 59.9, 2008: 69.0, 2022: 64.0}, TN: {1995: 55.9, 2008: 65.3, 2022: 62.8}, TX: {1995: 52.4, 2008: 65.8, 2022: 63.3}, UT: {1995: 56.9, 2008: 80.0, 2022: 65.9},
  VA: {1995: 55.8, 2008: 64.3, 2022: 57.6}, VT: {1995: 59.0, 2008: 55.1, 2022: 46.2}, WA: {1995: 51.8, 2008: 60.6, 2022: 55.9}, WI: {1995: 61.3, 2008: 65.7, 2022: 54.6},
  WV: {1995: 62.2, 2008: 63.2, 2022: 49.8}, WY: {1995: 56.9, 2008: 73.1, 2022: 55.0},
}; // for the three highlighted years: adding the percentage of birthrates

const historicalSnapshotPanels = [
  {year: 1995, sectionID: 'historical-years-snapshot-map-1995'}, 
  {year: 2008, sectionID: 'historical-years-snapshot-map-2008'},
  {year: 2022, sectionID: 'historical-years-snapshot-map-2022'}]; //getting the keys for the years and getting the id tags (same as the html)

function drawingTheSnapshotMaps() {
  const allValues = []; // creating an empty array to hold all key values
  const usStates = Object.keys(historicalSnapShotBirthRates); // creating object keys for the data

  for (let i = 0; i < 50; ++i) { // iterating through all 50 states
    const stateYears = Object.keys(historicalSnapShotBirthRates[usStates[i]]); // get the year for each state

    for (let j = 0; j < 50; ++j) { //getting the birthrate percentage for each year
      allValues.push(historicalSnapShotBirthRates[usStates[i]][stateYears[j]]);
    }
  } // putting all the values into an array

  const createColorScaleForStaticMaps = d3.scaleQuantile()
    .domain(allValues) //making sure the color scale includes all tiles
    .range(rate_colors); // making the color scale for the map

  const createColorScaleForTileText = d3.scaleQuantile()
    .domain(allValues) //making sure the color scale includes all the files
    .range(rate_text_colors); //making the color scale for the Borders

  for (let pi = 0; pi < 3; ++pi) { // iterating through the 3 historical timepoints
    const snapshot = historicalSnapshotPanels[pi]; //getting the specific time panel
    const section = document.getElementById(snapshot.sectionID); // getting the section id of the historical year
    const tile_size = 50; // creating the tile size
    const gap = 5; // gap between the tiles
    const step = tile_size + gap; //creating the proper spacing
    const columns = 15;
    const rows = 8;
    const width = columns * step;
    const height = rows * step; // all the above 4 lines create the proper alignment on for the static map
    const padding = 5;

    const svg = d3.select(section)
      .append("svg")
      .attr("viewBox",`-${padding} -${padding} ${width + padding * 2} ${height + padding * 2}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%"); // making sure everything is properly sized

    const g = svg.append("g");

    for (let stateIndex = 0; stateIndex < 50; ++stateIndex) { // iterating through all 50 states
      const state = state_grid[stateIndex]; // gets the current state in the loop
      const check = historicalSnapShotBirthRates[state.abbr][snapshot.year]; // gets the birth rate for each state to the corrsponding year
      const combine = get_law_category(state.abbr, snapshot.year); // calling the helper function to return the abortion policy, state, and year
      const fillColor = createColorScaleForStaticMaps(check); // filling the maps with the appropriate colors
      const strokeColor = law_colors[combine]; // making the border color the category color
      const textFill = createColorScaleForTileText(check); // making the text in the panels follow the proper color scale so that is readable
    
      const makeTile = g.append("g")
        .attr("transform", `translate(${state.col * step}, ${state.row * step})`); // adding the heat maps for the 3 historical years
    
      makeTile.append("rect")
        .attr("width", tile_size)
        .attr("height", tile_size)
        .attr("rx", 4)
        .attr("ry", 4) // these two lines round the edges of the rectangles slightly
        .attr("stroke-width", 4)
        .attr("fill", fillColor)
        .attr("stroke", strokeColor); // adding the heat rectangles for each map
    
      makeTile.append("text")
        .attr("x", tile_size / 2)
        .attr("y", tile_size / 2 + 1)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "11px")
        .attr("font-family", "sans-serif")
        .attr("font-weight", "bold")
        .attr("fill", textFill)
        .text(state.abbr); // adding the text to each rectangle
    }
  }
}

drawingTheSnapshotMaps();
