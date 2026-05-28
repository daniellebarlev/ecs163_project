// main.js
// loads all the CSV files at once, then calls the init functions
// using Promise.all so we don't start drawing before the data is ready

Promise.all([
  d3.csv("data/final_natality_data.csv"),
  d3.csv("data/final_labor_force_data.csv")
]).then(([natality_data, labor_data]) => {
  birth_rate_map.init(natality_data);
  // TODO: pass labor_data to the bottom section visualization once that's built
});
