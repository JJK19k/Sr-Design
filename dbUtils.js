/**
 * Created with JetBrains WebStorm.
 * User: JJK
 */

// find the header section of the document
var head = document.getElementsByTagName("head")[0];

// create a new script element in the document
// store a reference to it
var script=document.createElement("script");

// attach the script to the head
head.appendChild(script);

// set the script type
script.setAttribute("type","text/javascript");

// set the script source, this will load the script
script.setAttribute("src", "gridUtils.js");

var userData = null;
var puzzleData = null;

function Users(){
    this.users = {};
    GetUsers();
    this.users = userData;
}

function Puzzles(){
    this.puzzles = {};
    GetPuzzles();
    this.puzzles = puzzleData;

}

function GetSingleUser(name){
    this.exists = null;
    this.user = null;

    GetUsers();
    var userExists = false;
    i=0;
    while(userExists == false && userData[i] != null){
        userExists = (userData[i].username.toLowerCase() == name.toLowerCase());
        i++;
    }

    if(userExists){
        this.exists = true;
        this.user=userData[i-1];
    }else{
        this.exists = false;
    }

}

function GetPuzzle(pName){
    this.exists = null;
    this.puzzle = null;

    GetPuzzles();
    var puzzleExists = false;
    i=0;
    while(puzzleExists == false && puzzleData[i] != null){
        puzzleExists = (puzzleData[i].puzzleName.toLowerCase() == pName.toLowerCase());
        i++;
    }

    if(puzzleExists){
        this.exists = true;
        this.puzzle=puzzleData[i-1];
    }else{
        this.exists = false;
    }

}

function GetUsers(){
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "https://api.mongolab.com/api/1/databases/aokdb/collections/Users?apiKey=9F3RTpQ0S0sUsj0lM_uTVwfNqZtyFqel", false);
    xmlHttp.onreadystatechange = handleReadyStateChange;
    xmlHttp.send(null);

    function handleReadyStateChange() {
        if (xmlHttp.readyState == 4) {
            if (xmlHttp.status == 200) {
                // we convert the plain text returned into a JSON Object

                userData = JSON.parse(xmlHttp.responseText);

            } else {
                alert("XMLHttpRequest error, status=" + xmlHttp.status);
            }
        }
    }
}

function ChangePuzzle(pName, theGrid){

    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "https://api.mongolab.com/api/1/databases/aokdb/collections/Puzzles?apiKey=9F3RTpQ0S0sUsj0lM_uTVwfNqZtyFqel", false);
    xmlHttp.onreadystatechange = handleReadyStateChange;
    xmlHttp.send(null);

    function handleReadyStateChange() {
        if (xmlHttp.readyState == 4) {
            if (xmlHttp.status == 200) {
                // we convert the plain text returned into a JSON Object

                puzzleData = JSON.parse(xmlHttp.responseText);

                var puzExists = false;
                var i=0;
                while(puzExists == false && puzzleData[i] != null){
                    puzExists = (puzzleData[i].puzzleName.toLowerCase() == pName.toLowerCase());
                    i++;
                }

                if(puzExists){

                var pieceArray = puzzleData[i-1].puzzleString.split(',');
                var solStr = puzzleData[i-1].puzzleSolution;
                var instStr = puzzleData[i-1].puzzleDescription;

                var i = 0;
                var pObjArray = new Array(pieceArray.length);
                var pObj, piece, pType;

                while (i < pieceArray.length) {
                    piece = pieceArray[i];
                    pType = piece.charAt(0);
                    if(pType == 'r') {          // Resistor has value
                        pObj = new GridObj("resistor");
                        pObj.value = parseInt(piece.slice(1,piece.indexOf(':')));
                        pObj.num = parseInt(piece.slice(piece.indexOf(':') + 1));
                    } else if (pType == 'b') {     // Battery has value
                        pObj = new GridObj("battery");
                        pObj.value = parseInt(piece.slice(1,piece.indexOf(':')));
                        pObj.num = parseInt(piece.slice(piece.indexOf(':') + 1));
                    } else if (pType == 'j') {     // Battery has value
                        pObj = new GridObj("junct");
                        pObj.value = parseInt(piece.slice(1,piece.indexOf(':')));
                        pObj.num = parseInt(piece.slice(piece.indexOf(':') + 1));
                    } else if (pType == 'g') {      // Gate does not have value
                        pObj = new GridObj("gate");
                        pObj.num = parseInt(piece.slice(piece.indexOf(':') + 1));
                    } else if (pType == 'l') {      // Light does not have value
                        pObj = new GridObj("light");
                        pObj.num = parseInt(piece.slice(piece.indexOf(':') + 1));
                    }
                    //alert("Type: " + pObj.type + '\nValue: ' + pObj.value + "\nNum: " + pObj.num);
                    pObjArray[i] = pObj;
                    i++;
                }

                theGrid.setGrid(8,8,solStr,pObjArray,instStr);
                firstLoad = false;
                updateBoardGUI();

            } else {
                alert("XMLHttpRequest error, status=" + xmlHttp.status);
            }
            }
        }
    }

}

function SignIn(name, password){
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "https://api.mongolab.com/api/1/databases/aokdb/collections/Users?apiKey=9F3RTpQ0S0sUsj0lM_uTVwfNqZtyFqel", false);
    xmlHttp.onreadystatechange = handleReadyStateChange;
    xmlHttp.send(null);

    function handleReadyStateChange() {
        if (xmlHttp.readyState == 4) {
            if (xmlHttp.status == 200) {
                // we convert the plain text returned into a JSON Object

                var userData = JSON.parse(xmlHttp.responseText);
                var userExists = false;
                var i=0;
                while(userExists == false && userData[i] != null){
                    userExists = (userData[i].username.toLowerCase() == name.toLowerCase());
                    i++;
                }

                if(userExists){
                    if( userData[i-1].password == password){
                        sessionStorage.userID = userData[i-1]._id.$oid;
                        sessionStorage.username = userData[i-1].username;
                        sessionStorage.userType = userData[i-1].type;
                        window.location.href = "index.html";
                    }else{
                        alert("The password and/or username supplied is not correct");
                    }


                }else{
                    alert("That user does not exist please sign up or login as guest");
                }

            } else {
                alert("XMLHttpRequest error, status=" + xmlHttp.status);
            }
        }
    }
}

function GetPuzzles(){
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "https://api.mongolab.com/api/1/databases/aokdb/collections/Puzzles?apiKey=9F3RTpQ0S0sUsj0lM_uTVwfNqZtyFqel", false);
    xmlHttp.onreadystatechange = handleReadyStateChange;
    xmlHttp.send(null);

    function handleReadyStateChange() {
        if (xmlHttp.readyState == 4) {
            if (xmlHttp.status == 200) {
                // we convert the plain text returned into a JSON Object

                puzzleData = JSON.parse(xmlHttp.responseText);

        }else{
                alert("XMLHttpRequest error, status=" + xmlHttp.status);
        }
    }
}
}

function RegisterUser(name, username, email, password1, password2, type){

    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "https://api.mongolab.com/api/1/databases/aokdb/collections/Users?apiKey=9F3RTpQ0S0sUsj0lM_uTVwfNqZtyFqel", false);
    xmlHttp.onreadystatechange = handleReadyStateChange;
    xmlHttp.send(null);

    function handleReadyStateChange() {
        if (xmlHttp.readyState == 4) {
            if (xmlHttp.status == 200) {
                // we convert the plain text returned into a JSON Object

                var userData = JSON.parse(xmlHttp.responseText);

                var userExists = false;
                var i=0;
                while(userExists == false && userData[i] != null){
                    userExists = (userData[i].username.toLowerCase() == username.toLowerCase());
                    i++;
                }

                if(userExists){
                    alert("That username already exists!");

                }else{
                    if(password1 == password2){

                        var newUser = {};
                        newUser["username"] = username;
                        newUser["name"] = name;
                        newUser["email"] = email;
                        newUser["password"] = password1;
                        newUser["type"] = type;
                        newUser["linkedStudents"] = JSON.stringify(null);

                        var jsonString = JSON.stringify(newUser);
                        var xmlHttp2 = null;
                        xmlHttp2 = new XMLHttpRequest();
                        xmlHttp2.open("POST", "https://api.mongolab.com/api/1/databases/aokdb/collections/Users?apiKey=9F3RTpQ0S0sUsj0lM_uTVwfNqZtyFqel", false);
                        xmlHttp2.setRequestHeader("Content-type", "application/json");
                        xmlHttp2.onreadystatechange = function handleReadyStateChange2() {
                            if (xmlHttp2.readyState == 4) {
                                if (xmlHttp2.status == 200 || xmlHttp2.status == 304) {
                                    //sessionStorage.userID = newUser._id.$oid;
                                    sessionStorage.username = newUser.username;
                                    sessionStorage.userType = newUser.type;
                                    window.location.href = "index.html";
                                } else {
                                    alert("XMLHttpRequest error, status=" + xmlHttp2.status);
                                }
                            }
                        };
                        xmlHttp2.send(jsonString);




                    }else{
                        alert("The passwords you entered do not match!");
                    }
                }

            } else {
                alert("XMLHttpRequest error, status=" + xmlHttp.status);
            }
        }
    }

}

function AddUser(theUser){
    var jsonString = JSON.stringify(theUser);
    var xmlHttp2 = null;
    xmlHttp2 = new XMLHttpRequest();
    xmlHttp2.open("POST", "https://api.mongolab.com/api/1/databases/aokdb/collections/Users?apiKey=9F3RTpQ0S0sUsj0lM_uTVwfNqZtyFqel", false);
    xmlHttp2.setRequestHeader("Content-type", "application/json");
    xmlHttp2.onreadystatechange = handleReadyStateChange2;
    xmlHttp2.send(jsonString);

    function handleReadyStateChange2() {
        if (xmlHttp2.readyState == 4) {
            if (xmlHttp2.status == 200 || xmlHttp2.status == 304) {
                sessionStorage.userID = theUser.user._id.$oid;
                sessionStorage.username = theUser.user.username;
                sessionStorage.userType = theUser.user.type;
                window.location.href = "index.html";
            } else {
                alert("XMLHttpRequest error, status=" + xmlHttp2.status);
            }
        }
    }
}

function UpdateUser(userID, theUser){
    var jsonString = JSON.stringify(theUser);
    var xmlHttp2 = null;
    xmlHttp2 = new XMLHttpRequest();
    xmlHttp2.open("PUT", "https://api.mongolab.com/api/1/databases/aokdb/collections/Users/"+userID+"?apiKey=9F3RTpQ0S0sUsj0lM_uTVwfNqZtyFqel", false);
    xmlHttp2.setRequestHeader("Content-type", "application/json");
    xmlHttp2.onreadystatechange = handleReadyStateChange2;
    xmlHttp2.send(jsonString);

    function handleReadyStateChange2() {
        if (xmlHttp2.readyState == 4) {
            if (xmlHttp2.status == 200 || xmlHttp2.status == 304) {
                alert("User Info successfully updated!");
            } else {
                alert("XMLHttpRequest error, status=" + xmlHttp2.status);
            }
        }
    }
}

function UpdateScore(userID,username, score){

    var thisUser = new GetSingleUser(name);

    var oldscore = parseInt(thisUser.user.score,10);
    var addscore = parseInt(score,10);

    var newScore = oldscore + addscore;

    var updatedUser = {};
    updatedUser["username"] = thisUser.user.username;
    updatedUser["name"] = thisUser.user.name;
    updatedUser["email"] = thisUser.user.email;
    updatedUser["password"] = thisUser.user.password;
    updatedUser["type"] = thisUser.user.type;
    updatedUser["score"] = newScore;
    updatedUser["puzzlesOwned"] = thisUser.user.puzzlesOwned;
    updatedUser["linkedStudents"] = thisUser.user.linkedStudents;

    var update = new UpdateUser(userID,updatedUser);



}

function DeleteUser(userID){

    var xmlHttp2 = null;
    xmlHttp2 = new XMLHttpRequest();
    xmlHttp2.open("DELETE", "https://api.mongolab.com/api/1/databases/aokdb/collections/Users/"+userID+"?apiKey=9F3RTpQ0S0sUsj0lM_uTVwfNqZtyFqel", false);
    xmlHttp2.setRequestHeader("Content-type", "application/json");
    xmlHttp2.onreadystatechange = handleReadyStateChange2;
    xmlHttp2.send(null);

    function handleReadyStateChange2() {
        if (xmlHttp2.readyState == 4) {
            if (xmlHttp2.status == 200 || xmlHttp2.status == 304) {
                alert("User successfully deleted!");
                sessionStorage.removeItem("userID");
                sessionStorage.removeItem("username");
                sessionStorage.removeItem("userType");

                window.location.href = "index.html";
            } else {
                alert("XMLHttpRequest error, status=" + xmlHttp2.status);
            }
        }
    }

}

function AddPuzzle(thePuzzle){
    var jsonString = JSON.stringify(thePuzzle);
    var xmlHttp2 = null;
    xmlHttp2 = new XMLHttpRequest();
    xmlHttp2.open("POST", "https://api.mongolab.com/api/1/databases/aokdb/collections/Puzzles?apiKey=9F3RTpQ0S0sUsj0lM_uTVwfNqZtyFqel", false);
    xmlHttp2.setRequestHeader("Content-type", "application/json");
    xmlHttp2.onreadystatechange = handleReadyStateChange2;
    xmlHttp2.send(jsonString);

    function handleReadyStateChange2() {
        if (xmlHttp2.readyState == 4) {
            if (xmlHttp2.status == 200 || xmlHttp2.status == 304) {
                alert("Puzzle successfully created!");
            } else {
                alert("XMLHttpRequest error, status=" + xmlHttp2.status);
            }
        }
    }
}



