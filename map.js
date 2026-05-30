// map.js
// Draws the interactive US birth rate tile map using D3
// Each state is a colored square, fill = birth count, border = abortion law status

// birth rate color scale (light = low births, dark = high births)
const rate_colors = ['#FED0BB', '#FCB9B2', '#B23A48', '#8C2F39', '#461220'];
// make sure text colors over the tiles are readable when colors change through the gradient
const rate_text_colors = ['#555', '#555', '#fff', '#fff', '#fff'];

// border colors for each abortion law category
const law_colors = {
  'protective': '#1982C4',
  'some-limits': '#8AC926',
  'restrictive': '#FFCA3A',
  'near-total-ban': '#FF595E'
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

// abortion law data split into two periods:
// before Dobbs (Roe v. Wade was still law) and after Dobbs (2022+)
// REPLACE WITH ACTUAL DATASET WITH THE CORRECT LABELS, THIS IS A PLACEHOLDER JUST TO SEE IF THE BOARDERS WORK
const pre_dobbs = {
  'protective': ['CA','CO','CT','DE','HI','IL','MA','MD','ME','MN','NJ','NM','NY','OR','VT','WA'],
  'some-limits': ['AK','AZ','FL','GA','IA','IN','KS','KY','LA','MI','MO','MS','MT','NC','ND','NE','NH','NV','OH','OK','PA','RI','SC','SD','TN','TX','UT','VA','WI','WV','WY'],
  'restrictive': ['AL','AR','ID'],
  'near-total-ban': []
};

// REPLACE WITH ACTUAL DATASET WITH THE CORRECT LABELS, THIS IS A PLACEHOLDER JUST TO SEE IF THE BOARDERS WORK
const post_dobbs = {
  'protective': ['CA','CO','CT','DE','HI','IL','MA','MD','ME','MN','NJ','NM','NY','OR','RI','VT','WA'],
  'some-limits': ['AK','KS','NH','NV','PA','VA'],
  'restrictive': ['AZ','FL','GA','IA','MT','NC','NE','OH','SC','UT'],
  'near-total-ban': ['AL','AR','ID','IN','KY','LA','MI','MO','MS','ND','OK','SD','TN','TX','WI','WV','WY']
};

// returns the abortion law category string for a given state and year
function get_law_category(abbr, year) {
  const laws = year >= 2022 ? post_dobbs : pre_dobbs;
  for (const category in laws) {
    if (laws[category].includes(abbr)) return category;
  }
  return 'unknown';
}

// global variables used across functions
let birth_data = {}; // { stateAbbr: { year: totalBirths } }
let all_years = [];
let current_year;
let color_scale;
let text_color_scale;
let state_tiles; // d3 selection of all state tile groups

// called from main.js once both CSVs are loaded
function init_map(natality_data) {
  console.log('loaded natality data:', natality_data.length, 'rows');

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

  // get the sorted list of all years in the dataset
  all_years = [...new Set(natality_data.map(d => +d['Year']))]
    .filter(y => !isNaN(y))
    .sort((a, b) => a - b);

  current_year = all_years[0];

  // collect all birth values to build the color scale
  const all_birth_values = [];
  Object.keys(birth_data).forEach(state => {
    Object.keys(birth_data[state]).forEach(yr => {
      all_birth_values.push(birth_data[state][yr]);
    });
  });

  // quantile scale splits data into equal-sized buckets for each color and text color as well
  color_scale = d3.scaleQuantile()
    .domain(all_birth_values)
    .range(rate_colors);

  text_color_scale = d3.scaleQuantile()
    .domain(all_birth_values)
    .range(rate_text_colors);

  draw_map();
  draw_legend();
  setup_slider();
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

  // show tooltip on hover with birth count and abortion law info for that state and year
  state_tiles.on('mouseover', function(event, d) {
    const births = birth_data[d.abbr] ? birth_data[d.abbr][current_year] : null;
    const cat = get_law_category(d.abbr, current_year);

    // position tooltip near mouse cursor and populate with info for the state when hovered
    tooltip.classed('visible', true)
      .html(
        `<strong>${d.abbr}</strong><br>` +
        `${births != null ? births.toLocaleString() + ' births' : 'No data'}<br>` +
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

// re-colors all tiles based on the current year
// called on initial draw and whenever the slider moves
function update_map() {
  if (!state_tiles) return;

  // color each tile based on birth count for that state and year
  state_tiles.select('rect')
    .attr('fill', d => {
      const births = birth_data[d.abbr] ? birth_data[d.abbr][current_year] : null;
      return births != null ? color_scale(births) : '#ccc';
    })
    // set border color based on abortion law category for that state and year
    .attr('stroke', d => {
      const cat = get_law_category(d.abbr, current_year);
      return law_colors[cat] || '#999';
    });

  // make text white on dark tiles and dark on light tiles
  state_tiles.select('text')
    .attr('fill', d => {
      const births = birth_data[d.abbr] ? birth_data[d.abbr][current_year] : null;
      return births != null ? text_color_scale(births) : '#333';
    })
    .text(d => d.abbr);

  // update the big year number on the right
  const year_label = document.getElementById('year-label');
  if (year_label) year_label.textContent = current_year;

  update_top_states();
}

// updates the "Most Births" ranking on the right side of the page
function update_top_states() {
  const container = document.getElementById('top-states');
  if (!container) return;

  // build a list of all states with birth data for this year
  const state_list = state_grid.map(s => ({
    abbr: s.abbr,
    births: birth_data[s.abbr] ? birth_data[s.abbr][current_year] : null
  }));

  // sort by births and take the top 5
  const top_5 = state_list
    .filter(s => s.births != null)
    .sort((a, b) => b.births - a.births)
    .slice(0, 5);

  // builds the add-on description for Top 5 birth state throughout the years
  let html = `<p class="sidebar-heading"> Top 5 Highest Births by State </p>`;

  // add each of the top 5 states with birth count to sidebar
  top_5.forEach((s, i) => {
    html += `<div class="sidebar-item">
      <span class="sidebar-rank">${i + 1}</span>
      <span class="sidebar-state">${s.abbr}</span>
      <span class="sidebar-value">${s.births.toLocaleString()}</span>
    </div>`;
  });

  // add a note about what the birth counts represent and why some states might rank higher than others
  html += `<p class="sidebar-note">Reflects total birth counts. Large states rank higher due to population size.</p>`;

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

// draws the legend (birth rate bar + law color key)
function draw_legend() {
  // gradient bar showing the birth rate color range
  const birth_rate_legend = document.getElementById('legend-rate');
  if (birth_rate_legend) {
    birth_rate_legend.innerHTML =
      `<div class="legend-gradient" style="background: linear-gradient(to right, ${rate_colors.join(', ')})"></div>` +
      `<div class="legend-gradient-labels"><span>lower</span><span>higher</span></div>`;
  }

  // colored squares showing each abortion law category
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
}

// expose init_map globally so main.js can call it after loading the CSV
const birth_rate_map = { init: init_map };
