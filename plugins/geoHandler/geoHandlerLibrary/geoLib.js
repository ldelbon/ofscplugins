function geoFindMe(jsonEventField) {

	if (!navigator.geolocation) {
		jsonEventField.IdResponse = 'KO';
		jsonEventField.ErrorMessage = {
			"GEO-NA" : "Geolocalizzazione non disponibile."
		};
		return;
	}

	function success(position) {
		//debugger;
		var latitude = position.coords.latitude;
		var longitude = position.coords.longitude;

		//'lat:'+latitude+',lng:'+longitude;

		jsonEventField.ParamOutput.LATITUDE = latitude;
		jsonEventField.ParamOutput.LONGITUDE = longitude;
		$('#btnPosizione').attr('disabled', false);
		$("#divConferma").show();

	}

	function error(o) {
		//debugger;
		var errCode = o.code;
		var errMsg = o.message;
		var hrefGoogleHelp = 'https://support.google.com/chrome/answer/142065?co=GENIE.Platform%3DAndroid&oco=1';

		jsonEventField.IdResponse = 'KO';
		if (o.code === 1) {
			jsonEventField.IdResponse = 'DENY';
			errMsg += '<br> Si e\' scelto di non condividere la posizione.Non sarà possibile lavorare alcuna attività.<br>E\' necessario ripristinare\
			i permessi sulla condivisione della posizione sulle impostazione del browser.<br>\
			<br><button type="button" class="btn btn-link btn-lg">Info:</button><a href="' + hrefGoogleHelp + '" target="_blank" class="btn btn-info btn-lg" role="button">Google Help</a>';

		}
		jsonEventField.ParamOutput.LATITUDE = 0;
		jsonEventField.ParamOutput.LONGITUDE = 0;
		jsonEventField.ErrorMessage[errCode] = errMsg;
		handleErrors(jsonEventField);

	}


	navigator.geolocation.getCurrentPosition(success, error, {
		"timeout" : 10000
	});
}

function setGeoDataonJsonActivity(jsonGeoData) {

	//needed to avoid skip location on cloned activity
	var isPosition = (jsonGeoData.astatus === 'started' ? -2 : -1);

	jsonGeoData.SRT_isPosition = isPosition;
	jsonGeoData.SRT_pluginPosition = 'lat:' + jsonEventField.ParamOutput.LATITUDE + ',lng:' + jsonEventField.ParamOutput.LONGITUDE;

}

function resetPlugin() {
	$('#btnPosizione').attr('disabled', true);
	$("#idAlert").hide();
	$("#divConferma").hide();

}

function _setLocalStorage(localName, data) {
	var jsonLocal = {};
	if (localStorage.getItem(localName)) {
		jsonLocal = JSON.parse(_getLocalStorage(localName));
	}
	$.extend(jsonLocal, data);
	localStorage.setItem(localName, JSON.stringify(jsonLocal));
}

function _getLocalStorage(localName) {
	return (JSON.stringify(JSON.parse(localStorage.getItem(localName))));
}

function _deleteLocalStorage(localName) {
	if (localStorage.getItem(localName)) {
		delete localStorage[localName];
	}
}

