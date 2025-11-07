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

        this.moonEle = document.createElement('div');
        this.moonEle.style.top = this.y + 'px';
        this.moonEle.className = 'moon';

        this.updatePosition();

        return [ele, this.moonEle];
    };

    Sun.prototype.updatePosition = function() {
        // the sun moves from left to right being at 0 at 6am and window.innerWidth at 6pm she can disappear beyond those points
        let date = new Date();
        let hours = date.getHours() + date.getMinutes() / 60;
        let percentOfDay = (hours - 6) / 12; // 0 at 6am, 1 at 6pm
        this.x = percentOfDay * (global.window.innerWidth + 200) - 100;
        this.ele.style.left = Math.round(this.x) + 'px';

        // the moon is opposite the sun it comes in at 6pm and goes out at 6am
        // so we need to calculate its position accordingly but in two parts becase it goes across midnight
        let moonX;
        if (hours >= 18) {
            let percentOfNight = (hours - 18) / 12; // 0 at 6pm, 1 at 6am
            moonX = percentOfNight * (global.window.innerWidth + 200) - 100;
        } else {
            let percentOfNight = (hours + 6) / 12; // 0 at 6pm, 1 at 6am
            moonX = percentOfNight * (global.window.innerWidth + 200) - 100;
        }
        this.moonEle.style.left = Math.round(moonX) + 'px';

        // we allso want to add a sunset class to the document body when the sun is near the horizon
        if (hours < 7 || hours > 17) {
            document.body.classList.add('sunset');
        } else {
            document.body.classList.remove('sunset');
        }

        // and in the night we wnat to add a night class to show the moon
        if (hours < 6 || hours > 18) {
            document.body.classList.add('night');
        } else {
            document.body.classList.remove('night');
        }

        if (document.nosun) {
            document.body.classList.remove('night');
        }
    };

    Sun.prototype.start = function() {
        // animate the sun beams
        const duration = 180;
        this.ele.style.animation = 'sun-beam-rotate ' + duration + 's linear infinite';

        setInterval(this.updatePosition.bind(this), 1000);
    };

    global.Sun = Sun;

})(window);
