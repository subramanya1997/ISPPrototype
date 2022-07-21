gVars = {}

function init(){
    var canvas = document.getElementById('canvas');
    canvas.style.width ='100%';
    canvas.style.height='100%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    canvas.getContext('2d').textAlign = "center";

    /* Global scope */
    gVars['canvas'] = canvas;
    gVars['floorPlan'] = new Floorplan();
    gVars['mode'] = "point";

    canvas.addEventListener('mousedown', mouseClicked);
    document.addEventListener('keydown', onkeydown);
}

function drawImageToCanvas(canvas, imgPath){
    var image = new Image();
    image.onload = function() {
        var wrh = image.width / image.height;
        var newWidth = canvas.width;
        var newHeight = newWidth / wrh;
        if (newHeight > canvas.height) {
            newHeight = canvas.height;
            newWidth = newHeight * wrh;
        }
        var xOffset = newWidth < canvas.width ? ((canvas.width - newWidth) / 2) : 0;
        var yOffset = newHeight < canvas.height ? ((canvas.height - newHeight) / 2) : 0;
        gVars['floorPlan'].setFloorMap(gVars['pFloorPlan'].name, image, canvas.getContext('2d'), [xOffset, yOffset]);
    }
    image.src = imgPath;
    
}

function getPosition(event){
    var x = event.clientX - canvas.offsetLeft;
    var y = event.clientY - canvas.offsetTop;
    return [x, y]
}

init();
var cancel = document.getElementById('cancel');
var selectFileButton = document.getElementById('selectFileButton');
var submitButton = document.querySelector('submit');
var inventoryText = document.getElementById('pInventory');
var invTag = document.getElementById('invTag');
var tags = document.getElementById('tags');
var form = document.getElementById('saveForm');
form.addEventListener('submit', checkAndSubmit);
changeMode(gVars['mode']);

function changeMode(mode){
    gVars['mode'] = mode;
    var ctx = gVars['canvas'].getContext('2d');
    if(gVars['mode'] == 'point'){
        gVars['canAddPoints'] = true;
        setPointMode(null);
        gVars['floorPlan'].selectPoint(null, ctx);
    }
    else{
        gVars['canAddPoints'] = false;
        setPointMode(null);
        gVars['floorPlan'].selectPoint(null, ctx);
    }
}

function setInvTagVisiblity(isVisible){
    if(isVisible){
        invTag.classList.remove("hide");
        inventoryText.value = "";
    }else{
        invTag.classList.add("hide");
        inventoryText.value = "";
    }
}

function setPointMode(ptn){
    if(ptn == null){
        setInvTagVisiblity(false);
        return;
    }
    setInvTagVisiblity(true);
    text = "";
    for(var inv of ptn.inventory){
        text += '<div class="btn-group m-1" role="group" aria-label="Basic example">'
        text += '<button type="text" class="btn btn-outline-dark disabled">'+inv+'</button>'
        text += '<button type="button" class="btn btn-danger" onclick="deleteInvetory(this)"><i class="fa fa-times"></i></button>'
        text += '</div>'
    }
    tags.innerHTML = text;
}

function resetPointMode(){

}

function setPathMode(){

}

function resetPathMode(){

}

function checkAndSubmit(e){
    e.preventDefault();
    data = gVars['floorPlan'].getSaveData();
    document.saveDataForm.hdata.value = JSON.stringify(data);
    form.submit();
}

cancel.onclick = function(){
    //cancel is clicked
}

inventoryText.onkeydown = function(e){
    if(e.key == 'Enter'){
        gVars['floorPlan'].addInvetory(inventoryText.value);
        setPointMode(gVars['floorPlan'].pntSelected);
        inventoryText.value = "";
        console.log(inventoryText.value)
    }
}

function deleteInvetory(item){
    var text = item.parentNode.querySelector(".disabled").innerHTML
    gVars['floorPlan'].deleteInventory(text);
    setPointMode(gVars['floorPlan'].pntSelected);
}

function mouseClickedOnPointMode(ptn, ctx, isSelected, isDelete, x, y){
    //delete
    if (isDelete){
        if(isSelected){
            gVars['floorPlan'].deletePoint(ptn, ctx);
            setPointMode(gVars['floorPlan'].pntSelected);
        }
    }//select or create
    else{
        if(isSelected){
            gVars['floorPlan'].selectPoint(ptn, ctx);
            setPointMode(gVars['floorPlan'].pntSelected);
        }else{
            ptn = gVars['floorPlan'].createPoint(x, y, ctx);
            gVars['floorPlan'].selectPoint(ptn, ctx);
            setPointMode(gVars['floorPlan'].pntSelected);
        } 
    }  
}

function mouseClickedOnPathMode(ptn, ctx, isSelected, isDelete){
    if (isDelete){
        gVars['floorPlan'].deletePath(ptn);
        gVars['floorPlan'].selectPoint(ptn, ctx);
        gVars['floorPlan'].draw(ctx);
    }
    else if (!isDelete && isSelected){
        gVars['floorPlan'].computePath(ptn);
        if(gVars['floorPlan'].pntSelected != ptn){
            gVars['floorPlan'].draw(ctx);
        }
        gVars['floorPlan'].selectPoint(ptn, ctx);
    }

}

function mouseClicked(e){
    var [x, y] = getPosition(e);
    var ctx = gVars['canvas'].getContext('2d');
    var [isSelected, ptn] = gVars['floorPlan'].getPointUnder(x, y, ctx);
    if(gVars['mode'] == "point"){
        mouseClickedOnPointMode(ptn, ctx, isSelected, e.metaKey, x, y)
    }else{
        mouseClickedOnPathMode(ptn, ctx, isSelected, e.metaKey)
    }
}

selectFileButton.onchange = function(){
    const [file] = selectFileButton.files;
    if (file) {
        gVars['pFloorPlan'] = file;
        drawImageToCanvas(gVars['canvas'], URL.createObjectURL(gVars['pFloorPlan']));
    }
}

function onkeydown(e){
    if (e.altKey){
        var ctx = gVars['canvas'].getContext('2d');
        gVars['floorPlan'].selectPoint(null, ctx);
    }
    else if (e.shiftKey){
        console.log(gVars);
        gVars['floorPlan'].printData();
    }
    else if (e.code == "KeyA"){
        var data = gVars['floorPlan'].getSaveData();
        console.log(data);
    }

}