(function (global) {

  function Bee(){
    this.x = global.innerWidth / 2;
    this.y = global.innerHeight * 2;
    this.speed = 25;
    this.isGhost = false;
    this.flipped = false;
    this.laser = null;
    this.laser_x = 0;
    this.laser_y = 0;
    this.mouth = null;
    this.callbacks = [];
    this.lastUpdateTime = Date.now();
    
    if (global.TouchSicks) {
      this.touchSticks = new global.TouchSicks();
    }
    
    this.touchLaserEngaged = false; // tracks if laser started via touch sticks
  }

  Bee.prototype.updateTime = function() {
    this.lastUpdateTime = Date.now();
  }

  Bee.prototype.onUpdate = function(callback) {
    this.callbacks.push(callback);
  };

  Bee.prototype.triggerUpdate = function() {
    let data = {
      x: this.x,
      y: this.y,
      laser_on: this.laser !== null,
      laser_x: this.laser_x,
      laser_y: this.laser_y
    }
    for (let callback of this.callbacks) {
      callback(data);
    }
  }

  Bee.prototype.pointLaserAt = function(x, y) {    
    if (!this.laser) return;
    this.laser_x = x;
    this.laser_y = y;
    let dx = x - (this.x + 50);
    let dy = y - (this.y + 25);
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (!this.flipped) {
        angle += 180;
    } else {
        angle = -angle;
    }
    this.laser.style.transform = 'rotate(' + angle + 'deg)';
  };

  Bee.prototype.laserAt = function(x, y) {
    if (this.laser) {
      this.pointLaserAt(x, y);
      return;
    }
    let laser = document.createElement('div');
    laser.className = 'laser';
    this.body.appendChild(laser);
    this.body.classList.add('firing-laser');
    this.laser = laser;
    this.pointLaserAt(x, y);
  };

  Bee.prototype.laserStop = function() {
    if (this.laser) {
      this.body.removeChild(this.laser);
      this.body.classList.remove('firing-laser');
      this.laser = null;
    }
  };

  Bee.prototype.moveTo = function(x, y) {
    x = Math.round(x);
    y = Math.round(y);

    let movedToTheRight = x > this.x;
    let xDelta = Math.abs(x - this.x);

    this.x = x;
    this.y = y;
    this.body.style.left = this.x + 'px';
    this.body.style.top = this.y + 'px';

    if (movedToTheRight) {
      this.body.classList.add('facing-right');
      this.flipped = true;
    } else if (xDelta > 0) {
      this.body.classList.remove('facing-right');
      this.flipped = false;
    }
  };

  Bee.prototype.moveTowards = function(x, y) {
    let dx = x - this.x;
    let dy = y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) return;
    let stepX = (dx / distance) * this.speed;
    let stepY = (dy / distance) * this.speed;
    this.moveTo(this.x + stepX, this.y + stepY);
  };

  Bee.prototype.moveInDirection = function(angleDegrees) {
    let angleRadians = angleDegrees * (Math.PI / 180);
    let stepX = Math.cos(angleRadians) * this.speed;
    let stepY = Math.sin(angleRadians) * this.speed;
    this.moveTo(this.x + stepX, this.y + stepY);
  };

  Bee.prototype.kill = function() {
    if (!this.isGhost) {
      this.isGhost = true;
      this.body.classList.add('ghost');
    }
  };

  Bee.prototype.revive = function() {
    if (this.isGhost) {
      this.isGhost = false;
      this.body.classList.remove('ghost');
    }
  };

  Bee.prototype.getEle = function() {
    var ele = document.createElement('div');
    ele.className = 'bee';
    ele.style.left = this.x + 'px';
    ele.style.top = this.y + 'px';
    this.body = ele;

    const bumCount = 6;
    for (let i = 0; i < bumCount; i++) {
        const bum = document.createElement('div');
        bum.className = 'bum';
        ele.appendChild(bum);
    }

    const head = document.createElement('div');
    head.className = 'head';
    ele.appendChild(head);

    const mouth = document.createElement('div');
    mouth.className = 'mouth';
    //mouth.innerText = '👄';
    head.appendChild(mouth);
    this.mouth = mouth;

    for (let i = 0; i < 2; i++) {
        const wing = document.createElement('div');
        wing.className = 'wing n' + i;
        ele.appendChild(wing);

        const eye = document.createElement('div');
        eye.className = 'eye n' + i;
        //eye.innerText = '👁️';
        head.appendChild(eye);
        if (i === 0) {
          this.rightEye = eye;
        } else {
          this.leftEye = eye;
        }

        const antenna = document.createElement('div');
        antenna.className = 'antenna n' + i;
        head.appendChild(antenna);
    }

    for (let i = 0; i < 6; i++) {
        let u = i % 2;
        const leg = document.createElement('div');
        leg.className = 'leg n' + i + ' u' + u;
        //leg.innerText = '🦵🏿';
        ele.appendChild(leg);
    }

    const stinger = document.createElement('div');
    stinger.className = 'stinger';
    ele.appendChild(stinger);

    const waist = document.createElement('div');
    waist.className = 'waist';
    ele.appendChild(waist);

    const body = document.createElement('div');
    body.className = 'body';
    ele.appendChild(body);

    const neck = document.createElement('div');
    neck.className = 'neck';
    ele.appendChild(neck);

    return ele;
  };

  Bee.prototype.destroy = function() {
    if (this.body && this.body.parentNode) {
      this.body.parentNode.removeChild(this.body);
    }
  };

  Bee.prototype.control = function() {
    let pressedKeys = {};

    global.addEventListener('keydown', (event) => {
      pressedKeys[event.key] = true;
    });

    global.addEventListener('keyup', (event) => {
      pressedKeys[event.key] = false;
    });

    const update = () => {
      let kx = 0;
      let ky = 0;

      if (pressedKeys['w']) ky -= 1;
      if (pressedKeys['a']) kx -= 1;
      if (pressedKeys['s']) ky += 1;
      if (pressedKeys['d']) kx += 1;

      let mx = 0, my = 0;
      if (this.touchSticks) {
        const mv = this.touchSticks.moveAxis();
        mx = mv[0];
        my = mv[1];
      }

      let stepX = kx + mx;
      let stepY = ky + my;

      const length = Math.sqrt(stepX * stepX + stepY * stepY);
      if (length > 0) {
        stepX = (stepX / length) * this.speed;
        stepY = (stepY / length) * this.speed;

        let newX = this.x + stepX;
        let newY = this.y + stepY;

        if (newX < 0) newX = 0;
        if (newX > global.innerWidth - 50) newX = global.innerWidth - 50;
        if (newY < 0) newY = 0;
        if (newY > global.innerHeight - 50) newY = global.innerHeight - 50;

        this.moveTo(newX, newY);
      }

      // Touch laser aiming (do not interfere with mouse unless touch active)
      if (this.touchSticks) {
        const tv = this.touchSticks.targetAxis();
        const ax = tv[0];
        const ay = tv[1];
        const touchActive = this.touchSticks.targetPressed() && (Math.abs(ax) > 0 || Math.abs(ay) > 0);
        if (touchActive) {
          const range = 400; // distance from bee center to project aim point
          const targetX = this.x + 50 + ax * range;
          const targetY = this.y + 25 + ay * range;
          if (!this.laser) {
            this.laserAt(targetX, targetY);
          } else {
            this.pointLaserAt(targetX, targetY);
          }
          this.touchLaserEngaged = true;
        } else if (this.touchLaserEngaged) {
          // Only stop if we previously engaged via touch
          this.laserStop();
          this.touchLaserEngaged = false;
        }
      }

      requestAnimationFrame(update);
    };

    update();

    setInterval(this.triggerUpdate.bind(this), 100);
  };

  global.Bee = Bee;

  global.triggerWingTick = function() {
    let ele = document.body;
    setInterval(function() {
      ele.classList.toggle('wing-tick');
    }, 50);
  };

})(window);
