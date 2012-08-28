/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, indent:4, maxerr:50 */
/*global $:true, gapi:true */

(function () {
    "use strict";

    var base_url = $('head > base').prop('href') || '',
        overlays = {

            'antlers': {
                'url': base_url + 'images/overlays/antlers.png',
                'trackingFeature': gapi.hangout.av.effects.FaceTrackingFeature.NOSE_ROOT,
                'offset': {'x': 0, 'y': 0},
                'scale': 1,
                'rotation': 0,                
                'scaleWithFace': true,
                'rotateWithFace': true
            },
            'fox': {
                'url': base_url + 'images/overlays/fox.png',
                'trackingFeature': gapi.hangout.av.effects.FaceTrackingFeature.NOSE_ROOT,
                'offset': {'x': 0, 'y': 0},
                'scale': 1,
                'rotation': 0,                
                'scaleWithFace': true,
                'rotateWithFace': true
            },
            'moose': {
                'url': base_url + 'images/overlays/moose.png',
                'trackingFeature': gapi.hangout.av.effects.FaceTrackingFeature.NOSE_ROOT,
                'offset': {'x': 0, 'y': 0},
                'scale': 1,
                'rotation': 0,                
                'scaleWithFace': true,
                'rotateWithFace': true
            },
            'rabbit': {
                'url': base_url + 'images/overlays/rabbit.png',
                'trackingFeature': gapi.hangout.av.effects.FaceTrackingFeature.NOSE_ROOT,
                'offset': {'x': 0, 'y': 0},
                'scale': 1,
                'rotation': 0,                
                'scaleWithFace': true,
                'rotateWithFace': true
            }

        },
        internals = {},

        toggle_display = function (type) {

            // Validate existence of overlay type
            if (!(type in overlays)) { throw new Error('`' + type + '` is not a valid overlay type.'); }

            // If first call to toggle, assume the image has not been loaded
            if (!(type in internals)) {

                console.log("Will attempt creating image resources from: ", overlays[type].url);

                internals[type] = {
                    'resource': gapi.hangout.av.effects.createImageResource(overlays[type].url),
                    'overlay': null
                };

                internals[type].overlay = internals[type].resource.createFaceTrackingOverlay({
                    'scale': overlays[type].scale,
                    'rotation': overlays[type].rotation,
                    'offset': overlays[type].offset,
                    'scaleWithFace': overlays[type].scaleWithFace,
                    'rotateWithFace': overlays[type].rotateWithFace,
                    'trackingFeature': overlays[type].trackingFeature
                });
                internals[type].overlay.setVisible(true);

            } else {
                internals[type].overlay.setVisible(!internals[type].overlay.isVisible());
            }

        };

    console.log("Base URL: ", base_url);

    $('#overlays button').on('click', function () {
        console.log("Button clicked with type: ", this.id);
        toggle_display(this.id);
    });
    
    var selected = null,
        change_func,
        input_func;
    
    // POSITIONING CONTROLS
    change_func = function (ev) {
    
        var temp,
            overlay,
            form = $('#position');
    
        ev.preventDefault();
        if (this.checked) {
        
            if (this.value in internals) {
            
                selected = this.value;
            
                overlay = internals[this.value].overlay;
                
                temp = Math.round(overlay.getScale() * 100) / 100;
                form.find('[name="scale"]').val(temp);
                
                temp = Math.round(overlay.getRotation() * 180 / Math.PI);
                form.find('[name="rotation"]').val(temp);
                
                temp = Math.round(overlay.getOffset().x * 100) / 100;
                form.find('[name="offset_x"]').val(temp);
                
                temp = Math.round(overlay.getOffset().y * 100) / 100;
                form.find('[name="offset_y"]').val(temp);
                
                input_func();
            
            } else {
                alert('You need to initialise the overlay first.');
            }
        
        }
    
    };
    
    input_func = function () {
    
        var temp,
            form,
            overlay;
    
        if (selected) {
        
            form = $('#position');
            overlay = internals[selected].overlay;
            
            temp = Math.round(parseFloat(form.find('[name="scale"]').val()) * 100) / 100;
            form.find('output[for="scale"]').val(temp);
            overlay.setScale(temp);
            
            temp = parseInt(form.find('[name="rotation"]').val(), 10);
            form.find('output[for="rotation"]').val(temp);
            temp = temp * Math.PI / 180;
            overlay.setRotation(temp);
            
            temp = {
                'x': Math.round(parseFloat(form.find('[name="offset_x"]').val()) * 100) / 100,
                'y': Math.round(parseFloat(form.find('[name="offset_y"]').val()) * 100) / 100
            };
            form.find('output[for="offset_x"]').val(temp.x);
            form.find('output[for="offset_y"]').val(temp.y);
            overlay.setOffset(temp);
        
        }
    
    };
    
    $('#types input').on('change', change_func);
    $('#position').on('submit', function (ev) { ev.preventDefault(); }).on('input', input_func);

}());