// River wandering


class River {
    constructor(x, y) {
        // variables
        this.pos = createVector(x, y);
        this.origin = createVector(x, y);
        this.vel = createVector(1, 0);
        this.acc = createVector(0, 0);
        this.arrived = false;
        this.complete = false;
        this.targetIndex = 0;
        this.distToTarget = width;
        this.angleToTarget = 0;
        this.targetProgress = 0;
        this.noiseVal = 0;
        this.path = [];
        this.dotPath = [];

        // parameters
        this.mass = 2;
        this.maxSpeed = 4;
        this.maxForce = 2;
        this.maxAngleFromTarget = 0.8 * PI;
        this.slowRadius = 30;
        this.stopRadius = 20;
        this.noiseScale = 60 / width;
    }

    // Create new river with the same position, velocity and acc
    replicate() {
        let newRiver = new River(0, 0);
        newRiver.pos = this.pos.copy();
        newRiver.vel = this.vel.copy();
        newRiver.acc = this.acc.copy();

        return newRiver;
    }

    // update progress to reach target
    updateTargetProgress(target) {
        let distOriginTarget = p5.Vector.sub(target, this.origin).mag();
        this.distToTarget = p5.Vector.sub(target, this.pos).mag();
        this.angleToTarget = p5.Vector.sub(target, this.pos).heading();
        this.targetProgress = 1 - (this.distToTarget / distOriginTarget);
    }

    // wander, with noise, towards target
    wanderToTarget(target) {
        let force = createVector(1, 0);
        let angleOffset = this.maxAngleFromTarget;
        let forceMag = this.maxForce;

        this.updateTargetProgress(target);

        // if is close to the target
        if (this.distToTarget < this.slowRadius) {
            // narrow down to target
            angleOffset = map(this.targetProgress, 0, 1, angleOffset, 0)
        }

        // if arrived to the target
        if (this.distToTarget < this.stopRadius) {
            // stop
            forceMag = 0;
            this.arrived = true;
        }

        // apply noise offset on angle to target
        let angle = map(this.noiseVal, 0, 1, (this.angleToTarget - angleOffset), (this.angleToTarget + angleOffset));

        // create wander force from that angle and max mag
        force.setHeading(angle);
        force.setMag(forceMag);
        force.limit(this.maxForce);
        return force;
    }

    // apply a force to the river
    applyForce(force, show = false) {
        this.acc.add(force.mult(1 / this.mass));

        // debug parameter to draw force vector
        if (show) {
            this.showVector(force, origin = this.pos);
        }
    }

    // update physics 
    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.set(0, 0);

        // calculate the noise value for this position
        this.noiseVal = noise(this.pos.x * this.noiseScale, this.pos.y * this.noiseScale);

        // add current position to the river path
        this.path.push({
            x: this.pos.x,
            y: this.pos.y,
            weight: this.noiseVal
        });
    }

    // draw lines
    show() {
        push();
        stroke(lineColor);
        strokeWeight(2);
        let minStroke = 0.1;
        let maxStroke = 5;

        // loop path drawing lines with variable stroke weight
        let previousPoint = this.path[0];
        for (let point of this.path) {
            strokeWeight(map(point.weight, 0, 1, minStroke, maxStroke));
            line(point.x, point.y, previousPoint.x, previousPoint.y)
            previousPoint = point;
        }
        pop();
    }

    // debug function to draw vector
    showVector(vector, origin = createVector(0, 0), scale = 200, color = 'rgb(0,255,0)') {
        push();
        stroke(color);
        strokeWeight(1);
        fill(255);
        translate(origin.x, origin.y);
        line(0, 0, scale * vector.x, scale * vector.y);
        pop();
    }


    showDot(x = 0, y = 0, r = 8, turns = 3) {
        if (this.dotPath.length < 1) {
            for (var a = 0; a < turns * TWO_PI; a += 0.1) {
                let noiseVal = noise(a * 0.2, this.pos.y);
                let rOffset = map(noiseVal, 0, 1, 0, 1)
                this.dotPath.push({
                    x: r * rOffset * cos(a) + x,
                    y: r * rOffset * sin(a) + y,
                    weight: noiseVal
                })
            }
        } else {
            push();
            stroke(lineColor);
            noFill();
            let previousPoint = this.dotPath[0];
            let minStroke = 0.1;
            let maxStroke = 2;
            for (let point of this.dotPath) {
                strokeWeight(map(point.weight, 0, 1, minStroke, maxStroke));
                line(point.x, point.y, previousPoint.x, previousPoint.y)
                previousPoint = point;
            }
            pop();

        }
    }
}
