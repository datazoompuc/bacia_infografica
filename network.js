// Create force directed nodes

class Node {
    constructor(x, y, label = "", level = 0, url = null) {
        // variables
        this.pos = createVector(x, y);
        this.force = createVector(0, 0);
        this.mass = 2 * PI * (5 / (1 + level));
        this.size = 50 / (level + 1);
        this.name = label;
    	this.url = url; 
        this.selected = false;
        this.level = level;
        this.hoverText = this.createHoverText();
    }

    createHoverText() {
        let element = createP(this.name);
        element.parent("canvas_div");
	element.html(this.name);
        element.position(this.pos.x, this.pos.y);

        return element;
    }
}

class Link {
    constructor(source, target, distance) {
        // variables
        this.source = source;
        this.target = target;
        this.distance = distance;
    }
}

// Create network
class Network {
    constructor() {
        // variables
        this.nodes = [];
        this.links = [];

        // parameters
        this.gravityConstant = 0.2;
        this.gravityCenter = createVector(1 * width, 0.5 * height);
        this.repulsionConstant = 3000;
        this.linkConstant = 0.5;
        this.edgeConstant = 1.5;
        this.vBorder = 0.2 * height;
        this.hBorder = 0.4 * width;
        this.cicleCount = 0;
        this.maxCicles = 500;
    }

// Build nodes and links from CSV
networkFromCSV(table) {

  // Create nodes (ignore last column = url)
  for (let r = 0; r < table.getRowCount(); r++) {
    const lastColIndex = table.getColumnCount() - 1;

    for (let c = 0; c < lastColIndex; c++) {
      const nodeName  = table.getString(r, c);
      const nodeLevel = c;

      // Subcategory gets its url from the last column
      let nodeUrl = null;
      if (c === lastColIndex - 1) {
        nodeUrl = table.getString(r, lastColIndex);
      }

      if (this.nodes.findIndex(n => n.name == nodeName) < 0) {
        this.nodes.push(new Node(random(0, width), random(0, height), nodeName, nodeLevel, nodeUrl));
      }
    }
  }

  // Create links (do not connect to url column)
  for (let r = 0; r < table.getRowCount(); r++) {
    for (let c = 0; c < table.getColumnCount() - 2; c++) {
      const s = this.nodes.findIndex(n => n.name == table.getString(r, c));
      const t = this.nodes.findIndex(n => n.name == table.getString(r, c + 1));

      if (s >= 0 && t >= 0 && this.links.findIndex(l => l.source == s && l.target == t) < 0) {
        this.links.push(new Link(s, t, 300));
      }
    }
  }
}
    // Force that bring all nodes to a position
    applyGravityForce() {
        for (let node of this.nodes) {
            let gravity = p5.Vector.sub(this.gravityCenter, node.pos);
            gravity = gravity.mult(this.gravityConstant);
            node.force.add(gravity);
        }
    }

    // Repulsive force between nodes
    applyRepulsionForces() {
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                let pos = this.nodes[i].pos;
                let dis = this.nodes[j].pos.copy().sub(pos);
                let force = dis.div(dis.mag() * dis.mag());
                force.mult(this.repulsionConstant);
                this.nodes[i].force.add(force.copy().mult(-1));
                this.nodes[j].force.add(force);
            }
        }
    }

    // Force from edge to nodes
    applyEdgeForces() {
        for (let node of this.nodes) {
            let leftBorder = 0 + this.hBorder;
            let rightBorder = width - this.hBorder;
            let topBorder = 0 + this.vBorder;
            let bottomBorder = height - this.vBorder;

            let leftDist = p5.Vector.sub(node.pos, createVector(leftBorder, 0));
            let rightDist = p5.Vector.sub(node.pos, createVector(rightBorder, 0));
            let topDist = p5.Vector.sub(node.pos, createVector(0, topBorder));
            let bottomDist = p5.Vector.sub(node.pos, createVector(0, bottomBorder));

            let force = createVector(0, 0);

            if (leftDist.x < 0) {
                force = leftDist.mult(-1);
                force.y = 0;
                node.force.add(force.mult(this.edgeConstant))
            }

            if (rightDist.x > 0) {
                force = rightDist.mult(-1);
                force.y = 0;
                node.force.add(force.mult(this.edgeConstant))
            }

            if (topDist.y < 0) {
                force = topDist.mult(-1);
                force.x = 0;
                node.force.add(force.mult(this.edgeConstant))
            }

            if (bottomDist.y > 0) {
                force = bottomDist.mult(-1);
                force.x = 0;
                node.force.add(force.mult(this.edgeConstant))
            }
        }
    }

    // Link forces
    applyLinkForces() {

        for (let link of this.links) {
            let node1 = this.nodes[link.source];
            let node2 = this.nodes[link.target];
            if (node1 && node2) {
                let dis = node1.pos.copy().sub(node2.pos);
                let force = dis.mult(this.linkConstant); //.mult(diff);
                node1.force.sub(force);
                node2.force.add(force);
            }
        }
    }

    // Apply all forces to the network
    applyForces() {
        for (let node of this.nodes) {
            node.force = createVector(0, 0);
        }
        this.applyGravityForce();
        this.applyRepulsionForces();
        this.applyLinkForces();
        this.applyEdgeForces();
    }

    // Update physics
    update() {
        if (this.cicleCount < this.maxCicles) {
            this.cicleCount++
            for (let node of this.nodes) {
                this.applyForces();
                let force = node.force.copy();
                let vel = force.copy().div(node.mass);
                node.pos.add(vel)
            }
        }

        // keep position of first node fixed
        this.fixNodePosition(0, 0.25 * width, 0.5 * height);
        // update node closest to mouse position
        this.getClosestNode(mouseX, mouseY);
    }

    // fix node on a position
    fixNodePosition(index = 0, x = 0, y = 0) {
        this.nodes[index].pos.x = x;
        this.nodes[index].pos.y = y;
    }

    // Function to fast forward network physics
    fastForward(ticks = 1000) {
        for (let i = 0; i < ticks; i++) {
            this.update(true);
        }
    }

    // Function to get node closest to mouse position
    getClosestNode(x, y) {
        var minDist = 1000;
        var selectedNode = this.nodes[0];

        for (let node of this.nodes) {
            var nodeDist = dist(x, y, node.pos.x, node.pos.y);
            node.selected = false;
            if (nodeDist < minDist) {
                selectedNode = node;
                minDist = nodeDist;
            }
        }
        selectedNode.selected = true;
        return selectedNode;
    }

    showHover(node) {
        node.hoverText.position(node.pos.x, node.pos.y);

        if(node.level == 0) {
            node.hoverText.class("main_text");
        } else if(node.level == 1) {
            node.hoverText.class("branch_text");
        } else { 
            if (node.selected) {
                node.hoverText.class("hover_text");
            } else {
                node.hoverText.class("hidden_text");
            }
        }
    }

    // draw nodes and links for debug
    show() {
        push();
        stroke('rgba(0,0,0,0.2)');
        strokeWeight(1);

        // draw links
        for (let link of this.links) {
            let node1 = this.nodes[link.source];
            let node2 = this.nodes[link.target];
            line(node1.pos.x, node1.pos.y, node2.pos.x, node2.pos.y)
        };
        pop();

        // draw nodes
        for (let node of this.nodes) {
            push();
            if (node.selected) {
                stroke('rgba(0,0,0,0)');
                fill('rgba(0,0,0,0.5)');
                ellipse(node.pos.x, node.pos.y, node.size, node.size)
            } else {
                stroke('rgba(0,0,0,0)');
                fill('rgba(0,0,0,0.2)');
                ellipse(node.pos.x, node.pos.y, node.size, node.size)
            }
            pop();
        }
    }
}