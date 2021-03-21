// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .attr("class", "chart");

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Initial Params

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
      d3.max(stateData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(stateData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.8,
      d3.max(stateData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis_x = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis_x);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis_y = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis_y);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenXAxis, circlesGroup) {

  var labelX;

  if (chosenXAxis === "poverty") {
    labelX = "poverty:";
  }
  else if (chosenXAxis === "obesity") {
    labelX = "obesity:";
  }
  else {
    labelX = "smokes:";
  }

  var labelY;

  if (chosenYAxis === "healthcare") {
    labelY = "healthcare:";
  }
  else if (chosenXAxis === "income") {
    labelY = "income:";
  }
  else {
    labelY = "age:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`); 
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}


// Import Data
d3.csv("assets/data/data.csv").then(function(stateData, err) {

//   if (err) throw err;

    console.log(stateData);

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    stateData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.povertyMoe = +data.povertyMoe;
      data.age = +data.age;
      data.ageMoe = +data.ageMoe;
      data.income = +data.income;
      data.incomeMoe = +data.incomeMoe;
      data.healthcare = +data.healthcare;
      data.healthcareLow = +data.healthcareLow;
      data.healthcareHigh = +data.healthcareHigh;
      data.obesity = +data.obesity;
      data.obesityLow = +data.obesityLow;
      data.obesityHigh = +data.obesityHigh;
      data.smokes = +data.smokes;
      data.smokesLow = +data.smokesLow;
      data.smokesHigh = +data.smokesHigh;
    });

      // x, y LinearScale function above csv import

    var xLinearScale = xScale(stateData, chosenXAxis);
    var yLinearScale = yScale(stateData, chosenYAxis);


    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .attr("transform", "rotate(-90)")
    .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "10")
        .attr("fill", "blue")
        .attr("opacity", ".5");

    
    var circleLabels = chartGroup.selectAll(null).data(stateData).enter().append("text")
      .attr("x", function(d) { return xLinearScale(d[chosenXAxis]); })
      .attr("y", function(d) { return yLinearScale(d[chosenYAxis]); })
      .text(function(d) { return d.abbr; })
      .attr("font-family", "sans-serif")
      .attr("font-size", "6.5px")
      .attr("fill", "white");

     // Create group for three x-axis labels
    var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`)
    .attr("class", "aText");

    var poverty = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("poverty (%)");

    var obesity = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("obesity");

    var smokes = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("smokers");

    // Create group for three y-axis labels
    var labelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "aText");

    var age = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", -20)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("age");

    var income = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("income");

    var healthcare = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("healthcare");



    // Step 6: Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br> poverty: ${d.poverty}<br> healthcare: ${d.healthcare}`); 
      });

    
      // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenXAxis, circlesGroup); 


        // x axis labels event listener
    labelsGroup.selectAll("text")
    .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;

      // console.log(chosenXAxis)

      // functions here found above csv import
      // updates x scale for new data
      xLinearScale = xScale(stateData, chosenXAxis);

      // updates x axis with transition
      xAxis = renderXAxes(xLinearScale, xAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenXAxis === "poverty") {
        poverty
          .classed("active", true)
          .classed("inactive", false);
        obesity
          .classed("active", false)
          .classed("inactive", true);
        smokes
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenXAxis === "obesity") {
        obesity
          .classed("active", true)
          .classed("inactive", false);
        poverty
          .classed("active", false)
          .classed("inactive", true);
        smokes
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        smokes
          .classed("active", false)
          .classed("inactive", true);
        poverty
          .classed("active", true)
          .classed("inactive", false);
        obesity
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });

     // y axis labels event listener
     labelsGroup.selectAll("text")
     .on("click", function() {
       // get value of selection
       var value = d3.select(this).attr("value");
       if (value !== chosenYAxis) {
   
         // replaces chosenXAxis with value
         chosenYAxis = value;
   
         // console.log(chosenYAxis)
   
         // functions here found above csv import
         // updates y scale for new data
         yLinearScale = yScale(stateData, chosenYAxis);
   
         // updates y axis with transition
         yAxis = renderYAxes(YLinearScale, yAxis);
   
         // updates circles with new y values
         circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);
   
         // updates tooltips with new info
         circlesGroup = updateToolTip(chosenYAxis, circlesGroup);
   
         // changes classes to change bold text
         if (chosenYAxis === "healthcare") {
            healthcare
             .classed("active", true)
             .classed("inactive", false);
            income
             .classed("active", false)
             .classed("inactive", true);
            age
             .classed("active", false)
             .classed("inactive", true);
         }
         else if (chosenYAxis === "income") {
            income
             .classed("active", true)
             .classed("inactive", false);
            healthcare
             .classed("active", false)
             .classed("inactive", true);
            age
             .classed("active", false)
             .classed("inactive", true);
         }
         else {
            age
             .classed("active", false)
             .classed("inactive", true);
            healthcare
             .classed("active", true)
             .classed("inactive", false);
            income
             .classed("active", true)
             .classed("inactive", false);
         }
       }
     });

//   }).catch(function(error) {
//     console.log(error);
  });