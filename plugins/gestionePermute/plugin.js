"use strict";

(function($) {
    window.Plugin = function(debugMode) {
        this.debugMode = debugMode || false;
        this._messageListener = null;
    };

    $.extend(window.Plugin.prototype, {
        /**
         * Dictionary of enums
         */
        dictionary: {
            astatus: {
                pending: {
                    label: 'pending',
                    translation: 'Pending',
                    outs: ['started', 'cancelled', 'suspended','complete'],
                    color: '#FFDE00'
                },
                started: {
                    label: 'started',
                    translation: 'Started',
                    outs: ['complete', 'suspended', 'notdone', 'cancelled'],
                    color: '#A2DE61'
                },
                complete: {
                    label: 'complete',
                    translation: 'Completed',
                    outs: [],
                    color: '#79B6EB'
                },
                suspended: {
                    label: 'suspended',
                    translation: 'Suspended',
                    outs: [],
                    color: '#9FF'
                },
                notdone: {
                    label: 'notdone',
                    translation: 'Not done',
                    outs: [],
                    color: '#60CECE'
                },
                cancelled: {
                    label: 'cancelled',
                    translation: 'Cancelled',
                    outs: [],
                    color: '#80FF80'
                }
            },
            invpool: {
                customer: {
                    label: 'customer',
                    translation: 'Customer',
                    outs: ['deinstall'],
                    color: '#04D330'
                },
                install: {
                    label: 'install',
                    translation: 'Installed',
                    outs: ['provider'],
                    color: '#00A6F0'
                },
                deinstall: {
                    label: 'deinstall',
                    translation: 'Deinstalled',
                    outs: ['customer'],
                    color: '#00F8E8'
                },
                provider: {
                    label: 'provider',
                    translation: 'Resource',
                    outs: ['install'],
                    color: '#FFE43B'
                }
            }
        },

        /**
         * Which field shouldn't be editable
         *
         * format:
         *
         * parent: {
         *     key: true|false
         * }
         *
         */
        renderReadOnlyFieldsByParent: {
            data: {
                apiVersion: true,
                method: true,
                entity: true
            },
            resource: {
                pid: true,
                pname: true,
                gender: true
            }
        },

        /**
         * Check for string is valid JSON
         *
         * @param {*} str - String that should be validated
         *
         * @returns {boolean}
         *
         * @private
         */
        _isJson: function(str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        },

        /**
         * Return origin of URL (protocol + domain)
         *
         * @param {String} url
         *
         * @returns {String}
         *
         * @private
         */
        _getOrigin: function(url) {
            if (url != '') {
                if (url.indexOf("://") > -1) {
                    return 'https://' + url.split('/')[2];
                } else {
                    return 'https://' + url.split('/')[0];
                }
            }

            return '';
        },

        /**
         * Return domain of URL
         *
         * @param {String} url
         *
         * @returns {String}
         *
         * @private
         */
        _getDomain: function(url) {
            if (url != '') {
                if (url.indexOf("://") > -1) {
                    return url.split('/')[2];
                } else {
                    return url.split('/')[0];
                }
            }

            return '';
        },

        /**
         * Sends postMessage to document.referrer
         *
         * @param {Object} data - Data that will be sent
         *
         * @private
         */
        _sendPostMessageData: function(data) {
            //alert(document.referrer+'++++'+JSON.stringify(data_sendPostMessageData));
            if (document.referrer !== '') {
                this._log(window.location.host + ' -> ' + data.method + ' ' + this._getDomain(document.referrer), JSON.stringify(data, null, 4));

                parent.postMessage(JSON.stringify(data), this._getOrigin(document.referrer));
            }
        },

        /**
         * Handles during receiving postMessage
         *
         * @param {MessageEvent} event - Javascript event
         *
         * @private
         */
        _getPostMessageData: function(event) {
            if (typeof event.data !== 'undefined') {
                if (this._isJson(event.data)) {
                    //openDialog(event.data);

                    var data = JSON.parse(event.data);

                    if (data.method) {
                        this._log(window.location.host + ' <- ' + data.method + ' ' + this._getDomain(event.origin), JSON.stringify(data, null, 4));

                        switch (data.method) {
                            case 'init':
                                this.pluginInitEnd(data);

                                break;
                            case 'open':
                                this.pluginOpen(data);

                                break;
                            case 'error':
                            debugger;
                                data.errors = data.errors || {
                                    error: 'Unknown error'
                                };

                                this._showError(data.errors);

                                break;
                            default:
                                alert('Unknown method');

                                break;
                        }
                    } else {
                        this._log(window.location.host + ' <- NO METHOD ' + this._getDomain(event.origin), null, null, true);
                    }
                } else {
                    this._log(window.location.host + ' <- NOT JSON ' + this._getDomain(event.origin), null, null, true);
                }
            } else {
                this._log(window.location.host + ' <- NO DATA ' + this._getDomain(event.origin), null, null, true);
            }
        },

        /**
         * Show alert with error
         *
         * @param {Object} errorData - Object with errors
         *
         * @private
         */
        _showError: function(errorData) {
        	// debugger;
            var test = 'Attenzione: si è verificato un errore; si prega di contattare l\'amministratore inviando la schermata di errore.\n'+JSON.stringify(errorData, null, 4);
            alert(test);
        },

        /**
         * Logs to console
         *
         * @param {String} title - Message that will be log
         * @param {String} [data] - Formatted data that will be collapsed
         * @param {String} [color] - Color in Hex format
         * @param {Boolean} [warning] - Is it warning message?
         *
         * @private
         */
        _log: function(title, data, color, warning) {
            if (!this.debugMode) {
                return;
            }
            if (!color) {
                color = '#0066FF';
            }
            if (!!data) {
                console.groupCollapsed('%c[Plugin API] ' + title, 'color: ' + color + '; ' + (!!warning ? 'font-weight: bold;' : 'font-weight: normal;'));
                console.log('[Plugin API] ' + data);
                console.groupEnd();
            } else {
                console.log('%c[Plugin API] ' + title, 'color: ' + color + '; ' + (!!warning ? 'font-weight: bold;' : ''));
            }
        },

        /**
         * Business login on plugin init
         */
        saveToLocalStorage: function(data) {
            this._log(window.location.host + ' INIT. SET DATA TO LOCAL STORAGE', JSON.stringify(data, null, 4));
            if (data.attributeDescription) {
                localStorage.setItem('pluginInitDataPermute', JSON.stringify(data.attributeDescription));
            }
        },

        /**
         * Business login on plugin init end
         *
         * @param {Object} data - JSON object that contain data from OFSC
         */
        pluginInitEnd: function(data) {

            this.saveToLocalStorage(data);

            this._sendPostMessageData({
                method: 'initEnd'
            });
        },

        /**
         * Business login on plugin open
         *
         * @param {Object} receivedData - JSON object that contain data from OFSC
         */
        pluginOpen: function(receivedData) {
            if (localStorage.getItem('pluginInitDataPermute')) {
                this._log(window.location.host + ' OPEN. GET DATA FROM LOCAL STORAGE', JSON.stringify(JSON.parse(localStorage.getItem('pluginInitDataPermute')), null, 4));
                $('.json__local-storage').text(JSON.stringify(JSON.parse(localStorage.getItem('pluginInitDataPermute')), null, 4));
            }
            // uncomment for degub
            // $('.section__local-storage').show();
            $('.form').html(this.renderForm(receivedData));
            jsonClosePermute.activityList = $.extend(true, {}, receivedData.activityList);
            var retJsonObject = JSON.parse(checkNextActivity(jsonClosePermute.activityList));

            if (!retJsonObject.isActivity) {
                var test = composeAlertMessage(retJsonObject);
                $('.dummy-pricing').hide();
                $('.noPermute').show();
                $('#noPermute').html(test);
            } else {
                getPendingPermute(jsonClosePermute.activityList, retJsonObject);
                //$('#installedMaterial').html(this.renderInstalledTable(receivedData));
                $('#headerPermute').html(this.renderHeaderPermute(jsonClosePermute.activityList));
                $('#mandMatCont').html(this.renderPendingPermute(jsonClosePermute.activityList));
                this.renderSelects(jsonClosePermute.activityList);
            }
            _setLocalStorage('jsonClosePermute', jsonClosePermute);

            //alert(_getLocalStorage('jsonClosePermute'));

            /*$('#mandMatCont').find('[id^=chkToggle]').each(function(idx, item) {
                //alert(idx + '++++' + item);

            }).on('change', function() {
                if ($(this).prop('checked') == "on") {
                    $('#quantity_' + idx).attr('readonly', 'true');
                }

            });*/

            $('.key').each(function(index, item) {
                if ($(item).siblings('.value').has('.items').size() !== 0) {
                    $(item).addClass('clickable');
                }
            }).on('click', function() {
                if ($(this).siblings('.value').has('.items').size() !== 0) {
                    $(this).siblings('.value').toggle();
                    $(this).toggleClass('collapsed');
                }
            });

            $('.button__generate_serrorign').on('click', function(e) {
                var canvasElement = $('<canvas>').addClass('value').attr({
                    height: 240,
                    width: 320
                }).get(0);
                $(e.target).after(canvasElement);
                drawSampleSignature(canvasElement);

                $(e.target).parents('.item').addClass('edited');

                this._updateResponseJSON();

                $(e.target).remove();
            }.bind(this));

            $('.value__item').on('input change', function(e) { //IE10+
                $(e.target).parents('.item').addClass('edited');

                this._updateResponseJSON();
            }.bind(this));

            $('.back_method_select, .back_activity_id').on('change', function(e) { //IE10+
                this._updateResponseJSON();
            }.bind(this));

            $('.json__request').text(JSON.stringify(receivedData, null, 4));

            $('#btnIndietro').click(function() {
                this._sendPostMessageData({
                    "apiVersion": 1,
                    "method": "close",
                    "backScreen": "default"
                });
                _deleteLocalStorage('jsonClosePermute');
            }.bind(this));

            $('#btnAnnulla').click(function() {
                this._sendPostMessageData({
                    "apiVersion": 1,
                    "method": "close",
                    "backScreen": "activityList"
                });
                _deleteLocalStorage('jsonClosePermute');
            }.bind(this));
            
            $('#btnLavora').click(function(e) {
            	    var jsonTmp = JSON.parse(_getLocalStorage('jsonClosePermute'));
                    var jsonFormChiusura = {};
                    var jsonFromSelected = {};

                    jsonFormChiusura = $('#frmMainPermutePending').serializeJSON({
                        parseNumbers: true,
                        parseNulls: true,
                        checkboxUncheckedValue: "false"
                    });
                    
                    jsonFromSelected = $('#frmMandatMat').serializeJSON({
                        parseNumbers: true,
                        parseNulls: true,
                        checkboxUncheckedValue: "false"
                    });                    
                  	controlliSpeciali(jsonFormChiusura, jsonFromSelected);
                  	
                  	createCloseMessage(jsonFromSelected);
                  	
                  	console.log(JSON.stringify(jsonFromSelected));
									
                  	
                  	this._sendPostMessageData(jsonClosePermute);
                  	                    
                _deleteLocalStorage('jsonClosePermute');
            }.bind(this));
            
                        
            // $('#btnTest').click(function() {
                // //debugger;
                // jsonHeader.activityList = actlist;
                // console.log(JSON.stringify(jsonHeader, null, 4));
// 					
				// var newDateObj = new Date();
// 				
				// var jsonprova = {
					// "apiVersion" : 1,
					// "method":"close",
					// "activityList" : {}
				// };
// 			
// 				
                // this._sendPostMessageData(jsonHeader);
                // _deleteLocalStorage('jsonClosePermute');
// 
            // }.bind(this));

                        // $('#btnCloseAll').click(function() {
                // try {
                    // var jsonTmp = JSON.parse(_getLocalStorage('jsonClosePermute'));
                    // var jsonForm = {};
// 
                    // jsonForm.activityList = $('#frmMandatMat').serializeJSON({
                        // parseNumbers: true,
                        // checkboxUncheckedValue: "false"
                    // });
                    // for (var aa in jsonForm.activityList) {
// 
                        // if (jsonForm.activityList[aa].chkToggle == "on") {
                            // jsonForm.activityList[aa].astatus = "complete";
                        // } else {
                            // jsonForm.activityList[aa].astatus = "suspended";
                        // }
                        // jsonTmp.activityList[aa].XA_offline_start = 2;
                    // }
                    // $.extend(true, jsonTmp.activityList, jsonForm.activityList);
                    // createSingleJSONArray(jsonTmp.activityList);
// 
                    // var tmpsn = null;
                    // var aid = jsonTmp.activity.aid;
                    // //jsonTmp.backActivityId=aid;
                    // //jsonTmp.actions = [{}];
                    // var tmpProvider = {};
                    // var tmpForm = {};
                    // var tmpInvId = 0;
// 
                    // for (var provider in jsonTmp.inventoryList) {
                        // tmpsn = jsonTmp.inventoryList[provider].invsn;
                        // for (var forms in jsonForm) {
                            // if (jsonForm[forms].invsn == tmpsn) {
                                // if (jsonForm[forms].quantity > 0) {
                                    // //tmpInvId = parseInt(jsonTmp.inventoryList[provider].invid)+999;
                                    // //tmpProviderId = '999' + provider.toString();
                                    // // jsonForm[forms].invpool = 'install';
                                    // // jsonForm[forms].inv_aid = aid;
                                    // // jsonForm[forms].invid = provider;   
// 
                                    // // jsonForm[forms].action = 'install';
                                    // // jsonForm[forms].entity = 'inventory';
                                    // // jsonForm[forms].inv_aid = aid;
                                    // // jsonForm[forms].invid = provider;   
// 
                                    // jsonTmp.inventoryList[provider].invpool = 'install';
                                    // //jsonTmp.actions[tmpInvId].invpool = 'install';
                                    // jsonTmp.inventoryList[provider].invtype = jsonForm[forms].invtype;
                                    // jsonTmp.inventoryList[provider].invid = parseInt(provider);
                                    // jsonTmp.inventoryList[provider].inv_aid = parseInt(aid);
                                    // jsonTmp.inventoryList[provider].quantity = parseInt(jsonForm[forms].quantity);
                                    // //jsonTmp.actions[tmpInvId].quantity = parseInt(jsonForm[forms].quantity);   
                                    // //jsonForm[forms].invid = maxKeyOne.toString();
                                    // //jsonForm[forms].inv_pid = jsonTmp.inventoryList[provider].inv_pid;
                                    // //delete jsonForm[forms].chkToggle;
                                    // //jsonForm[forms].invid = tmpProviderId;
                                    // // tmpProvider[tmpProviderId] = jsonTmp.inventoryList[provider];
                                    // //jsonTmp.inventory[provider] = $.extend(true, {}, jsonTmp.inventoryList[provider]);
                                    // //jsonTmp.inventoryList[provider] = $.extend(true, {}, jsonForm[forms]);
                                    // //jsonTmp.inventoryList[maxKeyOne.toString()] = $.extend(true, {}, jsonForm[forms]);
                                    // //jsonTmp.inventoryList[provider] = $.extend(true, {}, jsonForm[forms]);
                                    // //jsonTmp.actions[tmpInvId] = $.extend(true, {}, jsonForm[forms]);
                                    // //jsonTmp.inventoryList[provider].quantity=(parseInt(jsonTmp.inventoryList[provider].quantity)-parseInt(jsonForm[forms].quantity));
                                    // //$.extend(true, jsonTmp.inventoryList, tmpForm);
                                    // // jsonTmp.inventoryList[tmpProviderId] = tmpProvider[tmpProviderId];
                                    // // $.extend(jsonTmp.inventoryList[jsonForm[forms].invid], tmpProvider[jsonForm[forms].invid]);
                                    // //$.extend(jsonTmp.inventory[provider], tmpProvider[provider]);
                                    // tmpInvId++;
                                // } else if (jsonForm[forms].chkToggle == "on") {
                                    // jsonTmp.activity.XA_CUSTOM_StoricoNote = jsonTmp.activity.XA_CUSTOM_StoricoNote + '\n' + new Date() + ': Materiale obbligatorio "' + tmpsn + '" non installato';
                                    // jsonTmp.activity.SRT_ChkMat = 2;
                                // }
                            // } //else delete jsonTmp.inventoryList[provider];
                        // }
                    // }
// 
                    // //delete jsonTmp.inventoryList;
                    // //delete jsonTmp.activity;
                    // console.log(JSON.stringify(jsonTmp));
                    // this._sendPostMessageData(jsonTmp);
                // } catch (e) {
                    // console.log('jeex->>>>>>>><' + e.stack);
                // }
                // _deleteLocalStorage('jsonClosePermute');
// 
            // }.bind(this));
            
			$('#chkAll').change(function(){
				
				var that=this;
				 $('input[name*="chkActivate"]').each(function() {
				 	$(this).prop('checked',that.checked).change();
				 });
			});
            
            $('[name="pendingPermute"]').click(function() {
                $('#divPendingPermute').slideToggle();
            });
            $('[name="sectionMandatory"]').click(function() {
                $('#frmMandatMat').slideToggle();
            });
            $('[name="closePermute"]').click(function() {
                $('#divClosePermute').slideToggle();
            });

			$('textarea').focus(function() {
				$("#modals").html($(this).val());
				$('#previa').modal();
			});
            var $input = $('input[name*="chkActivate"]');
            $input.change(function() {
                // $('.myCheck').change(function() {
                // debugger;
                var trigger = false;
                $input.each(function() {
                    trigger = (trigger || (($(this).prop('checked') == true)));
                });
                $('#frmMainPermutePending').toggle(trigger);
            });

            var $specialControl = $('.special-control');
            $specialControl.change(function() {
                var trigger1 = false;
                $specialControl.each(function() {
                    trigger1 = (trigger1 || (($(this).val() == '')));
                });
                $('#btnLavora').prop('disabled', (trigger1));
            });


            $('.submit').click(function() {
                var json_response = $('.json__response');

                if (json_response.is(":hidden") === true) {
                    var form = this.parseForm($('.form'));
                    this._sendPostMessageData(form.data);
                } else {
                    if (this._isJson(json_response.text())) {
                        var data = JSON.parse(json_response.text());
                        this._sendPostMessageData(data);
                    } else {
                        alert('JSON parse error!');
                    }
                }
            }.bind(this));

            $("#srtcentrale").change(function() {
                $(this).find("option:selected").each(function() {
                    // $('#mandMatCont').find(".box .row").each(function() {
                    var optionValue = $(this).attr("value");
                    if (optionValue) {
                        $(".box").not("." + optionValue).hide();
                        $("." + optionValue).show();
                    } else {
                        $(".box").hide();
                    }
                });
            }).change();

            // $('.section__ofsc-data').show();
        },

        /**
         * Render JSON object to DOM
         *
         * @param {Object} data - JSON object
         *
         * @returns {jQuery}
         */
        renderForm: function(data) {
            //            console.log(JSON.stringify(data));

            // for (var key in data.inventoryList) {
            //     if (!((data.inventoryList[key].invpool === "install") && (data.activity.aid == data.inventoryList[key].inv_aid))) {
            //         delete data.inventoryList[key];
            //     }

            // }
            return this.renderCollection('data', data, true);
        },

        renderSelects: function(data) {
            // debugger;
            var id = null;
            $('#divClosePermute').find('select').each(function(e) {
                id = this.id;
                $('#' + id).find('option').remove();
                $('#' + id).append(getDefinitions(JSON.parse(localStorage.getItem('pluginInitDataPermute')), id, 'enum'));

            });
            id = null;
        },
        renderPendingPermute: function(data) {
            var jsonFieldToExtract = {
                "1": "aid",
                "2": "SRT_Note_Lavoro",
                "3": "SRT_TipoImpianto",
                "4": "SRT_Centrale",
                "5": "SRT_Utenza",
                "6": "SRT_Operatore",
                "7": "SRT_CodProgNazionale"
            };

            return (renderHTMLPendingPermute(data, jsonFieldToExtract));

        },
        renderHeaderPermute: function(data) {
            var jsonFieldToExtract = {
                "1": "SRT_Centrale",
                "2": "SRT_CentraleDescrizione"
            };

            return (renderHTMLHeaderPermute(data, jsonFieldToExtract));

        },

        /**
         * Render JSON object to follow HTML:
         *
         * <div class="item">
         *     <div class="key">{key}</div>
         *     <div class="value">{value}</div>
         * </div>
         * <div class="item">
         *     <div class="key">{key}</div>
         *     <div class="value">
         *         <div class="items">
         *              <div class="item">
         *                  <div class="key">{key}</div>
         *                  <div class="value">{value}</div>
         *              </div>
         *              <div class="item">
         *                  <div class="key">{key}</div>
         *                  <div class="value">{value}</div>
         *              </div>
         *              ...
         *         </div>
         *     </div>
         * </div>
         * ...
         *
         * @param {String} key - Collection name
         * @param {Object} items - Child items of collection
         * @param {Boolean} [isWritable] - Will render as writable?
         * @param {number} [level] - Level of recursion
         * @param {string} [parentKey] - parent Key
         *
         * @returns {jQuery}
         */
        renderCollection: function(key, items, isWritable, level, parentKey) {
            var render_item = $('<div>').addClass('item');
            var render_key = $('<div>').addClass('key').text(key);
            var render_value = $('<div>').addClass('value value__collection');
            var render_items = $('<div>').addClass('items');

            isWritable = isWritable || false;
            level = level || 1;
            parentKey = parentKey || '';

            var newParentKey = key;

            if (items) {
                $.each(items, function(key, value) {
                    if (value && typeof value === 'object') {
                        render_items.append(this.renderCollection(key, value, isWritable, level + 1, newParentKey));
                    } else {
                        render_items.append(this.renderItem(key, value, isWritable, level + 1, newParentKey).get(0));
                    }
                }.bind(this));
            }
            render_item.append(render_key) /*.append('<span>: </span>')*/ ;

            render_value.append(render_items);
            render_item.append($('<br>'));
            render_item.append(render_value);

            return render_item;

        },
        renderInstalledCollection: function(key, items, isWritable, level, parentKey) {
            var render_item = $('<div>').addClass('item');
            var render_key = $('<div>').addClass('key').text(key);
            var render_value = $('<div>').addClass('value value__collection');
            var render_items = $('<div>').addClass('items');

            isWritable = isWritable || false;
            level = level || 1;
            parentKey = parentKey || '';

            var newParentKey = key;

            if (items) {
                $.each(items, function(key, value) {
                    if (value && typeof value === 'object') {
                        render_items.append(this.renderCollection(key, value, isWritable, level + 1, newParentKey));
                    } else {
                        render_items.append(this.renderItem(key, value, isWritable, level + 1, newParentKey).get(0));
                    }
                }.bind(this));
            }
            render_item.append(render_key) /*.append('<span>: </span>')*/ ;

            render_value.append(render_items);
            render_item.append($('<br>'));
            render_item.append(render_value);

            return render_item;

        },

        /**
         * Render key and value to follow HTML:
         *
         * <div class="item">
         *     <div class="key">{key}</div>
         *     <div class="value">{value}</div>
         * </div>
         *
         * @param {String} key - Key
         * @param {String} value - Value
         * @param {Boolean} [isWritable] - Will render as writable?
         * @param {number} [level] - Level of recursion
         * @param {string} [parentKey] - parent Key
         *
         * @returns {jQuery}
         */
        renderItem: function(key, value, isWritable, level, parentKey) {
            var render_item = $('<div>').addClass('item');
            var render_value;
            var render_key;

            isWritable = isWritable || false;
            level = level || 1;
            parentKey = parentKey || '';

            render_key = $('<div>').addClass('key').text(key);
            render_item.append(render_key).append('<span class="delimiter">: </span>');

            if (value === null) {
                value = '';
            }

            if (typeof this.renderReadOnlyFieldsByParent[parentKey] !== 'undefined' && typeof this.renderReadOnlyFieldsByParent[parentKey][key] !== 'undefined' && this.renderReadOnlyFieldsByParent[parentKey][key] === true) {
                isWritable = false;
            }

            switch (key) {
                case "csign":
                    if (isWritable) {
                        render_value = $('<button>').addClass('button button__generate_sign').text('Generate');
                    }
                    break;
                default:
                    if (this.dictionary[key]) {
                        render_value = this.renderSelect(this.dictionary, key, value, isWritable).addClass('value value__item');
                    } else {
                        render_value = $('<div>').addClass('value value__item').text(value);
                        if (isWritable) {
                            render_value.addClass('writable').attr('contenteditable', true);
                        }
                    }

                    break;
            }
            render_item.append(render_value);

            return render_item;
        },

        /**
         * Render enums
         *
         * <select class="value [writable]" [disabled]>
         *     <option value="{value}" [selected]>{dictionary}</option>
         *     ...
         * </select>
         *
         * @param {Object} dictionary - Dictionary that will be used for Enum rendering
         * @param {String} key - Just field name
         * @param {String} value - Selected value
         * @param {Boolean} isWritable - Will render as writable?
         *
         * @returns {HTMLElement}
         */
        renderSelect: function(dictionary, key, value, isWritable) {
            var render_value;

            var outs = dictionary[key][value].outs;
            var allowedValues = [value].concat(outs);
            var disabled = '';

            render_value = $('<select>').css({
                background: dictionary[key][value].color
            });

            if (isWritable) {
                render_value.addClass('writable');
            }

            if (!outs.length || !isWritable) {
                render_value.attr('disabled', true);
                render_value.removeClass('writable');
            }

            $.each(allowedValues, function(index, label) {
                render_value.append('<option' + (label === value ? ' selected' : '') + ' value="' + dictionary[key][label].label + '">' + dictionary[key][label].translation + '</option>');
            });

            return render_value;
        },

        /**
         * Parse form (root HTML element that was rendered)
         *
         * @param {HTMLElement} element - root HTML element
         *
         * @returns {Object}
         */
        parseForm: function(element) {
            var form = {};

            form.data = {
                apiVersion: 1,
                method: 'close',
                backScreen: $('.back_method_select').val()
            };

            if (form.data.backScreen === 'activity_by_id') {
                $.extend(form.data, {
                    backActivityId: $('.back_activity_id').val()
                });
            }
            //alert(form.data+'+++++'+this.parseCollection(element).data);
            $.extend(form.data, this.parseCollection(element).data);

            delete form.data.entity;
            delete form.data.resource;

            return form;
        },

        /**
         * Convert HTML elements to JSON
         *
         * @param {HTMLElement} rootElement - Root element that should be parsed recursively
         *
         * @returns {Object}
         *
         * <div class="key">activity</div>
         * <div class="value value__collection">
         *     <div class="items"> <-------------------------------- rootElement !!!
         *         <div class="item edited">
         *             <div class="key">WO_COMMENTS</div>
         *             <div class="value">text_comments</div>
         *         </div>
         *         <div class="item">
         *             <div class="key">aid</div>
         *             <div class="value">4225274</div>
         *         </div>
         *         <div class="item">
         *             <div class="key">caddress</div>
         *             <div class="value">text_address</div>
         *         </div>
         *     </div>
         * </div>
         *
         * converts to:
         *
         * {
         *     "aid": "4225274",
         *     "WO_COMMENTS": "text_comments"
         * }
         *
         */
        parseCollection: function(rootElement) {

            var returnObject = {};

            $(rootElement).children('.item').each(function(itemIndex, item) {
                var parentKey;
                var valueKey;
                var value;
                var mandatoryField = false;

                parentKey = $(rootElement).parent().siblings('.key').get(0);
                valueKey = $(item).children('.key').get(0);

                //Logic of mandatory fields
                if ((parentKey !== undefined) && (
                        ($(parentKey).text() == 'activity' && $(valueKey).text() == 'aid') ||
                        //($(parentKey).text() == 'inventory' && $(valueKey).text() == 'invid')
                        ($(parentKey).text() == 'inventory' && $(valueKey).text() == 'invid')
                    )) {
                    mandatoryField = true;
                }

                if ($(item).hasClass('item') === true && ($(item).hasClass('edited') === true || mandatoryField)) {

                    value = $(item).children('.value').get(0);

                    if ($(value).children('.items').size() > 0) {
                        returnObject[$(valueKey).text()] = this.parseCollection($(value).children('.items').get(0));
                    } else {
                        switch ($(value).prop("tagName")) {
                            case 'SELECT':
                                returnObject[$(valueKey).text()] = $(value).val();
                                break;
                            case 'CANVAS':
                                returnObject[$(valueKey).text()] = value.toDataURL();
                                break;
                            default:
                                returnObject[$(valueKey).text()] = $(value).text();
                                break;
                        }
                    }
                }
            }.bind(this));

            return returnObject;
        },

        /**
         * Update JSON
         *
         * @private
         */
        _updateResponseJSON: function() {
            var form = this.parseForm($('.form'));
            $('.json__response').text(JSON.stringify(form.data, null, 4));
        },

        /**
         * Initialization function
         */
        init: function() {
            $('.back_method_select').change(function() {
                if ($('.back_method_select').val() == 'activity_by_id') {
                    $('.back_activity_id').show();
                } else {
                    $('.back_activity_id').val('').hide();
                }
            });

            $('.json_local_storage_toggle').click(function() {
                $('.json__local-storage').toggle();
            });

            $('.json_request_toggle').click(function() {
                $('.json__response').hide();
                $('.json__request').toggle();
            });

            $('.json_response_toggle').click(function() {
                $('.json__request').hide();
                this._updateResponseJSON();
                $('.json__response').toggle();
            }.bind(this));

            this._messageListener = this._getPostMessageData.bind(this);

            window.addEventListener("message", this._messageListener, false); //Only IE9+
            
			var a={
	                "apiVersion": 1,
	                "method": "ready",
	                "sendInitData": true
                };
			    
            this._sendPostMessageData(a);
        }
    });

})(jQuery);