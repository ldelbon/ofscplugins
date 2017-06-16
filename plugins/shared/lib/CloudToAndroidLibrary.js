    globaltextToSave = "";

    function sendToAndroid(jsonString) {

        AndroidBridge.showToast(jsonString + "! this is OFSC plugin! Do you Copy?");
    }


    function getFromAndroid() {

        var stringFromAndroid = AndroidBridge.getFromAndroid();
        return (stringFromAndroid);

    }

    function openDialog(jsonString) {

        AndroidBridge.showDialog(jsonString);

    }

    function callLibrary(jsonInput) {
        //var jsonInput = JSON.parse(s);
        var sEvent = jsonInput.event;
        jsonInput.responsePayload = {}; // reset response
        jsonInput.errorPayload = {}; // reset error

        switch (sEvent) {
            case "sendToAndroid":
                //alert('jsonInput.payload.p1:=' + jsonInput.payload.p1);
                sendToAndroid(jsonInput.payload.p1);
                jsonInput.responsePayload = {
                    "result": new Date() + ': ' + "received"
                };
                break;
            case "getFromAndroid":
                jsonInput.responsePayload = {
                    "result": new Date() + ': ' + getFromAndroid()
                }; 
                break;
            case "openDialog":
                openDialog(JSON.stringify(jsonInput.payload));
                jsonInput.responsePayload = {
                    "result": new Date() + ': ' + "opened"
                };
                break;
            default:
                jsonInput.responsePayload = {
                    "result": new Date() + ': ' + "error"
                };
                jsonInput.errorPayload = {
                    "errCode": "KO",
                    "errMessage": "Method " + sEvent + " not found"
                };
                break;
        }
    }