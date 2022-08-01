gVars = {}

function init(project){
    var canvas = document.getElementById('canvas');
    canvas.style.width ='100%';
    canvas.style.height='100%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    canvas.getContext('2d').textAlign = "center";

    /* Global scope */
    gVars['canvas'] = canvas;
    gVars['floorPlan'] = new Floorplan(project, gVars['canvas'].getContext('2d'), false, false);
    console.log(gVars['floorPlan']);


    var invTags = document.getElementById('tags');
    canvas.addEventListener('mousedown', mouseClicked);
    canvas.addEventListener('mousemove', mouseMove);
    document.addEventListener('keydown', onkeydown);
    document.addEventListener('keyup', onkeyup);

    text = "";
    for(var [inv, pnt] of gVars['floorPlan'].invMap){
       text += '<button type="button" class="btn btn-outline-secondary m-1" data-toggle="button" aria-pressed="false" autocomplete="off" onclick="inventoryClicked(this)">' + inv + '</button>'
    }
    invTags.innerHTML = text;
}

function inventoryClicked(btn){
    if (!btn.classList.contains('active'))
    {
        gVars['floorPlan'].updatePathsAndPoints(btn.innerHTML)
    }
    else{
        gVars['floorPlan'].updatePathsAndPoints(btn.innerHTML, false)
    }   
}

function getPosition(event){
    var x = event.clientX - canvas.offsetLeft;
    var y = event.clientY - canvas.offsetTop;
    return [x, y]
}

function mouseClicked(e){
    if(e.which != 1){
        return;
    }
    var [x, y] = getPosition(e);
    var [isSelected, pnt] = gVars['floorPlan'].getPointUnder(x, y);
    if (e.altKey){
        gVars['floorPlan'].selectPoint(pnt);
    }else{
        if(pnt.draw){
            //to do completed
        }
    }
}

function mouseMove(e){
    var [x, y] = getPosition(e);
    var [isSelected, pnt] = gVars['floorPlan'].getPointUnder(x, y);
    if(pnt != null){
        if(pnt.draw){
            gVars['floorPlan'].onhover(pnt);
        }
    }else{
        gVars['floorPlan'].draw();
    }

    
}

function onkeydown(e){
    if (e.key == 'Alt'){
        gVars['floorPlan'].showAllpoints();
    }
}

function onkeyup(e){
    if (e.key == 'Alt'){
        gVars['floorPlan'].showAllpoints(false);
    }
    gVars['floorPlan'].updatePathsAndPoints();
}



