// set dimensions and margins for the chart
const margin = { top: 180, right: 30, bottom: 50, left: 110};
const width = 1000 - margin.left - margin.right;
const height = 900 - margin.top - margin.bottom;

// set years
const yearBegin = 2005;
const yearEnd = 2021;
let i = 0;
const yearArry = [];
for (let j = yearBegin; j <= yearEnd; j++) {
    yearArry[i] = j;
    i++
}

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

const sumCats = [];
const checkedCategories = [];
for (let i = 0; i < catArry.length; i++) {
    checkedCategories.push(i);
}

const chartTitle = "Cumulative Number of Video Views by Category (2005 - 2021)";
const xLabel = "Year";
const ylabel = "Running Sum of Video Views";


// set up the x and y scales
const x = d3.scaleTime()
  .range([0, width]);

const y = d3.scaleLinear()
  .range([height, 0]);

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
    .attr("x", -280)
    .attr("y", -110)
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

// load and process data
d3.csv("data/topSubscribed.csv").then(function (data) {

    // convert the Started year and video views to numbers
    data.forEach(d => {
        console.log(d["Video Views"]);
        d.Started = +d.Started;
        d["Video Views"] = +d["Video Views"];
    });

    // convert the Started year and VideoViews to numbers
    for (let i = 0; i < catArry.length; i++) {
        let sum = 0;
        const sumByYear = [];
        for(let j = 0; j < yearArry.length; j++) {
            data.forEach(d => {
                d["Video Views"] = +d["Video Views"];
                // cumulate number variables
                if (d.Category == catArry[i] && d.Started == yearArry[j]) {
                    sum += d["Video Views"];
                    //sumSubs.push(sum);
                }
            })
            sumByYear.push(sum);
        }
        sumCats.push(sumByYear)
    };

    // define the x and y domains
    x.domain(d3.extent(yearArry));
    y.domain([0, d3.max(sumCats[0])]);

    // add the x-axis
    svg.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x)
       .tickValues(yearArry)
       .tickFormat(d3.format("d")));

    // add the y-axis
    svg.append("g")
      .call(d3.axisLeft(y))

    // create the line generator
    function drawLine(catNum) {
        const line = d3.line()
            .x((d, i) => x(yearArry[i]))
            .y((d, i) => y(sumCats[catNum][i]));
        return line;
    }
    // function to format numbers with commas
    function formatNumberWithCommas(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // add the line path to the SVG element
    function initChart(catNum) {

        for (let k = 0; k < catNum.length; k++) {

           svg.append("path")
                .datum(catNum)
                .attr("class", "line")
                .attr("fill", "none")
                .attr("stroke", "#85bb65")
                .attr("stroke-width", 2)
                .attr("d", drawLine(catNum[k]))
                .attr("stroke", (d) => color[catNum[k]]);

            svg.selectAll("dot")
                .data(yearArry)
                .enter()
                .append("circle")
                .attr("class", "dot")
                .attr("cx", (d, i) => x(yearArry[i]))
                .attr("cy", (d, i) => y(sumCats[catNum[k]][i]))
                .attr("r", 2)
                .attr("fill", color[catNum[k]])
                .on("mouseover", function (event, d, i) {
                  const data = d3.select(this).data()[0];
                  d3.select(this).attr("r", 10).style("fill", color[catNum[k]]);
                  tooltip.transition().duration(200).style("opacity", .9);
                  tooltip.html("Category: " + catArry[catNum[k]] +
                    "<br>Video Views: " + formatNumberWithCommas(sumCats[catNum[k]][getYear(d3.select(this).attr("cx"), width, yearArry.length)]) +
                    "<br>Year: " + yearArry[getYear(d3.select(this).attr("cx"), width, yearArry.length)])
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("r", 2).style("fill", color[catNum[k]]);
                    tooltip.transition().duration(500).style("opacity", 0);
                });

            // create tooltip
            var tooltip = d3.select("#chart-container").append("div")
                            .attr("class", "tooltip")
                            .style("opacity", 0);

            // use x position to get x-axis tick value
            function getYear(xPos, top, intervalNum) {
                const interval = Math.ceil(top / intervalNum);
                let min = 0;
                let max = 0;
                for (let i = 0; i < yearArry.length; i++) {
                    min = max;
                    max = min + interval;
                    if (xPos >= min && xPos <= max) {
                        return i;
                    }
                }
            }
        }
    }

    // Function to update the chart with new categories
    function updateChart(catNum) {
        // remove the existing lines and dots
        svg.selectAll(".line").remove();
        svg.selectAll(".dot").remove();
  
        // redraw the lines and dots with the new categories
        for (let k = 0; k < yearArry.length; k++) {
            //console.log(catNum[k]);
            //console.log(sumCats[catNum[k]][1]);
            svg.append("path")
                .datum(yearArry)
                .attr("class", "line")
                .attr("fill", "none")
                .attr("stroke", "#85bb65")
                .attr("stroke-width", 2)
                .attr("d", (d3.line()
                            .x((d,i) => x(yearArry[i]))
                            .y((d,i) => y(sumCats[catNum[k]][i]))))
                .attr("stroke", (d) => color[catNum[k]]);
    
            svg.selectAll("dot")
                .data(yearArry)
                .enter()
                .append("circle")
                .attr("class", "dot")
                .attr("cx", (d, i) => x(yearArry[i]))
                .attr("cy", (d, i) => y(sumCats[catNum[k]][i]))
                .attr("r", 2)
                .attr("fill", color[catNum[k]])
                .on("mouseover", function (event, d, i) {
                    const data = d3.select(this).data()[0];
                    d3.select(this).attr("r", 10).style("fill", color[catNum[k]]);
                    tooltip.transition().duration(200).style("opacity", .9);
                    tooltip.html("Category: " + catArry[catNum[k]] +
                      "<br>Video Views: " + formatNumberWithCommas(sumCats[catNum[k]][getYear(d3.select(this).attr("cx"), width, yearArry.length)]) +
                      "<br>Year: " + yearArry[getYear(d3.select(this).attr("cx"), width, yearArry.length)])
                      .style("left", (event.pageX + 10) + "px")
                      .style("top", (event.pageY - 20) + "px");
                  })
                  .on("mouseout", function () {
                      d3.select(this).attr("r", 2).style("fill", color[catNum[k]]);
                      tooltip.transition().duration(500).style("opacity", 0);
                  });
  
              // create tooltip
              var tooltip = d3.select("#chart-container").append("div")
                              .attr("class", "tooltip")
                              .style("opacity", 0);
  

            // use x position to get x-axis tick value
            function getYear(xPos, top, intervalNum) {
                const interval = Math.ceil(top / intervalNum);
                let min = 0;
                let max = 0;
                for (let i = 0; i < yearArry.length; i++) {
                    min = max;
                    max = min + interval;
                    if (xPos >= min && xPos <= max) {
                        return i;
                    }
                }
            }
        }
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

    // onload
    initChart(checkedCategories);
    // initiated the checkboxes
    createCheckboxes();

    // get top category based on their subscribers (descending order)
    function getTopCat (checkedCategories) {

        var checkedCatArry = [];
        for (let i = 0; i < checkedCategories.length; i ++) {

            checkedCatArry.push(catArry[checkedCategories[i]]);
        }

        // sort categories with subscriber numbers
        const sortedCategories = checkedCatArry.slice().sort((a, b) => {
            const indexA = catArry.indexOf(a);
            const indexB = catArry.indexOf(b);
            return sumCats[indexB][sumCats[indexB].length - 1] - sumCats[indexA][sumCats[indexA].length - 1];
        });

        const topCategory = sortedCategories.slice(0, 1);

        return topCategory;
    }

    // display annotation block
    function showAnnotation(checkedCategories) {
        const annotationContainer = document.getElementById("annotation-container");
        annotationContainer.style.display = "block";
        console.log(catArry.length - 1);
        const topCategory = getTopCat(checkedCategories);
        const annotationText = `Current Top Category: ` + topCategory +
                               `</br> Video Views: ` + formatNumberWithCommas(sumCats[catArry.indexOf(topCategory[0])][(catArry.length - 1)]);

        const annotationElement = document.getElementById("annotation-text");
        annotationElement.innerHTML = annotationText;
    }

    // if no category is selected, hide the annotation
    function hideAnnotation() {
        const annotationContainer = document.getElementById("annotation-container");
        annotationContainer.style.display = "none";
    }

    // onload
    const catNum = [...Array(catArry.length).keys()];
    initChart(catNum);
    showAnnotation(checkedCategories);

    // checkbox change event to update the chart
    d3.selectAll('.categories').on('change', function () {
        const checkedCategories = [];
        d3.selectAll('.categories').each(function () {
            // check if the checkbox is checked
            if (this.checked) {
                checkedCategories.push(+this.value);
            }
        });
        if (checkedCategories.length > 0) {
            console.log(checkedCategories);
            // show the annotation if  categories are selected
            showAnnotation(checkedCategories);

        } else {
            // hide the annotation if there is no selected categories
            hideAnnotation();
        }
        updateChart(checkedCategories);
    });
})