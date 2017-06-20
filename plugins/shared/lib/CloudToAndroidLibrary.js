function callAndroid(jsonEventField) {
	//var jsonInput = JSON.parse(s);
	/*
	 * SirtiEventHandler(jsonstring)
	 *
	 * IdSirti
	 * IdOFSC
	 * Event
	 * IdResponse {'OK'-'KO'}
	 * ErrorMessage{}
	 * ParamInput{}
	 * ParamOutput{}
	 *
	 */

	var jsonEventFieldString = '';

	switch (jsonEventField.Event) {
	case "GEO":

		jsonEventFieldString = SirtiBridge.SirtiEventHandler(JSON.stringify(jsonEventField));

		$.extend(true, jsonEventField, JSON.parse(jsonEventFieldString));
		setOutputFields(jsonEventField);
		$('#btnPosizione').attr('disabled', false);
		$("#divConferma").show();

		break;
	default:
		jsonEventField.IdResponse = "KO";
		jsonEventField.ErrorMessage = {
			"EVENT" : "Evento non definito."
		};

	}

	if (!(jsonEventField.IdResponse === "OK")) {
		handleErrors(jsonEventField);
	}
}

function setOutputFields(jsonEventField) {

	for (var outFlds in jsonEventField.ParamOutput) {
		for (var flds in jsonEventFieldOutput) {
			if (!(jsonEventFieldOutput.hasOwnProperty(outFlds))) {
				delete jsonEventField.ParamOutput[outFlds];
			}
		}
	}

}

function handleErrors(jsonEventField) {
	//debugger;
	var html = '';
	var isConfirmationDisabled = false;
	$("#divConferma").show();
	switch (jsonEventField.Event) {
	case "GEO":
		if (jsonEventField.IdResponse === "DENY") {
			isConfirmationDisabled = true;
			$("#divAlertHeader").hide();
			$("#divConferma").hide();
		}
		break;
	default:
		isConfirmationDisabled = false;
	}

	html += 'Event: ' + jsonEventField.Event;
	for (var err in jsonEventField.ErrorMessage) {
		html += '<br>' + err + ': ' + jsonEventField.ErrorMessage[err];
	}
	$("#idAlert").html(html);
	$("#idAlert").show();
	$("#idAlert").alert();
	// $("#idAlert").delay(200).addClass("in");
	$('#btnPosizione').attr('disabled', isConfirmationDisabled);

}
