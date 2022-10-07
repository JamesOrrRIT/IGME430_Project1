const fs = require('fs');
const mapData = JSON.parse(fs.readFileSync(`${__dirname}/../data/codZombiesMaps.json`))["maps"];

let sendBack = mapData.length;

let searchedMaps = {};
let searchedNumber = 0;
let savedMaps = {};

let searchIndex = 0;
let savedIndex = 0;

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
        sendBack,
    };

    respondJSON(request, response, 200, responseJSON);
}

//Adds a user when using the POST body
const addUser = (request, response, body) => {
    //Default message
    const responseJSON = {
        message: 'Name and age are both required.',
    };

    //Check if both fields are filled in
    //Return with an error of 400 if one or both are empty
    if(!savedMaps.name || !savedMaps.age) {
        response.id = 'missingParams';
        return respondJSON(request, response, 400, responseJSON);
    }

    //Default status code
    let responseCode = 204;

    //If the user doesn't exist, set a new code and create an empty user
    if(!savedMaps[body.name]) {
        responseCode = 201;
        savedMaps[body.name] = {};
    }

    //Add the fields for this user
    savedMaps[body.name].name = savedMaps.name;
    savedMaps[body.name].age = savedMaps.age;

    //If the response is create, we create a message
    if(responseCode === 201)
    {
        responseJSON.message = 'Created Successfully';
        return respondJSON(request, response, responseCode, responseJSON);
    }

    return respondJSONMeta(request, response, responseCode);
};

//Run if the page cannot be found
const notReal = (request, response) => {
    const responseJSON = {
        id: 'notFound',
        message: 'The page you are looking for was not found.',
    };

    respondJSON(request, response, 404, responseJSON);
};

//Search for the data accordingly
const searchMaps = (request, response, params) => {
    //Reset the searched array if it was previously filled
    searchedMaps = {};
    searchedNumber = 0;

    //Parse the params to get the right information
    let searchType = params.slice(params.indexOf('=') + 1, params.lastIndexOf("&")); //The type of data being search
    let searchQuery = params.substring(params.lastIndexOf("=") + 1); //Whatever the user has typed in the bar

    //Checks for the maps by the right parameters and saves them in an array
    searchedMaps = lookFor(searchType, searchQuery);

    //Default response method
    const responseJSON = {
        message: searchedMaps[0],
    };

    //Default response code
    let responseCode = 201;

    //If there is nothing in the search box
    if(searchQuery === "")
    {
        responseJSON.message = 'Please fill in the field before searching';
        responseCode = 400;
    }

    //If no maps correlating to the data can be found
    if(Object.keys(searchedMaps).length === 0)
    {
        responseJSON.message = `No maps found with '${searchQuery}' under '${searchType}'`;
        responseCode = 404;
    }

    respondJSON(request, response, responseCode, responseJSON);
};

//Go through all of the maps and find the ones according to the search
const lookFor = (searchType, searchQuery) => {
    let mapsFound = {};

    for(const elem of mapData)
    {
        //Go through each of the maps by the corresponding type, and search for the inputed searched term
        let checking;

        switch(searchType) {
            case 'map-name':
                checking = elem.mapName;
                break;
            case 'enemies':
                checking = elem.enemies;
                break;
            case 'easter-eggs':
                checking = elem.easterEggs;
                break;
            case 'perks':
                checking = elem.perks;
                break;
            default:
                checking = elem.wonderWeapons
                break;
        }

        //Add the element to the searchedMaps array if the search query lines up
        if(checking.includes(searchQuery))
        {  
            //Write the data as a string for easy parsing
            mapsFound[searchedNumber] = `Map Name: ${elem.mapName}|Enemies: ${elem.enemies}|Easter Eggs: ${elem.easterEggs}|Perks: ${elem.perks}|Wonder Weapons: ${elem.wonderWeapons}`;
            //Increment the count of searchedNumber to fill in any future indexes
            searchedNumber += 1;
        }
    }

    return mapsFound;
}

//Adds a comment to the selected map
const commentMap = (request, response, params) => {
    
    const responseJSON = {
        params,
    }

    let responseCode = 201;

    if(params == "")
    {
        responseJSON.message = 'Please fill in the field with a comment before saving.'
        responseCode = 400;
    }

    respondJSON(request, response, responseCode, responseJSON);
}

//Special functions to cycle between the data shown
const changeIndex = (request, response, value) => {
    //Change the value of searchIndex if the prev button was pressed and the index is currently not 0
    if(value == 0 && searchIndex != 0)
    {
        searchIndex -= 1;
    }
    //Change the value of searchIndex if the next button was pressed and the index doesn't exceed the size of the array
    else if(value == 1 && searchIndex <= mapData.length)
    {
        searchIndex += 1;
    }

    //Default response method
    const responseJSON = {
        message: searchedMaps[searchIndex],
    };

    //Default response code
    let responseCode = 201;

    respondJSON(request, response, responseCode, responseJSON);
};

//Set out the functions for public use
module.exports = {
    addUser,
    getUsers,
    notReal,
    searchMaps,
    commentMap,
    changeIndex,
};