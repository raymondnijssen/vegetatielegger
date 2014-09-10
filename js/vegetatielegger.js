$(function() {
    $('div#right').find('a.closeButton').add('div#right h3 a').click(function(e) {
        e.preventDefault();
        var block = $(this).closest('div');
        var div = $(block).find('>div');
        var closeButton = $(block).find('a.closeButton');

        if ($(div).is(':visible')) {
            $(div).hide();
            //$(div).slideUp();
            $(closeButton).fadeOut('fast', function() {
                $(block).addClass('closed');
                $(closeButton).fadeIn('fast');
            });
        } else {
            $(div).show();
            //$(div).slideDown();
            $(closeButton).fadeOut('fast', function() {
                $(block).removeClass('closed');
                $(closeButton).fadeIn('fast');
            });
        }
    });

    // var vars = {
    //     controls: mapControls
    // };
    //$('div#right').find('a#add_reaction_marker').click(activateDrawControl).enableDrag(vars, {l: 10, r: 32 + 10});
    $('div#right').find('input:checkbox[name="layers"]').change(function(e) {
        for (var a = 0; a < api.map.layers.length; a++) { 
            if(api.map.layers[a].name === $(this).val()){
                api.map.layers[a].setVisibility($(this).is(':checked'));
            }
        }
        /*
        if (layer === 'reacties') {
            alleReactiesLayer.setVisibility(toggle);
            if (state === 'viewing') {
                //mapControls.select.unselectAll();
            }
            var legendaTable = $('div#right').find('div#legenda').find('table');
            var tr = $(legendaTable).find('tr.reactions');
            if (toggle) {
                if (tr.length === 0) {
                    tr = $('<tr />').addClass('reactions');
                    $(legendaTable).append(tr);
                }

                $(tr).find('td.eigen-reacties').removeAttr('colspan');
                var td = $('<td />').attr('headers', 'legenda_algemeen').addClass('alle-reacties');
                $('<div />').addClass('legenda_image').append($('<img />').attr('src', '/images/legenda/rhs-green-marker.png').attr('alt', 'Correctie')).appendTo(td);
                $('<div />').addClass('legenda_text').text('Correctie').appendTo(td);
                if ($(tr).find('td.eigen-reacties').length === 0) {
                    $(td).attr('colspan', '2');
                }
                $(td).prependTo(tr);
            } else if (tr.length !== 0) {
                $(tr).find('td.alle-reacties').remove();
                if ($(tr).find('td').length !== 0) {
                    $(tr).find('td.eigen-reacties').attr('colspan', '2');
                } else {
                    $(tr).remove();
                }
            }
            return;
        }*/
    });
});

function activateDrawControl(e) {
    e.preventDefault();
    if ($(this).hasClass('disabled')) {
        return;
    }
    $(this).addClass('active');
    mapControls.select.unselectAll();
    mapControls.select.deactivate();
    mapControls.draw.eigen.activate();
}

var normalizeEvent = function(event) {
    if (!event.offsetX) {
        event.offsetX = (event.pageX - $(event.target).offset().left);
        event.offsetY = (event.pageY - $(event.target).offset().top);
    }
    return event;
};

$.fn.enableDrag = function(vars, offset) {
    var elements = $(this).find('*');
    elements.push($(this)[0]);
    for (var i = 0; i < elements.length; i++) {
        if (typeof elements[i] !== 'undefined') {
            elements[i].ondragstart = function(e) {
                if (typeof e === 'object' && typeof e.preventDefault === 'function') {
                    e.preventDefault();
                }
                return false;
            };
            elements[i].ondrag = function(e) {
                if (typeof e === 'object' && typeof e.preventDefault === 'function') {
                    e.preventDefault();
                }
                return false;
            };
            elements[i].ondragend = function(e) {
                if (typeof e === 'object' && typeof e.preventDefault === 'function') {
                    e.preventDefault();
                }
                return false;
            };
        }
    }

    $(this).mousedown(function(e) {
        if ($(this).hasClass('disabled')) {
            return;
        }
        e = normalizeEvent(e);
        var _this = this;
        var startX = e.pageX;
        var startY = e.pageY;

        $(this).bind('mousemove', function(ev) {
            ev = normalizeEvent(ev);
            mapControls.select.unselectAll();
            $(this).unbind('mousemove');
            var mask = $('<div />').addClass('eventMask').appendTo('body').css(
                {
                    'position': 'absolute',
                    'width': $('div#map').width(),
                    'height': $('div#map').height(),
                    'top': $('div#map').offset().top + 'px',
                    'left': $('div#map').offset().left + 'px',
                    'background': 'url(/images/transparent.png) repeat',
                    'z-index': '2147483646'
                });
            var draggingNew = $('<div />').css(
                {
                    'position': 'absolute',
                    'width': '32px',
                    'height': '32px',
                    'background': 'url(/images/markers/rhs-blue.png) no-repeat',
                    'top': $(this).offset().top + 2 + 'px',
                    'left': $(this).offset().left + 10 + 'px',
                    'z-index': '2147483647'
                })
                    .appendTo('body')
                    .mouseup(function(ev) {
                        ev = normalizeEvent(ev);

                        // Get feature location
                        var l = $(this).offset().left,
                                r = l + $(this).width(),
                                t = $(this).offset().top,
                                b = t + $(this).height();

                        $(this).remove();
                        $(mask).remove();
                        $('body').unbind('mousemove');

                        if (ev.pageX === startX && ev.pageY === startY) {
                            $(_this).click();
                            return;
                        }

                        // Get map offsets
                        var ml = $('div#map').offset().left,
                                mr = ml + $('div#map').width();
                        mt = $('div#map').offset().top;
                        mb = mt + $('div#map').height();

                        var rl = $('div#right').offset().left,
                                rr = rl + $('div#right').width();
                        rt = $('div#right').offset().top;
                        rb = rt + $('div#right').height();

                        // Check if feature inside map
                        if (!(l > ml && r < mr && t > mt && b < mb)) {
                            return;
                        }

                        // Check if feature is not on top of the right boxes
                        if (l > rl && r < rr && t > rt && b < rb) {
                            return;
                        }
                        var latlon = map.getLonLatFromViewPortPx(new OpenLayers.Pixel(l - ml + 16, t - mt + 32));
                        mapControls.draw.eigen.drawFeature(new OpenLayers.Geometry.Point(latlon.lon, latlon.lat));
                    });
            $('body').bind('mousemove', function(ev) {
                ev = normalizeEvent(ev);
                $(draggingNew).offset({top: ev.pageY - 30, left: ev.pageX - 16});
            });
        }).bind('mouseup', function(ev) {
            $(this).unbind('mousemove').unbind('mouseup');
        });
    });
};
$(function() {
    $('input.autovalue').each(function(i, element) {
        if ($.trim($(element).val()) !== '')
            return;
        $(element).val($(element).attr('title')).addClass('default');
    });
    $(document).on('focus', 'input.autovalue', function(e) {
        if ($(this).hasClass('default')) {
            $(this).removeClass('default').val('');
        }
    }).on('blur', 'input.autovalue', function(e) {
        if ($.trim($(this).val()) === '' || $.trim($(this).val()) === $(this).attr('title')) {
            $(this).addClass('default').val($(this).attr('title'));
        }
    }).on('click', 'a.external', function(e) {
        window.open($(this).attr('href'));
        e.preventDefault();
        return false;
    });
});