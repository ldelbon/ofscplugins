function moveButton(elem) {
	debugger;
	var e = $(elem).closest('#pRow');
	var parentEId = $(e).parent().attr('id');
	//var a = $('#' + e);

	if (parentEId == "divPendingPermute") {
		$(e).appendTo('#divListOfPermute');
	} else {
		$(e).appendTo('#divPendingPermute');
	}
}

function renderHTMLHeaderPermute(mat, fields) {
	var html = '';
	var json = {};

	var centrale = "";
	var descCentrale = "";
	for (var act in mat) {
		//json[act] = {};
		if (mat[act].hasOwnProperty("SRT_Centrale")) {
			centrale = mat[act]["SRT_Centrale"];
		} else {
			centrale = act;
		}
		if (mat[act].hasOwnProperty("SRT_CentraleDescrizione")) {
			descCentrale = mat[act]["SRT_CentraleDescrizione"];
		} else {
			descCentrale = centrale;
		}

		if (json.hasOwnProperty(centrale) && (json[centrale].hasOwnProperty(descCentrale))) {
			json[centrale][descCentrale] = parseInt(json[centrale][descCentrale]) + 1;
		} else {
			json[centrale] = {};
			json[centrale][descCentrale] = 1;
		}
	}

	html += '<div class="col-xs-12 col-sm-10 col-md-10 form-group">';
	html += '<label for="srtcentrale" class="fb-select-label">Centrale</label>';
	html += '<select type="select" class="form-control" name="srtcentrale" id="srtcentrale">';
	//html += '<option value="NONE" selected="true">Seleziona centrale...</option>'
	for (var centr in json) {
		html += '<option value="' + centr + '">' + Object.keys(json[centr]).sort().pop() + ' - (' + json[centr][Object.keys(json[centr]).sort().pop()] + ')' + '</option>';
	}
	html += '</select></div>';
	html += '<div class="col-xs-1 col-sm-1 col-md-1 text-center form-group myCheck ">';
	html += '<label for="checkAll" class="fb-select-label" >Select all</label><input class="form-control" name="checkAll" id="chkAll" type="checkbox" data-on="Selected" data-off="Select All" data-toggle="toggle" data-onstyle="success"></div>';
		

	return (html);

}

function getDefinitions(localStorageData, key, def) {
	var retDef = '';
	var tempJson = {};
	if (localStorageData.hasOwnProperty(key)) {
		switch (def) {
		case "title":
			retDef = localStorageData[key].title;
			break;
		case "enum":
			//debugger;
			tempJson = localStorageData[key].enum;
			$.each(tempJson, function(chiave, valore) {
				if (!(tempJson[chiave].hasOwnProperty('inactive'))) {
					retDef += '<option value="' + chiave + '">' + tempJson[chiave].text + '</option>';
				}
			});
			break;
		default:
			retDef = 'label';
		}
	} else {
		retDef = key;
	}
	tempJson = null;
	return (retDef);
}

function renderHTMLPendingPermute(mat, fields) {
	//debugger;
	var html = '';
	var json = {};

	for (var act in mat) {
		json[act] = {};
		for (var kk in mat[act]) {
			for (var kf in fields) {
				if (kk == fields[kf]) {
					json[act][kk] = mat[act][kk];
				}
			}
		}
	}

	var i = 0;
	var param = null;
	var customClass = "";
	var noteLavoro = "";

	html += '<div id="divListOfPermute" class="container-fluid alert alert-warning">';

	for (var ks in json) {
		if (json[ks].hasOwnProperty("aid")) {
			param = json[ks].aid;
		} else {
			param = i;
		}
		if (json[ks].hasOwnProperty("SRT_Centrale")) {
			customClass = json[ks].SRT_Centrale;
		}

		if (json[ks].hasOwnProperty("SRT_Note_Lavoro")) {
			noteLavoro = json[ks].SRT_Note_Lavoro;
		}

		html += '<div id="pRow" class="box row ' + customClass + '">';
		for (var key in json[ks]) {
			if (key != "SRT_Note_Lavoro") {
				html += '<div class="col-xs-12 col-sm-6 col-md-3  form-group"><div class="input-group">';
				// html += '<span class="input-group-addon" id="' + key + i + '">' + key + '</span>';
				html += '<span class="input-group-addon" id="' + key + i + '">' + getDefinitions(JSON.parse(localStorage.getItem('pluginInitDataPermute')), key, 'title') + '</span>';
				html += '<input class="form-control  form-control-info alert alert-warning" type="text" value="' + json[ks][key] + '" aria-describedby="' + key + i + '" name="' + param + '[' + key + ']" readonly></input></div></div>';
			}
		}
		html += '<div class="col-xs-12 col-sm-10 col-md-10  text-center form-group"><div class="input-group">';
		html += '<span id="idSpan" class="input-group-addon">Note</span>';
		html += '<textarea class="form-control  alert alert-warning" rows="5" readonly>' + noteLavoro + '</textarea></div></div>';
		html += '<div class="col-xs-1 col-sm-1 col-md-1 text-center form-group myCheck"><input class="form-control mySingleCheck" name="' + param + '[chkActivate]" id="chkActivate' + i + '" type="checkbox" data-on="Selected" data-off="Select" data-toggle="toggle" data-onstyle="success"></div>';
		// html += '<div class="col-xs-6 col-md-3 form-group text-center"><input class="form-control" name="' + param + '[chkToggle]" id="chkToggle' + i + '" type="checkbox" data-on="OK" data-off="KO" data-toggle="toggle" data-offstyle="danger" data-onstyle="success"></div></div>';
		html += '</div>';
		i++;
	}
	html += '</div>';
	html += '<script>$(function(){$(\'[type="checkbox"]\').bootstrapToggle();})</script>';

	return (html);

}

function controlliSpeciali(jsonFormChiusura, jsonFromSelected) {

	var tipoImpianto = "";
	var CodProgNazionale = "";

	for (var mySelected in jsonFromSelected) {
		if (jsonFromSelected[mySelected].chkActivate == 'on') {
			$.extend(true, jsonFromSelected[mySelected], jsonFormChiusura);

			jsonFromSelected[mySelected].astatus = 'suspended';

			tipoImpianto = jsonFromSelected[mySelected].SRT_TipoImpianto;
			CodProgNazionale = jsonFromSelected[mySelected].SRT_CodProgNazionale;

			if (!((jsonControlliSpeciali["SRT_PT_TI_Codice_SCIA"].hasOwnProperty(jsonFormChiusura.SRT_Prova_SCIA)) && (!jsonControlliSpeciali.SRT_PT_TI_Codice_SCIA["SI-T"].hasOwnProperty(jsonFromSelected[mySelected].SRT_TipoImpianto)))) {
				delete jsonFromSelected[mySelected].SRT_PT_TI_Codice_SCIA;
				//jsonFromSelected[mySelected].SRT_PT_TI_Codice_SCIA = jsonFormChiusura.SRT_PT_TI_Codice_SCIA;
			}

			if (!((jsonControlliSpeciali["SRT_PT_ES_Codice_Collaudo"].hasOwnProperty(jsonFromSelected[mySelected].SRT_CodProgNazionale)) && (!jsonControlliSpeciali.SRT_PT_ES_Codice_Collaudo[jsonFromSelected[mySelected].SRT_CodProgNazionale].hasOwnProperty(jsonFromSelected[mySelected].SRT_Operatore)))) {
				delete jsonFromSelected[mySelected].SRT_PT_ES_Codice_Collaudo;
			}

		}
	}
}

function checkNextActivity(data) {
	var isActivity = false;

	var retJson = {
		aid : null,
		nPosInRoute : 1000,
		isActivity : false,
		SRT_Centrale : null,
		SRT_Tipinterv : null,
		appt_number : null,
		astatus : null
	};
	for (var key in data) {
		switch (data[key].astatus) {
		case "started":
		case "pending":
			if (retJson.nPosInRoute >= data[key].position_in_route && data[key].position_in_route != null) {
				retJson.nPosInRoute = data[key].position_in_route;
				retJson.aid = key;
				retJson.SRT_Tipinterv = data[key].SRT_Tipinterv;
				retJson.appt_number = data[key].appt_number;
				retJson.astatus = data[key].astatus;
			}
			break;
		default:
		}
	}

	if (retJson.aid != null) {
		if (((data[retJson.aid].hasOwnProperty("SRT_Tipinterv")) && (data[retJson.aid].SRT_Tipinterv == "WB") && (data[retJson.aid].astatus == 'pending'))) {
			retJson.isActivity = true;
			retJson.SRT_Centrale = data[retJson.aid].SRT_Centrale;
			retJson.astatus = data[retJson.aid].astatus;
		}
	}

	return (JSON.stringify(retJson));
}

function composeAlertMessage(retJsonObject) {
	var html = '';
	if ((!retJsonObject.isActivity)) {
		if (retJsonObject.aid) {
			html = '<h1><strong>Attenzione! </strong> Impossibile lavorare le permute perché è necessario lavorare l\'attività: <strong>' + ((retJsonObject.appt_number == null) ? retJsonObject.aid : retJsonObject.appt_number) + '</strong> in stato ' + retJsonObject.astatus + '</h1>';
		}
		if (retJsonObject.aid == null || retJsonObject.aid == 'undefined') {
			html = '<h1><strong>Attenzione!</strong> Non ci sono attività WB da lavorare</h1>';
		}
	}
	return (html);
}

function getPendingPermute(data, retJsonObject) {

	var canDelete = false;
	for (var key in data) {
		canDelete = ((data[key].astatus == "pending") && (data[key].hasOwnProperty("SRT_Tipinterv")) && (data[key].SRT_Tipinterv == "WB") && (retJsonObject.SRT_Centrale == data[key].SRT_Centrale));
		if (!canDelete) {
			delete data[key];
		}
	}
	console.log('jsonClosePermute');
	aid = null;
}

function getMaxKey(data) {
	var tmpKey = 0;
	for (var key in data.inventoryList) {
		if (parseInt(key) > tmpKey) {
			tmpKey = parseInt(key);
		}
	}
	return (tmpKey);
}

function createSingleJSONArray(jsonForm) {
	debugger;
	var singleJsonArray = [{}];

	var i = 0;
	var tmpAstatus = "";
	for (var a in jsonForm) {
		tmpAstatus = jsonForm[a].astatus;
		$.extend(true, singleJsonArray[i], jsonForm[a]);
		singleJsonArray[i][a].astatus = "started";
		i++;
		$.extend(true, singleJsonArray[i], jsonForm[a]);
		singleJsonArray[i][a].astatus = tmpAstatus;
		i++;
	}

}

function createCloseMessage(jsonFromSelected) {
	for (var mySelected in jsonFromSelected) {
		if (jsonFromSelected[mySelected].chkActivate != 'on') {
			delete jsonFromSelected[mySelected];

		}
	}
	jsonClosePermute.activityList = jsonFromSelected;

}

function createCompleteMessage(jsonFromSelected) {
	for (var mySelected in jsonFromSelected) {
		if (jsonFromSelected[mySelected].chkActivate != 'on') {
			delete jsonFromSelected[mySelected];

		}
	}
	jsonClosePermute.activityList = jsonFromSelected;

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

