var alleReactiesLayer = new OpenLayers.Layer.Vector("Alle reacties", {visibility: (typeof autoReactions != 'undefined' ? autoReactions : false)});
var eigenReactiesLayer = new OpenLayers.Layer.Vector("Eigen nieuwe reacties");

var mapControls =
{
	active: null,
	select: new OpenLayers.Control.SelectFeature([eigenReactiesLayer, alleReactiesLayer]),
	draw: { eigen: new OpenLayers.Control.DrawFeature(eigenReactiesLayer, OpenLayers.Handler.Point), alle: new OpenLayers.Control.DrawFeature(alleReactiesLayer, OpenLayers.Handler.Point) },
	drag: new OpenLayers.Control.DragFeature(eigenReactiesLayer)
};

$(function()
{
	if(typeof autoReactions != 'undefined' ? autoReactions : false)
	{
		var legendaTable = $('div#right').find('div#legenda').find('table')
		var tr = $(legendaTable).find('tr.reactions');
		if(tr.length == 0)
		{
			tr = $('<tr />').addClass('reactions');
			$(legendaTable).append(tr);
		}

		$(tr).find('td.eigen-reacties').removeAttr('colspan');
		var td = $('<td />').attr('headers', 'legenda_algemeen').addClass('alle-reacties');
		$('<div />').addClass('legenda_image').append($('<img />').attr('src', '/images/legenda/rhs-green-marker.png').attr('alt', 'Correctie')).appendTo(td);
		$('<div />').addClass('legenda_text').text('Correctie').appendTo(td);

		if($(tr).find('td.eigen-reacties').length == 0) { $(td).attr('colspan', '2'); }
		$(td).prependTo(tr);
	}
});

function setState(newState)
{
	state = newState;
	switch(state)
	{
		case 'viewing':
			mapControls.select.activate();
			$('div#right')
				.find('a#add_reaction_marker')
				.removeClass('disabled')
				.attr('title', 'Plaats uw eigen reactie op de kaart')
				.find('img')
				.attr('src', '/images/markers/add-button-rhs-blue.png');
			break;
		case 'placing':
		case 'filling in':
			mapControls.select.deactivate();
			$('div#right')
				.find('a#add_reaction_marker')
				.addClass('disabled')
				.attr('title', '')
				.find('img')
				.attr('src', '/images/markers/add-button-rhs-blue-disabled.png');
			break;
	}
}

function loadAllReactions()
{
	$.getJSON("/all_reactions/", function(data)
	{
		for(var i = 0; i < data.length; i++)
		{
		 	//mapControls.draw.alle.drawFeature(new OpenLayers.Geometry.Point(data[i].x, data[i].y));
			//data[i].samenvatting = $('<div />').html(data[i].samenvatting).text();
			var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(data[i].x, data[i].y), data[i],
			{
				id: 'p1',
				name: 'Gele pin',
				externalGraphic: '/images/markers/rhs-green-small.png',
				graphicHeight: 16,
				graphicWidth: 16,
				graphicXOffset: -8,
				graphicYOffset: -16
			})

			alleReactiesLayer.addFeatures([feature]);
		}
	});
}

function initFeatures()
{
	map.addLayer(alleReactiesLayer);
	map.addLayer(eigenReactiesLayer);

	eigenReactiesLayer.events.on({'featureselected': onOwnFeatureSelect,'featureunselected': onFeatureUnselect, 'featureremoved': onFeatureRemove});
	alleReactiesLayer.events.on({'featureselected': onReactionFeatureSelect,'featureunselected': onFeatureUnselect});

	map.addControl(mapControls.select);
	mapControls.select.activate();

   //	map.addControl(mapControls.drag);
	mapControls.drag.onComplete = function(feature, pixel)
	{
		mapControls.select.clickFeature(feature);
	};
	mapControls.drag.onDrag = function(feature)
	{
		mapControls.select.unselectAll();
	}

	mapControls.draw.eigen.featureAdded = featureAdded;
	mapControls.draw.alle.featureAdded = featureAdded;
	map.addControl(mapControls.draw.eigen);
	loadAllReactions();
}

function showPopup(feature, html, popupSize)
{
	var popup = new OpenLayers.Popup.FramedCloud
	(
		"featurePopup",
		feature.geometry.getBounds().getCenterLonLat(),
		popupSize,
		html,
		null,
		false,
		null
	);
   	popup.autoSize = false;
	popup.anchor.offset.y = -8;
	popup.anchor.offset.x = 8;

   	popup.size = popupSize;
   	popup.maxSize = popupSize;
	popup.setSize(popupSize);

	feature.popup = popup;
	popup.feature = feature;
	popup.fixedRelativePosition = true;

	popup.calculateRelativePosition = function (a)
	{
		a = this.map.getLonLatFromLayerPx(a);
		a = this.map.getExtent().determineQuadrant(a);
		a = OpenLayers.Bounds.oppositeQuadrant(a);
		switch(a) { case 'tl': case 'tr': return 'tr'; break; case 'bl': case 'br': return 'br'; break; }
		return 'tr';
	};

	popup.panMapIfOutOfView = true;
	map.addPopup(popup, true);


 	$(popup.div).find('.olFramedCloudPopupContent').height($(popup.div).height() - 55);
 	$(popup.div).find('.olFramedCloudPopupContent').width($(popup.div).width() - 15);


	return popup;
}

function createRadioFields(name, text, options, required, defaultValue)
{
	var div = $('<div />').addClass('list');
	var label = $('<label />').appendTo(div);
	var labelText = $('<span />').text(text).appendTo(label);
	if(typeof required == 'undefined' ? false : required) $(labelText).append($('<span />').addClass('required').attr('title', 'Dit veld is verplicht').text('*'));

	var list = $('<ul />').appendTo(div);
	for(var i in options)
	{
		var item = $('<li />').appendTo(list);
		label = $('<label />').appendTo(item);
		var input = $('<input />').attr('type', 'radio').attr('name', name).val(i).appendTo(label);
		if(typeof defaultValue == 'string' && defaultValue == i) $(input).attr('checked', 'checked');
		$('<span />').text(options[i]).appendTo(label);
	}
	return div;
}

function createTextfield(name, text, required)
{
	var div = $('<div />');
	var label = $('<label />').appendTo(div);
	var labelText = $('<span />').text(text).appendTo(label);
	if(typeof required == 'undefined' ? false : required) $(labelText).append($('<span />').addClass('required').attr('title', 'Dit veld is verplicht').text('*'));

	$('<input />').attr('type', 'text').attr('name', name).appendTo(label);

	return div;
}

function createTextarea(name, text, required, helpText)
{
	var div = $('<div />');
	var label = $('<label />').appendTo(div);
	var labelText = $('<span />').text(text).appendTo(label);
	if(typeof required == 'undefined' ? false : required) $(labelText).append($('<span />').addClass('required').attr('title', 'Dit veld is verplicht').text('*'));

	$('<textarea />').attr('name', name).appendTo(label);

	if(typeof helpText == 'string')
		$('<div />').text('?').addClass('helpButton').attr('title', helpText).appendTo(div);

	return div;
}


function onOwnFeatureSelect(e)
{
	if(this.name != 'Eigen nieuwe reacties') return;
	var feature = e.feature;

	if(feature.attributes.permanent && feature.attributes.filledIn)
	{
		onReactionFeatureSelect.apply(this, [e]);
		return;
	}

	var html = $('<div />');

	var popupSize = new OpenLayers.Size(500,500);


	if(!feature.attributes.permanent)
	{
		setState('placing');
		// EJV 12/1/2014 aanpassing
		$('<h4 />').text('Reageren via de kaart is niet meer mogelijk').appendTo(html);
		// EJV 12/1/2014 aanpassing test: U staat op het punt een nieuwe reactie op deze locatie op de kaart te plaatsen. U kunt de locatie bevestigen of de reactie annuleren. Annuleer de reactie en plaats een nieuwe pin als de locatie niet juist is.

		$('<p />').text('U kunt vanaf 13-1-2014 helaas geen reactie meer indienen m.b.t. de concept-Vegetatielegger').appendTo(html);
		var p = $('<p />').appendTo(html);

		// $('<a />')
		//		.attr('href', '#')
		//	.attr('title', 'Bevestig de locatie')
		//	.text('Bevestig')
		//	.addClass('confirmButton')
		//	.appendTo(p);
		$('<a />')
			.attr('href', '#')
			.attr('title', 'Reactie niet meer mogelijk')
			.text('Annuleer')
			.addClass('cancelButton')
			.appendTo(p);

		popupSize = new OpenLayers.Size(250,275);
	}
	else if(!feature.attributes.filledIn)
	{
		setState('filling in');
		$('<h4 />').text('Nieuwe reactie op de concept Vegetatielegger').addClass('align').appendTo(html);

		var form = $('<form />').attr('action', '/').appendTo(html);
		var messageBox = $('<div />').addClass('messages').appendTo(form);

		messageBox = $('<div>').addClass('message_err').appendTo(messageBox);
		$('<h2 />').text('Foutmelding').appendTo(messageBox);
		$('<ul />').appendTo(messageBox);

		var persoonlijkeGegevensFieldset = $('<fieldset />').append($('<legend />').text('Persoonlijke gegevens (niet publiekelijk zichtbaar in reactie)')).appendTo(form);
		var reactieFieldset = $('<fieldset />').append($('<legend />').text('Reactie ').append($('<a />').attr('href', '#').attr('title', 'Open een formulier dat u helpt bij het invullen van de reactie').addClass('helpLink').text('(Vul de reactie in met behulp van een aantal vragen)'))).appendTo(form);


		createRadioFields('status', 'Rol/belang', {eigenaar_selected: "Eigenaar", gebruiker_selected: "Gebruiker", geinteresseerde_selected: "Geinteresseerde", organisatie_selected: "Organisatie"}, true, 'eigenaar_selected').appendTo(persoonlijkeGegevensFieldset);
		createRadioFields('aanspreektitel', 'Aanspreektitel', {mijnheer_selected: 'Mijnheer', mevrouw_selected: 'Mevrouw'}, false).appendTo(persoonlijkeGegevensFieldset);
		createTextfield('voornaam', 'Voornaam/Voorletters', true).appendTo(persoonlijkeGegevensFieldset);
		createTextfield('achternaam', 'Achternaam', true).appendTo(persoonlijkeGegevensFieldset);
		createTextfield('email', 'E-mailadres', true).appendTo(persoonlijkeGegevensFieldset);
		createTextfield('telefoon', 'Telefoonnummer').appendTo(persoonlijkeGegevensFieldset);
		createTextarea('extrainfo', 'Extra informatie', false, 'In dit veld kunt u extra informatie toevoegen over uw organisatie of uw betrokkenheid bij de uiterwaarden.').appendTo(persoonlijkeGegevensFieldset);

		createTextarea('reactie', 'Reactie', true).appendTo(reactieFieldset);

		createRadioFields('publiceer', 'Reactie publiceren', {zichtbaar_selected: 'Zichtbaar zonder persoonsgegevens', private_selected: 'Niet publiekelijk zichtbaar'}, true, 'zichtbaar_selected').appendTo(reactieFieldset);

		$('<div />')
			.append($('<input />').attr('type', 'submit').val('Reactie indienen'))
			.append($('<a />').attr('href', '#').attr('title', 'Annuleer de reactie').text('Annuleer').addClass('cancelButton'))
			.appendTo(form);

		popupSize = new OpenLayers.Size(500,500);
	}

	var popup = showPopup(feature, $(html).html(), popupSize);

	// Bind Events
	if(!feature.attributes.permanent)
	{

		$(popup.contentDiv).on('click', 'a.confirmButton', function(e)
			{
				e.preventDefault();
				feature.attributes.permanent = true;
				mapControls.select.unselectAll();
				setTimeout((function() { mapControls.select.select(feature); }), 1);
			});
	}
	else if(!feature.attributes.filledIn)
	{
		$(popup.contentDiv).on('click', 'legend a.helpLink', function(e) { e.preventDefault(); showHelpScreen(popup.contentDiv); });

		$(popup.contentDiv)
			.on('submit', 'form', formSubmit);

		var errorContainer = $(popup.contentDiv).find('div.messages > div.message_err');

		$(popup.contentDiv).find('form')
			.data('feature', feature)
			.validate({
				debug: true,
				errorElement: "li",
				onfocusout: false,
				errorContainer: errorContainer,
				errorLabelContainer: $(errorContainer).find('ul'),
				rules: {
					status: 'required',
					publiceer: 'required',
					voornaam: { required: true },
					achternaam: { required: true },
					email: { required: true, email: true },
					reactie: { required: true, minlength: 10 }
				},
				messages:
				{
					status: 'Dit veld is verplicht',
					publiceer: 'Dit veld is verplicht',
					voornaam: 'Dit veld is verplicht',
					achternaam: 'Dit veld is verplicht',
					email: { required: 'Dit veld is verplicht', email: 'Vul een geldig e-mailadres in' },
					reactie: { required: 'Dit veld is verplicht', minlength: 'Dit veld moet minimaal 10 tekens bevatten' }
	  			}
			});
	}
	$(popup.contentDiv).on('click', 'a.cancelButton', function(e)
		{
			e.preventDefault();
			mapControls.select.unselectAll();
			feature.destroy();

		});
}

function onReactionFeatureSelect(e)
{

	var feature = e.feature;
	var html = $('<div />');

	var popupSize = null;;
	var height = 200;

//	$('<h4 />').text('Reactie').appendTo(html);
//	if(feature.attributes.zichtbaar)
//	{
//		var content = $('<p />').html(feature.attributes.samenvatting).width(285).appendTo('body');
		var content = $('<p />').html('Op deze locatie wordt de Vegetatielegger verbeterd, naar aanleiding van de online consultatie. Vanaf 1 mei 2014 is de verbeterde versie op deze plaats te zien.').width(285).appendTo('body');
//		var height = $(content).height() + 125;
		var height = $(content).height() + 80;
		if(height > 500) height = 500;
		popupSize = new OpenLayers.Size(300,height);
		$(content).removeAttr('style').appendTo(html);

//		$('<p />').text(feature.attributes.reactiedatum).addClass('date').appendTo(html);
//	}
//	else
//	{
//		popupSize = new OpenLayers.Size(250,130);
//		$('<p />').text('Deze reactie is verborgen, maar bekend bij Rijkswaterstaat.').appendTo(html);
//	}
	var popup = showPopup(feature, $(html).html(), popupSize);
}

function onFeatureUnselect(e)
{
	var feature = e.feature,
		popup = feature.popup;

	if (popup)
	{
		popup.feature = null;
		map.removePopup(popup);
		popup.destroy();
		popup = null;
	}
	setState('viewing');
}

function featureAdded(feature)
{
	feature.style =
	{
		id: 'p1',
		name: 'Blauwe pin',
		externalGraphic: '/images/markers/rhs-blue.png',
		graphicHeight: 32,
		graphicWidth: 32,
		graphicXOffset: -16,
		graphicYOffset: -32
	};

	eigenReactiesLayer.redraw();

	if(typeof feature.attributes == 'undefined')
		feature.attributes = {};

	feature.attributes.permanent = false;
	feature.attributes.filledIn = false;

	mapControls.draw.eigen.deactivate();
	$('div#right').find('a#add_reaction_marker').removeClass('active');
	mapControls.select.activate();
	mapControls.select.select(feature);

	var legendaTable = $('div#right').find('div#legenda').find('table')
	var tr = $(legendaTable).find('tr.reactions');
	if($(tr).find('td.eigen-reacties').length != 1)
	{
		if(tr.length == 0)
		{
			tr = $('<tr />').addClass('reactions');
			$(legendaTable).append(tr);
		}

		$(tr).find('td.alle-reacties').removeAttr('colspan');
		var td = $('<td />').attr('headers', 'legenda_algemeen').addClass('eigen-reacties');
		$('<div />').addClass('legenda_image').append($('<img />').attr('src', '/images/legenda/rhs-blue-marker.png').attr('alt', 'Eigen reactie')).appendTo(td);
		$('<div />').addClass('legenda_text').text('Eigen reactie').appendTo(td);

		if($(tr).find('td.alle-reacties').length == 0) { $(td).attr('colspan', '2'); }
		$(td).appendTo(tr);
	}
}

function onFeatureRemove(feature)
{
	if(eigenReactiesLayer.features.length != 0) return;

		var legendaTable = $('div#right').find('div#legenda').find('table')
		var tr = $(legendaTable).find('tr.reactions');

		$(tr).find('td.eigen-reacties').remove();
		if($(tr).find('td').length !== 0)
			$(tr).find('td.alle-reacties').attr('colspan', '2');
		else
			$(tr).remove();
}

var iframe = null;
function formSubmit(e)
{	e.preventDefault();
	var modal = $('<div />').addClass('popup-modal').appendTo('body');
	var popup = $('<div />').addClass('popup').appendTo('body');
	var popupContent = $('<div />').appendTo(popup);
	var loadImage = $('<img />').attr('src', 'images/ajax-loader-big.gif').attr('alt', 'Bezig met laden...').addClass('loading');

	function closePopup()
	{
		$(popup).fadeOut('normal', function() { $(popup).remove(); $(loadImage).remove(); });
		$(modal).fadeOut('normal', function() { $(modal).remove(); });
	}


	$('<h3 />').text('Een moment geduld a.u.b. ...').appendTo(popupContent);
	$('<p />').text('Uw reactie wordt opgeslagen.').appendTo(popupContent);
	$(loadImage).appendTo(popupContent);

	var timeoutTimer = setTimeout((function()
	{
		$(popup).height($(popup).height());
		$(popupContent).fadeOut('fast', function()
		{
			$(popupContent).empty();
			$('<h3 />').text('Er is iets mis gegaan!').appendTo(popupContent);
			$('<p />').text('Het maken van de verbinding met de server duurde te lang en is mislukt. Ververs deze pagina en probeer het later nog eens.').appendTo(popupContent);
			$(popupContent).show().css('visibility', 'hidden');
			$(popup).animate({height: $(popupContent).height()}, 'fast', 'swing', function()
			{
				$(popupContent).hide().css('visibility', 'visible').fadeIn('fast');
			});
		});
	}), 30000);

	var form = this;
	var feature = $(form).data('feature');

	if(iframe != null) $(iframe).remove();

	var samenvatting = $(form).find('[name="reactie"]').val();
	var zichtbaar = $(form).find('input[type="radio"][name="publiceer"]:checked').val() == 'zichtbaar_selected';

	iframe = $('<iframe />')
				.attr('id', 'hidden_form')
				.attr('src', '/reageren/reactieformulier/')
				.appendTo('body')
				.one('load', function()
				{
					//showIframe();
					clearTimeout(timeoutTimer);
					timeoutTimer = setTimeout((function()
					{
						$(popup).height($(popup).height());
						$(popupContent).fadeOut('fast', function()
						{
							$(popupContent).empty();
							$('<h3 />').text('Er is iets mis gegaan!').appendTo(popupContent);
							$('<p />').text('Er is iets mis gegaan bij het opslaan van uw reactie! Ververs deze pagina en probeer het later nog eens.').appendTo(popupContent);
							$(popupContent).show().css('visibility', 'hidden');
							$(popup).animate({height: $(popupContent).height()}, 'fast', 'swing', function()
							{
								$(popupContent).hide().css('visibility', 'visible').fadeIn('fast');
							});
						});
					}), 30000);

					var iframeContents = $(iframe).contents();
					var iframeForm = $(iframeContents).find('form#webform-client-form-93');
					if($(iframeForm).length == 0)
					{
						processResponse();
						return;
					}


					function putValue(outFieldName, value)
					{
						$(iframeForm).find('[name="' + outFieldName + '"]').val(value);
					}
					function cloneField(inFieldName, outFieldName, defaultValue)
					{
						putValue(outFieldName, $(form).find('[name="' + inFieldName + '"]').val());
					}
					function cloneRadioField(inFieldName, outFieldName, defaultValue)
					{
						var selectedValue = defaultValue;
						var selected = $(form).find('input[type="radio"][name="' + inFieldName + '"]:checked');
						if (selected.length == 1) selectedValue = selected.val();
					   $(iframeForm).find('input[type="radio"][name="' + outFieldName + '"]').removeAttr('checked');
					   $(iframeForm).find('input[type="radio"][name="' + outFieldName + '"][value="' + selectedValue + '"]').attr("checked", "checked");
					}

					cloneRadioField("status", "submitted[persoonlijke_gegevens][status]", "eigenaar_selected");
					cloneRadioField("aanspreektitel", "submitted[persoonlijke_gegevens][aanspreektitel]", "mijnheer_selected");
					cloneField("voornaam", "submitted[persoonlijke_gegevens][voornaam]");
					cloneField("achternaam", "submitted[persoonlijke_gegevens][achternaam]");
					cloneField("email", "submitted[persoonlijke_gegevens][e_mailadres]");
					cloneField("telefoon", "submitted[persoonlijke_gegevens][telefoon]");
					cloneField("extrainfo", "submitted[persoonlijke_gegevens][extrainfo]");
					cloneField("reactie", "submitted[reactie_tekst][korte_samenvatting]");
					cloneRadioField("publiceer", "submitted[reactie_tekst][reactie_publiceren]", "zichtbaar_selected");
					cloneField("adres", "submitted[Adresgegevens][adres]");
					cloneField("postcode", "submitted[Adresgegevens][postcode]");
					cloneField("woonplaats", "submitted[Adresgegevens][woonplaats]");

					putValue('submitted[locatiedata_optioneel][url_kaartlocatie]', window.location.protocol + '//' + window.location.hostname + '/reactie/0000000000000000000000000000000000000000/');
					putValue('submitted[locatiedata_optioneel][x_coordinaat_optioneel]', Math.round(feature.geometry.x*100)/100);
					putValue('submitted[locatiedata_optioneel][y_coordinaat_optioneel]', Math.round(feature.geometry.y*100)/100);


					$(iframe).one('load', processResponse);
					$(iframeForm).submit();

				});

	function processResponse()
	{
		clearTimeout(timeoutTimer);
		var iframeContents = $(iframe).contents();
		var errorMessages = $(iframeContents).find('.message_err');
		var confirmationMessage = $(iframeContents).find('.webform-confirmation');
		if (errorMessages.length > 0)
		{
			var messageBox = $(form).find('div.messages');
			if(messageBox.length == 0)
				messageBox = $('<div />').addClass('messages').prependTo(form);

			$(messageBox).empty().show();

			$(messageBox).append(errorMessages);
			$(messageBox).find('div.message_err').show();
			$(form).closest('div.olFramedCloudPopupContent').scrollTop(0);
			closePopup();
			$(iframe).remove();
			iframe = null;
			return;
		}
		else if(confirmationMessage.length == 1)
		{
			if(feature.popup)
			{
				feature.popup.feature = null;
				map.removePopup(feature.popup);
				feature.popup.destroy();
				feature.popup = null;
			}
			var html = $('<div />');

			$(html).append($('<h4 />').text('Reactie ingediend'));
			$(html).append(confirmationMessage);

			$('<p />').append($('<a />').attr('href', '#').text('Sluit deze pop-up').attr('title', 'Sluit deze pop-up')).appendTo(html);

			var olPopup = showPopup(feature, $(html).html(), new OpenLayers.Size(370, 310));

			$(olPopup.contentDiv).find('a[href="#"]').click(function(e)
			{
				e.preventDefault();
				mapControls.select.unselectAll();
			});


			var date = new Date();
			feature.attributes.filledIn = true;
			feature.attributes.reactiedatum = date.getDate() + '-' + (date.getMonth()+1) + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
			feature.attributes.samenvatting = $('<div />').text(samenvatting.replace(/\n/gi,"=====NEWLINE=====")).html().replace(/=====NEWLINE=====/gi, '<br />');
			feature.attributes.zichtbaar = zichtbaar;

			closePopup();
			setState('viewing');
		}
		else
		{
			$(popup).height($(popup).height());
			$(popupContent).fadeOut('fast', function()
			{
				$(popupContent).empty();
				$('<h3 />').text('Er is iets mis gegaan!').appendTo(popupContent);
				$('<p />').text('De server gaf een onverwacht resultaat terug. Het is niet bekend of uw reactie succesvol is opgeslagen.').appendTo(popupContent);
				$('<p />').text('Ververs deze pagina en probeer het later opnieuw').appendTo(popupContent);
				$(popupContent).show().css('visibility', 'hidden');
				$(popup).animate({height: $(popupContent).height()}, 'fast', 'swing', function()
				{
					$(popupContent).hide().css('visibility', 'visible').fadeIn('fast');
				});
			});
		}
	}
}

function showHelpScreen(form)
{
	var modal = $('<div />').addClass('popup-modal').appendTo('body');
	var popup = $('<div />').addClass('popup').appendTo('body');
	var popupContent = $('<div />').appendTo(popup);
	function closePopup()
	{
		$(popup).fadeOut('normal', function() { $(popup).remove(); });
		$(modal).fadeOut('normal', function() { $(modal).remove(); });
	}
	var closeButton = $('<a />').attr('href', '#').attr('title', 'Verberg deze popup').text('[X]').addClass('closeButton').appendTo(popup).click(function(e) { e.preventDefault(); closePopup(); });

	var helpForm = $('<form />').attr('action', '/').appendTo(popupContent).addClass('help-form');

	var fieldset = $('<fieldset />').append($('<legend />').text('Beantwoord de volgende vragen:')).appendTo(helpForm);

	$('<div />').appendTo(fieldset)
		.append($('<div />').append($('<label />').append($('<span />').text('Komt de begroeiing op de concept Vegetatielegger overeen met de feitelijke situatie in de zomerperiode?'))))
		.append($('<ul />')
					.append($('<li />').append(
						$('<label />')
							.append($('<input />').attr('type', 'radio').attr('name', 'vraag1').attr('checked', 'checked').val('JA'))
							.append($('<span />').text('JA, de kaartweergave komt goed overeen met de feitelijke situatie'))
					))
					.append($('<li />').append(
						$('<label />')
							.append($('<input />').attr('type', 'radio').attr('name', 'vraag1').val('NEE'))
							.append($('<span />').text('NEE, de kaartweergave wijkt (waarschijnlijk) af van de feitelijke situatie'))
					))
				);
	var vraag1Uitleg = $('<div />').appendTo(fieldset).hide()
		.append($('<div />').append(
			$('<label />')
				.append($('<span />').text('Beschrijf welke begroeiing afwijkt van de feitelijke situatie:'))
				.append($('<textarea />').attr('name', 'vraag1-uitleg'))
			));

	$(fieldset).find('input[name="vraag1"]').change(function()
	{
		if($(this).val() == 'NEE') $(vraag1Uitleg).stop(true, true).slideDown('fast');
		else $(vraag1Uitleg).stop(true, true).slideUp('fast');
	})

	$('<div />').appendTo(fieldset)
		.append($('<div />').append($('<label />').append($('<span />').text('Betreft uw reactie ook aangrenzende percelen?'))))
		.append($('<ul />')
					.append($('<li />').append(
						$('<label />')
							.append($('<input />').attr('type', 'radio').attr('name', 'vraag2').val('JA'))
							.append($('<span />').text('JA, mijn reactie betreft ook aangrenzende percelen'))
					))
					.append($('<li />').append(
						$('<label />')
							.append($('<input />').attr('type', 'radio').attr('name', 'vraag2').attr('checked', 'checked').val('NEE'))
							.append($('<span />').text('NEE, mijn reactie betreft alleen het perceel waar ik de pin heb geplaatst.'))
					))
					.append($('<li />').text('NB: als u wilt reageren op niet-aangrenzende percelen, kunt u meerdere reacties indienen.'))
				);
	var vraag2Uitleg = $('<div />').appendTo(fieldset).hide()
		.append($('<div />').append(
			$('<label />')
				.append($('<span />').text('Licht uw antwoord toe:'))
				.append($('<textarea />').attr('name', 'vraag2-uitleg'))
			));

	$(fieldset).find('input[name="vraag2"]').change(function()
	{
		if($(this).val() == 'JA') $(vraag2Uitleg).stop(true, true).slideDown('fast');
		else $(vraag2Uitleg).stop(true, true).slideUp('fast');
	})

	$('<input />').attr('type', 'submit').val('Voeg in!').appendTo(helpForm);

	$(helpForm).submit(function(e)
	{
		e.preventDefault();
		var reactie = '';
		if($(fieldset).find('input[type="radio"][name="vraag1"]:checked').val() == 'JA')
			reactie += "- De concept Vegetatielegger komt WEL overeen met de feitelijke situatie.\r\n";
		else
			reactie += "- De concept Vegetatielegger komt NIET overeen met de feitelijke situatie: \r\n" + $(fieldset).find('textarea[name="vraag1-uitleg"]').val();

		reactie += "\r\n\r\n";
		if($(fieldset).find('input[type="radio"][name="vraag2"]:checked').val() == 'JA')
			reactie += "- Deze reactie betreft OOK aangrenzende percelen: \r\n" + $(fieldset).find('textarea[name="vraag2-uitleg"]').val();
		else
			reactie += "- Deze reactie betreft ALLEEN het aangegeven perceel.";

		var origVal = $(form).find('textarea[name="reactie"]').val();
		$(form).find('textarea[name="reactie"]').val(reactie + (origVal.length == 1 ? "\r\n\r\n" + origVal : ''));
		closePopup();

	});

}