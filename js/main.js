// create frame constants
const FRAME_HEIGHT = 500;
const FRAME_WIDTH = 800; 
const MARGINS = {left: 80, right: 50, top: 50, bottom: 50};

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

  console.log(data)

  const color = d3.scaleOrdinal()

                        .domain(["Convenience Stores", "Pharmacies & Drug Stores", "Meat Markets", "Fish & Seafood Markets", "All Other Specialty Food Stores", "Supermarkets/Other Grocery (Exc Convenience) Strs", "Fruit & Vegetable Markets", 
                                "Warehouse Clubs & Supercenters", "Farmers Markets", "Winter Markets","Department Stores (Except Discount Dept Stores)"])             
                        .range([ "blue", "green", "red", "purple", "yellow", "orange", "pink", "brown", "grey", "indigo", "black"]);
  
  const count = d3.rollup(data, g => g.length, d => d.prim_type);
  const nums = count.values()

// bar chart based on species
    // hard code amounts of each species
  const MAX_AMT = d3.max(nums);

  console.log(MAX_AMT)
    // create scale  for y scale 
  const AMT_SCALE = d3.scaleLinear() 
                      .domain([MAX_AMT + 250, 0]) 
                      .range([0, VIS_HEIGHT]); 

  // create x axis scale based on category names
    const CATEGORY_SCALE = d3.scaleBand() 
                .domain(data.map((d) => { return d.prim_type; })) 
                .range([0, VIS_WIDTH])
                .padding(.2); 


    // plot bar based on data with rectangle svgs 
  var bars = FRAME1.selectAll("bar")  
        .data(count) 
        .enter()       
        .append("rect")  
          .attr("y", (d) => { return AMT_SCALE(d[1]) + MARGINS.bottom; }) 
          .attr("x", (d) => { return CATEGORY_SCALE(d[0]) + MARGINS.left;}) 
          .attr("height", (d) => { return VIS_HEIGHT - AMT_SCALE(d[1]); })
          .attr("width", CATEGORY_SCALE.bandwidth())
          .style("fill", (d) => {return color(d[0]); })
          .attr("class", "bar");



   // append x axis 
   FRAME1.append("g") 
        .attr("transform", "translate(" + MARGINS.left + 
              "," + (VIS_HEIGHT + MARGINS.top) + ")") 
        .call(d3.axisBottom(CATEGORY_SCALE))
          .attr("font-size", '10px');
    

    // append y axis
  FRAME1.append("g") 
        .attr("transform", "translate(" + (MARGINS.left) + 
              "," + (MARGINS.top) + ")") 
        .call(d3.axisLeft(AMT_SCALE).ticks(10)) 
          .attr("font-size", '20px');
        
})

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

        // FRAME2.append("circle")
        //     .attr("cx", (d) => { return (X_SCALE(latitude) + MARGINS.left); })
        //     .attr("cy", (d) => { return (Y_SCALE(longitude) + MARGINS.top) ; })
        //     .attr("r", 6)
        //     .attr("class", "point")
        //     .on("click", pointClicked);
    
    // event listeners 
    d3.selectAll(".point").on("click", pointClicked)
  }); 

