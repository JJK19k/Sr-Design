/* This is the code for the puzzle validation algorithm, serving as TEAM AOK's game logic.
* 
*/
goog.require('goog.math.Matrix');

var voltage = 0; // global variable voltage for a given circuit
var current = 0; // global tracking variable for the current of overall puzzle circuit
var equation_path = ""; // equation string that will display how total resistance was computed
var circuit_analysis_results = ""; // equation string showing the circuit analysis results

function series_resistor(label, resistance_value){
    this.id = label; // puzzle label name for a given resistor
    this.resistance = resistance_value; // resistance (Ohms) for this resistor object
}

/* A record structure that is meant to hold internal data for a given subcircuit within an overall circuit puzzle. */
function junct2_record(resolved_resistance, branch1_array, branch2_array){
    this.subcircuit_resistance_total = resolved_resistance;
    this.branch1 = branch1_array; // of type series_resistor
    this.branch2 = branch2_array; // of type series_resistor
}
/*
*  Solution Schema:  A solution string/path must be written as:  <obj>_<obj>_..._<obj>
*                    Expected attributes to be found within a puzzle object:  (solution, width, height, tileArray) 
*                    Tiles expected to have attributes:  type (i.e. "resistor", "empty", "battery", "gate")
*/
/*  This algorithm will model Ohm's Law in a manner...
 *  Ohm's law states that the current through a conductor between two points is directly proportional to the potential
 *  difference across the two points. Introducing the constant of proportionality, the resistance, one arrives at the
 *  usual mathematical equation that describes this relationship:
 *
 *        I = V / R <-- can be used to solve for the current through any object in circuit
 *
 *  where I is the current through the conductor in units of amperes, V is the potential difference measured across the
 *  conductor in units of volts, and R is the resistance of the conductor in units of ohms. More specifically, Ohm's
 *  law states that the R in this relation is constant, independent of the current.
 *  [http://en.wikipedia.org/wiki/Ohm%27s_law]
 *
 *  Voltage Law = The voltage changes around any closed loop must sum to zero.  This means that any voltage source
 *                presents a rise in the voltage of the circuit, and traveling across any resistor presents a drop in
 *                the voltage of the circuit.  The global variable "voltage" stores the total running sum of the voltage
 *                sources encountered in searching through a given circuit.
 *                [http://hyperphysics.phy-astr.gsu.edu/hbase/electric/ohmlaw.html]
 *
 */
function validate_puzzle(puzzle){
    voltage = 0; // need to reset the global voltage tracking variable if we are revalidating
    //alert("Validating puzzle...");
	/* This algorithm constrains the puzzle grid problem with 2 Rules (this does not apply to empty puzzle pieces):
	*
	*  RULE 1 = Any single puzzle piece, that is not type "empty", must have at least 2 wires leaving it.
	*  RULE 2 = Both ends of puzzle piece type "wire" must have its 2 primary ends (or 2 ends) touching a non-empty puzzle piece.
	*
	*  These rules ensure that the circuit is a complete circuit without the need to traverse the puzzle grid circuit and
	*  and searching for Hamilton Circuits to determine complete puzzle connectivity.
	*/
    var userSoln = "";
    var userSolutionList = [];  // This collection stores the user input solution components into an array that will be deconstructed
    var solution = puzzle.sol;
    if(solution == ""){
		// First case to check, the solution string is empty, which is actually an error case
        alert("There is no encoded solution associated with this puzzle.  ERROR!");
    }else{  // we may now enter the primary portion of the algorithm
        var componentCount = 0;
        var solComponentCount = (solution.split("_")).length;  // this counts the number of components in solution string
        //var solComponentCount = parseInt(solution.slice(0, solution.indexOf("_")));  // extract the count of number of non-empty puzzle pieces
        //solution = solution.slice(solution.indexOf("_") + 1);
        //var solutionList = [];  <-- deprecated
        var tileMax = puzzle.width * puzzle.height; // calculate total number of tiles within puzzle
        var i = 0; // loop iterator 1 for the puzzle internal array
        var j = 0; // loop iterator 2 for the puzzle internal array
        var k = 0; // loop iterator for the storage of the user solution attempt, which is a 1-D array
        var obj_iter = 0; // iterator for the storage of actual circuit, non-voltage objects for later analysis
        var startFlag = 0;
		var connected = 2;  // this flag needs to remain true by the end of the algorithm or else the user input solution is invalid
        for(i = 0; i < puzzle.width; i++){
			if(connected < 2){
				break;
			}
            for(j = 0; j < puzzle.height; j++){
                if(puzzle.gridArray[i][j].type != "empty"){ // filter out "empty" tiles
					//alert("Found " + puzzle.gridArray[i][j].type);
					connected = isConnected(puzzle, i, j); // this flag will be updated each call to isConnected(...)
					//alert("I think the value of connected is:  " + connected);
					if(connected < 2){
						break;  // we will halt this sub-routine if the connected flag goes to 0, the puzzle is instantly known as wrong
					}
                    if(startFlag == 1){  // Optimization #1:  store userSoln components as creating userSoln path
                        userSoln = userSoln + "_" +  (puzzle.gridArray[i][j]).type;  // <- This syntax works in JavaScript (string concat +)
                        //alert("Inserting user solution piece into solution array:  " + (puzzle.gridArray[i][j]).type);
						if(puzzle.gridArray[i][j].type != "wire"){
							//alert("Storing" + puzzle.gridArray[i][j].type);
							componentCount = componentCount + 1;
							userSolutionList[k] = (puzzle.gridArray[i][j]).type;
                            if(puzzle.gridArray[i][j].type == "battery"){
                                voltage = voltage + puzzle.gridArray[i][j].value; // store the voltage rise
                            }/*else if(puzzle.gridArray[i][j].type == "resistor"){
                                circuit_obj_list[obj_iter] = puzzle.gridArray[i][j]; // store the actual resistor obj
                                obj_iter++;
                            }*/
							k++;
						}
                    }else{
                        userSoln = userSoln +  (puzzle.gridArray[i][j]).type;  // <- This syntax works in JavaScript (string concat)
                        //alert("Inserting user solution piece into solution array:  " + (puzzle.gridArray[i][j]).type);
						if(puzzle.gridArray[i][j].type != "wire"){
							//alert("Storing" + puzzle.gridArray[i][j].type);
							componentCount = componentCount + 1;
							userSolutionList[k] = (puzzle.gridArray[i][j]).type;
							k++;
						}
						startFlag = 1; // switch we're not just starting a fresh expression, so we have to parse and store differently
                    }
                }
            }
        }
        //alert("# of User pieces = " + componentCount + " vs. # of Solution Pieces = " + solComponentCount);
        //alert("User soln is:  " + userSoln + " User soln list: " + userSolutionList[0] + ", " + userSolutionList[1] + ", " + userSolutionList[2] + ", ");
        // Optimization #2:  Solution String is exactly the solution, we're done!  Algorithm terminates.
		if(connected < 2){
			alert("The circuit is not fully connected!");
			flag = 1;
        }else if(userSoln == solution){
            alert("User soln = " + userSoln + " vs. Actual soln = " + solution);
            alert("User solution is Correct!");// User solution is correct (alert(...) is the print(...) of javaScript
            alert("Voltage of system is:  " + voltage + " volts");
        }else if((solComponentCount < componentCount) || (solComponentCount > componentCount)){
            //alert("# of User pieces = " + componentCount + " vs. # of Solution Pieces = " + solComponentCount);
            alert("User solution is Wrong!  Incorrect amount of pieces used to build the puzzle!");
        }else{
            //alert("entering main case");
            // Decompose and store the actual solution path into a temporary collection
            var isProcessed = 0;  // boolean variable for control flow
            var flag = 1;  // Assumption:  The user solution is wrong, and must proven that it is correct
            var retVal = 0;
            var end = 0;
            var setVal = 0;
            while(isProcessed == 0){
                retVal = solution.indexOf("_");
                if(retVal == -1){
                    //We enter the special case where we are at the end of the solution string, so this will be last iteration of processing loop
                    isProcessed = 1; // this marks that this is the last iteration of this algorithm loop
                    solnComponent = solution; // we also store the final solution component differently than before on the last iteration
                }else{
                    solnComponent = solution.slice(0, retVal); // Extract component from soln. str.
                }
                for(var j = 0; j < userSolutionList.length; j++){
                    //alert("Comparing actual to user soln:  " + solnComponent + " to " + userSolutionList[j]);
                    if(solnComponent == userSolutionList[j]){
                        userSolutionList[j] = "Removed"; // Deconstruct user solution list, as now we have a match and want to avoid duplication
                        setVal = 1;
                        break;  // Optimization #3 -- we don't need to finish iterating through the user solution list array, we found what we wanted
                    }
                }
                if(setVal != 1){
                    flag = 1;
                    break;
                }
                //solutionList[k]= solnComponent; // <-- this could potentially be used to store soln. str. component to explain what's wrong
                if(retVal != -1){
                    // Only keep iterating if we are still finding delineators in the solution string
                    solution = solution.slice(solution.indexOf("_") + 1); // Remove the stored component out of soln. str.
                    //alert("New solution:  " + solution);
                }else{
                    solution = ""; //if retVal is -1, this means at this point in code, we have pattern matched the last component of solution, so we remove the last piece from solution
                    flag = 0; // raise the flag that the user is correct, solution validated!
                    //alert("New solution:  " + solution);
                }
                setVal = 0; // if we are still in this algorithm loop, we should reset the setVal flag
            }
            /* User solution list already decomposed, so now compare the user solution to the actual solution
            *  If a component within the user solution is found, eliminate it from the actual solution collection.
            *  Victory Conditions:  If the actual solution collection is empty or contains only wires, then the user solution is correct i
			*/

            // Otherwise, user solution does not match up according to criteria, and is WRONG
            if(flag == 1){
                alert("User solution is wrong!");
            }else{
                alert("User solution is correct!");
                alert("Voltage of system is:  " + voltage + " volts");
            }
        }
    }
}

/* Checks the validity of the puzzle circuit.  */
function check_circuit_closure(puzzle){
    voltage = 0; // need to reset the global voltage tracking variable if we are re-validating
    var i = 0; // loop iterator 1 for the puzzle internal array
    var j = 0; // loop iterator 2 for the puzzle internal array
    var is_closed_flag = 1; // assume the circuit is closed, and prove otherwise if a rule violation is detected while scanning the puzzle grid
    var connected = 2;  // this flag needs to remain true by the end of the algorithm or else the user input solution is invalid
    for(i = 0; i < puzzle.width; i++){
        if(connected < 2){
            is_closed_flag = 0; // puzzle is invalid
            break;
        }
        for(j = 0; j < puzzle.height; j++){
            //alert("Found [" + i + "][" + j + "] of type " + puzzle.gridArray[i][j].type);
            if(puzzle.gridArray[i][j].type != "empty"){ // filter out "empty" tiles
                connected = isConnected(puzzle, i, j); // this flag will be updated each call to isConnected(...)
                //alert("I think the value of connected is:  " + connected);
                if(connected < 2){
                    is_closed_flag = 0; // puzzle is invalid
                    break;  // we will halt this sub-routine if the connected flag goes to 0, the puzzle is instantly known as wrong
                }
                if(puzzle.gridArray[i][j].type == "battery"){
                    //alert("Found [" + i + "][" + j + "] of type " + puzzle.gridArray[i][j].type + " w/ value " + puzzle.gridArray[i][j].value);
                    voltage = voltage + puzzle.gridArray[i][j].value; // store the voltage rise
                }
            }
        }
    }
    // if we manage to make it through the nested loop without breaking out, then the closure flag will be 1, and the puzzle will be valid
    /*if(is_closed_flag == 1){
        alert("Voltage of system is:  " + voltage + " volts"); // only print this statistic if circuit is fully connected/closed
    }*/
    return is_closed_flag;
}

/* Computes and returns the value of the current in Amperes across a given resistor object.
*
*  Kirchoff's Rules for circuit analysis:  http://www2.ignatius.edu/faculty/decarlo/kirchhoff.htm
*
*  Circuit Analysis Resource:  http://pages.uoregon.edu/dparks/206/resistorvoltage/
*
*  Parallel-Series Circuit Problems:  http://library.thinkquest.org/10796/ch14/ch14.htm
*
*/
// I = V / R (formulation #1 of Ohm's Law)
/*
 * Algorithm Steps:
 *   Determine if piece is a junction
 *   Determine orientation of that given junction
 *   Traverse that sub-circuit that the junction opens, depending on how the sub-circuit is oriented
 */

// Sub-routine that will search a list for the string mapping of tile coordinates
function search_collection(list, coord1, coord2){
    // linear search --> this will be slow if puzzles were to grow inexorably large, but our domain is of finite size
    var i = 0;
    var item = "" + coord1 + "" + coord2; // create a string tuple
    var flag = 0;
    for(i = 0; i < list.length; i++){
        if(list[i] == item){
            flag = 1; // tile was found inside the tile list
            break;
        }
    }
    return flag;
}
function compute_circuit_current(puzzle){
    if(voltage == 0){
        alert("Error:  No battery detected in circuit system!");
        equation_path = "N/A";
        return 0;
    }
    circuit_analysis_results = "";
    var circuit_obj_list = []; // the list of parallel component pieces to avoid
    // do not consider already considered elements of a parallel circuit
    var total_resistance = 0;
    // loop through the puzzle grid
    var i = 0;
    var j = 0;
    var ind = 0; // pointer to a subcircuit equation list
    var k = 0;  // pointer to location within the memorized object list
    var short_circuit = 0;
    var internal_resist_count1 = 0;
    var internal_resist_count2 = 0;
    var temp_count = 0; // this is used to assigned a resistor identification label to a resistor puzzle tile
    equation_path = "<b>Total Resistance =</b> ";
    var resolved_resistances_list = [];
    var series_resistors = []; // this list will store all known series resistor labels and values
    var series_list_iter = 0;
    var parallel_subcircuits = []; // this list will store all known parallel subcircuits
    var parallel_list_iter = 0;
    for(i = 0; i < puzzle.width; i++){
        internal_resist_count1 = 0;
        internal_resist_count2 = 0;
        for(j = 0; j < puzzle.height; j++){
            if(search_collection(circuit_obj_list, i, j) == 0){
                //alert("Item not memorized, analyzing current tile...");
                if(puzzle.gridArray[i][j].type == "resistor"){ // Case 1:  Series Resistor
                    //alert("Caught a standard resistor in series!");
                    total_resistance = total_resistance + puzzle.gridArray[i][j].value;
                    equation_path = equation_path + " (<b><i>R" + temp_count + "</b></i> = " + puzzle.gridArray[i][j].value + " Ohms) +";
                    puzzle.gridArray[i][j].label = "R" + temp_count; // update the puzzle tile label
                    series_resistors[series_list_iter] = new series_resistor(("R" + temp_count), puzzle.gridArray[i][j].value);
                    series_list_iter++;
                    temp_count++;
                }else if(puzzle.gridArray[i][j].type == "junct"){ // Case 2:  2-Branch Parallel Resistor
                    //alert("Caught a junction2 type piece!");
                    var horizontal = 0; // is the isolated parallel circuit horizontally oriented?
                    var vertical = 0; // is the isolated parallel circuit vertically oriented?
                    /* Check the orientation of the junction as well as boundary conditions */
                    if((i < (puzzle.width - 1))){ // check the right boundary
						//alert("[" + (i) + "][" + j + "] of type " + puzzle.gridArray[i][j].type + " Examining, [" + (i+1) + "][" + j + "] of type " + puzzle.gridArray[i+1][j].type);
                        if(puzzle.gridArray[i+1][j].type == "junct"){ // check the next piece, 1 to the right
                            //alert("setting vertical");
                            vertical = 1; // the parallel circuit is vertically oriented
                        }else if(j < (puzzle.height-1)){
							//alert("[" + (i) + "][" + j + "] of type " + puzzle.gridArray[i][j].type + " Examining, [" + i + "][" + (j+1) + "] of type " + puzzle.gridArray[i][j+1].type);
                            if(puzzle.gridArray[i][j+1].type == "junct"){ // check the next piece, 1 to the bottom
								//alert("setting horizontal");
                                horizontal = 1; // the parallel is vertically oriented
                            }else{ // failure case
                                alert("Unable to determine junction orientation, [" + i + "][" + j + "]");
                            }
                        }else{ // failure case
                            alert("Unable to determine junction orientation, [" + i + "][" + j + "]");
                        }
                    }else{
                        /* The algorithm only gets here in the following cases:
                         *  1)  an incorrectly facing junction piece
                         *  2) a junction piece placed at the boundary before a circuit could be started
                         */
                        alert("Critical Failure:  Junction piece misplaced at [" + i + "][" + j + "]");
                    }
                    var isolated_circuit_resistance = 0; // holds the total resistance of an isolated parallel circuit
                    var x = i; // entry point x coord into detected sub-circuit
                    var y = j; // entry point y coord into detected sub-circuit
                    var subcircuit_equation = "";
                    var branch1_eqn = "";
                    var branch2_eqn = "";
                    internal_resist_count1 = 0;
                    internal_resist_count2 = 0;
                    var branch1_resist = 0;
                    var branch2_resist = 0;
                    // given the orientation determined, traverse and resolve the parallel circuit
                    // this traversal models 1 / R = 1 / R1 + 1/ R2 + ... + 1 / Rn, the Voltage Law
                    if(horizontal == 1){ // traverse a horizontal parallel circuit/sub-puzzle
                        //alert("traversing horizontal sub-circuit");
                        var junct_top = "" + x + "" + (y);
                        var junct_bot = "" + x + "" + (y+1);
                        //alert("Memorize " + junct_top);
                        circuit_obj_list[k] = junct_top;
                        k++;
                        //alert("Memorize " + junct_bot);
                        circuit_obj_list[k] = junct_bot;
                        k++;
                        x++;
                        var memorized_tile = "";
                        var branch1_resistors = []; // want to kill the old version of this data list
                        var branch2_resistors = []; // want to kill the old version of this data list
                        var branch1_counter = 0;
                        var branch2_counter = 0;
                        while(puzzle.gridArray[x][y].type != "junct"){
							//alert("Look at [" + x + "][" + y + "] of " + puzzle.gridArray[x][y].type);
                            memorized_tile = "" + x + "" + y;
                            //alert("Memorize " + memorized_tile);
                            circuit_obj_list[k] = memorized_tile;
                            k++;
                            if(puzzle.gridArray[x][y].type == "resistor"){ // will need to change to determine if it's a resistor
                                branch1_resist = branch1_resist + (puzzle.gridArray[x][y].value);
                                //isolated_circuit_resistance = isolated_circuit_resistance + (1/(puzzle.gridArray[x][y].value));
                                internal_resist_count1++;
                                branch1_eqn = branch1_eqn + " (<b><i>R" + temp_count + "</b></i> = " + puzzle.gridArray[x][y].value + " Ohms) +";
                                puzzle.gridArray[x][y].label = "R" + temp_count; // update the puzzle tile label
                                branch1_resistors[branch1_counter] = new series_resistor(("R" + temp_count), puzzle.gridArray[x][y].value);
                                //alert("R" + temp_count + " = " + puzzle.gridArray[x][y].value);
                                //alert("Stored in branch1:  " + branch1_resistors[branch1_counter].id + " = " + branch1_resistors[branch1_counter].resistance);
                                branch1_counter++;
                                temp_count++;
                            }
							//alert("Look at [" + x + "][" + (y+1) + "] of " + puzzle.gridArray[x][y+1].type);
                            memorized_tile = "" + x + "" + (y+1);
                            //alert("Memorize " + memorized_tile);
                            circuit_obj_list[k] = memorized_tile;
                            k++;
                            if(puzzle.gridArray[x][y + 1].type == "resistor"){
                                branch2_resist = branch2_resist + (puzzle.gridArray[x][y+1].value);
                                //isolated_circuit_resistance = isolated_circuit_resistance + (1/(puzzle.gridArray[x][y+1].value));
                                internal_resist_count2++;
                                branch2_eqn = branch2_eqn + " (<b><i>R" + temp_count + "</b></i> = " + puzzle.gridArray[x][y+1].value + " Ohms) +";
                                puzzle.gridArray[x][y+1].label = "R" + temp_count; // update the puzzle tile label
                                branch2_resistors[branch2_counter] = new series_resistor(("R" + temp_count), puzzle.gridArray[x][y+1].value);
                                //alert("R" + temp_count + " = " + puzzle.gridArray[x][y+1].value);
                                //alert("Stored in branch2:  " + branch2_resistors[branch2_counter].id + " = " + branch2_resistors[branch2_counter].resistance);
                                branch2_counter++;
                                temp_count++;
                            }
                            x++;
                        }
                        if(branch1_eqn.lastIndexOf("+") != -1){
                            branch1_eqn = branch1_eqn.slice(0, branch1_eqn.lastIndexOf("+")); // strip off excess plus symbol
                        }
                        if(branch2_eqn.lastIndexOf("+") != -1){
                            branch2_eqn = branch2_eqn.slice(0, branch2_eqn.lastIndexOf("+")); // strip off excess plus symbol
                        }
                        subcircuit_equation = subcircuit_equation + " 1 / (" + branch1_eqn + ") + 1 / (" + branch2_eqn + ") ";
						// don't forget to memorize the closing 2 junction pieces
						junct_top = "" + x + "" + (y);
						junct_bot = "" + x + "" + (y+1);
						//alert("Memorize " + junct_top);
						circuit_obj_list[k] = junct_top;
						k++;
						//alert("Memorize " + junct_bot);
						circuit_obj_list[k] = junct_bot;
						k++;
                        if(internal_resist_count1 == 0){
                            short_circuit = 1;
                        }
                        if(internal_resist_count2 == 0){
                            short_circuit = 1;
                        }
                        internal_resist_count1 = 0;
                        internal_resist_count2 = 0;
                    }
                    if(vertical == 1){ // traverse a vertical parallel circuit/sub-puzzle
                        //alert("traversing vertical sub-circuit");
                        var junct_top = "" + x + "" + (y);
                        var junct_bot = "" + (x+1) + "" + (y);
                        //alert("Memorize " + junct_top);
                        circuit_obj_list[k] = junct_top;
                        k++;
                        //alert("Memorize " + junct_bot);
                        circuit_obj_list[k] = junct_bot;
                        k++;
                        y++;
                        var memorized_tile = "";
                        var branch1_resistors = []; // want to kill the old version of this data list
                        var branch2_resistors = []; // want to kill the old version of this data list
                        var branch1_counter = 0;
                        var branch2_counter = 0;
                        while(puzzle.gridArray[x][y].type != "junct"){
                            //alert("Look at [" + x + "][" + y + "] of " + puzzle.gridArray[x][y].type);
                            memorized_tile = "" + x + "" + y;
                            //alert("Memorize " + memorized_tile);
                            circuit_obj_list[k] = memorized_tile;
                            k++;
                            if(puzzle.gridArray[x][y].type == "resistor"){ // will need to change to determine if it's a resistor
                                branch1_resist = branch1_resist + (puzzle.gridArray[x][y].value);
                                //isolated_circuit_resistance = isolated_circuit_resistance + (1/(puzzle.gridArray[x][y].value));
                                internal_resist_count1++;
                                branch1_eqn = branch1_eqn + " (<b><i>R" + temp_count + "</b></i> = " + puzzle.gridArray[x][y].value + " Ohms) +";
                                puzzle.gridArray[x][y].label = "R" + temp_count; // update the puzzle tile label
                                branch1_resistors[branch1_counter] = new series_resistor(("R" + temp_count), puzzle.gridArray[x][y].value);
                                branch1_counter++;
                                temp_count++;
                            }
                            //alert("Look at [" + (x+1) + "][" + (y) + "] of " + puzzle.gridArray[x][y+1].type);
                            memorized_tile = "" + (x+1) + "" + (y);
                            //alert("Memorize " + memorized_tile);
                            circuit_obj_list[k] = memorized_tile;
                            k++;
                            if(puzzle.gridArray[x+1][y].type == "resistor"){
                                branch2_resist = branch2_resist + (puzzle.gridArray[x+1][y].value);
                                //isolated_circuit_resistance = isolated_circuit_resistance + (1/(puzzle.gridArray[x+1][y].value));
                                internal_resist_count2++;
                                branch2_eqn = branch2_eqn + " (<b><i>R" + temp_count + "</b></i> = " + puzzle.gridArray[x+1][y].value + " Ohms) +";
                                puzzle.gridArray[x+1][y].label = "R" + temp_count; // update the puzzle tile label
                                branch2_resistors[branch2_counter] = new series_resistor(("R" + temp_count), puzzle.gridArray[x+1][y].value);
                                branch2_counter++;
                                temp_count++;
                            }
                            y++;
                        }
                        if(branch1_eqn.lastIndexOf("+") != -1){
                            branch1_eqn = branch1_eqn.slice(0, branch1_eqn.lastIndexOf("+")); // strip off excess plus symbol
                        }
                        if(branch2_eqn.lastIndexOf("+") != -1){
                            branch2_eqn = branch2_eqn.slice(0, branch2_eqn.lastIndexOf("+")); // strip off excess plus symbol
                        }
                        subcircuit_equation = subcircuit_equation + " 1 / (" + branch1_eqn + ") + 1 / (" + branch2_eqn + ") +";
                        alert(subcircuit_equation);
                        // don't forget to memorize the closing 2 junction pieces
                        junct_top = "" + x + "" + (y);
                        junct_bot = "" + (x+1) + "" + (y);
                        //alert("Memorize " + junct_top);
                        circuit_obj_list[k] = junct_top;
                        k++;
                        //alert("Memorize " + junct_bot);
                        circuit_obj_list[k] = junct_bot;
                        k++;
                        if(internal_resist_count1 == 0){
                            short_circuit = 1;
                        }
                        if(internal_resist_count2 == 0){
                            short_circuit = 1;
                        }
                        internal_resist_count1 = 0;
                        internal_resist_count2 = 0;
                    }
                    if(short_circuit == 0){ // parallel circuits are legal
                        isolated_circuit_resistance = 1 / ((1 / (branch1_resist)) + (1 / (branch2_resist))); // 1 / sum = R
                        total_resistance = total_resistance + isolated_circuit_resistance; // store the resolved resistance
                    }else{
                        total_resistance = total_resistance + 0;
                    }
                    parallel_subcircuits[parallel_list_iter] = new junct2_record(isolated_circuit_resistance, branch1_resistors, branch2_resistors);
                    parallel_list_iter++;
                    // reset the isolated circuit variables
                    isolated_circuit_resistance = 0;
                    resolved_resistances_list[ind] = subcircuit_equation;
                    ind++; // increment the pointer into the resistance equation list
                }else if(puzzle.gridArray[i][j].type == "junction3"){ // Case 2:  3-Branch Parallel Resistor
                    alert("Caught a junction3 type piece!");
                    alert("Did nothing...cuz I don't know how to handle junction3's...")
                }
            }
        }
    }
    var circuit_current = voltage / total_resistance; // compute the circuit's overall current
    current = circuit_current;
    var p = 0;
    for(p = 0; p < resolved_resistances_list.length; p++){
        alert("here");
        alert(resolved_resistances_list[p]);
        equation_path = equation_path + " 1 / (" + resolved_resistances_list[p] + " ) +";
    }
    if(equation_path.lastIndexOf("+") != -1){
        equation_path = equation_path.slice(0, equation_path.lastIndexOf("+")); // strip off excess plus symbol
    }
    // Compute the circuit analysis of each circuit component
    var main_iter = 0;
    var voltage_check = "";
    var volt_total = 0;
    for(main_iter = 0; main_iter < parallel_subcircuits.length; main_iter++){
        //alert("At " + main_iter + " is " + parallel_subcircuits[parallel_list_iter]);
        var voltage_subcircuit = circuit_current * parallel_subcircuits[main_iter].subcircuit_resistance_total;
        //alert("Volt calc:  " + parallel_subcircuits[main_iter].subcircuit_resistance_total + " * " + circuit_current + " = " + voltage_subcircuit);
        volt_total = volt_total + voltage_subcircuit;
        voltage_check = voltage_check + voltage_subcircuit + " Volts + ";
        var m = 0;
        var branch_resistance = 0;
        for(m = 0; m < (parallel_subcircuits[main_iter].branch1).length; m++){
            branch_resistance = branch_resistance + (parallel_subcircuits[main_iter].branch1[m]).resistance;
        }
        var branch1_current = voltage_subcircuit / branch_resistance;
        //alert("Branch 1 calc:  " + voltage_subcircuit + " / " + branch_resistance + " = " +  voltage_subcircuit / branch_resistance + " vs " + branch1_current);
        branch_resistance = 0;
        for(m = 0; m < (parallel_subcircuits[main_iter].branch2).length; m++){
            branch_resistance = branch_resistance + (parallel_subcircuits[main_iter].branch2[m]).resistance;
        }
        var branch2_current = voltage_subcircuit / branch_resistance;
        //alert("Branch 2 calc:  " + voltage_subcircuit + " / " + branch_resistance + " = "+  (voltage_subcircuit / branch_resistance) + " vs " + (circuit_current - branch1_current));
        //alert(circuit_current + " = " + branch1_current + " + " + branch2_current);
        for(m = 0; m < (parallel_subcircuits[main_iter].branch1).length; m++){
            var component_voltage = branch1_current * (parallel_subcircuits[main_iter].branch1[m]).resistance;
            circuit_analysis_results = circuit_analysis_results + "<b>Voltage through " + (parallel_subcircuits[main_iter].branch1[m]).id + "</b> = " + (component_voltage).toFixed(5) + " Volts <BR/>";
            circuit_analysis_results = circuit_analysis_results + "<b>Current through " + (parallel_subcircuits[main_iter].branch1[m]).id + "</b> = " + (branch1_current).toFixed(5) + " Amperes <BR/>";
        }
        for(m = 0; m < (parallel_subcircuits[main_iter].branch2).length; m++){
            var component_voltage = branch2_current * (parallel_subcircuits[main_iter].branch2[m]).resistance;
            circuit_analysis_results = circuit_analysis_results + "<b>Voltage through " + (parallel_subcircuits[main_iter].branch2[m]).id + "</b> = " + (component_voltage).toFixed(5) + " Volts <BR/>";
            circuit_analysis_results = circuit_analysis_results + "<b>Current through " + (parallel_subcircuits[main_iter].branch2[m]).id + "</b> = " + (branch2_current).toFixed(5) + " Amperes <BR/>";
        }
    }
    for(m = 0; m < series_resistors.length; m++){
        var component_voltage = circuit_current * series_resistors[m].resistance;
        volt_total = volt_total + component_voltage;
        voltage_check = voltage_check + (component_voltage).toFixed(5) + " Volts + ";
        circuit_analysis_results = circuit_analysis_results + "<b>Voltage through " + series_resistors[m].id + "</b> = " + (component_voltage).toFixed(5) + " Volts <BR/>";
        circuit_analysis_results = circuit_analysis_results + "<b>Current through " + series_resistors[m].id + "</b> = " + (circuit_current).toFixed(5) + " Amperes <BR/>";
    }
    if(voltage_check.lastIndexOf("+") != -1){
        voltage_check = voltage_check.slice(0, voltage_check.lastIndexOf("+")); // strip off excess plus symbol
    }
    voltage_check = voltage_check + " = " + (volt_total).toFixed(5) + " Volts";
    circuit_analysis_results = circuit_analysis_results + voltage_check + " <BR/>";
    short_circuit = 0;
    return circuit_current;
}

function get_circuit_analysis(){
    return circuit_analysis_results;
}

function get_system_voltage(){
    return voltage;
}

function get_resistance_equation(){
    return equation_path;
}

/* This sub-routine checks that a given puzzle piece of a puzzle adheres to RULE 1 or RULE 2 as specified in validate_puzzle(...) 
*
*  RETURN:  If the puzzle piece adheres to the rules, this routine returns 1, else, returns 0
*/
function isConnected(puzzle, i, j){
	//alert("Checking puzzle piece for rule-adherence!");
	// This sub-routine will first check to see if the wire is of type "wire" or not, then will check for rule-adherence accordingly
	var rule_adherence_count = 0;
	//alert("Pos in Grid to check:  [" + i + "][" + j + "]");
	//alert("Type of piece is:  " + (puzzle.gridArray[i][j]).type);
	if((puzzle.gridArray[i][j]).type == "wire" || (puzzle.gridArray[i][j]).type == "junct"){
		// Check for adherence to RULE 2, since the piece is a wire
        // NOTE that a junction is a special kind of wire, despite its primary purpose to serve as a constraint
		if((i < (puzzle.width - 1))){
			if(puzzle.gridArray[i+1][j].type != "empty"){
				//alert("Found at [" + (i + 1) + "][" + j + "] the type " + puzzle.gridArray[i+1][j].type);
				rule_adherence_count++;
			}
		}
		if(i > 0){
			if(puzzle.gridArray[i-1][j].type != "empty"){
				//alert("Found at [" + (i - 1) + "][" + j + "] the type " + puzzle.gridArray[i-1][j].type);
				rule_adherence_count++;
			}
		}
		if((j < (puzzle.height-1))){
			if(puzzle.gridArray[i][j+1].type != "empty"){
				//alert("Found at [" + i + "][" + (j+1) + "] the type " + puzzle.gridArray[i][j + 1].type);
				rule_adherence_count++;
			}
		}
		if(j > 0){
			if(puzzle.gridArray[i][j-1].type != "empty"){
				//alert("Found at [" + i + "][" + (j-1) + "] the type " + puzzle.gridArray[i][j - 1].type);
				rule_adherence_count++;
			}
		}
	}else{
		// Check for adherence to RULE 1, since the piece is a non-empty, non-wire
        // Note that junction's are technically wires too, they are just specialized kinds of wire
		if((i < (puzzle.width-1))){
			if(puzzle.gridArray[i+1][j].type == "wire" || puzzle.gridArray[i+1][j].type == "junct"){
				rule_adherence_count++;
			}
		}
		if(i > 0){
			if(puzzle.gridArray[i-1][j].type == "wire" || puzzle.gridArray[i-1][j].type == "junct"){
				rule_adherence_count++;
			}
		}
		if((j < (puzzle.height -1))){
			if(puzzle.gridArray[i][j+1].type == "wire" || puzzle.gridArray[i][j+1].type == "junct"){
				rule_adherence_count++;
			}
		}
		if(j > 0){
			if(puzzle.gridArray[i][j-1].type == "wire" || puzzle.gridArray[i][j-1].type == "junct"){
				rule_adherence_count++;
			}
		}
	}
	//alert("Rule adherence count for" + puzzle.gridArray[i][j].type + " is: " + rule_adherence_count + "vs. dimensions:  " + puzzle.height + " " + puzzle.width);
	return rule_adherence_count;  // will return a rule-adherence count:  2 if a wire or >= 2 if a non-wire
}

/* Circuit Analysis Method:  Nodal-Voltage */
/*var a1 = [ [1, 2], [2, 3], [4, 5] ];
var m1 = new goog.math.Matrix(a1);
var A = new goog.math.Matrix(1,1);
var B = new goog.math.Matrix(1,1);
var R = new goog.math.Matrix(1,1); // holds resistance values
var I = new goog.math.Matrix(1,1);*/ // holds current values

// circuit lines defined as:  {r [a-b] resist_value}  OR {v [a-b] volt_value | internal_resist_value}
function analyze_circuit(circuit_map){
    //alert("Reading in:  " + circuit_map);
    var label_counter = 0; // this is a dynamic variable that will be used to keep track of the components via labeling
    var A = new goog.math.Matrix(1,1); // holds first node # of node-node bridge
    var B = new goog.math.Matrix(1,1); // holds 2nd node # of node-node bridge
    var R = new goog.math.Matrix(1,1); // holds resistance values
    var I = new goog.math.Matrix(1,1); // holds current values
    var Comp_names = new goog.math.Matrix(1,1); // holds names of the components of system
    Comp_names.setValueAt(0, 0, "N0"); // set the first entry label to be the reference node
    /*A = []; B = []; R = []; I = [];*/  // initialize the internal circuit structure lists
    /*var a_iter = 0; var b_iter = 0; var r_iter = 0; var i_iter = 0;*/
    var quit = 0; // flag to finish scanning and parsing a string-mapped circuit
    var error = 0;  // flag to catch critical errors and halt the algorithm
    var line = "";
    var remainder = circuit_map;
    //alert("Line = " + line + "Remainder = " + remainder);
    while(quit == 0){
        if(remainder.charAt(0) == "{"){
            line = remainder.slice(1, remainder.indexOf("}"));
            remainder = remainder.slice(remainder.indexOf("}") + 1);
            //alert("Line = " + line + "Remainder = " + remainder);
        }else{
            break;
        }
        if((line.charAt(0)).toLowerCase() == "r"){  // Case => resistor
            var Comp_names_meta = new goog.math.Matrix(1,1);
            Comp_names_meta.setValueAt(0,0, (line.slice(0, line.indexOf("["))));
            Comp_names = Comp_names.appendColumns(Comp_names_meta);
            label_counter++; // update the label counting variable
            //alert("Found resistor!");
            var a = parseFloat(line.slice(line.indexOf("[") + 1, line.indexOf("-")));
            var b = parseFloat(line.slice(line.indexOf("-") + 1, line.indexOf("]")));
            if(a == b){
                alert("Error:  Imaginary node created.");
                error = 1; // raise the error flag and kill the parsing loop
                break;
            }
            //alert("a: " + a + "b str: " + line.slice(line.indexOf("-") + 1, line.indexOf("]")));
            //alert("a: " + a + "b: " + b);
            var A_meta = new goog.math.Matrix(1,1);
            A_meta.setValueAt(0,0, a);
            A = A.appendColumns(A_meta);
            //A[a_iter] = a;
            //a_iter++;
            var B_meta = new goog.math.Matrix(1,1);
            B_meta.setValueAt(0,0, b);
            B = B.appendColumns(B_meta);
           // B[b_iter] = b;
            //b_iter++;
            var r = parseFloat(line.slice(line.indexOf("]") + 1));
            var R_meta = new goog.math.Matrix(1,1);
            R_meta.setValueAt(0,0, r);
            R = R.appendColumns(R_meta);
           // R[r_iter] = r;
            //r_iter++;
            var I_meta = new goog.math. Matrix(1,1);
            I_meta.setValueAt(0,0, 0);
            I = I.appendColumns(I_meta);
            //I[i_iter] = 0; // place dummy current value into this resistor's current slot
            //i_iter++;
        }else if((line.charAt(0)).toLowerCase() == "v"){ // Case => voltage source
            var Comp_names_meta = new goog.math.Matrix(1,1);
            Comp_names_meta.setValueAt(0,0, (line.slice(0, line.indexOf("["))));
            Comp_names = Comp_names.appendColumns(Comp_names_meta);
            label_counter++; // update the label counting variable
            //alert("Found volt src!");
            var a = parseFloat(line.slice(line.indexOf("[") + 1, line.indexOf("-")));
            var b = parseFloat(line.slice(line.indexOf("-") + 1, line.indexOf("]")));
            if(a == b){
                alert("Error:  Imaginary node created.");
                error = 1; // raise the error flag and kill the parsing loop
                break;
            }
           // alert("a: " + a + "b str: " + line.slice(line.indexOf("-") + 1, line.indexOf("]")));
           // alert("a: " + a + "b: " + b);
            var A_meta = new goog.math.Matrix(1,1);
            A_meta.setValueAt(0,0, a);
            A = A.appendColumns(A_meta);
            //A[a_iter] = a;
            //a_iter++;
            var B_meta = new goog.math.Matrix(1,1);
            B_meta.setValueAt(0,0, b);
            B = B.appendColumns(B_meta);
           // B[b_iter] = b;
            //b_iter++;
            var v = parseFloat(line.slice(line.indexOf("]") + 1, line.indexOf("|")));
            var r = parseFloat(line.slice(line.indexOf("|") + 1));
            var R_meta = new goog.math.Matrix(1,1);
            R_meta.setValueAt(0,0, r);
            R = R.appendColumns(R_meta);
            //R[r_iter] = r;
            //r_iter++;
            var I_meta = new goog.math.Matrix(1,1);
            I_meta.setValueAt(0,0, -v/r);
            I = I.appendColumns(I_meta);
            //I[i_iter] = -v/r; // place dummy current value into this resistor's current slot
            //i_iter++;
        }else{
            alert("Unknown circuit type!");
            quit = 1;
            break;
        }
    }
    if(error == 1){
        return "Circuit has been shorted.  Please fix the system.";
    }
    if(quit == 1){
        return; // handle the error case --> improper syntax, please exit
    }
    var dummy_mat = A.appendColumns(B);
    //alert("A:  " + A.toString() + "\nB:  " + B.toString() + "\nR:  " + R.toString() + "\nI:  " + I.toString() + "\nA cat B:  " + (dummy_mat.toString()));
    // SOLVE THE SYSTEM now
    //alert(A.appendColumns(B).toString);
    var j = 0;
    var i = 0;
    //var matrix_nums = matrix_nums_input.toArray();
    var max = dummy_mat.getValueAt(i,j);
   // alert(dummy_mat.toString());
    //alert(max + " size = " + dummy_mat.getSize().width + " " + dummy_mat.getSize().height);
    //alert(dummy_mat.toString());
    for(i = 0; i < dummy_mat.getSize().width; i++){
        //alert("max = " + max + " next = " + dummy_mat.getValueAt(0,i));
        if(max < dummy_mat.getValueAt(0,i)){
            max = dummy_mat.getValueAt(0,i);
            //alert("[0][i]" + max);
        }
    }
    var NN = max;
    //alert(NN);
    var G = new goog.math.Matrix(NN, NN); // initialize the conductance matrix
    //alert("Max of A cat B is:  " + NN + "G:  " + G.toString());
    var II = new goog.math.Matrix(NN, 1); // initialize the current vector
    //alert("II:  " + II.toString());

    // scan all of the components of the circuit map
    var n = 0;
    for(n = 0; n < A.getSize().width; n++){
        // extract the current values from each vector at this iteration
       /*var a = A[n]; var b = B[n]; var r = R[n]; var i = I[n];*/
        var a = A.getValueAt(0,n);
        var b = B.getValueAt(0,n);
        var r = R.getValueAt(0,n);
        var i = I.getValueAt(0,n);
       // alert(A.toString() + "\n" + B.toString() + "\n" + R.toString() + "\n" + I.toString() + "\na = " + a + " b = " + b + " r = " + r + " i = " + i);
        // Consider and compute the self-conductance's of the system's components
        if(a > 0){
            G.setValueAt(a-1,a-1, G.getValueAt(a-1,a-1) + (1/r));
           // alert(G.toString());
        }
        if(b > 0){
            G.setValueAt(b-1,b-1, G.getValueAt(b-1,b-1) + (1/r));
            //alert(G.toString());
        }
        // Consider and compute the cross-conductance's of the system's components
        if(a > 0 && b > 0){
            G.setValueAt(a-1,b-1, G.getValueAt(a-1,b-1) - (1/r));
            G.setValueAt(b-1,a-1, G.getValueAt(b-1,a-1) - (1/r));
            //alert(G.toString());
        }
        // enter the fixed current values into the vector as well
        if(a > 0){
            II.setValueAt(a-1,0, II.getValueAt(a-1,0) - i); // II[a] = II[a] - i;
            //alert(II.toString());
        }
        if(b > 0){
            II.setValueAt(b-1,0, II.getValueAt(b-1,0) + i);  // II[b] = II[b] + i;
            //alert(II.toString());
        }
    }
    //alert("Final G: \n" + G.toString());
    //alert("Final II: \n" + II.toString());
    //alert("Inv G:  \n" + (G.getInverse()).toString());
    // Compute node-to-reference-node voltages
    var VV = (G.getInverse()).multiply(II);
    //alert("Mult G * II: \n" + VV.toString());
    // Add the voltage value for node 0 (0 volts = reference node)
    var ref_val = 0;
    var ref_node = new goog.math.Matrix(1,1);
    var VV_fin = ref_node.appendRows(VV);
    //alert("VV:  \n" + VV_fin.toString());
    var V = new goog.math.Matrix((A.getSize()).width, (A.getSize()).height);
    //alert(V.toString());
    // compute voltages across all components
    for(n = 0; n < A.getSize().width; n++){
        var a = A.getValueAt(0, n);
        var b =  B.getValueAt(0, n);
        //alert("a = " + a + " b = " + b);
        //alert(VV_fin.getValueAt(b,0));
        V.setValueAt(n,0, (VV_fin.getValueAt(a,0) - VV_fin.getValueAt(b,0)));
        //alert(V.toString());
    }
    // We need to compute the current through each component using Ohm's Law and thus do not need the modeled current from NV analysis
    var I_current = new goog.math.Matrix((A.getSize()).width, (A.getSize()).height); // needs to match V's dimensions
    I_current.setValueAt(0, 0, 0); // preset the reference node's current value inside the current value matrix to avoid a "divide by 0" error
    for(n = 1; n < A.getSize().width; n++){
        var voltage = V.getValueAt(n, 0);
        var resistance = R.getValueAt(0,n);
        I_current.setValueAt(n, 0, (voltage / resistance)); // I = V / R (Ohm's Law Formulation)
    }
    var analysis_collection = [V, I_current, R, Comp_names];
    //alert("V:  \n" + V.toString() + "I:  \n" + I.toString() + "R:  \n" + R.toString() + "V arr:  \n" + V.toString() + "I arr:  \n" + I.toString() + "R arr:  \n" + R.toString());
    var analysis_string = "\n<b>V:</b>  \n" + print_analysis_matrix(analysis_collection[0]) + "</BR><b>I:</b> (I = V / R)  </BR>" + print_analysis_matrix(analysis_collection[1]) + "</BR><b>R:</b>  </BR>" + print_analysis_matrix(analysis_collection[2]);
    //alert(analysis_string);
    //alert(print_analysis_clean(analysis_collection));
    analysis_string = analysis_string + "</BR>" + print_analysis_clean(analysis_collection);
    return analysis_string;
}

/* Pretty print function for the results of a circuit analysis. */
function print_analysis_clean(array_of_matrices){
    var ind = 0;
    var output = "";
    for(ind = 0; ind < array_of_matrices[3].getSize().width; ind++){
        if((array_of_matrices[3].getValueAt(0, ind)).indexOf("R") != -1){
            output = output + "<b>Voltage across " + array_of_matrices[3].getValueAt(0, ind) + "</b> (" + array_of_matrices[2].getValueAt(0, ind) + " Ohms) <b> = </b> " + (array_of_matrices[0].getValueAt(ind, 0)).toFixed(5) + " Volts </BR>";
            output = output + "<b>Current across " + array_of_matrices[3].getValueAt(0, ind) + "</b> (" + array_of_matrices[2].getValueAt(0, ind) + " Ohms) <b> = </b> " + (array_of_matrices[1].getValueAt(ind, 0)).toFixed(5) + " Amperes </BR>";
        }
        if((array_of_matrices[3].getValueAt(0, ind)).indexOf("V") != -1){
            output = output + "<b>Voltage Source " + array_of_matrices[3].getValueAt(0, ind) + "</b> <b> = </b> " + (array_of_matrices[0].getValueAt(ind, 0)).toFixed(5) + " Volts </BR>";
        }
    }
    return output;
}

/* Tests the NV algorithm on a few MatLab verified examples.  The code must pass this benchmark for minimal functionality guarantee.
*  Please consult "validate_test_suite.txt" for the MatLab results to compare against.
*/
function test_analysis_routine(){
    var test1 = analyze_circuit("{V [1-0] 80 | 5}{V [3-1] 2 | 1}{R [1-2] 5}{R [2-3] 5}{R [2-0] 40}{R [3-0] 10}");
    var test2 = analyze_circuit("{V [1-0] 128 | 8}{V [2-0] 70  | 10}{R [1-2] 18}{R [2-0] 20}{R [1-0] 48}");
    var test3 = analyze_circuit("{V [1-0] 125 | 1}{V [0-3] 125 | 1}{R [0-2] 2}{R [1-2] 6}{R [2-3] 12}{R [1-3] 24}");
    var test4 = analyze_circuit("{V [1-0] 144 | 4}{V [0-2] 3 | 5}{R [1-2] 80}{R [1-0] 10}");
    alert(test1);
    alert(test2);
    alert(test3);
    alert(test4);
}

// a printing conversion function for circuit analysis matrices
function print_analysis_matrix(matrix){
    var circuit_out = "";
    var i = 0;
    var j = 0;
    var count = 1;
    for(i = 0; i < matrix.getSize().width; i++){
        for(j = 0; j < matrix.getSize().height; j++){
            if(count < 3){
                //alert(matrix.getValueAt(j,i));
                circuit_out = circuit_out +  (matrix.getValueAt(j,i)).toFixed(5) + ", ";
                count++;
            }else{
                //matrix.getValueAt(j,i);
                circuit_out = circuit_out + (matrix.getValueAt(j,i)).toFixed(5) + ", " + "</BR>";
                count = 1;
            }
        }
    }
    return circuit_out;
}

/* Sub-funfcion for computing the maximum value */
function maximum(matrix_nums){
    alert(matrix_nums.toString);
    var j = 0;
    var i = 0;
    //var matrix_nums = matrix_nums_input.toArray();
    var max = matrix_nums.getValueAt(i,j);
    alert(max + " size = " + matrix_nums.getSize().width + " " + matrix_nums.getSize().height);
    for(i = 0; i < matrix_nums.getSize().width; i++){
        for(j = 0; j < matrix_nums.getSize().height; j++){
            alert("max = " + max + " next = " + matrix_nums.getValueAt(i,j));
            if(max < matrix_nums.getValueAt(i,j)){
                max = matrix_nums.getValueAt(i,j);
                alert("[i][j]" + max);
            }
        }
    }
}

