/**
 * Created with JetBrains WebStorm.
 * User: JJK
 */

/* Grid object dec */
function Grid() {
    this.width = -1;     // dimension parameter
    this.height = -1;    // dimension parameter
    this.pieces = 0;    // Available Pieces
    this.gridArray = 0; // Pieces on main board
    this.sideArray = 0; // Pieces on side Board
    this.sol = new String(); // the internal actual solution
    this.instStr = new String();
    //alert("Grid Created");

    this.setGrid = function(x,y, solutionInput, piecesInput,InstStr) {
		this.sol = solutionInput;
        this.width = x;
        this.height = y;
        this.pieces = piecesInput;
        this.sideArray = new Array(this.pieces.length);
        this.gridArray = new Array(x);
        this.instStr = InstStr;
        for(var i = 0; i < this.pieces.length; i++) {
            this.sideArray[i] = this.pieces[i].copy();
        }
        for (i = 0; i < x; i++) {
            this.gridArray[i] = new Array(y);
        }
        for (i = 0; i < this.width; i++) {
            for(var j = 0; j < this.height; j++) {
                this.gridArray[i][j] = new GridObj("empty");
            }
        }

        //alert("Grid Set")
    }

    this.copyGridArray = function() {
        var gArray = new Array(this.width);
        for(var i = 0; i < this.width; i++) {
            gArray[i] = new Array(this.height);
            for (var j = 0; j <this.height; j++) {
                gArray[i][j] = this.gridArray[i][j].copy();
            }
        }
        return gArray;
    }

    this.toString = function() {
        var string = new String();

           for (var j = 0; j < this.height; j++) {
               string += j.toString() + " | ";
               for(var i = 0; i < this.width; i++) {
                   string += this.gridArray[i][j].type + ":" + this.gridArray[i][j].numNeighbors() + " ";
               }
               string += "\n";
           }
        for(i = 0; i < this.pieces.length; i++)
            string += this.pieces[i].type + " : " + this.pieces[i].num + ", ";

        return string;
    }

}


/* Grid objects go in the grid and represent components (reisistors, wires, etc) */ 
function GridObj(t) {
    this.type = t;
    this.value = -1;
    this.num = -1;
    this.node = -1;
    this.label = "";
    this.neighbors = new Array(4);
    this.neighbors[0] = false;
    this.neighbors[1] = false;
    this.neighbors[2] = false;
    this.neighbors[3] = false;

    this.numNeighbors =  function() {
        var num = 0;
        for(var i = 0; i < 4; i++) {
            if(this.neighbors[i] == true)
                num++;
        }
        return num;
    }

    this.copy = function() {
        var newObj = new GridObj(this.type);
        newObj.value = this.value;
        newObj.num = this.num;
        newObj.node = this.node;
        newObj.label = new String(this.label);
        newObj.neighbors = this.neighbors.slice(0);
        return newObj;
    }
}

function handleDragStart(e) {
// Target (this) element is the source node.
    this.style.opacity = '0.5';

    dragSrcEl = this;

    e.dataTransfer.effectAllowed = 'move';

// Add ghost image to drag
    var ghostImg = document.createElement('img');
    ghostImg.width = 100;

    if(this.hasAttribute('data-xpos'))
        var gObj = theGrid.gridArray[this.dataset.xpos][this.dataset.ypos];
    else if(this.hasAttribute('data-cellnum')) {
        //alert("Lifting from side");
        if(this.dataset.cellnum == -1)
            var gObj = new GridObj('wire');
        else if(this.dataset.cellnum < theGrid.sideArray.length)
            var gObj = theGrid.sideArray[this.dataset.cellnum];
        else
            return;
    }



    if(gObj.type == 'wire')
        ghostImg.src = 'Images/wire.jpg';
    else if (gObj.type == 'battery')
        ghostImg.src = 'Images/battery.png';
    else if (gObj.type == 'resistor')
        ghostImg.src = 'Images/resistor.jpg';
    else if (gObj.type == 'junct')
        ghostImg.src = 'Images/junct.png';
    else if (gObj.type == 'light')
        ghostImg.src = 'Images/lightO.png';
    else if (gObj.type == 'switch')
        ghostImg.src = 'Images/switch.png';
    else
        ghostImg.src = 'Images/ship.png';
    if (e.dataTransfer.setDragImage) {
        e.dataTransfer.setDragImage(ghostImg,0,0);
    } else {
        alert ("Your browser does not support the setDragImage method.");
    }

}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }

    e.dataTransfer.dropEffect = 'move'; // See the section on the DataTransfer object.

    return false;
}

function handleDragEnter(e) {
// this / e.target is the current hover target.
    this.classList.add('over');
}

function handleDragLeave(e) {
    this.classList.remove('over'); // this / e.target is previous target element.
}

function handleDrop(e) {
// this/e.target is current target element.

    if (e.stopPropagation) {
        e.stopPropagation(); // Stops some browsers from redirecting.
    }

// Do nothing if dropping the same cell we're dragging.
    if (dragSrcEl == this) {
        return false;
    }

// get copy of element being dragged and element being dropped onto, along with their coords or number, as needed

    var target;
    var source;
    var tarX = -1;
    var tarY = -1;
    var sourceX = -1;
    var sourceY = -1;

    if (this.hasAttribute('data-xpos')) {
        tarX = this.dataset.xpos;
        tarY = this.dataset.ypos;
        target = theGrid.gridArray[tarX][tarY];
    }

    if (dragSrcEl.hasAttribute('data-xpos')) {
        sourceX = dragSrcEl.dataset.xpos;
        sourceY = dragSrcEl.dataset.ypos;
        source = theGrid.gridArray[sourceX][sourceY];
    } else if (dragSrcEl.hasAttribute('data-cellnum')) {
        if(dragSrcEl.dataset.cellnum == '-1') // If source was the wire tile
            source = new GridObj('wire');
        else
            source = theGrid.sideArray[dragSrcEl.dataset.cellnum];
    }

// Update puzzle data as needed

    if (this.hasAttribute('data-xpos')) { // target is main board
        if(dragSrcEl.hasAttribute('data-xpos')) { // source is main board
            if(addToMainBoard(target, sourceX, sourceY)) // If first placement was allowed, attempt second
                if(!addToMainBoard(source, tarX, tarY))
                    addToMainBoard(source, sourceX, sourceY);
        } else { // Source is side board
            if(removeFromSideBoard(source)) { // If there are enough pieces on side
                if(addToMainBoard(source, tarX, tarY)) // If it was a legit placement on main
                    addToSideBoard(target); // add piece being replaced on main back to side
                else // else, add original piece back to side
                    addToSideBoard(source);
            }
        }
    } else { // Target is side Board
        if(dragSrcEl.hasAttribute('data-xpos')) { // source is Main Board
            addToMainBoard(new GridObj('empty'), sourceX, sourceY);
            addToSideBoard(source);
        } else { // Source is Side board
// Do nothing
        }
    }

    updateBoardGUI();
    return false;
}

function handleDragEnd(e) {
// this/e.target is the source node.
    this.style.opacity = "1.0";
    var cells = document.querySelectorAll('div');
    [].forEach.call(cells, function (col) {
        col.classList.remove('over');
    });
}

function onDivClick(e) {
    if(!e.srcElement) {
        alert("No click target");
        return;
    }
	var tar = e.target;
    var x = tar.dataset.xpos;
    var y = tar.dataset.ypos;
    var gObj = theGrid.gridArray[x][y];
    if(e.ctrlKey) {         // Ctrl click
        if(gObj.type == 'empty') {
            addToMainBoard(new GridObj('wire'), x, y);
        } else {
            addToSideBoard(gObj);
            addToMainBoard(new GridObj('empty'), x, y);
        }
    } else if(gObj.type == 'switch') {
        if(gObj.value == -1) {
            //alert("switch is open, closing");
            gObj.value = 1;
        } else if(gObj.value == 1) {
            //alert("switch is closed, opening");
            gObj.value = -1;
        }
    }
    updateBoardGUI();
}

// Updates the GUI to match the current internal representation of the puzzle
// This should be the only function that actually updates the visual representation
function updateBoardGUI() {
    var sideTab = document.getElementById('sideTab');
    var sideDivs = sideTab.getElementsByTagName('div'); // List of All divs in the side Tab

    [].forEach.call(sideDivs, function(aDiv) {
        if(aDiv.hasAttribute('data-cellnum')) { // Ensure only divs we want are looked at

            aDiv.className = "";

            var cNum = aDiv.dataset.cellnum;
            var aObj = theGrid.sideArray[cNum];
            if(cNum < theGrid.sideArray.length && cNum != -1) { // If this div had pieces to hold other than wires

                if(aObj.num == 0) // No pieces remaining? set to empty
                    aDiv.classList.add('empty');
                else
                    aDiv.classList.add(aObj.type); // Else, update with current type

// Set InnerHTML to reflect value and num
                var innerH = new String();
                if(aObj.num > 0) {
                    innerH = aObj.num;
                    if((dispVals && aObj.value > 0) || aObj.type == 'battery')
                        innerH = aObj.value + " : " + innerH;
                }
                aDiv.innerHTML = innerH;

            } else if(cNum == -1) { // Place wires in first position always
                aDiv.classList.add('wire');
            } else
                aDiv.classList.add('empty');

            aDiv.classList.add("smallGridTile");
        }
    });

    updateAllNeighbors(theGrid.gridArray);
    var mainTab = document.getElementById('boardTab');
    var mainDivs = mainTab.getElementsByTagName('div'); // List of All divs in the main Tab

    [].forEach.call(mainDivs, function(bDiv) {
        if (bDiv.hasAttribute('data-xpos')) {
            var xPos = bDiv.dataset.xpos;
            var yPos = bDiv.dataset.ypos;
            if(xPos < theGrid.width && yPos < theGrid.height) {
                var bObj = theGrid.gridArray[xPos][yPos];

                bDiv.className = "";

    // Update visual representation based on orientation as needed
                if(bObj.node != -2 || showUnconnected) {        // Dont show disconnected nodes if toggled
                    if (bObj.type == 'wire')
                        updateWire(bDiv, parseInt(xPos), parseInt(yPos));
                    else if (bObj.type == 'junct')
                        updateJunct(bDiv, parseInt(xPos), parseInt(yPos));
                    else if (bObj.type == 'resistor')
                        updateResistor(bDiv, parseInt(xPos), parseInt(yPos));
                    else if (bObj.type == 'switch')
                        updateSwitch(bDiv, parseInt(xPos), parseInt(yPos));
                    else if (bObj.type == 'light')
                        updateLight(bDiv, parseInt(xPos), parseInt(yPos));
                    else
                        bDiv.classList.add(bObj.type);

                    // Set innerHTML to reflect value and num
                    if((dispVals && bObj.value != -1 && bObj.type != 'junct' && bObj.type != 'switch') || bObj.type == 'battery' ) {
                        if(bObj.label != "")
                            bDiv.innerHTML = new String(bObj.label + ": " + bObj.value);
                        else
                            bDiv.innerHTML = new String(bObj.value);

                    } else {
                        bDiv.innerHTML = '';
                    }


                } else {
                    bDiv.classList.add("empty");
                    bDiv.innerHTML = "";
                }


            }
        }
        if(largeBoard)
            bDiv.classList.add("largeGridTile");
        else
            bDiv.classList.add("smallGridTile");
    });

    var instEle = document.getElementById('instBox');
    instEle.innerHTML = theGrid.instStr;
}

function updateWire(div, x, y) {
    var wire = theGrid.gridArray[x][y];

    if(wire.neighbors[2] && wire.neighbors[0])
        div.classList.add('wireh');
    else if(wire.neighbors[3] && wire.neighbors[1])
        div.classList.add('wirev');
    else if(wire.neighbors[0] && wire.neighbors[1])
        div.classList.add('wirebr');
    else if(wire.neighbors[3] && wire.neighbors[0])
        div.classList.add('wiretr');
    else if(wire.neighbors[2] && wire.neighbors[1])
        div.classList.add('wirebl');
    else if(wire.neighbors[3] && wire.neighbors[2])
        div.classList.add('wiretl');
    else
        div.classList.add('wire');
}

function updateResistor(div, x, y) {
    if(theGrid.gridArray[x][y].type != 'resistor') {
        alert("Not a resistor!");
        return false;
    }
    var resistor = theGrid.gridArray[x][y];

    if(resistor.value >= 100 && resistor.value % 5 == 0) {
        if (resistor.neighbors[2] && resistor.neighbors[0])
            div.classList.add('resistor');
        else
            div.classList.add('resistorV');
    } else {
        if (resistor.neighbors[2] && resistor.neighbors[0])
            div.classList.add('resistor');
        else
            div.classList.add('resistorV');
    }
}

function updateJunct(div, x, y) {
    var junct = theGrid.gridArray[x][y];
    var neighbors = junct.neighbors;

    if (junct.numNeighbors() == 3) {
        if(neighbors[0] && neighbors[1] && neighbors[3])
            div.classList.add('junctl');
        else if(neighbors[0] && neighbors[1] && neighbors[2])
            div.classList.add('junctt');
        else if(neighbors[1] && neighbors[2] && neighbors[3])
            div.classList.add('junctr');
        else if(neighbors[3] && neighbors[2] && neighbors[0])
            div.classList.add('junctb');
        else
            alert("Error updating Junction");
    } else
        div.classList.add('junct');
}

function updateSwitch(div, x, y) {
    var swt = theGrid.gridArray[x][y];
    var neighbors = swt.neighbors;
    if(swt.value == -1) {
        if(neighbors[0] && neighbors[2])
            div.classList.add('switch');
        else if(neighbors[1] && neighbors[3])
            div.classList.add('switchV');
        else
            div.classList.add('switch');
    } else if (swt.value == 1) {
        if(neighbors[0] && neighbors[2])
            div.classList.add('switchC');
        else if(neighbors[1] && neighbors[3])
            div.classList.add('switchVC');
        else
            div.classList.add('switchC');
    }
}

function updateLight(div, x, y) {
    //alert("Updating light")
    var tempGA = theGrid.copyGridArray();
    if(verifyConnectivity(tempGA)) {
        //alert("In light's spot is a: " + tempGA[x][y].type);
        if(tempGA[x][y].type == 'light') {
            div.classList.add('lightO');
            return;
        }
    }
    div.classList.add('light');
}

/*
 This Funciton updates the given GridObj's neighbor field such that neighbors[0] = true indicates a non empty
 piece to the right of the given object's location in the grid.

 neighbor array index mapping 3
                3
              ______
             |      |
          2  |      |  0
             |______|
                1
 */
function updateNeighbors(grid, x, y) {
    if(x < 0 || y < 0 || x >= grid.length || y >= grid[0].length)
        return
    if(grid[x][y].type == 'empty')
        return;

    grid[x][y].neighbors[0] = (x + 1 < grid.length && grid[x+1][y].type != 'empty');
    grid[x][y].neighbors[1] = (y + 1 < grid[0].length && grid[x][y+1].type != 'empty');
    grid[x][y].neighbors[2] = (x > 0 && grid[x-1][y].type != 'empty');
    grid[x][y].neighbors[3] = (y > 0 && grid[x][y-1].type != 'empty');
}

function updateAllNeighbors(grid) {
    for(var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[i].length; j++) {
            if(grid[i][j] != 'empty')
                updateNeighbors(grid, i, j);
        }
    }
}

function resetNeighbors(gObj) {
    gObj.neighbors[0] = false;
    gObj.neighbors[1] = false;
    gObj.neighbors[2] = false;
    gObj.neighbors[3] = false;
}

/*
 This Function Checks to make sure that placing the given GridObj into the main board at location (x,y) does not
 violate the restriction that only a junction can have more than 2 neighbors.

 This check is accomplished by making the desired move on a copy of the grid, and checking that all criteria are met

 it returns true if the move is valid
 */

function neighborRuleValid(gObj,x,y) {
    var tempG = theGrid.copyGridArray();
    tempG[x][y] = gObj;
    updateAllNeighbors(tempG);
    for(var i = 0; i < theGrid.width; i++) {
        for(var j = 0;j < theGrid.height; j++) {
            if(tempG[i][j].numNeighbors() > 2 && tempG[i][j].type != 'junct') {
                alert(i + ", " + j + " has too many neighbors");
                return false;
            }
        }
    }
    return true;
}

function addToMainBoard(gObj, x, y) {
    if(gObj.type == 'empty') {
        theGrid.gridArray[x][y] = new GridObj('empty');
        return true;
    }
    if(neighborRuleValid(gObj,x,y)) {
        theGrid.gridArray[x][y] = gObj.copy();
        return true;
    }
    return false;
}

function addToSideBoard(gObj) {
//alert("Adding a(n) " + gObj.type+ " to the sideBoard");
    if(gObj.type == 'empty' || gObj.type == 'wire') // Do nothing for a wire, report success
        return true;
    for(var i = 0; i < theGrid.pieces.length; i++){
        //alert("Returning an " + gObj.type + " to the side board with value " + gObj.value + ", compare to " + theGrid.sideArray[i].type + "with value " + theGrid.sideArray[i].value);
        if(theGrid.sideArray[i].type == gObj.type && (theGrid.sideArray[i].value == gObj.value || gObj.type == 'switch')) {
            theGrid.sideArray[i].num++;
            alert("Returned Sucsessfully");
            return true;
        }
        //alert("Not returned");
    }
    return false;
}

function removeFromSideBoard(gObj) {
//alert("Romiving a(n) " + gObj.type+ " from the sideBoard");
    if(gObj.type == 'wire' || gObj.type == 'empty') // Do noting for a wire, report success
        return true;
    if(gObj.num > 0) { // If there is at least 1 piece on the stack, remove, report success
        gObj.num--;
        return true;
    } else
        return false; // Else, report failure
}

/*
 This function will remove all the gridObjs from the current gridArray and sideArray, it will not reset the GUI

 it should be called before reloading a new puzzle to ensure that differences in size do not lead to left over elements
 */
function resetAllBoards() {
    if(theGrid.pieces = 0)
        return
    for(var i = 0; i < theGrid.width; i++) {
        for (var j = 0; j < theGrid.height; j++) {
            theGrid.gridArray[i][j] = new GridObj('empty');
        }
    }

    for (var k = 0; k < theGrid.sideArray.length; k++)
        theGrid.sideArray[k] = new GridObj('empty');

    updateBoardGUI();
}

function resetBoard() {
    theGrid.setGrid(theGrid.width, theGrid.height, theGrid.sol, theGrid.pieces, theGrid.instStr);
    var resultEle = document.getElementById('resultsBox');
    resultEle.innerHTML = "";
    updateBoardGUI();
}

function setBoardSize() {
    var cells = document.querySelectorAll('div.empty');
    [].forEach.call(cells, function(cell) {
        if(cell.hasAttribute('data-xpos')) {
            if(largeBoard) {
                cell.classList.add('largeGridTile');
            } else {
                if(cell.dataset.xpos > 7 || cell.dataset.ypos > 7)
                    cell.classList.add('hidden');
                else
                    cell.classList.add('smallGridTile');
            }
        }

        if(cell.hasAttribute('data-cellnum')) {
            cell.classList.add('smallGridTile');
        }

    });
}

function initializeBoard() {
    // Assign event handlers to appropriate div elements
    var cells = document.querySelectorAll('div.empty');
    [].forEach.call(cells, function(cell) {
        cell.addEventListener('dragstart', handleDragStart, false);
        cell.addEventListener('dragenter', handleDragEnter, false);
        cell.addEventListener('dragover', handleDragOver, false);
        cell.addEventListener('dragleave', handleDragLeave, false);
        cell.addEventListener('drop', handleDrop, false);
        cell.addEventListener('dragend', handleDragEnd, false);

        if(cell.hasAttribute('data-xpos')) {
            cell.onclick  = onDivClick;
        }

    });
    document.getElementById('nodalVBut').disabled = false;
    document.getElementById('dispValBut').disabled = false;
    document.getElementById('resetBut').disabled = false;
    document.getElementById('printBut').disabled = false;
    document.getElementById('toggleConnectedBut').disabled = false;
}

setBoardSize();

function choosePuzzle(select) {
    if(!firstLoad)
        resetAllBoards();
    loadPuzzle(select);
}

function loadPuzzle(select) {
    var puz = new GetPuzzle(select.options[select.selectedIndex].getAttribute('pname'));


    var pieceArray = puz.puzzle.puzzleString.split(',');
    var solStr = puz.puzzle.puzzleSolution;
    var instStr = puz.puzzle.puzzleDescription;

    var i = 0;
    var pObjArray = new Array(pieceArray.length);
    var pObj, piece, pType;

    while (i < pieceArray.length) {
        piece = pieceArray[i];
        pType = piece.charAt(0);
        if(pType == 'r') { // Resistor has value
            pObj = new GridObj("resistor");
            pObj.value = parseInt(piece.slice(1,piece.indexOf(':')));
            pObj.num = parseInt(piece.slice(piece.indexOf(':') + 1));
        } else if (pType == 'b') { // Battery has value
            pObj = new GridObj("battery");
            pObj.value = parseInt(piece.slice(1,piece.indexOf(':')));
            pObj.num = parseInt(piece.slice(piece.indexOf(':') + 1));
        } else if (pType == 'j') { // junct has value
            pObj = new GridObj("junct");
            pObj.value = parseInt(piece.slice(1,piece.indexOf(':')));
            pObj.num = parseInt(piece.slice(piece.indexOf(':') + 1));
        } else if (pType == 'g') { // Gate does not have value
            pObj = new GridObj("gate");
            pObj.num = parseInt(piece.slice(piece.indexOf(':') + 1));
        } else if (pType == 'l') { // Light does not have value
            pObj = new GridObj("light");
            pObj.num = parseInt(piece.slice(piece.indexOf(':') + 1));
        } else if (pType == 's') { // switch does not have value
            pObj = new GridObj("switch");
            pObj.num = parseInt(piece.slice(piece.indexOf(':') + 1));
        }

//alert("Type: " + pObj.type + '\nValue: ' + pObj.value + "\nNum: " + pObj.num);
        pObjArray[i] = pObj;
        i++;
    }
    if(firstLoad) {
        initializeBoard();
        firstLoad = false;
    }
    if(largeBoard)
        theGrid.setGrid(16,16,solStr,pObjArray,instStr);
    else
        theGrid.setGrid(8,8,solStr,pObjArray,instStr);




    updateBoardGUI();
}

/*
 This function will trace the wire it starts on down all ends and juncture directions
 until each trace reaches either a resistor or voltage source

 Each group of contagious wires and wire junctures represents a node and each contiguous element will have its
 node member set to the number of the node currently being traced

 Each time this method is called, one "node" in the circuit is set
 */
function setNode(x, y, nodeNum, tempG) {
    //alert("Setting " + x + ", " + y);
    var wire = tempG[x][y];
    if(wire.type == 'wire' || wire.type == 'junct' || wire.type == 'light' || wire.type == 'switch') {
        wire.node = nodeNum;
        if(wire.neighbors[0] && tempG[x+1][y].node == -1)
            setNode(x+1, y, nodeNum, tempG);
        if(wire.neighbors[1] && tempG[x][y+1].node == -1)
            setNode(x, y+1, nodeNum, tempG);
        if(wire.neighbors[2] && tempG[x-1][y].node == -1)
            setNode(x-1, y, nodeNum, tempG);
        if(wire.neighbors[3] && tempG[x][y-1].node == -1)
            setNode(x, y-1, nodeNum, tempG);
    }
}

function buildNodeString(gridArray) {
    var csvStr = new String("");
    var nStr = new String("[");
    var value = 0;
    var rCount = 0;
    var vCount = 0;

    for(var i = 0; i < gridArray.length; i++) {
        for (var j = 0; j < gridArray[0].length; j++) {

            var gridObj = gridArray[i][j];

            nStr = "[";
            value = 0;


            if (gridObj.type == 'resistor' || gridObj.type == 'battery') {
                if(gridObj.neighbors[0] == true)
                    nStr = nStr + gridArray[i+1][j].node + "-";
                if(gridObj.neighbors[1] == true)
                    nStr = nStr + gridArray[i][j+1].node + "-";
                if(gridObj.neighbors[2] == true)
                    nStr = nStr + gridArray[i-1][j].node + "-";
                if(gridObj.neighbors[3] == true)
                    nStr = nStr + gridArray[i][j-1].node + "-";
//alert(nStr);

                nStr = nStr.slice(0,nStr.length - 1) + ']';
                if(gridObj.type == 'battery') {
                    csvStr = csvStr + '{V' + vCount + ' ' + nStr + " " + gridObj.value + " | 1}";
                    gridObj.label = "V" + vCount;
                    vCount++;
                } else if(gridObj.type == 'resistor') {
                    csvStr = csvStr + '{R' + rCount + ' ' + nStr + " " + gridObj.value + " }";
                    gridObj.label = "R" + rCount;
                    rCount++;
                }
                //alert(csvStr);
            }


        }
    }
    //alert(csvStr.toString());
    return csvStr;
}

function verifyConnectivity(tempG) {
    var wiresNotPruned = true;

    while(wiresNotPruned) {
        wiresNotPruned = false;
        for(var i = 0; i < theGrid.width; i++) {
            for(var j = 0; j < theGrid.height; j++) {
                if(tempG[i][j].type != 'empty') {
                    if(tempG[i][j].numNeighbors() < 2 || (tempG[i][j].type == 'switch' && tempG[i][j].value == -1)) {
                        //alert('trimming ' + i + ' ,' + j);
                        tempG[i][j] = new GridObj('empty');
                        updateNeighbors(tempG, i+1,j);
                        updateNeighbors(tempG, i,j+1);
                        updateNeighbors(tempG, i-1,j);
                        updateNeighbors(tempG, i,j-1);
                        wiresNotPruned = true;
                    }
                }
            }
        }
    }

    var piecesRemaining = false;
    for(i = 0; i < theGrid.width; i++) {
        for(j = 0; j < theGrid.height; j++) {
            if(tempG[i][j].type != 'empty') {
                piecesRemaining = true;
                if(tempG[i][j].numNeighbors() < 2)
                    return false;
                if(tempG[i][j].type == 'switch' && tempG[i][j].value == -1)
                    return false
            }
        }
    }

    return piecesRemaining;
}