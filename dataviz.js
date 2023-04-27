async function CrunkButton() {
  clearViz()
  StartViz(crunk_filepath)
}
async function DrillButton() {
  clearViz()
  StartViz(drill_filepath)
}
async function GangstaButton() {
  clearViz()
  StartViz(gangsta_filepath)
}
async function GoldenButton() {
  clearViz()
  StartViz(golden_filepath)
}
async function MumbleButton() {
  clearViz()
  StartViz(mumble_filepath)
}
async function OldButton() {
  clearViz()
  StartViz(old_filepath)
}
async function TrapButton() {
  clearViz()
  StartViz(trap_filepath)
}

async function drawTimeline() {

  // 1. Access Data

  var timelineData = [
    {
      label: "Old School",
      times: [
        { "starting_time": 1973 },
        { "ending_time": 1985 }
      ]
    },
    {
      label: "Golden Age",
      times: [
        { "starting_time": 1985 },
        { "ending_time": 1995 }
      ]
    },
    {
      label: "Gangsta",
      times: [
        { "starting_time": 1987 },
        { "ending_time": 1997 }
      ]
    },
    {
      label: "Crunk",
      times: [
        { "starting_time": 1997 },
        { "ending_time": 2009 }
      ]
    },
    {
      label: "Trap",
      times: [
        { "starting_time": 2003 },
        { "ending_time": 2022 }
      ]
    },
    {
      label: "Drill",
      times: [
        { "starting_time": 2012 },
        { "ending_time": 2022 }
      ]
    },
    {
      label: "Mumble",
      times: [
        { "starting_time": 2015 },
        { "ending_time": 2020 }
      ]
    }
  ]

  const labelAccessor = d => d.label
  const startingTimeAccessor = d => d.times[0].starting_time
  const endingTimeAccessor = d => d.times[1].ending_time

  // 2. Dimensions

  const width = window.innerWidth * 0.9
  let dimensions = {
    width: width,
    height: 300,
    margin: {
      top: 90,
      right: 30,
      bottom: 70,
      left: 200,
    },
  }
  dimensions.boundedWidth = dimensions.width
    - dimensions.margin.left
    - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height
    - dimensions.margin.top
    - dimensions.margin.bottom

  // 3. Draw Canvas

  const timelineContainer = d3.select("#timeline")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)

  const bounds = timelineContainer.append("g")
    .style("transform", `translate(${dimensions.margin.left
      }px, ${dimensions.margin.top
      }px)`)

  // 4. Scales

  const xScale = d3.scaleLinear()
    .domain([1973, 2022])
    .range([0, dimensions.boundedWidth])
    .nice()

  // 5. Draw

  const barGroup = bounds.append("g")

  let barHeight = 20;
  const barPadding = 5;

  const bars = barGroup.selectAll(".bar-group")
    .data(timelineData)
    .join("g")
    .attr("class", "bar-group")
    .attr("stroke-width", "2px")
    .attr("fill", (d, i) => {
      const color = d3.schemeCategory10[i % d3.schemeCategory10.length];
      return color;
    })
    .on("mouseover", function () {
      d3.select(this)
        .attr("stroke", "black")
        .classed("hover", true);
    })
    .on("mouseout", function () {
      d3.select(this)
        .attr("stroke", "none")
        .classed("hover", false);
    });

  // Guiding Lines
  bars.append("line")
    .attr("x1", 0)
    .attr("y1", (d, i) => i * (barHeight + barPadding) + (barHeight / 2))
    .attr("x2", xScale(2025))
    .attr("y2", (d, i) => i * (barHeight + barPadding) + (barHeight / 2))
    .attr("class", "line")
    .attr("stroke", "black")
    .attr("stroke-width", ".2px");

  // Actual Bars
  bars.append("rect")
    .attr("x", d => xScale(startingTimeAccessor(d)))
    .attr("y", (d, i) => i * (barHeight + barPadding))
    .attr("width", d => xScale(endingTimeAccessor(d)) - xScale(startingTimeAccessor(d)))
    .attr("height", barHeight);

  // 6. Peripherals

  // Header
  const header = timelineContainer.append("g")
    .attr("transform", `translate(${dimensions.width / 2}, ${dimensions.margin.top / 2})`);

  header.append("text")
    .attr("text-anchor", "middle")
    .style("font-size", "1.5em")
    .text("Timeline of Rap Subgenres")
    .style("font-family", "Impact")
    .style("font-weight", "50");

  header.append("text")
    .attr("dy", "1.5em")
    .attr("text-anchor", "middle")
    .style("font-size", "1em")
    .text("Click on a Subgenre to See its Data")
    .style("font-family", "Impact")
    .style("font-weight", "50");
    

  // Subgenre Labels
  bars.append("text")
    .attr("class", "label")
    .attr("x", -dimensions.margin.left + 180)
    .attr("y", (d, i) => i * (barHeight + barPadding) + 10)
    .text(d => labelAccessor(d))
    .attr("alignment-baseline", "middle")
    .style("text-anchor", "end")
    .style("font-family", "'Libre Baskerville', serif")

  // Axis
  const xAxisGenerator = d3.axisBottom()
    .scale(xScale)
    .tickFormat(d3.format("d")); // specify tick format as integers without commas

  const xAxis = bounds.append("g")
    .call(xAxisGenerator)
    .style("transform", `translateY(${dimensions.boundedHeight + 40}px)`)
    .selectAll("text")
    .style("font-size", "14px") // modify font-size of the text element associated with the ticks
    .style("font-family", "'Libre Baskerville', serif")

  // 7. Interactivity

  bars.on("click", function (event, d) {
    const clickedData = d3.select(this).datum();
    subgenre = labelAccessor(clickedData)
    clearViz();
    // Display the data visualization(s) for the selected subgenre
    StartViz(subgenre);
  });

}

async function getArtistsFromJson(jsonFile) {
  let response = await fetch(jsonFile);
  let data = await response.json();
  return data.artists;
}

async function StartViz(subgenre) {

  // Change Header
  var h4Element = document.querySelector("#subgenre-under-inspection h4");
  h4Element.textContent = subgenre;

  // show the visualization container
  document.getElementById("visualization-container").style.display = "grid";

  // Construct the filepath for the selected subgenre
  let subgenre_filepath = "subgenre_" + subgenre + ".json";

  // Construct artist list
  let artistList = await getArtistsFromJson(subgenre_filepath)

  // Construct common words list
  let commonWords = await getCommonWordsFromJson(subgenre_filepath)

  // Draw Vizes
  drawArtistCircles(artistList)
  drawWordCloud(commonWords)
  drawSpeedometer(subgenre_filepath)
  drawSpider(subgenre_filepath)
}

async function getCommonWordsFromJson(jsonFile) {
  let response = await fetch(jsonFile);
  let data = await response.json();
  return data.top_words;
}

async function drawArtistCircles(artistList) {

  // 1. Access data
  let dataset = await d3.json("artists.json")
  const filteredDataset = dataset.filter(d => artistList.includes(d.artist));

  // 2. Create chart dimensions

  const nameAccessor = d => d.artist
  const sizeAccessor = d => d.monthly_listeners
  const picAccessor = d => d.profile_pic_url

  let dimensions = {
    width: window.innerWidth * 0.5,
    height: 500
  }

  // 3. Draw Canvas

  const svg = d3.select("#bubbleChart")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)
    .append("g")
    .attr("transform", "translate(0,0)")

  // 4. Create Scales

  const sizeScale = d3.scaleSqrt()
    .domain(d3.extent(filteredDataset, sizeAccessor))
    .range([0, 100])

  // 5. Draw Data

  const drag = simulation => {

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      simulation.alpha(0); // pause simulation when dragging starts
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
      simulation.alpha(0);
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      simulation.alpha(0.1); // resume simulation when dragging ends
    }

    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  var simulation = d3.forceSimulation()
    .force("x", d3.forceX(dimensions.width / 2).strength(0.15))
    .force("y", d3.forceY(dimensions.height / 2).strength(0.15))
    .force("collide", d3.forceCollide(d => sizeScale(sizeAccessor(d)) + 3))

  const circles = svg.selectAll(".artist")
    .data(filteredDataset)
    .enter()
    .append("g")
    .attr("class", "artist")

  // Add Tooltip Div to HTML
  d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

  circles.append("circle")
    .attr("r", d => sizeScale(sizeAccessor(d)))
    .attr("title", d => `${nameAccessor(d)}: ${sizeAccessor(d)} monthly listeners`) // Add a `title` element with the desired text
    .on('mouseover', function (event, d) {
      // Display tooltip on mouseover
      d3.select(this)
        .attr('stroke-width', '2px')
        .attr('stroke', 'black');
      d3.select('#tooltip')
        .style('opacity', 1)
        .html(`${nameAccessor(d)}<br>${sizeAccessor(d)} monthly listeners`)
        .style('left', `${event.pageX}px`)
        .style('top', `${event.pageY - 10}px`)
        .style('transform', `translate(-50%, -100%)`)
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border', '1px solid black')
        .style('padding', '10px')
        .style('border-radius', '5px')
        .style('box-shadow', '2px 2px 6px rgba(0, 0, 0, 0.3)');
    })
    .on('mousemove', function (event, d) {
      // Update tooltip position on mousemove
      d3.select('#tooltip')
        .style('left', `${event.pageX}px`)
        .style('top', `${event.pageY - 60}px`);
    })
    .on('mouseout', function (event, d) {
      // Hide tooltip on mouseout
      d3.select(this)
        .attr('stroke-width', '0px');
      d3.select('#tooltip')
        .style('opacity', 0);
    })
    .call(drag(simulation));

  circles.append("text")
    .text(nameAccessor)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr("font-size", function (d) {
      if (nameAccessor(d).length > 8) {
        return sizeScale(sizeAccessor(d)) * 0.2; // set font size smaller for names longer than 8 characters
      } else {
        return sizeScale(sizeAccessor(d)) * 0.4; // use default font size for names shorter than or equal to 8 characters
      }
    })
    .attr("fill", "white")
    .attr("pointer-events", "none")
    .style("font-family", "Impact")


  simulation.nodes(filteredDataset)
    .on('tick', ticked)

  // tick tock
  function ticked() {
    circles.attr('transform', d => `translate(${d.x},${d.y})`);
  }
}

async function drawWordCloud(commonWords) {

  // 1. Access data
  const wordAccessor = d => d.text
  const sizeAccessor = d => d.size

  // 2. Create chart dimensions

  let dimensions = {
    width: window.innerWidth * 0.5,
    height: window.innerHeight * 0.5,
    margin: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
  }
  dimensions.boundedWidth = dimensions.width
    - dimensions.margin.left
    - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height
    - dimensions.margin.top
    - dimensions.margin.bottom

  // 3. Draw Canvas

  const centerX = dimensions.boundedWidth / 2 + dimensions.margin.left;
  const centerY = dimensions.boundedHeight / 2 + dimensions.margin.top;

  var svg = d3.select("#wordCloud")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)

  const bounds = svg.append("g")
    .attr("transform", `translate(0,0)`);

  // 4. Create Scales

  const sizeScale = d3.scaleLinear()
    .domain([0, d3.max(commonWords, sizeAccessor)])
    .range([10, 60])

  // 5. Create Force Simulation

  const simulation = d3.forceSimulation(commonWords)
    .force("center", d3.forceCenter(dimensions.boundedWidth / 2, dimensions.boundedHeight / 2))
    .force("charge", d3.forceManyBody().strength(5))
    .force("collision", d3.forceCollide().radius(d => sizeScale(sizeAccessor(d)) + 1))
    .on("tick", ticked)

  function ticked() {
    bounds.selectAll("text")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
  }

  // 6. Draw Data

  bounds.selectAll("text")
    .data(commonWords)
    .enter().append("text")
    .style("font-size", d => `${sizeScale(sizeAccessor(d))}px`)
    .style("fill", "#000000")
    .attr("text-anchor", "middle")
    .style("font-family", "Impact")
    .text(d => wordAccessor(d))
    .call(drag(simulation))

  function drag(simulation) {

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
  }

}

async function drawSpeedometer(subgenre_filepath) {

  // 1. Access data
  const dataset = await d3.json(subgenre_filepath)

  const sentimentAccessor = dataset.sentiment_score

  // 2. Create chart dimensions

  let dimensions = {
    width: window.innerWidth * 0.5,
    height: window.innerHeight * 0.5,
    margin: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
  }
  dimensions.boundedWidth = dimensions.width
    - dimensions.margin.left
    - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height
    - dimensions.margin.top
    - dimensions.margin.bottom

  const centerX = dimensions.boundedWidth / 2;
  const centerY = dimensions.boundedHeight / 2 + 100;

  const gaugeRadius = Math.min(dimensions.boundedWidth, dimensions.boundedHeight) / 2 * 1;
  const labelFontSize = gaugeRadius / 7;
  const tickFontSize = gaugeRadius / 10;
  const maxScore = 100;
  const minScore = -100;

  // 3. Draw SVG container
  const svg = d3.select("#speedometer")
    .append("svg")
    .attr("width", dimensions.boundedWidth)
    .attr("height", dimensions.boundedHeight);

  // 4. Create a group for the gauge elements
  const gaugeGroup = svg.append("g")
    .attr("transform", `translate(${centerX}, ${centerY})`);

  // 5. Define the scales
  const angleScale = d3.scaleLinear()
    .domain([minScore, maxScore])
    .range([-Math.PI / 2, Math.PI / 2])
    .clamp(true);

  // 6. Draw the gauge background
  const backgroundArc = d3.arc()
    .innerRadius(gaugeRadius * 0.7)
    .outerRadius(gaugeRadius)
    .startAngle(-Math.PI / 2)
    .endAngle(Math.PI / 2);

  // Create a linear gradient
  const gradient = gaugeGroup.append("linearGradient")
    .attr("id", "gradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", -gaugeRadius)
    .attr("x2", gaugeRadius)
    .attr("y1", 0)
    .attr("y2", 0);

  // Add color stops to the gradient
  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "black");
  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "white");

  // Apply the gradient to the background arc
  gaugeGroup.append("path")
    .attr("class", "gauge-background")
    .attr("d", backgroundArc)
    .style("fill", "url(#gradient)")
    .style("stroke", "black")
    .style("stroke-width", "3")

  //label for highest possible score
  const maxEnd = gaugeGroup.append("text")
    .attr("text-anchor", "middle")
    .attr("x", gaugeRadius * 1.17 * Math.sin(angleScale(100)))
    .attr("y", -gaugeRadius * 1.17 * Math.cos(angleScale(100)))
    .text("100")
    .style("font-size", 35)
    .style("font-family", "Impact")

  //label for lowest possible score
  const midScore = gaugeGroup.append("text")
    .attr("text-anchor", "middle")
    .attr("x", gaugeRadius * 1.02 * Math.sin(angleScale(0)))
    .attr("y", -gaugeRadius * 1.02 * Math.cos(angleScale(0)))
    .text("0")
    .style("font-size", 35)
    .style("font-family", "Impact")

  //label for lowest possible score
  const minEnd = gaugeGroup.append("text")
    .attr("text-anchor", "middle")
    .attr("x", gaugeRadius * 1.19 * Math.sin(angleScale(-100)))
    .attr("y", -gaugeRadius * 1.19 * Math.cos(angleScale(-100)))
    .text("-100")
    .style("font-size", 35)
    .style("font-family", "Impact")

  // Select the gauge indicator element
  const indicator = gaugeGroup.selectAll("path")
    .filter(".gauge-indicator");

  // Update the indicator arc with the new angle
  const newAngle = angleScale(sentimentAccessor);
  const indicatorArc = d3.arc()
    .innerRadius(gaugeRadius * 0.7)
    .outerRadius(gaugeRadius)
    .startAngle(-Math.PI / 2)
    .endAngle(newAngle);

  // Redraw the indicator arc with transition
  indicator.transition()
    .duration(500)
    .attr("d", indicatorArc);

  // 8. Add the label for the gauge
  const vizLabel = gaugeGroup.append("text")
    .attr("class", "gauge-label")
    .attr("text-anchor", "middle")
    .attr("y", -10)
    .text("Sentiment Score")
    .style("font-size", labelFontSize)
    .style("font-family", "Impact")

  const scoreLabel = gaugeGroup.append("text")
    .attr("class", "gauge-score-label")
    .attr("text-anchor", "middle")
    .attr("x", 0)
    .attr("y", -gaugeRadius * 0.25)
    .text(() => {
      if (sentimentAccessor >= 0) {
        return "+" + sentimentAccessor.toFixed(2);
      } else {
        return sentimentAccessor.toFixed(2);
      }
    }).style("font-size", 60)
    .style("text-decoration", "underline")
    .style("font-family", "Impact")


  const tickAngleRadians = angleScale(sentimentAccessor);

  // 9. Indicator
  const ticks = gaugeGroup.selectAll(".gauge-tick")
    .data(angleScale.ticks(10))
    .enter().append("g")
    .attr("class", "gauge-tick")
    .append("line")
    .attr("x1", gaugeRadius * Math.sin(tickAngleRadians))
    .attr("y1", -gaugeRadius * Math.cos(tickAngleRadians))
    .attr("x2", gaugeRadius * 0.67 * Math.sin(tickAngleRadians))
    .attr("y2", -gaugeRadius * 0.67 * Math.cos(tickAngleRadians))
    .style("stroke", "red")
    .style("stroke-width", "2px");
}

async function drawSpider(subgenre_filepath) {
  // 1. Access data
  const dataset = await d3.json(subgenre_filepath)

  const topicAccessor = dataset.topic_scores

  const crimeAccessor = dataset.topic_scores.Crime
  const deathAccessor = dataset.topic_scores.Death
  const violenceAccessor = dataset.topic_scores.Violence
  const drugsAccessor = dataset.topic_scores.Drugs
  const funAccessor = dataset.topic_scores.Fun
  const consciousAccessor = dataset.topic_scores.Conscious

  // 2. Create chart dimensions
  const width = window.innerWidth * 0.5
  const height = width * 0.6

  // 3. Draw canvas
  let svg = d3.select("#spider")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // 4. Scales!

  let rangeMax = 180

  let radialScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, rangeMax])

  let crimeScale = d3.scaleLinear()
    .domain([0.06, 0.2978577156604422])
    .range([0, rangeMax])

  let consciousScale = d3.scaleLinear()
    .domain([0.04, 0.10596397224943518])
    .range([0, rangeMax])

  let funScale = d3.scaleLinear()
    .domain([0.2, 0.952358776137475])
    .range([0, rangeMax])

  let drugsScale = d3.scaleLinear()
    .domain([0.1, 0.6140688648845833])
    .range([0, rangeMax])

  let violenceScale = d3.scaleLinear()
    .domain([0.03, 0.38986744506867665])
    .range([0, rangeMax])

  let deathScale = d3.scaleLinear()
    .domain([0.08, 0.30989463582381993])
    .range([0, rangeMax])

  let ticks = [0.2, 0.4, 0.6, 0.8, 1];

  // 5. Draw
  svg.selectAll("circle")
    .data(ticks)
    .join(
      enter => enter.append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", "3")
        .attr("r", d => radialScale(d))
    );

  // svg.selectAll(".ticklabel")
  //   .data(ticks)
  //   .join(
  //     enter => enter.append("text")
  //       .attr("text-anchor", "middle")
  //       .attr("class", "ticklabel")
  //       .attr("x", width / 2)
  //       .attr("y", d => height / 2 - radialScale(d) - 3)
  //       .text(d => d.toString() + "%")
  //   );

  let angleSlice = Math.PI * 2 / Object.keys(topicAccessor).length;

  // 6. Draw the axes
  let line = d3.line()
    .x(d => d.x)
    .y(d => d.y);

  let axes = svg.selectAll(".axis")
    .data(Object.keys(topicAccessor))
    .join(
      enter => enter.append("g")
        .attr("class", "axis")
    );

  axes.append("line")
    .attr("x1", width / 2)
    .attr("y1", height / 2)
    .attr("x2", (d, i) => {
      let angle = angleSlice * i;
      return width / 2 + Math.cos(angle) * radialScale.range()[1];
    })
    .attr("y2", (d, i) => {
      let angle = angleSlice * i;
      return height / 2 - Math.sin(angle) * radialScale.range()[1];
    })
    .attr("class", "line")
    .attr("stroke", "black")
    .attr("stroke-width", "3");

  axes.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("x", (d, i) => {
      let angle = angleSlice * i;
      return width / 2 + Math.cos(angle) * radialScale.range()[1] * 1.15;
    })
    .attr("y", (d, i) => {
      let angle = angleSlice * i;
      return height / 2 - Math.sin(angle) * radialScale.range()[1] * 1.15;
    })
    .style("font-family", "Impact")
    .text(d => d);

  // 7. Plot the data
  let values = Object.values(topicAccessor);
  let data = [];

  for (let i = 0; i < values.length; i++) {
    let value = values[i];
    let angle = angleSlice * i;
    let coordinates = angleToCoordinate(angle, value, i);
    data.push(coordinates);
  }

  data.push(data[0]); // to close the shape

  let area = svg.append("path")
    .datum(data)
    .attr("class", "area")
    .attr("d", line)
    .style("fill", "red")
    .style("opacity", 0.7);

  function angleToCoordinate(angle, value, scale) {
    let x = 0
    let y = 0
    switch (scale) {
      case 0:
        x = Math.cos(angle) * crimeScale(value);
        y = Math.sin(angle) * crimeScale(value);
        return { "x": width / 2 + x, "y": height / 2 - y };
      case 1:
        x = Math.cos(angle) * deathScale(value);
        y = Math.sin(angle) * deathScale(value);
        return { "x": width / 2 + x, "y": height / 2 - y };
      case 2:
        x = Math.cos(angle) * violenceScale(value);
        y = Math.sin(angle) * violenceScale(value);
        return { "x": width / 2 + x, "y": height / 2 - y };
      case 3:
        x = Math.cos(angle) * drugsScale(value);
        y = Math.sin(angle) * drugsScale(value);
        return { "x": width / 2 + x, "y": height / 2 - y };
      case 4:
        x = Math.cos(angle) * funScale(value);
        y = Math.sin(angle) * funScale(value);
        return { "x": width / 2 + x, "y": height / 2 - y };
      case 5:
        x = Math.cos(angle) * consciousScale(value);
        y = Math.sin(angle) * consciousScale(value);
        return { "x": width / 2 + x, "y": height / 2 - y };
    }
  }
}

function clearViz() {
  let bubbleChart = document.getElementById('bubbleChart');
  bubbleChart.innerHTML = '';
  let wordCloud = document.getElementById("wordCloud");
  wordCloud.innerHTML = '';
  let speedometer = document.getElementById("speedometer");
  speedometer.innerHTML = '';
  let spider = document.getElementById("spider");
  spider.innerHTML = '';
}

drawTimeline()