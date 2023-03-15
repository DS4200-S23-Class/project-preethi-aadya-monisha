// create frame constants
const FRAME_HEIGHT = 500;
const FRAME_WIDTH = 400; 
const MARGINS = {left: 50, right: 50, top: 50, bottom: 50};

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


  const count = d3.rollup(data, g => g.length, d => d.prim_type);
  console.log(count);

});