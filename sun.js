(function (global) {

    function Sun(){
        this.x = global.window.innerWidth / 2;
        this.y = 200;
        this.beamCount = 16;
    }

    Sun.prototype.getEle = function() {
        let ele = document.createElement('div');
        ele.className = 'sun';
        ele.style.top = this.y + 'px';
        ele.style.left = this.x + 'px';
        this.ele = ele;

        for (let i = 0; i < this.beamCount; i++) {
            let beam = document.createElement('div');
            beam.className = 'sun-beam n' + i;
            ele.appendChild(beam);
            beam.style.transform = 'rotate(' + (i * (360 / this.beamCount)) + 'deg)';
        }

        this.updatePosition();

        return ele;
    };

    Sun.prototype.updatePosition = function() {
        // the sun moves from left to right being at 0 at 6am and window.innerWidth at 6pm she can disappear beyond those points
        let date = new Date();
        let hours = date.getHours() + date.getMinutes() / 60;
        let percentOfDay = (hours - 6) / 12; // 0 at 6am, 1 at 6pm
        this.x = percentOfDay * (global.window.innerWidth + 200) - 100;
        this.ele.style.left = this.x + 'px';
    };

    Sun.prototype.start = function() {
        // animate the sun beams
        const duration = 180;
        this.ele.style.animation = 'sun-beam-rotate ' + duration + 's linear infinite';

        setInterval(this.updatePosition.bind(this), 1000);
    };

    global.Sun = Sun;

})(window);
