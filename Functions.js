/**
 * Created by Joe David on 25-11-2017.
 */
var request = require('request');
var parseXml = require('xml2js').parseString;

module.exports = {

    //FUNCTION CREATE INSTANCE OF CLASS/SUBCLASS
    getSubject: function (id, senderID) {
        var zone;
        var workstation;
        var subject;
        if ((id == 'PalletLoaded') || (id == 'PalletUnloaded') || (id == 'PaperLoaded')) {
            console.log('entered specific IF block')
            switch (id) {
                case "PalletLoaded":
                case "PalletUnloaded":
                    workstation = 7;
                    zone = 3;
                    break;

                case "PaperLoaded":
                    workstation = 1;
                    zone = 3;
                    break;
            }
        }
        else {
            //PROCESS ID -> ZONE AND SENDER ID -> WORKSTATION HERE
            if(senderID.includes("CNV")) {
                console.log('1st IF BLOCK');
                workstation = senderID.split("V")[1];
            }
            else if(senderID.includes("ROB")){
                console.log('2nd IF BLOCK');
                workstation = senderID.split("B")[1];
            }
            zone = id.charAt(1)


        }
        subject = "zone_" + zone + "_" + workstation;
        console.log("Processed Subject: " + subject);
        return subject;
    },
    fuseki: function (type, query, callback) {
        //  var result = "default";
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
            optionsKB.url = "http://127.0.0.1:3032/iii2017/query";
            request(optionsKB, function (err, res, body) {
                if (err) {
                    console.log('Error querying the knowledge base', err);
                    return;
                }
                //console.log(body);
                //     console.log(body);

                // var str = body.results.bindings[0].variable.value;
                // result = str.split("#")[1];
                // console.log("From function:", result);
                if (query.includes("SELECT")) {
                    console.log('DEBUGXXX: body',body.results.bindings[0]);
                    var str = body.results.bindings[0].variable.value;
                    if (str.includes("#")){
                        result = str.split("#")[1];
                    }

                    callback(result);
                }
                if (query.includes("ASK")) {
                    var result = body.boolean;
                    console.log('From FunctionF', body.boolean);
                    callback(result);
                }


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
                    // console.log(result.html.body[0].h1);

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


    },
    getdrawnumber: function (type) {
        switch (type){
            case "Frame_1":
                return 'Draw1';
                break;
            case "Frame_2":
                return 'Draw2';
                break;
            case "Frame_3":
                return 'Draw3';
                break;
            case "Screen_1":
                return 'Draw4';
                break;
            case "Screen_2":
                return 'Draw5';
                break;
            case "Screen_3":
                return 'Draw6';
                break;
            case "Keyboard_1":
                return 'Draw7';
                break;
            case "Keyboard_2":
                return 'Draw8';
                break;
            case "Keyboard_3":
                return 'Draw9';
                break;

        }

    },

};