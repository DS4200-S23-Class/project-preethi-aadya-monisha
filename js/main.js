// create frame constants
const FRAME_HEIGHT = 800;
const FRAME_WIDTH = 1000; 
const MARGINS = {left: 150, right: 50, top: 50, bottom: 50};

const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right; 



// frame1 to append svgs in vis1 div
const FRAME1 = d3.select("#vis1") 
                  .append("svg") 
                    .attr("height", FRAME_HEIGHT)   
                    .attr("width", FRAME_WIDTH)
                    .attr("class", "frame");


  // frame to add the svg in vis2 div
const FRAME2 = d3.select("#vis2")
    .append("svg")
    .attr("height", FRAME_HEIGHT)
    .attr("width", FRAME_WIDTH)
    .attr("class", "frame")


  // create projection to plot longititude/latitude 
   let projection = d3.geoMercator().center([-72.02, 42])
                    .scale(12000)
                    .translate([VIS_WIDTH/2,VIS_HEIGHT/2]);

   let g = FRAME2.append("g");

   
// plot geoJSON of mass
d3.json("data/usa.json").then((data) => { 
      
        g.selectAll(
                   "path").data(data.features).enter().append(
                   "path").attr("fill", "white").attr(
                   "d", d3.geoPath().projection(projection)).style(
                   "stroke", "black");

});


// read in  data
d3.csv("data/food_retailers.csv").then((data) => { 
  
  //log data
  console.log(data);	

 // create scale for colors based on store type
  const color = d3.scaleOrdinal()
                        .domain(["Convenience Stores", "Pharmacies", "Meat Markets", "Seafood Markets", "Other Specialites", "Supermarkets", "Fruit & Vegetable Markets", 
                                "Warehouse Clubs", "Farmers Markets", "Winter Markets","Department Stores"])             
                        .range(["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]);
  

  // bar chart based on establishment type
  // caulctae number of entries per establishment type
  let count = d3.rollup(data, g => g.length, d => d.prim_type);

  // determine max numnber
  let nums = count.values();
  let MAX_AMT = d3.max(nums);



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


   // append y axis 
   FRAME1.append("g") 
        .attr("transform", "translate(" + MARGINS.left + 
              "," + (MARGINS.top) + ")") 
        .call(d3.axisLeft(CATEGORY_SCALE))
          .attr("font-size", '10px')
        .append('text')
        .attr('class', 'axis-label')
        .text("Type of Establishment")
        .attr('x', MARGINS.left + (VIS_WIDTH) / 2)
        .attr('y', 50);
    

    // append x axis
  FRAME1.append("g") 
        .attr("transform", "translate(" + (MARGINS.left) + 
              "," + (MARGINS.bottom +VIS_HEIGHT) + ")") 
        .call(d3.axisBottom(AMT_SCALE).ticks(10)) 
          .attr("font-size", '20px')
        .append('text')
        .attr('class', 'axis-label')
        .text("Type of Establishment")
        .attr('x', MARGINS.left + (VIS_WIDTH) / 2)
        .attr('y', MARGINS.bottom +VIS_HEIGHT);



    //SECOND VIS - scatter plot
    
        let circleR = 5;
    
      // Plots the data points on to the scatter plot 
    g.selectAll("points")
          .data(data)
          .enter()
          .append("circle")
          .attr("cx", (d) => { return projection([d.longitude,d.latitude])[0]; })
          .attr("cy", (d) => { return projection([d.longitude,d.latitude])[1]; })
          .attr("r", circleR)
          .attr("class", "point")
          .style("fill", (d) => {return color(d.prim_type); });


    // set zoom for vis2 that calls handleZoom
      let zoom = d3.zoom().on('zoom', handleZoom).scaleExtent([1, 10]).extent([[0, 0], [VIS_WIDTH, VIS_HEIGHT]]);
     
      function handleZoom({transform}) {
          g.attr('transform', transform);
          console.log(transform.k);
          g.selectAll("circle").attr('r', circleR / transform.k);
      };
      

    FRAME2.call(zoom);
    

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
                    "<br> Municipal:" + d.municipal + "<br>Type of Store: " + d.prim_type)
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


  


  let allGroup = d3.group(data, (d) => d.municipal).keys();
  let groupArray = Array.from(allGroup);

  
    // add the options to the button
  
      let options = '';

        for (let i = 0; i < groupArray.length; i++) {
          options += '<option value="' + groupArray[i] + '">';
        };

     

        document.getElementById('muncipals').innerHTML = options;


    // // A function that update the chart
     function update() {

      let selectedGroup = document.getElementById("mun");
      let str  = String(selectedGroup.value);

  
    //   // Create new data with the selection?
       let dataFilter = data.filter((d) => {return d.municipal== str})
       console.log(dataFilter);

       g.selectAll("circle").remove();

     // Give these new data to update line
         g.selectAll("points")
            .data(dataFilter)
            .enter()
            .append("circle")
            .attr("cx", (d) => { return projection([d.longitude,d.latitude])[0]; })
            .attr("cy", (d) => { return projection([d.longitude,d.latitude])[1]; })
            .attr("r", 3)
            .attr("class", "point")
            .style("fill", (d) => {return color(d.prim_type); })
            
          FRAME2.call(zoom);

           // Add event listeners
    FRAME2.selectAll(".point")
          .on("mouseover", handleMouseover2) 
          .on("mousemove", handleMousemove2)
          .on("mouseleave", handleMouseleave2);    


          // caulctae number of entries per establishment type
    let count = d3.rollup(dataFilter, g => g.length, d => d.prim_type);

    // determine max numnber
    let nums = count.values();
    let MAX_AMT = d3.max(nums);

      // create scale  for x scale 
    const AMT_SCALE = d3.scaleLinear() 
                        .domain([0, MAX_AMT + MAX_AMT/10]) 
                        .range([0, VIS_WIDTH]); 

    // create y axis scale based on category names
      const CATEGORY_SCALE = d3.scaleBand() 
                  .domain(dataFilter.map((d) => { return d.prim_type; })) 
                  .range([0, VIS_HEIGHT])
                  .padding(.2); 


    FRAME1.selectAll("rect").remove();
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
            .attr("class", "bar")
            .call(zoom)
            .append("g");

        FRAME1.selectAll("g").remove();

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
      
      // Add event listeners
      FRAME1.selectAll(".bar")
            .on("mouseover", handleMouseover) //add event listeners
            .on("mousemove", handleMousemove)
            .on("mouseleave", handleMouseleave);    


    };



     // add Event Listener to button to submit new coordinates 
    document.getElementById("submitButton").addEventListener("click", update);

    // Add event listeners
    FRAME2.selectAll(".point")
          .on("mouseover", handleMouseover2) 
          .on("mousemove", handleMousemove2)
          .on("mouseleave", handleMouseleave2);    

   

     
        
});




