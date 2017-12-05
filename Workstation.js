var express = require('express');
//var app = express();

var request = require('request');
var bodyParser = require('body-parser');
var functions = require('./Functions');
var sparqlgen = require('./SPARQLGen');


//define variables
var setValue;
var query1 = "query=PREFIX iii:<http://www.manufacturing.com/cellphones.owl#> SELECT* WHERE{iii:conveyor_1 iii:transZone45 ?url}";

//define query for the Knowledge base
var optionsUpdatepalletID = {
    method: 'post',
    body: " ",
    json: true, // Use,If you are sending JSON data
    url: "http://127.0.0.1:8000/updateProduct",
    headers: {
        'Content-Type': 'text/plain'
    }
};

//define query for S1000
var optionsOrchestrator = {
    method: 'post',
    body: '', // Javascript object payload
    json: true,
    url: 'http://127.0.0.1:6500/invokeService', //http://127.0.0.1:6500/invokeService
    headers: {
        'Content-Type': 'text/plain'
    }
};


function fuseki(type, query, tempgoal, callback) {

    var optionsKB = {
        method: 'post',
        body: query,
        json: true, // Use,If you are sending JSON data
        url: "",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': 'application/sparql-results+json,*/*;q=0.9'
        }
    };
    if (type == "query") {
        var result;
        var str;
        optionsKB.url = "http://127.0.0.1:3032/iii2017/query";
        request(optionsKB, function (err, res, body) {

            if (err) {
                console.log('Error querying the knowledge base', err);
                return;
            }
            //console.log(body);
            console.log('DEBUG 0:', query);
            console.log(body);

            if (query.includes("variable")) {
                var count  = body.results.bindings.length;
                console.log('DEBUG X', count);
                if(count>1){
                    var neighbours = [];
                    for(var i=0; i<count;i++) {

                        // console.log('DEBUG Z', body.results);
                        // console.log('DEBUG A', body.results.bindings[count]);
                            var temp = body.results.bindings[i].variable.value;
                        console.log('DEBUG Y', temp);
                        if (temp.includes("#")) {
                            neighbours.push(temp.split("#")[1]);
                            console.log('DEBUG ZZ:', neighbours);
                        }
                    }
                    for (var j=0;j<neighbours.length;j++){
                        console.log('DEBUG: ENTERING SECOND FOR LOOP:', j);
                        var neigh = neighbours[j];
                        console.log('FROM second loop neighbourslist', neigh);
                        var query_ = sparqlgen.getNeighbourQuery(neigh,"hasNeighbour");
                        console.log('FROM second loop query_', query_);
                        console.log('FROM second loop tempgoal', tempgoal);
                        functions.fuseki("query", query_, function (neighbour) {
                            console.log('debug k: ', neighbour);
                        if(neighbour == tempgoal){
                            result= neigh;

                        }
                        });


                    }
                }
                else {
                    console.log('DEBUG L: ',body.results.bindings[0]);
                    str = body.results.bindings[0].variable.value;
                    if (str.includes("#")) {
                        result = str.split("#")[1];
                    }
                    else {
                        result = str;
                    }
                }
            }
            else if (query.includes("currentneed")) {
                console.log(body.results.bindings[0]);
                str = body.results.bindings[0].currentneed.value;
                result =str;
            }

            console.log('DEBUG B: ',str);
            // if (str.includes("#")) {
            //     result = str.split("#")[1];
            // }
            // else {
            //     result = str;
            // }

            console.log("From function:", result);
            callback(result);


        });


    }
    else if (type == "update") {
        optionsKB.url = "http://127.0.0.1:3032/iii2017/update";


        request(optionsKB, function (err, res, body) {
            if (err) {
                console.log('Error updating the knowledge base', err);
                return;
            }
            //console.log(body);
            parseXml(body, function (err, result) {
                console.log(result.html.body[0].h1);

                if (result.html.body[0].h1 == 'Success') {
                    console.log('Successful updation');
                }
                else {
                    console.log("Error while performing updation");
                }


            });


            // for(var i = 0; i<body.results.bindings.length; i++) {
            //     var next = body.results.bindings[i].url.value;
            //     //var setValue = next;
            //     //requestOut(next);
            //     console.log(next);
            // }
        });
    }


}


var workstation = function (wsnumber, capability, zone1neighbor, zone2neighbor, zone3neighbor, zone4neighbor, robotUrl, conveyorUrl) {
    this.wsnumber = wsnumber;
    this.capability = capability;
    this.zone1neighbour = zone1neighbor;
    this.zone2neighbour = zone2neighbor;
    this.zone3neighbour = zone3neighbor;
    this.zone4neighbour = zone4neighbor;
    this.port = 1234;
    this.robotUrl = robotUrl;
    this.conveyorUrl = conveyorUrl;
    this.url = '127.0.0.1';
    this.status = 'free';
};

workstation.prototype.runServer = function (port) {
    var app = express();
    this.port = port;
    var ref1 = this; // explanation?
    var hostname = this.url; // can write direct url

    app.get('/', function (req, res) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.write('\nI am workstation ' + ref1.wsnumber + 'from the CLASS Definition');
        res.write('\nMy zone1 has neighbor: ' + ref1.zone1neighbour);
        res.write('\nMy zone2 has neighbor: ' + ref1.zone2neighbour);
        res.write('\nMy zone3 has neighbor: ' + ref1.zone3neighbour);
        res.write('\nMy zone4 has neighbor:: ' + ref1.zone4neighbour);
        res.end('\nWorkstation ' + ref1.wsnumber + ' CLASS Server is running.');
    });
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    //EXECUTE ROUTE FOR EVERY WORKSTATION
    app.post('/execute/', function (req, res) {


        if (ref1.wsnumber == 7) {
            optionsOrchestrator.body = "http://" + ref1.robotUrl + "/RTU/SimROB" + ref1.wsnumber + "/services/LoadPallet";
        }
        console.log(optionsOrchestrator.body);
        request(optionsOrchestrator, function (err) {
            if (!err) {
                console.log('Load Pallet Command Issued by ' + ref1.wsnumber);
            }

            else {
                console.log('Error issuing Load Pallet Command');
            }
        });

    });

    //HANDLE NOTIFICATION FROM THE FASTORY SIMULATOR
    app.post('/notifs/', function (req, res) {
        console.log(req.body);
        var PalletID = req.body.payload.PalletID;
        var ws = req.body.senderID.split("V")[1];
        console.log('~~~~~~~ws: ', ws);
        var temp = parseInt(ws);
        console.log('~~~~~~~temp: ', temp);
        var next_ws;
        temp < 12? next_ws= temp+1: next_ws=1;
        console.log('~~~~~~~next_ws: ', next_ws);
        var zone = req.body.id.split("")[1];
        console.log('DEBUG POINT 11111111');
        switch (req.body.id) {


            case "Z1_Changed":
                console.log('DEBUG POINT 2222222');
                if (PalletID != -1) {
                    console.log('DEBUG POINT 333333333');
                    console.log(PalletID);
                    var query = sparqlgen.getProductDetail(PalletID, "currentneed");
                    console.log(query)
                    fuseki("query", query, '', function (need) {
                        console.log('From function call, need: ', need);
                        var subject = functions.getSubject(req.body.id, req.body.senderID);  //Gets Processed String for use by Knowledge Base
                        console.log('Subject: ', subject);
                        var getNeighQuery = sparqlgen.getNeighbourQuery(subject, "hasNeighbour");    //gets query to find the neighbour of current location
                        console.log('getNeighQuery: ', getNeighQuery);
                        if ((need == 'paper') || (need == 'unload')) {
                            fuseki("query", getNeighQuery, 'zone_1_'+next_ws, function (neighbour) {
                                var reachNeighLinkQuery = sparqlgen.reachNeighbourLinkQuery(neighbour);
                                console.log('reachNeighLinkQuery: ', reachNeighLinkQuery);
                                fuseki("query", reachNeighLinkQuery, '', function (link) {
                                    console.log('link: ', link);
                                    optionsOrchestrator.body = link;
                                    request(optionsOrchestrator, function (err, res, body) {
                                        if (err) {
                                            console.log('Error sending invoke  command to the orchestrator');
                                        }

                                    });
                                })

                            })
                        }


                    });

                }
                // callNext(query1);
                break;
            case "Z2_Changed":
                break;
            case "Z3_Changed":

                //var id = req.body.id;
                //var senderID = 'SimROB7';
                //queries the fuseki with the query obtained in the previous step to obtain neighnour

                break;
            case "Z4_Changed":
                break;
            case "Z5_Changed":
                break;
            case "PalletLoaded"://update PalletID to the first product in OrderClass`
                var subject = functions.getSubject(req.body.id, req.body.senderID);  //Gets Processed String for use by Knowledge Base
                console.log('Subject: ', subject);
                var getNeighQuery = sparqlgen.getNeighbourQuery(subject, "hasNeighbour");    //gets query to find the neighbour of current location
                console.log('getNeighQuery: ', getNeighQuery);
                fuseki("query", getNeighQuery, '', function (neighbour) {
                    console.log('From function call: ', neighbour);
                    var reachNeighLinkQuery = sparqlgen.reachNeighbourLinkQuery(neighbour);
                    console.log('reachNeighLinkQuery: ', reachNeighLinkQuery);
                    fuseki("query", reachNeighLinkQuery, '', function (link) {
                        console.log('link: ', link);
                        optionsOrchestrator.body = link;
                        request(optionsOrchestrator, function (err, res, body) {
                            if (err) {
                                console.log('Error sending invoke  command to the orchestrator');
                            }

                        });
                    });

                });
                optionsUpdatepalletID.body = req.body.payload.PalletID;
                request(optionsUpdatepalletID, function (err) {
                    if (err) {
                        console.log('Error requesting to update Pallet ID');
                    }
                    else {
                        console.log('Successfully requested to update Pallet');
                    }

                })
        }
    });


    app.listen(port, hostname, function () {
        console.log(' WorkStation CLASS Server WS' + ref1.wsnumber + ' is running at http://' + hostname + ':' + port);
    });
    if ((ref1.wsnumber > 0) && (ref1.wsnumber < 10)) {
        request.post('	http://localhost:3000/RTU/SimCNV' + ref1.wsnumber + '/events/Z1_Changed/notifs', {form: {destUrl: "http://localhost:600" + ref1.wsnumber + "/notifs/"}});
        request.post('	http://localhost:3000/RTU/SimCNV' + ref1.wsnumber + '/events/Z2_Changed/notifs', {form: {destUrl: "http://localhost:600" + ref1.wsnumber + "/notifs/"}});
        request.post('	http://localhost:3000/RTU/SimCNV' + ref1.wsnumber + '/events/Z3_Changed/notifs', {form: {destUrl: "http://localhost:600" + ref1.wsnumber + "/notifs/"}});
        // request.post('	http://localhost:3000/RTU/SimCNV'+ref1.wsnumber+'/events/Z5_Changed/notifs', {form: {destUrl: "http://localhost:600"+ref1.wsnumber+"/notifs/"}});
        if ((ref1.wsnumber != 1) && (ref1.wsnumber != 7)) {
            request.post('	http://localhost:3000/RTU/SimCNV' + ref1.wsnumber + '/events/Z4_Changed/notifs', {form: {destUrl: "http://localhost:600" + ref1.wsnumber + "/notifs/"}});
            request.post('http://localhost:3000/RTU/SimROB' + ref1.wsnumber + '/events/DrawEndExecution/notifs', {form: {destUrl: "http://localhost:600" + ref1.wsnumber + "/notifs/"}});
        }

    }
    if ((ref1.wsnumber > 9) && (ref1.wsnumber < 13)) {
        request.post('	http://localhost:3000/RTU/SimCNV' + ref1.wsnumber + '/events/Z1_Changed/notifs', {form: {destUrl: "http://localhost:60" + ref1.wsnumber + "/notifs/"}});
        request.post('	http://localhost:3000/RTU/SimCNV' + ref1.wsnumber + '/events/Z2_Changed/notifs', {form: {destUrl: "http://localhost:60" + ref1.wsnumber + "/notifs/"}});
        request.post('	http://localhost:3000/RTU/SimCNV' + ref1.wsnumber + '/events/Z3_Changed/notifs', {form: {destUrl: "http://localhost:60" + ref1.wsnumber + "/notifs/"}});
        request.post('	http://localhost:3000/RTU/SimCNV' + ref1.wsnumber + '/events/Z4_Changed/notifs', {form: {destUrl: "http://localhost:60" + ref1.wsnumber + "/notifs/"}});
        //  request.post('	http://localhost:3000/RTU/SimCNV'+ref1.wsnumber+'/events/Z5_Changed/notifs', {form: {destUrl: "http://localhost:60"+ref1.wsnumber+"/notifs/"}});
        request.post('http://localhost:3000/RTU/SimROB' + ref1.wsnumber + '/events/DrawEndExecution/notifs', {form: {destUrl: "http://localhost:60" + ref1.wsnumber + "/notifs/"}});
    }
};

workstation.prototype.execute = function () {

};


function subscriptions() {

    request.post('http://localhost:3000/RTU/SimROB7/events/PalletLoaded/notifs', {form: {destUrl: "http://localhost:6007/notifs/"}}, function (err) {
        if (err) {
        } else {
            console.log('subscribed to pallet load');
        }
    });
    request.post('http://localhost:3000/RTU/SimROB1/events/PaperLoaded/notifs', {form: {destUrl: "http://localhost:6001/notifs/"}}, function (err) {
        if (err) {
        }
    });
    request.post('http://localhost:3000/RTU/SimROB7/events/PalletUnloaded/notifs', {form: {destUrl: "http://localhost:6007/notifs/"}}, function (err) {
        if (err) {
        }
    });
}
subscriptions();

var ws1 = new workstation(1, 'paper', 'zone_2_1', 'zone_3_1', 'zone_5_1', 'NILL', '192.168.1.11', '192.168.1.12');
var ws2 = new workstation(2, 'red', '', '', '', '', '192.168.2.1', '192.168.2.2');
var ws3 = new workstation(3, 'blue', '', '', '', '', '192.168.3.1', '192.168.3.2');
var ws4 = new workstation(4, 'green', '', '', '', '', '192.168.4.1', '192.168.4.2');
var ws5 = new workstation(5, 'red', '', '', '', '', '192.168.5.1', '192.168.5.2');
var ws6 = new workstation(6, 'blue', '', '', '', '', '192.168.6.1', '192.168.6.2');
var ws7 = new workstation(7, 'loadpallet', 'zone_2_7', 'zone_3_7', 'zone_5_7', 'NILL', '127.0.0.1:3000', '127.0.0.1:3000');
var ws8 = new workstation(8, 'green', '', '', '', '', '192.168.8.1', '192.168.8.2');
var ws9 = new workstation(9, 'red', '', '', '', '', '192.168.9.1', '192.168.9.2');
var ws10 = new workstation(10, 'blue', '', '', '', '', '192.168.10.1', '192.168.10.2');
var ws11 = new workstation(11, 'green', '', '', '', '', '192.168.11.1', '192.168.11.2');
var ws12 = new workstation(12, 'red', '', '', '', '', '192.168.12.1', '192.168.12.2');


ws1.runServer(6001);
ws2.runServer(6002);
ws3.runServer(6003);
ws4.runServer(6004);
ws5.runServer(6005);
ws6.runServer(6006);
ws7.runServer(6007);
ws8.runServer(6008);
ws9.runServer(6009);
ws10.runServer(6010);
ws11.runServer(6011);
ws12.runServer(6012);

