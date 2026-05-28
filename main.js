// Load CSV data
Promise.all([
  d3.csv("data/final_natality_data.csv"),
  d3.csv("data/final_labor_force_data.csv")
]).then(([natalityData, laborData]) => {
  console.log("Natality data loaded:", natalityData.length, "rows");
  console.log("Labor force data loaded:", laborData.length, "rows");

  // TODO: build visualizations with natalityData and laborData
});
