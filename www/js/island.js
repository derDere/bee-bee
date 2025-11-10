(function (global) {

    function Island(x, y, l, pond, trees) {
        this.x = x;
        this.y = y;
        this.l = l;
        [this.pondPos, this.pondSize] = pond;
        this.trees = trees;
    }

    Island.prototype.getEle = function() {
        let ele = document.createElement('div');
        ele.className = 'island';
        ele.style.left = this.x + 'px';
        ele.style.top = this.y + 'px';
        ele.style.width = this.l + 'px';
        let h = Math.floor(this.l / 8);
        ele.style.height = h + 'px';

        let step = Math.floor(this.l * 0.06);
        let startTop = Math.floor(h / 2);
        for (let i = 0; i < 5; i++) {
            let kh = Math.floor(((h * 0.4) + 10) - (i * (step / 6)));
            let kliff = document.createElement('div');
            kliff.className = 'kliff n' + i;
            kliff.style.borderLeftWidth = step + 'px';
            kliff.style.borderRightWidth = step + 'px';
            kliff.style.borderTopWidth = kh + 'px';
            kliff.style.height = kh + 'px';
            kliff.style.top = startTop + 'px';
            startTop += kh;
            ele.appendChild(kliff);
        }

        let grass = document.createElement('div');
        grass.className = 'grass';
        ele.appendChild(grass);

        if (this.pondPos > 0) {
            let pondM = this.pondSize / 100;
            let pondW = Math.floor(this.l * pondM);
            let pondH = Math.floor(h * pondM);
            let pondPos = this.pondPos / 100;
            let beachW = Math.floor(pondW * 0.1);
            let pond = document.createElement('div');
            pond.className = 'pond';
            pond.style.width = pondW + 'px';
            pond.style.height = pondH + 'px';
            pond.style.left = Math.floor((this.l - pondW) * pondPos) + 'px';
            pond.style.top = Math.floor((h - pondH) / 2) + 'px';
            pond.style.borderLeftWidth = beachW + 'px';
            pond.style.borderRightWidth = beachW + 'px';
            grass.appendChild(pond);

            if (pondW > 200) {
                let lilipdCount = Math.floor((pondW - 200) / 100) + 1;
                for (let i = 0; i < lilipdCount; i++) {
                    let lilypad = document.createElement('div');
                    lilypad.className = 'lilypad';
                    if (Math.random() < 0.5) {
                        lilypad.classList.add('flower');
                    }
                    // calc top left on round pond but not on beach
                    let waterW = pondW - (beachW * 2);
                    let waterH = pondH;
                    // random angle
                    let angle = Math.random() * 2 * Math.PI;
                    // random radius within from 0 to 1 (will later be scaled to waterW and waterH)
                    let radius = Math.random() * 0.7;
                    // random size from 30 to 60
                    let size = 30 + Math.floor(Math.random() * 30);
                    let h = Math.floor(size / 4);
                    let lx = Math.floor((waterW / 2) + Math.cos(angle) * radius * (waterW / 2 - size));
                    let ly = Math.floor((waterH / 2) + Math.sin(angle) * radius * (waterH / 2 - size));
                    lilypad.style.width = size + 'px';
                    lilypad.style.height = h + 'px';
                    lilypad.style.left = lx + 'px';
                    lilypad.style.top = ly + 'px';
                    lilypad.style.zIndex = (ly + h).toString();
                    pond.appendChild(lilypad);
                }
            } 
        }

        return ele;
    }

    global.Island = Island;

})(window);