class Floorplan {
    constructor(project = null, ctx = null, drawPnt = true, drawPth = true){
        this.points = new Set();
        this.paths = new Map();
        this.pathMap = new Map();
        this.pointsMap = new Map();
        this.invMap = new Map();
        this.pntSelected = null;
        this.selectStyle = 'red';
        this.defaultStyle = 'black';
        this.mode = 0; // 0 : None, 1: Points, 2: Path 
        this.url = null;
        this.image = null;
        this.offsets = null;
        this.cnt = 0;
        this.id = null;
        this.drawPnt = drawPnt;
        this.drawPth = drawPth;
        if(project != null){
            this.ctx =  ctx;
            this.#loadFloorPlan(project);
        }
        this.pointPaths = new Set();
    }

    #loadFloorPlan(project){
        // load image
        var image = new Image();
        image.obj = this;
        image.onload = function() {
            image.obj.setFloorMap(project.imagePath, image, image.obj.ctx, project.offsets);
            image.obj.draw(image.obj.ctx);
        }
        image.src = '/static/save/'+project.imagePath;
        this.offsets = project.offsets;
        this.cnt = project.count;
        this.id = project.id;
        for(var pnt of project.points){
            this.createPoint(pnt.point[0], pnt.point[1], pnt.name, pnt.inventory, pnt.shortestPaths);
        }
        for(var pth of project.paths){
            var toPoints = pth.points;
            for(const ele of toPoints){
                this.createPath(this.pointsMap.get(pth.name),this.pointsMap.get(ele));
            }
        }
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
        ctx.strokeStyle = this.#getColor(path.isSelected);
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
        // this.#drawFloorMap(this.image, ctx, this.offsets);
    }

    createPoint(x, y, name=null, inv=null, shortestPaths=null){
        var pnt = new Path2D();
        pnt.arc(x, y, 10, 0, 2 * Math.PI);
        pnt.name = name == null ? "node_"+String(this.cnt) : name;
        pnt.isSelected = false;
        pnt.inventory = inv == null ? new Set() : new Set(inv);
        pnt.draw = this.drawPnt;
        pnt.x = x;
        pnt.y = y;
        pnt.shortestPaths = shortestPaths == null ? new Map() : shortestPaths
        for(var _inv of pnt.inventory){
            this.invMap.set(_inv, pnt.name);
        }
        this.points.add(pnt);
        this.pointsMap.set(name, pnt);
        if(name == null){
            this.cnt += 1;
        }
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

    getPointUnder(x, y) {
        for(var pnt of this.points){
            if (this.ctx.isPointInPath(pnt, x, y)) {
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
        this.draw();
    }

    selectPoint(pnt, _draw=true){
        //previously selected unselect it
        if (this.pntSelected != null){
            this.pntSelected.isSelected = !this.pntSelected.isSelected;
        }
        //current is equal to null
        this.pntSelected = pnt;
        if (this.pntSelected != null){
            this.pntSelected.isSelected = !this.pntSelected.isSelected;
        }
        if(_draw){
            this.draw();
        }
    }

    draw(){
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.#drawFloorMap(this.image, this.ctx, this.offsets);
        for(var pnt of this.points){
            if(pnt.draw){
                this.#drawPoint(pnt, this.ctx);
            }
        }
        var temp = new Set();
        for (var [_name, path] of this.pathMap) {
            if(!temp.has(_name)){
                if(path.draw){
                    var [first, second] = path.name;
                    this.#drawLines(path, this.ctx);
                    temp.add(first);
                    temp.add(second);
                }
            }   
        }
    }

    createPath(pnt1, pnt2){
        if(pnt1 != null && pnt2 != null && pnt1 != pnt2){
            var temp = null;
            var [_name1, _name2 ] = ["", ""]
            if(this.paths.has(pnt1.name)){
                temp = this.paths.get(pnt1.name);
                temp.add(pnt2.name);
                this.paths.set(pnt1.name, temp);
                _name1 = pnt1.name + '_' + pnt2.name;
            }else{
                temp = new Set();
                temp.add(pnt2.name);
                this.paths.set(pnt1.name, temp);
                _name1 = pnt1.name + '_' + pnt2.name;
            }
            if(this.paths.has(pnt2.name)){
                temp = this.paths.get(pnt2.name);
                temp.add(pnt1.name);
                this.paths.set(pnt2.name, temp);
                _name2 = pnt2.name + '_' + pnt1.name;
            }else{
                temp = new Set();
                temp.add(pnt1.name);
                this.paths.set(pnt2.name, temp);
                _name2 = pnt2.name + '_' + pnt1.name;
            }
            var _path =  new Path2D();
            _path.x1 = pnt1.x;
            _path.y1 = pnt1.y;
            _path.moveTo(pnt1.x, pnt1.y);
            _path.x2 = pnt2.x;
            _path.y2 = pnt2.y;
            _path.lineTo(pnt2.x, pnt2.y);
            _path.name = new Set();
            _path.points = new Set();
            _path.name.add(_name1);
            _path.name.add(_name2);
            _path.points.add(pnt1.name);
            _path.points.add(pnt2.name);
            _path.draw = this.drawPth;
            _path.isSelected = false;
            var _x1x2 = _path.x2 - _path.x1;
            var _y1y2 = _path.y2 - _path.y1;
            _path.distance = Math.sqrt( _x1x2*_x1x2 + _y1y2*_y1y2 );
            this.pathMap.set(_name1, _path);
            this.pathMap.set(_name2, _path);
        }
    }

    computePath(ptn){
        this.createPath(this.pntSelected, ptn);
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
                        _name1 = ptn.name + '_' + _ptn;
                        _name2 = _ptn + '_' + ptn.name;
                        this.pathMap.delete(_name1);
                        this.pathMap.delete(_name2);
                    }
                }
                this.paths.delete(ptn.name);
            }
        }
    }

    computeDistances(){
        let graphMap = new Graph();
        for(var pnt of this.points){
            graphMap.addNode(pnt.name);
        } 
        var _tempName = new Set();
        for (var [name, pth] of this.pathMap){
            if(!_tempName.has(name)){
                var _t = [...pth.points];
                graphMap.addEdge(_t[0], _t[1], pth.distance);
                for(var _tempN of pth.name){
                    _tempName.add(_tempN);
                }
            }
        }
        var _shortestPaths = null;
        for(var pnt1 of this.points){
            _shortestPaths = new Map();
            for(var pnt2 of this.points){
                _shortestPaths.set(pnt2.name, graphMap.findPathWithDijkstra(pnt1.name, pnt2.name));
            }
            pnt1.shortestPaths = _shortestPaths;
        }
    }

    updatePaths(startPnt, points, first=false){
        var _distance = 100000000000000000000;
        var endPoint = null;
        var path = null;
        if (points.size == 0){
            return;
        }
        for(var pnt of points){
            var _pntDistance = this.pointsMap.get(startPnt).shortestPaths[pnt].distance ;
            if(_pntDistance < _distance){
                _distance = _pntDistance;
                endPoint = pnt;
                path = this.pointsMap.get(startPnt).shortestPaths[pnt].path
            }
        }
        if(path != null){
            for(var i = 1; i < path.length; i++){
                var _tempName = startPnt + '_' + path[i];
                this.pathMap.get(_tempName).draw = true;
                this.pathMap.get(_tempName).isSelected = first;
                startPnt = path[i];
            }
        }
        points.delete(endPoint);
        if(!first){
            this.updatePaths(endPoint, points);
        }
    }

    updatePathsAndPoints(invName=null, add=true){
        for(var [pntN, pnt] of this.pointsMap){
            pnt.draw = false;
        }
        for(var [pthN, pth] of this.pathMap){
            pth.draw = false;
            pth.isSelected = false;
        }
        if(invName != null){
            var pntName =  this.invMap.get(invName);
            if(add){
                this.pointPaths.add(pntName);
                
            }else{
                this.pointPaths.delete(pntName);
            }
        }
        for(var pntN of this.pointPaths){
            this.pointsMap.get(pntN).draw = true;
        }
        this.pointsMap.get(this.pntSelected.name).draw = true;
        var points = structuredClone(this.pointPaths);
        this.updatePaths(this.pntSelected.name, points);
        points = structuredClone(this.pointPaths);
        this.updatePaths(this.pntSelected.name, points, true);
        this.draw();
    }

    showAllpoints(show = true){
        for(var [pntN, pnt] of this.pointsMap){
            pnt.draw = show;
            if(pnt.isSelected){
                pnt.draw = true;
            }

        }
        this.draw();
    }

    getSaveData(){
        var data = {
            points : [],
            paths : [],
            imagePath : this.url,
            offsets : this.offsets,
            count : this.cnt,
            id : this.id,
        }
        this.computeDistances();
        for(var pnt of this.points){
            var _invs = []
            for(var inv of pnt.inventory){
                _invs.push(inv)
            }
            
            data["points"].push({
                name: pnt.name,
                point: [pnt.x, pnt.y],
                inventory: _invs,
                shortestPaths: Object.fromEntries(pnt.shortestPaths),
            })
        }

        for(var [node, pth] of this.paths){
            var _pnt = []
            for(var _n of pth){
                _pnt.push(_n)
            }
            data["paths"].push({
                name: node,
                points : _pnt,
            })
        }
        return data;
    }

    printData(){
        console.log(this);
    }
}