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
                    let zadd = 0;
                    if (Math.random() < 0.5) {
                        lilypad.classList.add('flower');
                        zadd += 20;
                    }
                    // calc top left on round pond but not on beach
                    let waterW = pondW - (beachW * 4);
                    let waterH = pondH;
                    let raw = Math.random();
                    let big = Math.floor(raw * 1e9);
                    let angle = (big % 628318530) / 100000000 * Math.PI * 2 / (Math.PI * 2) * Math.PI * 2; // simplify: angle in [0,2pi)
                    let rRaw = (big >> 3) % 1000000;
                    let rNorm = rRaw / 1000000; // [0,1)
                    let r = Math.sqrt(rNorm);
                    let size = 30 + (big % 30);
                    let h = Math.floor(size / 4);
                    let waterInnerW = waterW - size;
                    let waterInnerH = waterH - h;
                    if (waterInnerW < 0) waterInnerW = 0;
                    if (waterInnerH < 0) waterInnerH = 0;
                    let rx = (waterInnerW) / 2;
                    let ry = (waterInnerH) / 2;
                    let cx = beachW + waterW / 2;
                    let cy = waterH / 2;
                    let padCx = cx + Math.cos(angle) * r * rx;
                    let padCy = cy + Math.sin(angle) * r * ry;
                    let lx = Math.floor(padCx - size / 2);
                    let ly = Math.floor(padCy - h / 2);
                    if (lx < beachW) lx = beachW;
                    if (lx + size > beachW + waterW) lx = beachW + waterW - size;
                    if (ly < 0) ly = 0;
                    if (ly + h > waterH) ly = waterH - h;
                    lilypad.style.width = size + 'px';
                    lilypad.style.height = h + 'px';
                    lilypad.style.left = lx + 'px';
                    lilypad.style.top = ly + 'px';
                    lilypad.style.zIndex = (ly + h + zadd).toString();
                    pond.appendChild(lilypad);
                }
            } 
        }

        const TREE_PART_SIZE = 30;
        for (let [treePos, stepSize, treeSize] of this.trees) {
            let treeP = treePos / 100;
            let stemP = stepSize / 100;
            let stemHeight = Math.floor(treeSize * stemP);
            let stepWidth = Math.floor(treeSize / 17);
            let leavesHeight = treeSize - stemHeight;
            let leavesCount = Math.round(leavesHeight / TREE_PART_SIZE);
            let treeX = Math.floor(this.l * treeP);

            let tree = document.createElement('div');
            tree.className = 'tree';
            tree.style.left = treeX + 'px';

            let stem = document.createElement('div');
            stem.className = 'stem';
            stem.style.height = stemHeight + 'px';
            stem.style.width = stepWidth + 'px';
            stem.style.left = -Math.floor(stepWidth  / 2) + 'px';
            stem.style.bottom = '0px';
            let halfStemW = Math.floor(stepWidth / 2);
            stem.style.borderBottomLeftRadius = halfStemW + 'px';
            stem.style.borderBottomRightRadius = halfStemW + 'px';
            tree.appendChild(stem);

            for (let i = 0; i < leavesCount; i++) {
                let w = (((leavesCount - i) * 2) - 1) * stepWidth / 4;
                let leaf = document.createElement('div');
                leaf.className = 'leaf n' + i;
                leaf.style.height = TREE_PART_SIZE + 'px';
                leaf.style.width = w + 'px';
                leaf.style.left = -Math.floor(w / 2) + 'px';
                leaf.style.bottom = (stemHeight + (i * TREE_PART_SIZE)) + 'px';
                leaf.style.borderTopLeftRadius = TREE_PART_SIZE + 'px';
                leaf.style.borderTopRightRadius = TREE_PART_SIZE + 'px';
                tree.appendChild(leaf);
            }

            ele.appendChild(tree);
        }

        return ele;
    }

    global.Island = Island;

})(window);
