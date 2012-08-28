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

}());