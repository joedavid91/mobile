/**
 * Created by Joe David on 22-11-2017.
 */
//including the modules
var request = require('request');
var express = require('express');
var app = express();
//var http = require('http').Server(app);
var sparqlgen = require('./SPARQLGen');
var formidable = require('formidable');
var parseXml = require('xml2js').parseString;
const num_of_fields = 10


//var io = require('socket.io')(http);

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: true }))
var hostname = 'localhost';
var port = 6000;
var emitSocket;

//defining argument to retrieve the data from S1000
var argument = {
    data: {"destUrl":"http://192.168.23.152:3000/events"},
    headers: { "Content-Type": "application/json" }
};

//define variables


//define options for requeste library to query the Knowledge base
var optionsKB = {
    method: 'post',
    body: " ",
    json: true, // Use,If you are sending JSON data
    url:"",
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept':'application/sparql-results+json,*/*;q=0.9'
    }
};

var optionsOrder = {
    method: 'post',
    body: " ",
    json: true, // Use,If you are sending JSON data
    url:"http://127.0.0.1:8000/updateOrder",
    headers: {
        //'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Type': 'application/json',
        'Accept':'application/sparql-results+json,*/*;q=0.9'
    }
};

//define query for S1000
var optionsS1000 = {
    method: 'post',
    body: {destUrl:''}, // Javascript object payload
    json: true,
    url: '',
    headers: {
        'Content-Type': 'application/json'
    }
};
var optionsSim = {
    method: 'POST', //
    body: {"destUrl": "http://127.0.0.1"}, // Javascript object
    json: true,
    headers: {
        'Content-Type': 'application/json'
    }
};


/*
 //function for receiving order value from the operator
 function callOrder(ord){
 console.log(ord);
 optionsKB.body = ord; //Assembly of the new query
 console.log(optionsKB);
 request(optionsKB, function (err, res, body) {
 if (err) {
 console.log('Error :', err);
 return;
 }

 for(var i = 0; i<body.results.bindings.length; i++) {
 var next = body.results.bindings[i].url.value;
 setValue = next;
 console.log(setValue);
 }
 });
 }
 */
/*
//function to instruct S1000 to perform the job based on the url received from fuseki
function requestOut(num){
    optionsS1000.url = num;
    console.log(optionsS1000);
    request(optionsS1000, function (err, res, body) {
        if (err) {
            console.log('Error :', err);
            return;
        }
        console.log(optionsS1000);
        console.log(' Body :', body);
    });
}


*/
//this route is from localhost:3000
app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('Orchestrator is operational');
});

//defining counter variable and getting into the condition till counter is less than set value


app.post('/invokeService',function (req,res) {
    console.log('Received invoke command from the Workstation Class: ', req.body);
    optionsSim.url = JSON.parse(req.body);
    console.log("DEBUG 2",optionsSim.url);
    request(optionsSim, function(err,res){
        if(err){
            console.log('Error from Orchestrator: Error Invoking service on the line');
            console.log(res);
        }


    });
    res.end();



});

/*

//receiving post request from S1000 and performing jobs based on the events
app.post('/events', function (req,res){
    console.log(req.body);
    console.log(counter);
    console.log(setValue);
    if (counter < setValue){
        // console.log(counter);
        // console.log(setValue);
        if ((req.body.id == "Z1_Changed")&&(req.body.payload.PalletID == "-1")) {
            console.log("Sending " + req.body.id);
            setTimeout(function(){callNext(cnv_2)},5000);}
        else if((req.body.id == "Z2_Changed")&&(req.body.payload.PalletID == "-1")){
            console.log("Sending " + req.body.id);
            setTimeout(function(){callNext(rob_Screen)},5000);}
        else if((req.body.payload.Recipe == "4")||(req.body.payload.Recipe == "5")||(req.body.payload.Recipe == "6")){
            setTimeout(function(){callNext(rob_Frame)},5000);}
        else if((req.body.payload.Recipe == "1")||(req.body.payload.Recipe == "2")||(req.body.payload.Recipe == "3")){
            setTimeout(function(){callNext(rob_Keyboard)},5000);}
        else if((req.body.payload.Recipe == "7")||(req.body.payload.Recipe == "8")||(req.body.payload.Recipe == "9")){
            console.log("Sending " + req.body.id);
            setTimeout(function(){callNext(cnv_3)},5000);}
        else if((req.body.id == "Z5_Changed")&&(req.body.payload.PalletID == "-1")){
            counter = counter + 1;
            console.log("hi" +counter);
            console.log("Sending " + req.body.id);
            setTimeout(function(){callNext(cnv_1)},5000);}
        res.end();
    }
    else{res.end();}

});


*/

//Running server on port 3000. here the local host is waiting to connect to client.
app.listen(6500, function()
{
    console.log('Orchestrator running on port 6500');
});

//subscribing for the data



// making socket connection and listening for instruction from the HTML
// io.on('connection', function (socket) {
//     console.log('socket connection established');
//     socket.on('disconnect', function () {
//         console.log('user disconnected');
//     });
//
//     socket.on('move_pallet12', function (msg) {
//         console.log("kimchi");
//         var Client = require('node-rest-client').Client;
//         client = new Client();
//         callNext(cnv_1);
//         console.log("Hello");
//     });
// });

