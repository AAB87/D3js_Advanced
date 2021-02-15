// variables for the chart
let margin = null,
    width = null,
    height = null;
let svg = null;
let x = null,
    y = null;

// Constants for the line colors and legend
const BUDGET_COLOR = "steelBlue";
const BOX_OFFICE_COLOR = "crimson";

renderChart(oscarsDataset, oscarsDatasetMetaData);

function renderChart(dataset, datasetMetaData) {
  setupCanvasSize();
  appendSvg("#chart");
  setupXScale(datasetMetaData.xField);
  setupYScale(datasetMetaData.yField1, datasetMetaData.yField2);
  appendXAxis();
  appendXLabel(datasetMetaData.xLabelText);
  appendYAxis(datasetMetaData.yAxisTickFormat);
  appendYLabel(datasetMetaData.yLabelText);
  appendChartTitle(datasetMetaData.chartTitleText);
  appendChartLines(dataset, datasetMetaData.xField, datasetMetaData.yField1, BOX_OFFICE_COLOR);
  appendDotsAndInteraction(dataset, datasetMetaData.xField, datasetMetaData.yField1, "tooltipBoxOffice");
  appendChartLines(dataset, datasetMetaData.xField, datasetMetaData.yField2, BUDGET_COLOR);
  appendDotsAndInteraction(dataset, datasetMetaData.xField, datasetMetaData.yField2, "tooltipBudget");
  appendLegend(BOX_OFFICE_COLOR, BUDGET_COLOR);
}

/**
 * @method setupCanvasSize
 * @description Sets the value of the variables margin, width and height for the positioning of svg
 */
function setupCanvasSize() {
  margin = {top: 50, left: 80, bottom: 60, right: 80};
  width = 960 - margin.left - margin.right;
  height = 450 - margin.top - margin.bottom;
}

/**
 * @method appendSvg
 * @description Adds a svg element to a dom element considering width and height variables for positioning
 * @param {String} domElement The dom element to which svg will be added
 */
function appendSvg(domElement) {
  svg = d3.select(domElement)
        .append('svg')
        .style('padding', margin.top + ' ' + margin.right + ' ' + margin.bottom + ' ' + margin.left)
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
        .attr('id', 'svg-responsive')
}

/**
 * @method setupXScale
 * @description Sets x-axis scale mapping ordinal data (domain) to pixels in the screen (rangeRound), and gap for visualization of bars later.
*/
function setupXScale(xField) {
  x = d3.scaleBand()
        .rangeRound([0, width])
        .padding(1)
        .domain(oscarsDataset.map(function(d) {
          return d[xField];
        }));
}

/**
 * @method setupYScale
 * @description Sets y-axis scale, mapping linear data (domain) to pixels in the screen (range). As we will represent two lines it is necessary to fix the scale of the maximum among the two
 */
function setupYScale(yField1, yField2) {
  let budgetList = oscarsDataset.map(function(item) {
    return item[yField1]
  });

  let boxOfficeList = oscarsDataset.map(function(item) {
    return item[yField2]
  });

  let yDataList = budgetList.concat(boxOfficeList)

  let yMaxDataset = d3.max(yDataList, function(d) {
    return d;
  });
  
  y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, yMaxDataset]);
}

/**
 * @method appendXAxis
 * @description Add x-axis at the bottom position of svg, translating it from 0 position (top-left corner) to "height" distance.
 */
function appendXAxis() {
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform",`translate(0, ${height})`)
    .call(d3.axisBottom(x));
}

/**
 * @method appendXLabel
 * @description Adds x-axis label to the svg placed at the bottom side.
 */
function appendXLabel(xLabelText) {
  svg.append("text")
    .attr("class", "x label")
    .attr("x", width)
    .attr("y", height + 40)
    .attr("text-anchor", "end")
    .text(xLabelText);
}

/**
 * @method appendYAxis
 * @description Add y-axis at the left position of svg.
 */
function appendYAxis(yAxisTickFormat) {
  svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y)
    .tickFormat(d3.format(yAxisTickFormat)));
}

/**
 * @method appendYLabel
 * @description Adds y-axis label to the svg.
 */
function appendYLabel(yLabelText) {
  svg.append("text")
    .attr("class", "y label")
    .attr("x", 0)
    .attr("y", -50)
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .text(yLabelText);
}

/**
 * @method appendChartTitle
 * @description Add title to the chart.
 */
function appendChartTitle(chartTitleText) {
  svg.append("text")
      .attr("class", "chartTitle")
      .attr("x", (width / 2))             
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")  
      .style("font-size", "25px") 
      .style("text-decoration", "bold")  
      .text(chartTitleText);
}

/**
 * @method getHtmlForInformationDisplay
 * @param {Object} d
 * @description Obtains html content for 1) tooltips or 2) information area to be visualized when the mouse is 1) over or 2) clicked on the dots, for the given line.
 */
function getHtmlForInformationDisplay(d, informationItem) {
  let toolTipContent = oscarsDatasetMetaData[informationItem].reduce(function(totalString, metaDataItem, index) {

    let myToolTipString = totalString + "<u>"+ metaDataItem.fieldText  + "</u> <b>"+ d[metaDataItem.fieldValue] + "</b><br>";
    
    if (index !== oscarsDatasetMetaData[informationItem].length - 1) {
      myToolTipString = myToolTipString + "<br>";
    }

    return myToolTipString;
  }, "")

  return toolTipContent;
}

/**
 * @method appendChartLines
 * @description Add lines to the graph, including tooltips, dots and colors.
 */
function appendChartLines(dataset, xAxisField, yAxisField, lineColor)
{
  let line = d3.line()
                .x(function(d) { 
                  return x(d[xAxisField]); })
                .y(function(d) { 
                  return y(d[yAxisField]); });
  
  svg.append("path")
      .datum(dataset) 
      .transition()
      .duration(1000)
      .attr("fill", "none")
      .attr("stroke", lineColor)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 2)
      .attr("d", line);
}
/**
 * @method appendDotsAndInteraction
 * @description Append dots to the chart and add interaction for displaying tooltips and information area including movies metadata
 */
function appendDotsAndInteraction(dataset, xAxisField, yAxisField, tooltip) {
  let toolTip = d3.select("body")
                  .append("div")
                  .attr("class", "toolTip")
                  .attr("html", "none")
  
  d3.select("#information")
    .html("Please click on an point from the chart to display movie information.");
  
  svg.selectAll("dot")
    .data(dataset)
    .enter().append("circle")								
    .attr("r", 3.5)
    .style("fill", "black")		
    .attr("cx", function(d) { return x(d[xAxisField]); })		 
    .attr("cy", function(d) { return y(d[yAxisField]); })
    .attr("class", "dot")			
  
  .on("mousemove", function(d){
    toolTip.style("left", d3.event.pageX+10+"px");
    toolTip.style("top", d3.event.pageY-25+"px");
    toolTip.style("display", "inline-block");
    toolTip.html(getHtmlForInformationDisplay(d, tooltip));
  })
  
  .on("mouseover", function(d){
    d3.select(this)
      .transition()
      .duration(300)
      .attr("r", 8)
      .style("fill", "green")
  })
  
  .on("mouseout", function(d){
    toolTip.style("display", "none");
    d3.select(this)
      .transition()
      .duration(300)
      .attr("r", 3.5)
      .style("fill", "black")
  })
  
  .on("click", function(d) {				
    d3.select("#information").html(getHtmlForInformationDisplay(d, "information"))	  
  });
}

/**
 * @method appendLegend
 * @description Add legend to the chart.
 */
function appendLegend(colorY1, colorY2) {
  let legend = svg.append('g')
                  .attr('class', 'legend');

  legend.append('text')
        .text('• ' + "Box-Office")
        .attr('fill', colorY1)
        .attr('x', width - 90)
        .attr('y', 20);
  
  legend.append('text')
        .text('• ' + "Budget")
        .attr('fill', colorY2)
        .attr('x', width - 90)
        .attr('y', 40);
}
