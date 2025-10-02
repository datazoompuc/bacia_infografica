// Visual parameters
var width = window.innerWidth;
var height = window.innerHeight;
const backgroundColor = 'rgb(255,255,255)';
const terrainColor = 'rgba(115, 195, 115, 0.2)';
const lineColor = 'rgba(62,104,139,1)';
const urlBase = "https://datazoom.com.br/amazonia/pt/viz/"
const tablePath = 'assets/categorias.csv';
var showNet = false;

// Global variables
var table;
var net;
var rivers = [];
var canvas;
var bg;

// Function to create terrain
function createTerrain() {
    var noiseScale = 20 / width;
    var cell = 10;
    var cutoff = 0.4;
    var border = 0.1;

    // Create new graphics element
    t = createGraphics(width,height)
    t.stroke(terrainColor)
  
    // loop the canvas
    for (var x = 0; x < width; x+=cell) {
		for (var y = 0; y < height; y+=cell) {
            // get noise value for each 
            var noiseVal = noise(noiseScale * x, noiseScale * y);
            // get position in %
            var xPerc = x/width;
            var yPerc = y/height;

            // only show point if above cutoff
            if(noiseVal > cutoff) {
                // fade if close to the border
                if(xPerc < border) noiseVal = noiseVal*xPerc/border;
                if(yPerc < border) noiseVal = noiseVal*yPerc/border;
                if(xPerc > (1-border)) noiseVal = noiseVal*(1-xPerc)/border;
                if(yPerc > (1-border)) noiseVal = noiseVal*(1-yPerc)/border;
   
                t.strokeWeight(noiseVal*cell);
                t.point(x,y)
            } 
		}		
  	}
    return t;
}


// Preload table and font
function preload() {
    table = loadTable(tablePath, 'csv', 'header');
}

// Setup
function setup() {
    // Canvas setup
    width = window.innerWidth;
    height = window.innerHeight;
    canvas = createCanvas(width, height);
    canvas.parent("canvas_div");
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(0.025 * min(width, height));

    // Load network
    net = new Network();
    net.networkFromCSV(table);
    net.fastForward(1000);

    // Create first river
    let rio = new River(0, 0.5 * height);
    rivers.push(rio);

    // Create background;
    bg = createTerrain();
}

// Draw loop
function draw() {
    // draw background as image
    background(255);
    image(bg,0,0);

    // update/show network
    net.update();
    if (showNet) net.show();

    // loop rivers
    for (let rio of rivers) {
        let targetNode = net.nodes[rio.targetIndex];
        let target = targetNode.pos;
        // update rivers that are not "complete"
        if (!rio.complete) {

            // update rivers that have not arrived to target/destination
            if (!rio.arrived) {
                // apply wander to target
                let force = rio.wanderToTarget(target);
                rio.applyForce(force);
                rio.update();
            }
            // from rivers that arrived to target, create new rivers
            else {
                // loop all source-target combinations
                for (let link of net.links) {
                    // if river arrived to the source of another link
                    if (rio.targetIndex == link.source) {
                        // create new river for this link
                        let newRiver = rio.replicate();
                        newRiver.targetIndex = link.target;
                        rivers.push(newRiver);
                    }
                }
                // mark this river as done
                rio.complete = true;
            }
        } else {
            net.showHover(targetNode)
            // if there is no next river, draw dot
            if(!net.links.find(l => l.source == rio.targetIndex)) {
                rio.showDot(x=target.x, y=target.y);
            }
        }
        rio.show();
    }
}

// handle mouse click event
function mouseClicked() {
  const node = net.getClosestNode(mouseX, mouseY);

  if (node.url) {
    window.open(urlBase + node.url);
  } else if (node.name.toLowerCase().trim() === "data<br>zoom") {
    window.open("https://www.datazoom.com.br"); 
  }
}