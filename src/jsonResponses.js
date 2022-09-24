const users = {};

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
        users,
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
    if(!body.name || !body.age) {
        response.id = 'missingParams';
        return respondJSON(request, response, 400, responseJSON);
    }

    //Default status code
    let responseCode = 204;

    //If the user doesn't exist, set a new code and create an empty user
    if(!users[body.name]) {
        responseCode = 201;
        users[body.name] = {};
    }

    //Add the fields for this user
    users[body.name].name = body.name;
    users[body.name].age = body.age;

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

//Set out the functions for public use
module.exports = {
    addUser,
    getUsers,
    notReal,
};