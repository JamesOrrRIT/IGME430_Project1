const fs = require('fs');
const mapData = JSON.parse(fs.readFileSync(`${__dirname}/../data/codZombiesMaps.json`))["maps"];

let searchedMaps = {};
let searchedNumber = 0;
let savedMaps = {};
let currentMap = {};

let searchIndex = 0;

//Function to respond to the json object with the request, response, status code, and object
const respondJSON = (request, response, status, object) => {
    response.writeHead(status, {'Content-Type': 'application/json'});
    response.write(JSON.stringify(object));
    response.end();
};

//Function to respond with the json body
const respondJSONMeta = (request, response, status) => {
    response.writeHead(status, {'Content-Type': 'application/json'});
    response.end();
}

//Return the user object as json
const getUsers = (request, response) => {
    const responseJSON = {
        message: savedMaps,
        returnValue: 2,
    };

    //Return this value if nothing was saved yet
    if(Object.keys(savedMaps).length === 0)
    {
        responseJSON.message = 'There are currently no saved maps.';
        responseJSON.returnValue = 0;
        return respondJSON(request, response, 400, responseJSON);
    }

    return respondJSON(request, response, 200, responseJSON);
}

//Run if the page cannot be found
const notReal = (request, response) => {
    const responseJSON = {
        id: 'notFound',
        message: 'The page you are looking for was not found.',
    };

    respondJSON(request, response, 404, responseJSON);
};

//Go through all of the maps and find the ones according to the search
const lookFor = (searchType, searchQuery, index) => {
    let checking;

    switch(searchType) {
        case 'map-name':
            checking = mapData[index].mapName;
            break;
        case 'enemies':
            checking = mapData[index].enemies;
            break;
        case 'easter-eggs':
            checking = mapData[index].easterEggs;
            break;
        case 'perks':
            checking = mapData[index].perks;
            break;
        default:
            checking = mapData[i].wonderWeapons
            break;
    }

    //Add the element to the searchedMaps array if the search query lines up
    if(checking.includes(searchQuery))
    {  
        //Write the data as a string for easy parsing
        mapsFound[searchedNumber] = `Map Name: ${mapData[index].mapName} (${mapData[index].nameTranslation})|Location: ${mapData[index].location}|Date: ${mapData[index].date}|Enemies: ${mapData[index].enemies}|Easter Eggs: ${mapData[index].easterEggs}|Perks: ${mapData[index].perks}|Wonder Weapons: ${mapData[index].wonderWeapons}`;
        //Increment the count of searchedNumber to fill in any future indexes
        searchedNumber += 1;
    }
}

//Search for the data accordingly
const searchMaps = (request, response, params) => {
    //Reset the searched array if it was previously filled
    searchedMaps = {};
    searchedNumber = 0;
    searchIndex = 0;

    //Parse the params to get the right information
    let searchType = params.slice(params.indexOf('=') + 1, params.lastIndexOf("&")); //The type of data being search
    let searchQuery = params.substring(params.lastIndexOf("=") + 1); //Whatever the user has typed in the bar

    //Checks for the maps by the right parameters and saves them in an array
    searchedMaps = lookFor(searchType, searchQuery);
    currentMap = searchedMaps[0];

    //Default response method
    const responseJSON = {
        message: currentMap,
        returnValue: 1,
    };

    //Default response code
    let responseCode = 201;

    //If there is nothing in the search box
    if(searchQuery === "")
    {
        responseJSON.message = 'Please fill in the field before searching.';
        responseCode = 400;
    }

    //If no maps correlating to the data can be found
    if(Object.keys(searchedMaps).length == 0)
    {
        responseJSON.message = `No maps found with '${searchQuery}' under '${searchType}'.`;
        responseCode = 404;
    }

    respondJSON(request, response, responseCode, responseJSON);
};

//Adds a comment to the selected map
const commentMap = (request, response, params) => {
    //Default message
    const responseJSON = {
        message: 'Please fill in the field before commenting.',
        returnValue: 0,
    }

    //Check if the user searched for a map before commenting
    if(Object.keys(searchedMaps).length === 0)
    {
        responseJSON.message = `Please search for a map before commenting.`;
        return respondJSON(request, response, 400, responseJSON);
    }

    //Check if the field is filled in, return 400 if it is
    if(!params.comment) {
        response.id = 'missingParams';
        return respondJSON(request, response, 400, responseJSON);
    }

    //Default status code
    let responseCode = 204;

    let currentName = JSON.stringify(currentMap);
    currentName = currentName.substring(currentName.indexOf(':') + 1, currentName.indexOf('(') - 1);

    //If the user doesn't exist, set a new code and create an empty user
    if(!savedMaps[params.comment]) {
        responseCode = 201;
        savedMaps[params.comment] = {};
    }

    //Add the fields for this user
    savedMaps[params.comment].comment = params.comment;
    savedMaps[params.comment].map = currentName;

    //If the response is create, we create a message
    if(responseCode === 201)
    {
        responseJSON.message = 'Map Saved';
        return respondJSON(request, response, responseCode, responseJSON);
    }

    return respondJSONMeta(request, response, responseCode);
}

//Special functions to cycle between the data shown
const changeIndex = (request, response, value) => {
    //If no map was found yet, tell the user to do so
    const responseJSON = {
        message: 'Please search for maps before going through the indexes.',
        returnValue: 1,
    };

    //Check if the user searched for a map before commenting
    if(Object.keys(searchedMaps).length === 0 || Object.keys(searchedMaps).length === 1)
    {
        respondJSON(request, response, 400, responseJSON);
    }

    //Change the value of searchIndex if the prev button was pressed and the index is currently not 0
    if(value === 0 && searchIndex !== 0)
    {
        searchIndex -= 1;
    }
    //Change the value of searchIndex if the next button was pressed and the index doesn't exceed the size of the array
    else if(value === 1 && searchIndex !== (Object.keys(searchedMaps).length) - 1)
    {
        searchIndex += 1;
    }

    //Return the new index of the array
    currentMap = searchedMaps[searchIndex];
    responseJSON.message = currentMap;

    //Default response code
    let responseCode = 201;

    respondJSON(request, response, responseCode, responseJSON);
};

//Set out the functions for public use
module.exports = {
    getUsers,
    notReal,
    searchMaps,
    commentMap,
    changeIndex,
};