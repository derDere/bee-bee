(function (global) {

  function TouchSicks(options) {
    options = options || {};
    this.deadzone = options.deadzone == null ? 0.15 : options.deadzone; // fraction of radius treated as 0
    this.outerRadius = options.outerRadius == null ? 120 : options.outerRadius; // px
    this.innerRadius = options.innerRadius == null ? 55 : options.innerRadius; // px
    this.activeOpacity = options.activeOpacity == null ? 0.5 : options.activeOpacity;
    this.passiveOpacity = options.passiveOpacity == null ? 0.15 : options.passiveOpacity;

    this.leftTouchId = null;   // identifier for movement stick
    this.rightTouchId = null;  // identifier for aim stick

    this.leftOrigin = null;    // {x,y} start position
    this.rightOrigin = null;   // {x,y} start position

    this.leftVector = { x: 0, y: 0 };   // normalized movement output
    this.rightVector = { x: 0, y: 0 };  // normalized aim output

    this.rightActive = false;          // whether right stick is currently engaged

    this._initDom();
    this._bind();
  }

  // Public API expected (stubs / not implemented logic yet):
  // moveAxis() -> [x,y] from -1..1 for movement stick
  // targetAxis() -> [x,y] from -1..1 for aim/target stick
  // targetPressed() -> boolean true if aim stick active

  TouchSicks.prototype.moveAxis = function() {
    return [this.leftVector.x, this.leftVector.y];
  };

  TouchSicks.prototype.targetAxis = function() {
    return [this.rightVector.x, this.rightVector.y];
  };

  TouchSicks.prototype.targetPressed = function() {
    return this.rightActive;
  };

  // Internal: create joystick DOM elements (hidden by default)
  TouchSicks.prototype._initDom = function() {
    var doc = global.document;
    this.root = doc.body;

    // Movement stick elements
    this.leftOuter = doc.createElement('div');
    this.leftInner = doc.createElement('div');
    this.leftOuter.className = 'touch-stick outer left';
    this.leftInner.className = 'touch-stick inner left';
    this.leftOuter.style.position = 'absolute';
    this.leftInner.style.position = 'absolute';
    this.leftOuter.style.pointerEvents = 'none';
    this.leftInner.style.pointerEvents = 'none';
    this._styleCircle(this.leftOuter, this.outerRadius, this.passiveOpacity);
    this._styleCircle(this.leftInner, this.innerRadius, this.activeOpacity);
    this.leftOuter.style.display = 'none';
    this.leftInner.style.display = 'none';
    this.root.appendChild(this.leftOuter);
    this.root.appendChild(this.leftInner);

    // Aim stick elements
    this.rightOuter = doc.createElement('div');
    this.rightInner = doc.createElement('div');
    this.rightOuter.className = 'touch-stick outer right';
    this.rightInner.className = 'touch-stick inner right';
    this.rightOuter.style.position = 'absolute';
    this.rightInner.style.position = 'absolute';
    this.rightOuter.style.pointerEvents = 'none';
    this.rightInner.style.pointerEvents = 'none';
    this._styleCircle(this.rightOuter, this.outerRadius, this.passiveOpacity);
    this._styleCircle(this.rightInner, this.innerRadius, this.activeOpacity);
    this.rightOuter.style.display = 'none';
    this.rightInner.style.display = 'none';
    this.root.appendChild(this.rightOuter);
    this.root.appendChild(this.rightInner);
  };

  TouchSicks.prototype._styleCircle = function(ele, radius, opacity) {
    ele.style.width = radius + 'px';
    ele.style.height = radius + 'px';
    ele.style.marginLeft = (-radius / 2) + 'px';
    ele.style.marginTop = (-radius / 2) + 'px';
    ele.style.borderRadius = '50%';
    ele.style.background = 'rgba(255,255,255,' + opacity + ')';
    ele.style.transition = 'opacity 120ms';
    ele.style.zIndex = 9999;
  };

  // Bind touch events (logic intentionally left minimal / placeholder)
  TouchSicks.prototype._bind = function() {
    var self = this;
    var doc = global.document;

    var halfWidth = function() { return global.innerWidth / 2; };

    function assignTouch(touch) {
      var x = touch.clientX;
      var y = touch.clientY;
      if (x < halfWidth()) {
        if (self.leftTouchId === null) {
          self.leftTouchId = touch.identifier;
          self.leftOrigin = { x: x, y: y };
          self.leftVector.x = 0; self.leftVector.y = 0;
          showStick(self.leftOuter, self.leftInner, x, y);
        }
      } else {
        if (self.rightTouchId === null) {
          self.rightTouchId = touch.identifier;
          self.rightOrigin = { x: x, y: y };
          self.rightVector.x = 0; self.rightVector.y = 0;
          self.rightActive = true;
          showStick(self.rightOuter, self.rightInner, x, y);
        }
      }
    }

    function showStick(outer, inner, x, y) {
      outer.style.display = 'block';
      inner.style.display = 'block';
      outer.style.left = x + 'px';
      outer.style.top = y + 'px';
      inner.style.left = x + 'px';
      inner.style.top = y + 'px';
    }

    function hideStick(outer, inner) {
      outer.style.display = 'none';
      inner.style.display = 'none';
    }

    function updateVector(touch, origin, vector, inner) {
      var dx = touch.clientX - origin.x;
      var dy = touch.clientY - origin.y;
      var dist = Math.sqrt(dx*dx + dy*dy);
      var max = self.outerRadius / 2; // because we centered by margin half-size
      if (dist > max) {
        dx = dx / dist * max;
        dy = dy / dist * max;
        dist = max;
      }
      // Position inner circle
      inner.style.left = (origin.x + dx) + 'px';
      inner.style.top = (origin.y + dy) + 'px';
      // Normalize to -1..1 (before deadzone) using max radius
      var nx = dx / max;
      var ny = dy / max;
      var mag = Math.sqrt(nx*nx + ny*ny);
      if (mag < self.deadzone) {
        vector.x = 0; vector.y = 0; return 0;
      }
      vector.x = nx;
      vector.y = ny;
      return mag;
    }

    doc.body.addEventListener('touchstart', function(e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        assignTouch(e.changedTouches[i]);
      }
      e.preventDefault();
    }, { passive: false });

    doc.body.addEventListener('touchmove', function(e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        if (t.identifier === self.leftTouchId && self.leftOrigin) {
          updateVector(t, self.leftOrigin, self.leftVector, self.leftInner);
        } else if (t.identifier === self.rightTouchId && self.rightOrigin) {
          var mag = updateVector(t, self.rightOrigin, self.rightVector, self.rightInner);
          self.rightActive = self.rightTouchId !== null && mag >= self.deadzone;
        }
      }
      e.preventDefault();
    }, { passive: false });

    function releaseTouch(t) {
      if (t.identifier === self.leftTouchId) {
        self.leftTouchId = null;
        self.leftOrigin = null;
        self.leftVector.x = 0; self.leftVector.y = 0;
        hideStick(self.leftOuter, self.leftInner);
      } else if (t.identifier === self.rightTouchId) {
        self.rightTouchId = null;
        self.rightOrigin = null;
        self.rightVector.x = 0; self.rightVector.y = 0;
        self.rightActive = false;
        hideStick(self.rightOuter, self.rightInner);
      }
    }

    doc.body.addEventListener('touchend', function(e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        releaseTouch(e.changedTouches[i]);
      }
      e.preventDefault();
    }, { passive: false });

    doc.body.addEventListener('touchcancel', function(e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        releaseTouch(e.changedTouches[i]);
      }
      e.preventDefault();
    }, { passive: false });
  };

  global.TouchSicks = TouchSicks;

})(window);
