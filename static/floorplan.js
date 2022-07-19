class Floorplan {
    constructor(){
        this.points = new Set();
        this.paths = new Map();
        this.pathMap = new Map();
        this.pntSelected = null;
        this.selectStyle = 'red';
        this.defaultStyle = 'black';
        this.mode = 0; // 0 : None, 1: Points, 2: Path 
        this.url = null;
        this.image = null;
        this.offsets = null;
        this.cnt = 0;
    }
    
    #getColor(isSelected){
        return isSelected ? this.selectStyle : this.defaultStyle;
    }

    #drawPoint(pnt, ctx){
        ctx.fillStyle = this.#getColor(pnt.isSelected);
        ctx.fill(pnt);
    }

    #drawLines(path, ctx){
        ctx.lineWidth = 8;
        ctx.stroke(path);
    }

    #updatePoint(ptn){
        this.points.add(ptn);
    }

    #drawFloorMap(image, ctx, offsets){
        if(image != null){
            ctx.drawImage(image, offsets[0], offsets[1]);
        }
    }

    setFloorMap(url, image, ctx, offsets){
        this.url = url;
        this.image = image;
        this.offsets = offsets;
        this.#drawFloorMap(this.image, ctx, this.offsets);
    }

    createPoint(x, y, ctx){
        var pnt = new Path2D();
        pnt.arc(x, y, 10, 0, 2 * Math.PI);
        pnt.name = "node_"+String(this.cnt);
        pnt.isSelected = false;
        pnt.inventory = new Set();
        pnt.x = x;
        pnt.y = y;
        this.points.add(pnt);
        this.cnt += 1;
        return pnt;
    }

    addInvetory(inv){
        if(this.pntSelected != null){
            this.pntSelected.inventory.add(inv);
            this.#updatePoint(this.pntSelected);
        }
    }

    deleteInventory(inv){
        if(this.pntSelected != null){
            this.pntSelected.inventory.delete(inv);
            this.#updatePoint(this.pntSelected);
        } 
    }

    getPointUnder(x, y, ctx) {
        for(var pnt of this.points){
            if (ctx.isPointInPath(pnt, x, y)) {
                return [true, pnt];
            }  
        }
        return [false, null];
    }

    deletePoint(pnt, ctx){
        if(pnt == this.pntSelected){
            this.selectPoint(null, ctx);
        }
        this.points.delete(pnt);
        this.deletePath(pnt);
        this.draw(ctx);
    }

    selectPoint(pnt, ctx){
        //previously selected unselect it
        if (this.pntSelected != null){
            this.pntSelected.isSelected = !this.pntSelected.isSelected;
        }
        //current is equal to null
        this.pntSelected = pnt;
        if (this.pntSelected != null){
            this.pntSelected.isSelected = !this.pntSelected.isSelected;
        }
        this.draw(ctx);
    }

    draw(ctx){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.#drawFloorMap(this.image, ctx, this.offsets);
        for(var pnt of this.points){
            this.#drawPoint(pnt, ctx);
        }
        var temp = new Set();
        for (var [_name, path] of this.pathMap) {
            if(!temp.has(_name)){
                var [first, second] = path.name;
                this.#drawLines(path, ctx);
                temp.add(first);
                temp.add(second);
            }   
        }
    }

    computePath(ptn){
        if(this.pntSelected != null && ptn != null && this.pntSelected != ptn){
            var temp = null;
            var [_name1, _name2 ] = ["", ""]
            if(this.paths.has(this.pntSelected.name)){
                temp = this.paths.get(this.pntSelected.name)
                temp.add(ptn.name)
                this.paths.set(this.pntSelected.name, temp);
                _name1 = this.pntSelected.name + '_' + ptn.name
            }else{
                temp = new Set();
                temp.add(ptn.name);
                this.paths.set(this.pntSelected.name, temp);
                _name1 = this.pntSelected.name + '_' + ptn.name
            }
            if(this.paths.has(ptn.name)){
                temp = this.paths.get(ptn.name)
                temp.add(this.pntSelected.name)
                this.paths.set(ptn.name, temp);
                _name2 = ptn.name + '_' + this.pntSelected.name
            }else{
                temp = new Set();
                temp.add(this.pntSelected.name);
                this.paths.set(ptn.name, temp);
                _name2 = ptn.name + '_' + this.pntSelected.name
            }
            var _path =  new Path2D();
            _path.moveTo(this.pntSelected.x, this.pntSelected.y);
            _path.lineTo(ptn.x, ptn.y);
            _path.name = new Set()
            _path.name.add(_name1)
            _path.name.add(_name2)
            this.pathMap.set(_name1, _path);
            this.pathMap.set(_name2, _path);
        }
    }

    deletePath(ptn){
        if(ptn != null){
            if(this.paths.has(ptn.name)){
                var temp = null;
                var [_name1, _name2 ] = ["", ""]
                var _itTemp = this.paths.get(ptn.name)
                for(var _ptn of _itTemp){
                    if(this.paths.has(_ptn)){
                        temp = this.paths.get(_ptn);
                        temp.delete(ptn.name);
                        if(temp.size == 0){
                            this.paths.delete(_ptn);
                        }else{
                            this.paths.set(_ptn, temp);
                        }
                        _name1 = ptn.name + '_' + _ptn
                        _name2 = _ptn + '_' + ptn.name
                        this.pathMap.delete(_name1);
                        this.pathMap.delete(_name2);
                    }
                }
                this.paths.delete(ptn.name);
            }
        }
    }

    printData(){
        console.log(this);
    }
}