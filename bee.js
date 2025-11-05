(function (global) {

  function Bee(){
    this.x = global.innerWidth / 2;
    this.y = global.innerHeight / 2;
  }

  Bee.prototype.getEle = function() {
    var ele = document.createElement('div');
    ele.className = 'bee';
    ele.style.left = this.x + 'px';
    ele.style.top = this.y + 'px';

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
    mouth.innerText = '👄';
    head.appendChild(mouth);

    for (let i = 0; i < 2; i++) {
        const wing = document.createElement('div');
        wing.className = 'wing';
        ele.appendChild(wing);

        const eye = document.createElement('div');
        eye.className = 'eye';
        eye.innerText = '👁';
        head.appendChild(eye);

        const antenna = document.createElement('div');
        antenna.className = 'antenna';
        ele.appendChild(antenna);
    }

    for (let i = 0; i < 6; i++) {
        const leg = document.createElement('div');
        leg.className = 'leg';
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

  global.Bee = Bee;

})(window);
