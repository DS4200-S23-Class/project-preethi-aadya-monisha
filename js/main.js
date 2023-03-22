// create frame constants
const FRAME_HEIGHT = 500;
const FRAME_WIDTH = 800; 
const MARGINS = {left: 150, right: 50, top: 50, bottom: 50};

const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right; 



// frame1 to append svgs to 
const FRAME1 = d3.select("#vis1") 
                  .append("svg") 
                    .attr("height", FRAME_HEIGHT)   
                    .attr("width", FRAME_WIDTH)
                    .attr("class", "frame"); 


// read in  data
d3.csv("data/food_retailers.csv").then((data) => { 
  

  // bar chart based on establishment type
  const color = d3.scaleOrdinal()
                        .domain(["Convenience Stores", "Pharmacies", "Meat Markets", "Seafood Markets", "Other Specialites", "Supermarkets", "Fruit & Vegetable Markets", 
                                "Warehouse Clubs", "Farmers Markets", "Winter Markets","Department Stores"])             
                        .range(["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]);
  
  // caulctae number of entries per establishment type
  const count = d3.rollup(data, g => g.length, d => d.prim_type);

  // determine max numnber
  const nums = count.values();
  const MAX_AMT = d3.max(nums);

    // create scale  for x scale 
  const AMT_SCALE = d3.scaleLinear() 
                      .domain([0, MAX_AMT + 100]) 
                      .range([0, VIS_WIDTH]); 

  // create y axis scale based on category names
    const CATEGORY_SCALE = d3.scaleBand() 
                .domain(data.map((d) => { return d.prim_type; })) 
                .range([0, VIS_HEIGHT])
                .padding(.2); 


    // plot bar based on data with rectangle svgs 
  FRAME1.selectAll("bar")  
        .data(count) 
        .enter()       
        .append("rect")  
          .attr("x", MARGINS.left) 
          .attr("y", (d) => { return CATEGORY_SCALE(d[0]) + MARGINS.bottom;}) 
          .attr("width", (d) => { return AMT_SCALE(d[1]); })
          .attr("height", CATEGORY_SCALE.bandwidth())
          .style("fill", (d) => {return color(d[0]); })
          .attr("class", "bar");



   // append y axis 
   FRAME1.append("g") 
        .attr("transform", "translate(" + MARGINS.left + 
              "," + (MARGINS.top) + ")") 
        .call(d3.axisLeft(CATEGORY_SCALE))
          .attr("font-size", '10px');
    

    // append x axis
  FRAME1.append("g") 
        .attr("transform", "translate(" + (MARGINS.left) + 
              "," + (MARGINS.bottom +VIS_HEIGHT) + ")") 
        .call(d3.axisBottom(AMT_SCALE).ticks(10)) 
          .attr("font-size", '20px');


  // create new variable for tooltip
  const TOOLTIP = d3.select("#vis1")
                        .append("div")
                          .attr("class", "tooltip")
                          .style("opacity", 0); 


    // Define event handler functions for tooltips/hovering
    function handleMouseover(event, d) {

      // on mouseover, make opaque 
      TOOLTIP.style("opacity", 1);

      // change bar color
      d3.select(this)
        .style("fill", "red");

    };

    function handleMousemove(event, d) {

      // position the tooltip and fill in information 
      TOOLTIP.html("Type of Store: " + d[0] + "<br>Number of Stores: " + d[1])
              .style("left", (event.pageX + 10) + "px") 
              .style("top", (event.pageY - 10) + "px"); 
     
    };

    function handleMouseleave(event, d) {

      // on mouseleave, make transparant again 
      TOOLTIP.style("opacity", 0); 

      //revert to original bar color
      d3.select(this)
        .style("fill", (d) => {return color(d[0]);});
    };

    // Add event listeners
    FRAME1.selectAll(".bar")
          .on("mouseover", handleMouseover) //add event listeners
          .on("mousemove", handleMousemove)
          .on("mouseleave", handleMouseleave);    

        
});

// create a frame to add the svg in vis2 div
const FRAME2 = d3.select("#vis2")
    .append("svg")
    .attr("height", FRAME_HEIGHT)
    .attr("width", FRAME_WIDTH)
    .attr("class", "frame");

// read in the scatter plot data
d3.csv("data/food_retailers.csv").then((DATA) => {

  const MAX_X = d3.max(DATA, (d) => { return parseFloat(d.latitude); });

 // the max Y used for scaling
  const MIN_Y = d3.min(DATA, (d) => { return parseFloat(d.longitude); });

  const X_SCALE = d3.scaleLinear()
  .domain([41.2, (MAX_X) ])
  .range([0, VIS_WIDTH])
  const Y_SCALE = d3.scaleLinear()
  .domain([(MIN_Y*-1), 69])
  .range([0, VIS_HEIGHT]);


	// Plots the data points on to the scatter plot 
	FRAME2.selectAll("points")
        .data(DATA)
        .enter()
        .append("circle")
        .attr("cx", (d) => { return (X_SCALE(d.latitude) + MARGINS.left); })
        .attr("cy", (d) => { return (Y_SCALE(d.longitude*-1) + MARGINS.top) ; })
        .attr("r", 6)
        .attr("class", "point");

	// Adds the axises to the scatter plot 
	FRAME2.append("g")
		.attr("transform", "translate(" + MARGINS.left + "," + (VIS_HEIGHT + MARGINS.top) + ")")
		.call(d3.axisBottom(X_SCALE).ticks(10))
        .attr("font-size", "15px");
	FRAME2.append("g")
		.attr("transform", "translate(" + MARGINS.left + "," + (MARGINS.bottom) + ")")
		.call(d3.axisLeft(Y_SCALE).ticks(10))
        .attr("font-size", "15px");

    // displays the last point clicked text 
    function pointClicked() {

        let xCoord = d3.select(this).attr("cx");
        let yCoord = d3.select(this).attr("cy");

        xCoord = Math.round(X_SCALE.invert(xCoord - MARGINS.left));
        yCoord = Math.round(Y_SCALE.invert(yCoord - MARGINS.top));
        
        document.getElementById("last_point").innerHTML = "Last Point Clicked: (" + xCoord + "," + yCoord + ")";

        this.classList.toggle('point-border');
    }
    
    // event listeners 
    d3.selectAll(".point").on("click", pointClicked)
  }); 

