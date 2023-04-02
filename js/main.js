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

  // create a frame to add the svg in vis2 div
const FRAME2 = d3.select("#vis2")
    .append("svg")
    .attr("height", FRAME_HEIGHT)
    .attr("width", FRAME_WIDTH)
    .attr("class", "frame")



// read in  data
d3.csv("data/food_retailers.csv").then((data) => { 
  
console.log(data);	

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


    // scattter plot of food establishments
    // the max X used for scaling
    const MAX_X = d3.max(data, (d) => { return parseFloat(d.latitude); });

   // the max Y used for scaling
    const MIN_Y = d3.min(data, (d) => { return parseFloat(d.longitude); });

  // set scales for x and y
    const X_SCALE = d3.scaleLinear()
    .domain([(MAX_X), 41.2])
    .range([0, VIS_WIDTH]);

    const Y_SCALE = d3.scaleLinear()
    .domain([69, (MIN_Y*-1)])
    .range([VIS_HEIGHT, 0]);
  
    // Plots the data points on to the scatter plot 
    FRAME2.selectAll("points")
          .data(data)
          .enter()
          .append("circle")
          .attr("cx", (d) => { return (X_SCALE(d.latitude) + MARGINS.left); })
          .attr("cy", (d) => { return (Y_SCALE(d.longitude*-1) + MARGINS.top) ; })
          .attr("r", 6)
          .attr("class", "point")
          .style("fill", (d) => {return color(d.prim_type); });



      // create new variable for tooltip
        const TOOLTIP2 = d3.select("#vis2")
                              .append("div")
                                .attr("class", "tooltip")
                                .style("opacity", 0); 


       // Define event handler functions for tooltips/hovering
    function handleMouseover2(event, d) {

      // on mouseover, make opaque 
      TOOLTIP2.style("opacity", 1);

      // change bar color
      d3.select(this)
        .style("fill", "red");

    };

    function handleMousemove2(event, d) {

      // position the tooltip and fill in information 
      TOOLTIP2.html("Store Name:" + d.name + "<br>Store Address:" + d.address +
                    "<br> Municipal:" + d.municipal + "<br>Type of Store: " + d.prim_type )
              .style("left", (event.pageX + 10) + "px") 
              .style("top", (event.pageY - 10) + "px"); 
     
    };

    function handleMouseleave2(event, d) {

      // on mouseleave, make transparant again 
      TOOLTIP2.style("opacity", 0); 

      //revert to original bar color
      d3.select(this)
        .style("fill", (d) => {return color(d.prim_type);});
    };

    // Add event listeners
    FRAME2.selectAll(".point")
          .on("mouseover", handleMouseover2) //add event listeners
          .on("mousemove", handleMousemove2)
          .on("mouseleave", handleMouseleave2);    


        
});




