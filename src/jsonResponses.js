const fs = require('fs');
const mapData = JSON.parse(fs.readFileSync(`${__dirname}/../data/codZombiesMaps.json`))["maps"];

const searchedMaps = {};
const savedMaps = {};

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
        savedMaps,
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
    const responseJSON = {
        message: mapData,
    };

    let responseCode = 204;

    return respondJSON(request, response, responseCode, responseJSON);
};

//Adds a comment to the selected map
const commentMap = (request, response) => {

}

//Special functions to cycle between the data shown
const getPrev = (request, response) => {

};

const getNext = (request, response) => {

};

//Set out the functions for public use
module.exports = {
    addUser,
    getUsers,
    notReal,
    searchMaps,
};