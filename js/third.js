// set dimensions and margins for the chart
const margin = { top: 180, right: 30, bottom: 100, left: 100};
const width = 1000 - margin.left - margin.right;
const height = 900 - margin.top - margin.bottom;

// set category
const catArry = [
  "Music", "Film & Animation", "Education", "Shows", "Entertainment",
  "Gaming", "People & Blogs", "Sports", "Autos & Vehicles", "Comedy",
  "Movies", "Howto & Style", "Nonprofits & Activism", "News & Politics",
  "Pets & Animals", "Science & Technology", "Travel & Events"
];
// color palette
const color = [
  '#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffdf33','#a65628','#f781bf','#999999',
  '#FF33B2','#CA33FF','#A2FF33','#FFB833','#6BFF33','#33FFD7','#3352FF','#E0FF33'
];

const chartTitle = "Cumulative Number of Subscribers by Category (2005 - 2021)";
const xLabel = "Video Count";
const ylabel = "Subscribers";

// set up the x and y scales
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// create the SVG element and append it to the chart container
const svg = d3.select("#chart-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// add the chart title to the SVG container
svg.append("text")
  .attr("x", width / 2)
  .attr("y", -120)
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .style("font-size", "24px")
  .text(chartTitle);

// add the y-axis label to the SVG
svg.append("text")
  .attr("x", -200)
  .attr("y", -100)
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text(ylabel);

// add the x-axis label to the SVG container
svg.append("text")
  .attr("x", width / 2)
  .attr("y", height + 20)
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .style("font-size", "16px")
  .text(xLabel);

// append tooltip
const tooltip = d3.select("#chart-container")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// load and process data
d3.csv("data/topSubscribed.csv").then(function (data) {
  // convert the Started year and video views to numbers
  data.forEach(d => {
      d.Subscribers = +d.Subscribers;
      d.videoCount = +d["Video Count"];
      d.rank = +d.Rank;
      d.channel = d["Youtube Channel"];
  });

  const subscribers = data.map(d =>  +d.Subscribers);
  const videoCount = data.map(d =>  +d["Video Count"]);

  // define initial x and y scales
  const xScale = d3.scaleLinear()
    .domain([d3.min(videoCount), d3.max(videoCount)])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([d3.min(subscribers), d3.max(subscribers)])
    .range([height, 0]);

  // add x and y axes
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale));

  svg.append("g")
    .call(d3.axisLeft(yScale));

  // create a lookup table to map each category to a color
  const colorLookup = {};
  catArry.forEach((category, index) => {
    colorLookup[category] = color[index];
  });

  // function to format numbers with commas
  function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // function to update the dots based on the checked categories
  function updateDots(checkedCategories) {
    const filteredData = data.filter(d => checkedCategories.includes(d.Category));
    // update the dots
    const dots = svg.selectAll("circle")
      .data(filteredData, d => d.Category);

    // update existing dots
    dots.attr("cx", (d) => xScale(d.videoCount))
      .attr("cy", (d) => yScale(d.Subscribers))
      .style("fill", d => colorLookup[d.Category]);

    // remove any extra dots if necessary
    dots.exit().remove();

    // add new dots if necessary
    dots.enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.videoCount))
      .attr("cy", (d) => yScale(d.Subscribers))
      .attr("r", 5)
      .style("fill", d => colorLookup[d.Category])
      .on("mouseover", (event, d) => { 
        // Show tooltip on mouseover
        const [x, y] = d3.pointer(event, this);
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html("Rank: " + d.rank + "<br>Youtube Channel: " + d.channel + "<br>Category: " 
                     + d.Category + "<br>Subscribers: " + formatNumberWithCommas(d.Subscribers) 
                     + "<br>Video Count: " + formatNumberWithCommas(d.videoCount))
          .style("left", (x + 10) + "px")
          .style("top", (y - 28) + "px");
      })
      .on("mouseout", () => {
        // hide tooltip on mouseout
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  }

  // create checkbox
  function createCheckboxes() {
    const checkboxContainer = d3.select(".checkbox-container");

    catArry.forEach((category, index) => {
      const checkboxDiv = checkboxContainer.append("div");
      checkboxDiv.append("input")
        .attr("type", "checkbox")
        .attr("name", "categories")
        .attr("class", "categories")
        .attr("value", index)
        .attr("checked", true);
      checkboxDiv.append("label")
        .text(category);
    });
  }

  // call the function to create and append the checkboxes
  createCheckboxes();

  // checkbox change event to update the chart
  d3.selectAll('.categories').on('change', function () {
    const checkedCategories = [];
    d3.selectAll('.categories').each(function () {
      // check if the checkbox is checked
      if (this.checked) {
        checkedCategories.push(catArry[+this.value]);
      }
    });

    updateDots(checkedCategories);
  });

  // call updateDots initially with all categories checked
  updateDots(catArry);
});