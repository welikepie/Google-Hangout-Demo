/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, indent:4, maxerr:50 */
/*global $:true, gapi:true, THREE:true */

(function () {
    "use strict";
	var n = 6; //(n is points of data to smooth over)
	console.log(n);
    var participants = {
            'list': Object.extended(),
            'parent': $('section#participants ul'),
            'template': $('section#participants ul li.template')
                .remove().removeClass('template'),
            'update': null,
            'appUpdate': null
        },
        state = {
            'form': $('section#state #stateForm'),
            'fieldset': $('section#state #stateForm fieldset'),
            'template': $('section#state #stateForm fieldset div.template')
                .remove().removeClass('template'),
            'handling': {
                'add': null,
                'update': null,
                'submit': null
            },
            'last': Object.extended(),
            'messages': {
                'queue': [],
                'duration': 5000,
                'form': $('section#state #messageForm'),
                'display': null,
                'send': null
            }
        },
        facetrack = {
            'modal': $('section#facetrack .track_render'),
            'container': $('section#facetrack .track_render .canvas'),
            'renderer': {
                'size': [600, 338],
                'visible': false,
                'adjust': null
            },
            'measurements': {
                'table': $('section#facetrack .track_render .measurements'),
                'map': Object.extended(),
                'update': null
            },
            'data': {
                'last': null,
                'last_good': null
            },
            'overlays': Object.extended({
                'both_eyes': {
                    'url': 'https://raw.github.com/welikepie/Google-Hangout-Demo/master/images/glasses.png',
                    'scale': 0.55,
                    'rotation': 0,
                    'offset': {'x': 0, 'y': -0.075},
                    'scaleWithFace': true,
                    'rotateWithFace': true,
                    'trackingFeature': gapi.hangout.av.effects.FaceTrackingFeature.NOSE_ROOT,
                    'resource': null,
                    'tracker': null
                },
                'single_eye': {
                    'url': 'https://raw.github.com/welikepie/Google-Hangout-Demo/master/images/eyepatch.png',
                    'scale': 0.525,
                    'rotation': 0,
                    'offset': {'x': -0.25, 'y': -0.08},
                    'scaleWithFace': true,
                    'rotateWithFace': true,
                    'trackingFeature': gapi.hangout.av.effects.FaceTrackingFeature.RIGHT_EYE,
                    'resource': null,
                    'tracker': null
                },
                'toggle': null
            })
        },

        participant_init,
        state_init,
        facetrack_init,
        init;

    // PARTICIPANT HANDLING
    // -------------------------------------

    /**
     * This function handles the change in the number of participants,
     * is executed both at the page load and every time the onParticipantsChanged
     * event is triggered.
     * It takes the new list of participants and compares it to the list of participants
     * rendered client-side. Entries that only appear in the update are queued for addition,
     * entries that only appear in the client are queued for removal.
     */
    participants.update = function (updated) {

        var add_list,
            remove_list;

        try {

            // Ensures the work both with manual input and with event
            if (typeof updated.participants !== 'undefined') {
                updated = updated.participants;
            }

            (function () {

                var new_entries = updated.map('id').subtract(participants.list.keys()),
                    old_entries = participants.list.keys().subtract(updated.map('id'));

                // Add list is the array of Participant objects from Google Hangout API.
                // Remove list is the array of participant IDs, by which the page elements are stored.
                add_list = updated.filter(function (x) { return new_entries.some(x.id); });
                remove_list = old_entries;

            }());

            // Remove any lingering old entries first
            remove_list.each(function (key) {
                $(participants.list[key]).remove();
                delete participants.list[key];
            });

            // Add new entries
            add_list.each(function (x) {

                var el = participants.template.clone();

                if (!x.hasAppEnabled) { el.addClass('disabled'); }

                el.find('.name').html(x.person.displayName);
                el.find('img').attr('alt', x.person.displayName);

                if (x.person.image && x.person.image.url) {
                    el.find('img').attr('src', x.person.image.url + '?sz=60');
                }

                if (x.hasMicrophone) { el.find('.capabilities').append('<span>Microphone<span>'); }
                if (x.hasCamera) { el.find('.capabilities').append(' <span>Camera</span>'); }

                if (x.person.url) { el.find('.link').html('<a href="' + x.person.url + '">Profile</a>'); }

                // Ensure to add the element to the page, but also keep reference along with participant ID.
                participants.parent.append(el);
                participants.list[x.id] = el.get(0);

            });

        } catch (e) {

            console.log("Error encountered in `participants.update`:");
            if (e.stack) { console.error(e.stack); } else { console.log(e); }
            console.log("");

        }

    };

    /**
     * This function handles changes is participants' app status, marking
     * the participants accordingly.
     */
    participants.appUpdate = function (updated) {

        try {

            if (typeof updated.enabledParticipants !== 'undefined') {
                updated = updated.enabledParticipants;
            }

            var update_list = Object.extended();
            updated.each(function (x) { update_list[x.id] = x; });

            participants.list.each(function (key, val) {

                var temp, el = $(val);

                if (!update_list.has(key)) {
                    el.addClass('disabled');
                } else {

                    if (update_list[key].hasAppEnabled) {
                        el.removeClass('disabled');
                    } else {
                        el.addClass('disabled');
                    }

                    temp = el.find('.capabilities').empty();
                    if (update_list[key].hasMicrophone) { temp.append('<span>Microphone<span>'); }
                    if (update_list[key].hasCamera) { temp.append(' <span>Camera</span>'); }

                }

            });

        } catch (e) {

            console.log("Error encountered in `participants.appUpdate`:");
            if (e.stack) { console.error(e.stack); } else { console.log(e); }
            console.log("");

        }

    };

    participant_init = function () {

        try {

            gapi.hangout.onParticipantsChanged.add(participants.update);
            gapi.hangout.onEnabledParticipantsChanged.add(participants.appUpdate);
            console.log('Manual first-time update.');
            participants.update(gapi.hangout.getParticipants());

        } catch (e) {

            console.log("Error encountered in `participant_init`:");
            if (e.stack) { console.error(e.stack); } else { console.log(e); }
            console.log("");

        }

    };

    // SHARED STATE HANDLING
    // ------------------------------

    state.handling.add = function (key, val) {

        var el;

        try {

            el = state.template.clone();

            // Fill in the values if provided
            if (typeof key === 'string') {
                el.find('.key')
                    .val(key)
                    .attr('readonly', 'readonly');
            }
            if (typeof val === 'string') {
                el.find('.value')
                    .val(val)
                    .attr('readonly', 'readonly');
            }

            // Add event handling on input fields to
            // make the borders disappear when finished editing
            el.find('input')
                .on('click focus', function () {
                    this.readOnly = false;
                })
                .on('change blur', function () {
                    this.readOnly = true;
                });

            // Add event handling on the button to remove entry
            el.find('button').on('click', function () {
                $(this.parentNode).remove();
            });

            state.fieldset.append(el);

        } catch (e) {

            console.log("Error encountered in `state.handling.add`:");
            if (e.stack) { console.error(e.stack); } else { console.log(e); }
            console.log("");

        }

    };

    state.handling.update = function (new_state) {

        try {

            if (typeof new_state.state !== 'undefined') {
                new_state = new_state.state;
            }

            // Update last encountered state
            state.last = Object.extended(new_state);

            // Empty fieldset and add all the entries from last state
            state.fieldset.empty();
            state.last.each(state.handling.add);

        } catch (e) {

            console.log("Error encountered in `state.handling.update`:");
            if (e.stack) { console.error(e.stack); } else { console.log(e); }
            console.log("");

        }

    };

    state.handling.submit = function (ev) {

        var added, removed;

        ev.preventDefault();

        try {

            // Generate set of added and modified pairs
            added = Object.extended();
            state.fieldset.children().each(function () {

                var key = $(this).find('.key').val(),
                    val = $(this).find('.value').val();
                added[key] = val;

            });

            // Generate list of deleted properties
            removed = state.last.keys().subtract(added.keys());

            // Submit state delta
            gapi.hangout.data.submitDelta(added, removed);

        } catch (e) {

            console.log("Error encountered in `state.handling.submit`:");
            if (e.stack) { console.error(e.stack); } else { console.log(e); }
            console.log("");

        }

    };

    state.messages.display = function (message) {

        var in_display = false,
            display_func;

        try {

            /* This anonymous display function lowers the message bar while filling it
             * with first message in the message queue, then after a specified delay,
             * raises it out of sight again. If there are more messages waiting in the
             * queue, the message bit will lower with new message once again, calling
             * itself recursively until the queue has been emptied.
             */
            display_func = function () {

                var text = state.message.queue.pop();

                // Mark message as visible (so that more incoming messages
                // will end up on queue, not trigger display) and fill the element.
                in_display = true;
                $('#message')
                    .addClass('open')
                    .find('p').text(text);

                // Set the timeout to hide the message bar again
                window.setTimeout(function () {

                    // This bit here will make the message bar
                    // appear again if there are more messages
                    // in the queue
                    var end_func = function () {

                        $('#message').off([
                            'transitionend',
                            'oTransitionEnd',
                            'webkitTransitionEnd'
                        ].join(' '));

                        if (state.messages.queue.length) {
                            display_func();
                        } else {
                            in_display = false;
                        }

                    };

                    // Start hiding the message and ensure
                    // end_func to run once it's hidden
                    $('#message')
                        .on([
                            'transitionend',
                            'oTransitionEnd',
                            'webkitTransitionEnd'
                        ].join(' '), end_func)
                        .removeClass('open');

                }, state.messages.duration);

            };

            // Ensure it works with manual input AND events
            if (typeof message.message === 'string') {
                message = message.message;
            }

            // Add message to the queues
            state.messages.queue.add(message, 0);

            // Start displaying the message if message bar is not visible
            if (!in_display) {
                display_func();
            }

        } catch (e) {

            console.log("Error encountered in ` state.messages.display`:");
            if (e.stack) { console.error(e.stack); } else { console.log(e); }
            console.log("");

        }

    };

    state_init = function () {

        try {

            // Shared state handling
            state.form.on('submit', state.handling.submit);
            state.form.find('.add').on('click', state.handling.add);
            gapi.hangout.data.onStateChanged.add(state.handling.update);
            console.log("First-time shared state handling.");
            state.handling.update(gapi.hangout.data.getState());

            // Message handling (not available in the API for some reason)
            gapi.hangout.data.onMessageReceived.add(state.messages.display);
            $('#messageForm').on('submit', function (ev) {
                ev.preventDefault();
                gapi.hangout.data.sendMessage($('[type="text"]', this).val());
            });

        } catch (e) {

            console.log("Error encountered in `state_init`:");
            if (e.stack) { console.error(e.stack); } else { console.log(e); }
            console.log("");

        }

    };

    // FACE TRACKING HANDLING
    // ----------------------
var lastInformation = new Array();
var panAverage, rollAverage, tiltAverage, xAverage, yAverage;


    facetrack.renderer.adjust = function (obj) {

        var scales = {
            'vertical': 200,
            'horizontal': 400
        };

        if (facetrack.data.last_good) {

            // Perform rotations on the ball
            obj.rotation.y = facetrack.data.last_good.pan;
            obj.rotation.x = - facetrack.data.last_good.roll;
            obj.rotation.z = facetrack.data.last_good.tilt;

            // Perform positioning on the ball
            obj.position.y = facetrack.data.last_good.noseRoot.y * scales.vertical * (-1);
            obj.position.z = facetrack.data.last_good.noseRoot.x * scales.horizontal * (-1);

        }
    };

    facetrack.measurements.update = function (track_data) {
        try {

            //Update track data
            facetrack.data.last = Object.extended(track_data);
            if (track_data.hasFace) { facetrack.data.last_good = facetrack.data.last; }

            //Update measurements table if visible
            if (facetrack.renderer.visible) {

                if (track_data.hasFace) {
                	
  
                	lastInformation.push(facetrack.data.last_good);
                	if(lastInformation.length==n+1){
                		lastInformation[n+1]==null;
            			//var panAverage, rollAverage, tiltaverage, xaverage, yaverage;
    					lastInformation.each( function(key,val){
    										
    						console.log(key+","+val);
    						
    					
    						
    						
    					});
			  		panAverage = panAverage/n;
			  		rollAverage = rollAverage/n;
			  		tiltAverage = tiltAverage/n;
			  		xAverage = xAverage/n;
			  		yAverage = yAverage/n;
                	}              	
                	
                    facetrack.data.last_good.each(function (key, val) {
							
                        // Boolean values
                        if (key === 'hasFace') {
                            facetrack.measurements.map.hasFace.text('TRUE');
                        // Single number values
                        } else if (['pan', 'roll', 'tilt'].some(key)) {
                            facetrack.measurements.map[key].text((val / Math.PI * 180).round(2) + ' degrees');
                        // Double number values
                        } else {
                            facetrack.measurements.map[key][0].text(val.x.round(4));
                            facetrack.measurements.map[key][1].text(val.y.round(4));
                        }

                    });
                } else {
                    facetrack.measurements.map.hasFace.text('FALSE');
                }

            }

        } catch (e) {

            console.log("Error encountered in `facetrack.measurements.update`:");
            if (e.stack) { console.error(e.stack); } else { console.log(e); }

        }

    };

    facetrack.overlays.toggle = function (type) {

        var overlay,
            event_func;

        try {

            if (facetrack.overlays.has(type) && (typeof facetrack.overlays[type].url === 'string')) {

                overlay = facetrack.overlays[type];

                // Create image resource and generate a function to toggle the overlay
                overlay.resource = gapi.hangout.av.effects.createImageResource(overlay.url);
                event_func = function (ev) {

                    ev.preventDefault();

                    // If the overlay does not exist yet, create it...
                    if (!overlay.tracker) {
                        overlay.tracker = overlay.resource.createFaceTrackingOverlay({
                            'scale': overlay.scale,
                            'rotation': overlay.rotation,
                            'offset': overlay.offset,
                            'scaleWithFace': overlay.scaleWithFace,
                            'rotateWithFace': overlay.rotateWithFace,
                            'trackingFeature': overlay.trackingFeature,
                        });
                        overlay.tracker.setVisible(true);
                    } else {
                        overlay.tracker.setVisible(!overlay.tracker.isVisible());
                    }

                };

            } else {
                event_func = function () {};
            }

            return event_func;

        } catch (e) {

            console.log("Error encountered in `facetrack.overlays.toggle`:");
            if (e.stack) { console.error(e.stack); } else { console.log(e); }

        }

    };

    facetrack_init = function () {

        var render_func,
            measurement_rows;

        try {

            // Face tracking renderer initialisation
            (function () {

                var renderer,
                    use_webgl,
                    scene,
                    camera,
                    globe,
                    texture;

                // Determine whether to use WebGL or Canvas renderer
                (function () {
                    var element = document.createElement('canvas');
                    try { use_webgl = !!element.getContext('webgl') || !!element.getContext('experimental-webgl'); }
                    catch (e) {  use_webgl = false; }
                }());

                // Initialise the appropriate renderer
                renderer = (use_webgl ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer());
                renderer.setSize(facetrack.renderer.size[0], facetrack.renderer.size[1]);
                facetrack.container.append(renderer.domElement);
                scene = new THREE.Scene();

                // Initialise the camera
                camera = new THREE.PerspectiveCamera(
                    75,
                    facetrack.renderer.size[0] / facetrack.renderer.size[1],
                    1,
                    10000
                );
                camera.position.x = 300;
                camera.rotation.y = Math.PI / 2;
                scene.add(camera);

                // Generate the texture for the face-tracking sphere
                (function () {

                    var source,
                        context,
                        img;

                    source = $(document.createElement('canvas'))
                        .width(300)
                        .height(150)
                        .get(0);

                    context = source.getContext('2d');
                    context.fillStyle = 'gray';
                    context.fillRect(0, 0, 300, 150);

                    context.strokeStyle = 'black';
                    context.lineWidth = 2;

                    context.beginPath();
                    context.arc(150, 75, 50, 0, Math.PI * 2, true); // Outer circle
                    context.moveTo(185, 75);
                    context.arc(150, 75, 35, 0, Math.PI, false);   // Mouth
                    context.moveTo(140, 65);
                    context.arc(135, 65, 5, 0, Math.PI * 2, true);  // Left eye
                    context.moveTo(170, 65);
                    context.arc(165, 65, 5, 0, Math.PI * 2, true);  // Right eye
                    context.stroke();

                    img = document.createElement('img');
                    img.src = source.toDataURL();

                    texture = new THREE.Texture(img);
                    texture.needsUpdate = true;

                }());

                globe = new THREE.Mesh(
                    new THREE.SphereGeometry(100, (use_webgl ? 40 : 24), (use_webgl ? 40 : 24)),
                    new THREE.MeshBasicMaterial({ "map": texture })
                );
                scene.add(globe);

                render_func = function () {

                    //console.log('Rendering!');

                    // Perform adjustments to the globe first
                    facetrack.renderer.adjust(globe);
                    renderer.render(scene, camera);

                    if (facetrack.renderer.visible) {
                        window.requestAnimationFrame(render_func);
                    }

                };

            }());

            // Measurement table initialisation
            measurement_rows = facetrack.measurements.table.find('tr');
            facetrack.measurements.map = {
                'hasFace': measurement_rows.eq(0).find('td'),
                'pan': measurement_rows.eq(1).find('td'),
                'roll': measurement_rows.eq(2).find('td'),
                'tilt': measurement_rows.eq(3).find('td'),

                'leftEye': measurement_rows.eq(4).find('td').selector.map($),
                'leftEyebrowLeft': measurement_rows.eq(5).find('td').selector.map($),
                'leftEyebrowRight': measurement_rows.eq(6).find('td').selector.map($),
                'rightEye': measurement_rows.eq(7).find('td').selector.map($),
                'rightEyebrowLeft': measurement_rows.eq(8).find('td').selector.map($),
                'rightEyebrowRight': measurement_rows.eq(9).find('td').selector.map($),

                'noseRoot': measurement_rows.eq(10).find('td').selector.map($),
                'noseTip': measurement_rows.eq(11).find('td').selector.map($),
                'upperLip': measurement_rows.eq(12).find('td').selector.map($),
                'lowerLip': measurement_rows.eq(13).find('td').selector.map($),
                'mouthLeft': measurement_rows.eq(14).find('td').selector.map($),
                'mouthCenter': measurement_rows.eq(15).find('td').selector.map($),
                'mouthRight': measurement_rows.eq(16).find('td').selector.map($)
            };
            gapi.hangout.av.effects.onFaceTrackingDataChanged.add(facetrack.measurements.update);
            //console.log("Measurements map: ", facetrack.measurements.map);

            // Interface initialisation
            facetrack.modal.find('.close').on('click', function () {
                facetrack.renderer.visible = false;
                facetrack.modal.removeClass('open');
            });
            $(facetrack.modal.get(0).parentNode).find('.open_render').on('click', function () {
                facetrack.renderer.visible = true;
                facetrack.modal.addClass('open');
                window.requestAnimationFrame(render_func);
            });

            $(facetrack.modal.get(0).parentNode).find('.single_eye').on('click', facetrack.overlays.toggle('single_eye'));
            $(facetrack.modal.get(0).parentNode).find('.both_eyes').on('click', facetrack.overlays.toggle('both_eyes'));

        } catch (e) {

            console.log("Error encountered in `facetrack_init`:");
            if (e.stack) { console.error(e.stack); } else { console.log(e); }

        }

    };

    init = function () {

        participant_init();
        state_init();
        facetrack_init();

    };

    window.init = init;

}());