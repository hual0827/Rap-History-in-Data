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
  drawArtistCircles(artistList, subgenre)
  drawWordCloud(commonWords)
  drawSpeedometer(subgenre_filepath)
  drawSpider(subgenre_filepath, subgenre)
}

async function getCommonWordsFromJson(jsonFile) {
  let response = await fetch(jsonFile);
  let data = await response.json();
  return data.top_words;
}

async function drawArtistCircles(artistList, subgenre) {

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
    .force("x", d3.forceX(dimensions.width / 2).strength(0.03))
    .force("y", d3.forceY(dimensions.height / 2).strength(0.13))
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

  // change paragraph
  var paragraphElement = document.querySelector("#bubbleChartParagraph");
  switch (subgenre) {
    case "Old School":
      paragraphElement.innerHTML = 'Beastie Boys is the clear winner here for number of monthly spotify listeners in April 2023. While they debatably belong in the Golden Age era (as their career only started taking off at the end of the Old School era), this dataset considers their first albums to be Old School. The Beastie Boys originally started as a hardcore punk band called \"The Young Aborigines\". They later transitioned to hip-hop music. <br>In 2nd place we have Run-DMC. Run-DMC was formed in 1981 in Queens, New York, by Joseph \"Run\" Simmons, Darryl \"DMC\" McDaniels, and Jason \"Jam Master Jay\" Mizell. Run-DMC\'s debut album, \"<a href = "https://genius.com/albums/Rundmc/Rund-m-c" target="_blank">Run-D.M.C.</a>\" was released in 1984 and was the first hip-hop album to go gold, selling over 500,000 copies. They were also the first rap group to appear on the cover of <i>Rolling Stone</i> magazine. <br>In 3rd place is The Sugarhill Gang, formed in 1979. They are best known for their hit song \"<a href = "https://www.youtube.com/watch?v=mcCK99wHrk0" target="_blank">Rapper\'s Delight</a>\", which is widely regarded as the first commercially successful rap single.'
      break;

    case "Golden Age":
      paragraphElement.innerHTML = 'The Golden Age of rap is considered the peak of hip hop in terms of innovation and diversity. Lyrically speaking, we see more diversity in subject topics, complexity in rhyme schemes / wordplay, and intricacy in storytelling. In terms of artist diversity, we get some female representation in this era from artists like Queen Latifah, MC Lyte, and Salt & Pepa. Prior to this era, the only rappers lived in the north-east USA, but during this time, it spread to the West Coast, starting the rivalry between coasts.<br>Christopher George Latore Wallace, or "The Notorious B.I.G." was known for his distinctive flow and lyrical skill, which earned him the nickname "The King of New York." His first stage name, "Biggie Smalls," was actually inspired by a real-life gangster named "Biggie Smalls" who was active in Brooklyn during the 1970s. However, he had to change his name to "The Notorious B.I.G." due to legal issues with the original "Biggie Smalls." <br>A Tribe Called Quest is known for their positive, socially conscious lyrics, and their influence on the development of alternative hip hop.'
      break;

    case "Gangsta":
      paragraphElement.innerHTML = 'This chart justly displays the most influential artists of the Gangsta Rap, or G-rap, era: N.W.A, 2Pac, Snoop Dogg, and Biggie. Most of them are from the west coast, and this era is where the East vs West Coast feud really began. It is worth noting that there are smaller subgenres similar to Gangsta Rap that focus more on East Coast, like "Mafioso Rap."<br>N.W.A, featuring legendary rap artists Ice Cube, Eazy-E, and Dr. Dre, were the ones to lead the charge in Gangsta Rap. Their 1988 album <i>Straight Outta Compton</i> is considered one of the most influential albums in hip hop history. The title track "<a href = "https://www.youtube.com/watch?v=CFcZbVyFZLI" target="_blank">Straight Outta Compton</a>" was controversial for its explicit and violent lyrics, especially since they were often aimed at police/government. In 1989, N.W.A was banned from performing their song "<a href = "https://www.youtube.com/watch?v=ADdpLv3RDhA" target = "_blank">Fuck tha Police</a>" by the FBI and police departments across the country. Also in 1989, Ice Cube left the group over disputes with the manager and royalties. However, Ice Cube ended up having a successful solo career (as did Dre).'
      break;

    case "Crunk":
      paragraphElement.innerHTML = 'Crunk is a subgenre of hip hop that originated in the southern United States, particularly in the state of Georgia, in the late 1990s and early 2000s. It is characterized by heavy beats, melodic hooks that are easy to sing along to, and a focus on partying with energetic performances.<br>Some of the most notable crunk artists include Lil Jon (who is often credited with popularizing and running the genre), as well as Ying Yang Twins, Petey Pablo, and Lil Scrappy. Lil Jon is known for his distinctive raspy voice, which he has described as a result of his vocal cords being damaged from years of yelling and screaming while DJing.<br>While Pitbull is not generally considered a Crunk artist, he does have a couple albums from the era that draw heavily from Crunk music. He has since incorporated elements of Crunk, Latin, and pop into his successful music career.'
      break;

    case "Trap":
      paragraphElement.innerHTML = 'Like Crunk, Trap originates from the southern USA, specifically Atlanta. 808 drum machines, synthesizers, and heavily processed vocals are all common attributes to Trap music.<br>Trap was coined by T.I. in his 2003 album "<a href = "https://genius.com/albums/Ti/Trap-muzik" target = "_blank">Trap Muzik</a>." Some of the most notable Trap artists other than T.I. are Gucci Mane, (Young) Jeezy, Future, 2 Chainz, Migos, and Travis Scott.<br>Drake is not classified exclusively as a Trap artist, but several instances of his discography definitely draw heavily from Trap. So, we decided to put his 2015 collaboration album with Future, "<a href = "https://genius.com/albums/Drake-and-future/What-a-time-to-be-alive" target = "_blank">What a Time to Be Alive</a>" in the dataset. By the way, "<a href = "https://genius.com/albums/Future/Ds2" target = "_blank">DS2</a>" by Future comes up a lot in internet forums like Reddit as the album that got Trap lovers into Trap.<br>It is also worth noting, especially for this particular graph that the circle sizes are relative to other artists in the same subgenre. Drake is huge compared to other Trap artists, but his circle should not be compared with those of artists from other subgenres.'
      break;

    case "Drill":
      paragraphElement.innerHTML = 'Drill rap originated in the South Side of Chicago in the early 2010s. It is characterized by its heavy use of trap beats, menacing lyrics, and a focus on street violence and crime. Wikipedia says, "It is sonically similar to the trap music subgenre and lyrically similar to the gangsta rap subgenre." <br>Chief Keef is widely considered the most influential figure in the development of Drill. He gained attention in 2012 with his single "<a href = "https://www.youtube.com/watch?v=6g5ZF6DUrHI" target = "_blank">I Don\'t Like</a>," which was <a href = "https://www.youtube.com/watch?v=MIh0MMm6TyE" target = "_blank">remixed by Kanye West</a> and helped bring national attention to the Chicago rap scene. Lil Durk, who was also part of the Chicago scene, gained popularity around the same time with his mixtape "<a href = "https://genius.com/albums/Lil-durk/Signed-to-the-streets" target = "_blank">Signed to the Streets</a>." Lil Reese, another Chicago rapper, gained popularity with his single "<a href = "https://www.youtube.com/watch?v=TqteboRvtnA" target = "_blank">Us</a>," which was released in 2012. More recently, artists like Polo G and G Herbo have been associated with the drill sound and have helped to keep the subgenre relevant.<br>'
      break;

    case "Mumble":
      paragraphElement.innerHTML = 'Mumble rap is the shortest lasting subgenre in this dataset, as it has seen a rapid decline to accompany its meteoric rise. While non-biased definitions of the genre are hard to come across, the general consensus is that its artists typically mumble and slur their vocals, oftentimes making it hard to understand. The genre gained initial popularity through SoundCloud, which is why the term "SoundCloud rap" can sometimes be used instead of "Mumble Rap."<br>An especially interesting artist here is Lil Uzi Vert (Symere Woods) who has claimed massive commercial success with some multi-platinum singles and a couple multi-platinum albums, despite not having much discography. They also had a $24 million 10-carat pink diamond implanted in their forehead which was ripped out by fans while crowd surfing. Have no fear, they claim to still possess the diamond. To replace the forehead hole, they went with a barbell piercing to accompany the rest of their eclectic fashion.'
      break;
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
    .force("x", d3.forceX(dimensions.width / 2).strength(0.03))
    .force("y", d3.forceY(dimensions.height / 2).strength(0.05))
    .force("collide", d3.forceCollide(d => sizeScale(sizeAccessor(d)) + 1))
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

  // change paragraph
  var paragraphElement = document.querySelector("#wordCloudParagraph");
  switch (subgenre) {
    case "Old School":
      paragraphElement.innerHTML = 'In old school rap, "jibbit" was a slang term used to refer to money. It was popularized by the rap group Run-DMC in their song "<a href = "https://genius.com/Rundmc-peter-piper-lyrics" target="_blank">Peter Piper</a>" where they say "Ahuuuumpty Dumpty paid the debt, Now what do you call that? Jibbit! Jibbit, real good.\"<br>"Wikki" refers to the sound made by a DJ scratching a vinyl record back and forth, producing a distinct sound. The technique was discovered accidentally by <a href = "https://en.wikipedia.org/wiki/Grand_Wizzard_Theodore#:~:text=Theodore%20Livingston%20(born%20March%205,which%20he%20invented%20or%20perfected." target = "_blank">DJ Grand Wizzard Theodore</a> in the late 1970s. According to some sources, he was practicing his DJing skills at home, and his mother burst into the room to scold him for playing his music too loud. In a moment of panic, he held the record still with his hand while moving the turntable back and forth with the other, creating the now-famous scratch sound. He was 12 years old when this happened.'
      break;

    case "Golden Age":
      paragraphElement.innerHTML = 'Both "funk" and "funky" made it into this word cloud - funk music played an important role in the development of golden age hip hop. Many producers and DJs drew from the funk sound and incorporated its elements into their beats. <br>There are lots of names in this word cloud, like "wu/tang", "latifah", "biggie", and "jeff" (from DJ Jazzy Jeff & the Fresh Prince). This could be from the artists saying their own name in a braggadocious way, shout outs from other rappers (both positive and negative shoutouts).<br>The word "bom" is repeated 180 times in a Beastie Boys song called "Girls" making "bom" the biggest word in this chart.'
      break;

    case "Gangsta":
      paragraphElement.innerHTML = 'This is the last time in the dataset we see "mcs". The term still exists today, but it is definitely more prevalent on the old-school side of hip hop. In <a href = "https://www.youtube.com/watch?v=qrLmvqsljmU" target = "_blank">this interview</a> on Sway In The Morning, Ice-T describes the difference between an MC and a rapper - "An MC means a person that can move a crowd and basically control an audience. [...] Rappers you might see them get on a stage and they\'ll be afraid of the audience or they can only sing their hit record. [...] Rhyming is something [MCs] do, but that\'s not all they do."<br>There are several words here that reference the west coast: "coast", "westside", and "compton" signal the west\'s rise in the rap game and dominance in this genre. Still, "bronx" and "biggie" make the cut, referencing New York.<br>Like the Golden Age era, funk also influenced Gangsta Rap, leading to the greatest subgenre of all: G-Funk.'
      break;

    case "Crunk":
      paragraphElement.innerHTML = 'The word "shawty" is actually thought to come out of Atlanta, Georgia, just like Crunk did. It is a term of endearment for women, but is usually used for the young and attractive party-oriented ones, which has led to some people considering it condescending. Nonetheless, it got so popular as a word because of Crunk that it has slipped into the vernacular and other music genres.<br>"Bankhead" is a neighborhood in Atlanta, Georgia that is known for its role in the development of crunk music. Many of the early crunk artists, such as Lil Jon and the Eastside Boyz, were from Bankhead, and the neighborhood is often referenced in their music. Bankhead also had a significant impact on the fashion and style associated with crunk music, with artists often wearing oversized clothing and sporting flashy jewelry, like "chain[s]," another word that made it into this word cloud.<br>"Bwok" is an onomatopoeic word that was popularized by the crunk rapper Project Pat, imitating the noise of a chicken in the song "<a href = "https://www.youtube.com/watch?v=-XaUiMcDFZs" target = "_blank">Chickenhead</a>."'
      break;

    case "Trap":
      paragraphElement.innerHTML = '<ul><li>Thot is an acronym that stands for "that hoe over there."</li><li>Weezy is one of Lil Wayne\'s nicknames.</li><li>Fein means to crave or have a strong desire for something, often used in reference to drugs</li><li>Rising popularity of adlibs such as "ayy," "skrrt," and "yah"</li><li>The emphasis of fashion and status symbols like jewelry through words like "bezzle," "chain," "racks," "wrist," "icy," "drippin\'," etc.</li><li>The continued use of "shawty" (see Crunk for more info)</li><li>Drug-related terms like "pot," "sosa" (slang for the infamous drug lord Joaquín "El Chapo" Guzmán), and "bricksquad." Bricksquad is a hip-hop collective founded by rapper Gucci Mane, and the term "brick" refers to a tightly packed container of drugs.</li></ul>'
      break;

    case "Drill":
      paragraphElement.innerHTML = '<ul><li>GBE stands for Glory Boyz Entertainment, which was a record label and music group founded by Chicago rapper Chief Keef. The group included other Chicago rappers, such as Lil Reese and Fredo Santana.</li><li>Julio is a term used in drill rap to refer to a gun, specifically a .38 revolver.</li><li>Lawrence is a reference to the Lawrence Gardens housing project on Chicago\'s South Side, which has been known as a violent area associated with gang activity.</li><li>OTF stands for Only The Family, which is a record label and music group founded by Chicago rapper Lil Durk. The group includes other Chicago rappers, such as King Von and Booka600.</li><li>Opp is short for "opposition," and in drill rap, it refers to rival gang members or enemies.</li><li>Gould is a reference to the Robert Taylor Homes housing project on Chicago\'s South Side, which was another area associated with gang activity and violence.'
      break;

    case "Mumble":
      paragraphElement.innerHTML = 'Ayy takes the cake with this wordcloud. Mumble rappers tend to use the "aye" flow, where they add words like "ayy," "skrrt", and "woah" to the start or end of their lines. Other words that made it into this chart include...<ul><li>Purpp, which is short for Smokepurpp. He is a rapper associated with the SoundCloud rap scene and one of the pioneers of the "SoundCloud rap" subgenre.</li><li>Ballin, a slang term meaning to be wealthy or successful.</li><li>Slime, a term of endearment used within certain rap circles, originally coined by rapper Young Thug.</li><li>Xans, short for Xanax, a prescription drug used to treat anxiety disorders. It is also often used recreationally.</li><li>Wamp, a term used to express excitement or approval.</li><li>Esskeetit is a phrase coined by rapper Lil Pump, which means "let\'s get it" or "let\'s go."</li></ul>'
      break;
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

  // change paragraph
  var paragraphElement = document.querySelector("#speedometerParagraph");
  switch (subgenre) {
    case "Old School":
      paragraphElement.innerHTML = 'Don\'t let this chart fool you, hip-hop was born in South Bronx, a predominantly Black and Latino neighborhood that was hit hard by poverty, crime, and neglect. At the time, New York City was facing a financial crisis, and many public services were being cut, including funding for education and community programs. In 1970, Daniel P. Moynihan wrote <a href = "https://www.nixonlibrary.gov/sites/default/files/virtuallibrary/documents/jul10/53.pdf" target="_blank">a memorandum</a> for president Nixon. One of the key concepts in the document is captured in this quote that symbolizes the cause of hardship from the US government - "The time may have come when the issue of race could benefit from a period of \'benign neglect\'." The early hip hop scene was centered around block parties and street performances; it was a way for people to come together and create something positive in the face of adversity.'
      break;

    case "Golden Age":
      paragraphElement.innerHTML = 'One of the main sentiments during this time was a feeling of empowerment and pride in black identity. Many rappers used their music to celebrate black culture and history, and to express their frustration with the systemic inequalities that plagued the community. This sentiment is evident in classic tracks like Public Enemy\'s "<a href = "https://www.youtube.com/watch?v=mmo3HFa2vjg" target="_blank">Fight the Power</a>" and Stop the Violence Movement\'s "<a href = "https://www.youtube.com/watch?v=MmX5TgWsfEQ" target = "_blank">Self Destruction</a>" which was released in 1989 and featured some of the biggest names in hip-hop at the time, including KRS-One, MC Lyte, Public Enemy, and Stetsasonic. The song\'s message promotes non-violence in the black community and discourages gang violence. The Stop the Violence movement was formed by KRS-One in response to recent violent tragedies in the black community at the time. The goal of the group was to advance a vision of hip hop that more closely aligned to its "original principles" for the music industry'
      break;

    case "Gangsta":
      paragraphElement.innerHTML = 'The sentiment score of G-Rap is lower than every other subgenre in this dataset other than Drill. The lyrics of gangsta rap often depicted violence, drug use, and misogyny, and were <a href = "https://www.city-journal.org/article/how-hip-hop-holds-blacks-back" target = "_blank">criticized</a> for promoting negative stereotypes of black people and perpetuating a cycle of violence. However, proponents of the genre argued that it was a form of social commentary and a way to shed light on the systemic issues and struggles faced by black Americans. Some say that the artists might also adopt a harder and rougher persona on the mic to play something of a character.<br>Despite the <a href = "https://www.ipl.org/essay/Gangsta-Rap-Controversy-F3C4CF742DTT" target = "_blank">controversy</a>, this subgenre helped push rap into the mainstream.'
      break;

    case "Crunk":
      paragraphElement.innerHTML = 'The vibe of Crunk rap is associated with high energy, having a good time, and partying, which is why it is surprising to see this sentiment score in the negatives. A couple possibilities why this is the case include... <ul><li>The physically aggressive side of Crunk, including violent themes.</li><li>The sexually aggressive side, which could be interpreted as misogyny at times. According to <a href = "https://www.youtube.com/watch?v=rCgBd9hvwqk" target = "_blank">this interview</a>, Lil Jon likes to take his new music to the strip club first to see whether or not it\'s going to be a hit.</li></ul>'
      break;

    case "Trap":
      paragraphElement.innerHTML = 'The sentiment in Trap music is fairly conflicted, which could explain why it balances out near 0 on this gauge. How positive/negative the lyrics are can vary widely depending on the artist and the song, but some common themes include struggles with poverty, violence, and drugs which you will notice in the spider chart below. <br>Some trap artists rap about their experiences growing up in inner-city neighborhoods and the challenges they faced. However, there are also themes of materialism and the pursuit of wealth, often through illegal means such as drug dealing. Additionally, trap music often celebrates partying and a carefree lifestyle, with references to doing the drugs that they talk about dealing as well.'
      break;

    case "Drill":
      paragraphElement.innerHTML = 'The lyrics of Drill tend to be pretty violent and gritty, which is why seeing this subgenre\'s sentiment score as the lowest in this dataset is not too much of a surprise. The Guardian\'s <a href = "https://www.theguardian.com/music/2012/nov/16/chief-keef-chicago-drill-rap" target = "_blank">Lucy Stehlik said "nihilistic drill reflects real life where its squeaky-clean hip-hop counterparts have failed</a>." The more recent subgenres of rap have indeed paid more attention to pop elements (like the rise to fame and emphasis on fashion/status). It is in the midst of these more glamorous and sensational trends of the hip hop scene that Drill stood out to reflect life on the streets in a realistic and nihilistic way.'
      break;

    case "Mumble":
      paragraphElement.innerHTML = 'The sentiment of Mumble rap is often associated with a party/carefree lifestyle, with lyrics referencing drugs, money, and sex. The overall tone of the music is laid-back and relaxed, with many of the beats featuring slow tempos and heavy bass lines. However, part of the meteoric rise of this subgenre can be attributed to its ability to <a href = "https://www.youtube.com/watch?v=q9fAoNpYd2w" target = "_blank">bring massive energy to crowds</a>.<br>From people outside of the Mumble rap community, sentiments about the genre itself are split. Some more lyrically inclined rappers and hip hop fans discredit the genre as lacking substance in the messaging and authentic effort from the artists themselves. Others, even hardcore lyricists from more old school hip hop eras, take a more balanced approach, saying that if the beat is annoying, it doesn\'t matter how technically amazing the lyrics are. Many veterans understand that Mumble rappers have their own motivations and sources of inspiration, just as they did.'
      break;
  }
}

async function drawSpider(subgenre_filepath, subgenre) {
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
    .style("fill", "gray")
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

  // change paragraph
  var paragraphElement = document.querySelector("#spiderParagraph");
  switch (subgenre) {
    case "Old School":
      paragraphElement.innerHTML = 'Hip hop culture has four primary elements: breakdancing, DJing, MCing, and graffiti. All of these are high energy activities that blossomed at block parties while the police were buying-in to the "benign neglect" ideology. DJs were and still are an essential part of hip hop parties and events, but did you know that MCs were originally the hype men for the DJ? Only later did they become the focal point of hip hop performances. Rappers, or MCs, tackled a range of subjects, from braggadocio, to parties, to race, class, and the crises in the black community. However, it seems the main emphasis for successful MCs was getting the people up and grooving on the dance floor.'
      break;

    case "Golden Age":
      paragraphElement.innerHTML = 'This chart shows one of the reasons why the Golden Age era is so highly regarded in the history of hip hop - it was a time when rap was both socially conscious and musically innovative. The messaging and various styles of rap helped inspire the following generations of artists.<br>Notice how this spider-chart is somewhere in-between Old School and Gangsta Rap. The score of each topic lies somewhere between the scores from Old School and Gangsta Rap of that same topic. There are some Gangsta rap albums also classified as Golden Age in this dataset, as there is quite a bit of overlap between the two genres.'
      break;

    case "Gangsta":
      paragraphElement.innerHTML = 'While G-Rap scores more highly in the topic of drugs than Old School and Golden Age, it still is not as high as any of the subgenres that come after it, suggesting a steady growth in America\'s relationship with drugs. Still, the drug-related content was shocking for listeners at the time. This subgenre does, however, rank highest in violence and death which is not a total surprise with all the strereotypes that surround Gangsta rap.<br>What will come as a surprise to many people is that this subgenre scored the highest in conscious lyrics. Many gangsta rappers shed light on issues such as police brutality, racism, poverty, and <a href = "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2565489/" target = "_blank">the drug epidemic</a> that ravaged many inner-city neighborhoods during the 1980s and 1990s. Moreover, some gangsta rappers used their platform to promote self-empowerment and encourage listeners to take control of their lives and strive for success despite the hardships. Examples of gangsta rap songs with conscious themes include N.W.A\'s "Fuck tha Police" and Ice Cube\'s "<a href = "https://www.youtube.com/watch?v=78D8yW5c6cQ" target = "_blank">Endangered Species (Tales from the Darkside)</a>," which both address police brutality and racism. Tupac\'s "<a href = "https://www.youtube.com/watch?v=NRWUs0KtB-I" target = "_blank">Brenda\'s Got a Baby</a>," which is about a young girl struggling to survive in poverty.'
      break;

    case "Crunk":
      paragraphElement.innerHTML = 'Listening to Crunk, you will not come across mentions of drugs like heroin, but mentions of party drugs like marijuana, sizzurp (AKA codeine), alcohol/liquor, ecstacy, and cocaine will be pretty common. This side of Crunk rap is met with controversy – some people believe it promotes a self-destructive lifestyle. Lil Wayne is an example of a rapper that has come out to publicly talk about his codeine addiction.<br>That said, Crunk, especially at live performances, focuses on bringing its audience a good time in a fairly wholesome way, using call-and-response techniques to engage their audiences and create a sense of community and camaraderie.'
      break;

    case "Trap":
      paragraphElement.innerHTML = 'The term "Trap" in Trap music originates from the slang term "trap house," which is a place where illegal drugs are sold. Again, Trap music came from the southern United States, particularly Atlanta, Georgia, which had a reputation for trap houses during the 1990s and early 2000s. Trap was originally associated with the lifestyle and culture surrounding these trap houses, which often involved drug dealing, violence, and poverty. <br>The term "trap" was first used for music itself by Atlanta rapper T.I. in the early 2000s, and it has since become widely used to describe the sound and culture of the genre. Trap is the longest enduring subgenre of this dataset, as its success has persisted up to the present day. Its success could be due to its marriage of hip hop and EDM (electronic dance music), Two of the world\'s most popular music genres in recent years.'
      break;

    case "Drill":
      paragraphElement.innerHTML = 'Drill ranks the highest among all subgenres in terms of how much its artists talk about crime. Drill also comes second place in the violence and drugs categories. It is important to know that many of the famous artists that launched Drill into the mainstream were <a href = "https://press.princeton.edu/ideas/forrest-stuart-on-ballad-of-the-bullet" target = "_blank">young teenagers,</a> when they started getting famous. A lot of the same messaging that we see in this chart went into their online social media presence as well. Artists would openly flaunt firearms and aim threats at other rappers. Artists gained popularity and used it for money, guns, sex, and resources to survive poverty. However, this notoriety can also result in artists going to prison and/or killed, like Pop Smoke (Bashar Jackson), or CHII WVTTZ (Jayquan Mckenley).'
      break;

    case "Mumble":
      paragraphElement.innerHTML = 'Mumble rappers rap more about drugs than any other set of rappers in this dataset. These rappers are especially infamous for perscription drugs like Xanax, codeine, etc. Drugs come up in their lyrics, stagenames (like Lil Xan), and fashion (like carrying around styrofoam cups associated with codeine). A couple famous Mumble rappers have died from overdoses, like Lil Peep and Juice WRLD.<br>Not all Mumble rappers do drugs. Lil Yachty has never even been drunk before... <a href = "https://www.youtube.com/watch?v=ENJh3qecaN4" target = "_blank">Oh wait nevermind</a>'
      break;
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
