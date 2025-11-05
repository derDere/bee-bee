(function (global) {

    function Cloud(){
        // y is the screen position height
        this.y = Math.random() * window.innerHeight;

        // distance is the distance from the viewer with 0 at the front and 100 way back
        this.distance = Math.round(Math.random() * 100);

        // based on the distance the z-index is set with 0 behing behind everything and 1000 in from everything all distances starting at 50 go behind everything (z-index 0)
        this.zIndex = this.distance < 50 ? 1000 : 0;

        // based on the distance we calculate the scale from 1.5 at 0 distance to 0.1 at 100 distance
        const minScale = 0.5;
        const maxScale = 3.5;
        this.scale = maxScale - (this.distance / 100) * (maxScale - minScale);

        // now we calculate the speed based on the distance using a const min and max speed
        const minSpeed = 0.2;
        const maxSpeed = 2.0;
        this.speed = minSpeed + ((100 - this.distance) / 100) * (maxSpeed - minSpeed);

        // cloud parts are divs inside the cloud that make it look like a cloud
        // here well decie how much parts we want randomly
        const minParts = 3;
        const maxParts = 8;
        this.partCount = minParts + Math.floor(Math.random() * (maxParts - minParts + 1));
    }

    Cloud.prototype.getEle = function() {
        let ele = document.createElement('div');
        ele.className = 'cloud';
        ele.style.top = this.y + 'px';
        ele.style.zIndex = this.zIndex;
        ele.style.transform = 'scale(' + this.scale + ')';
        this.ele = ele;

        let maxW = 0;
        for (let i = 0; i < this.partCount; i++) {
            let part = document.createElement('div');
            part.className = 'cloud-part n' + i;
            let x = Math.round(Math.random() * 200);
            let y = Math.round(Math.random() * 60);
            part.style.left = x + 'px';
            part.style.top = y + 'px';
            let w = 50 + Math.round(Math.random() * 100);
            let h = 30 + Math.round(Math.random() * 60);
            part.style.width = w + 'px';
            part.style.height = h + 'px';
            ele.appendChild(part);
            if (x + w > maxW) maxW = x + w;
        }
        maxW *= this.scale;
        maxW += 100; // extra space
        maxW = Math.round(maxW);
        this.maxW = maxW;
        this.ele.style.left = -maxW + 'px';

        return ele;
    };

    Cloud.prototype.destroy = function() {
        this.ele.parentNode.removeChild(this.ele);
    };

    Cloud.prototype.startAnimation = function() {
        // we will just set this.ele.style.left to window.innerWidth + 100 px but adjust the transition to a speed that matches this.speed
        
        // first we calculate the distance to travel and the time it will take based on this.speed (pixels per frame at 60fps)
        let distance = window.innerWidth + 200 + this.maxW;
        let time = distance / this.speed / 60; // in seconds

        this.ele.style.transition = 'left ' + time + 's linear';
        this.ele.style.left = (window.innerWidth + 100) + 'px';

        // return time in ms
        return time * 1000;
    };

    global.Cloud = Cloud;

    global.addClound = function(pageEl) {
        let cloud = new Cloud();
        let ele = cloud.getEle();
        pageEl.appendChild(ele);

        setTimeout(function() {
            let time = cloud.startAnimation();
            setTimeout(function() {
                cloud.destroy();
                addClound(pageEl);
            }, time);
        }, 100);

        return cloud;
    };

})(window);
