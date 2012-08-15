/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, indent:4, maxerr:50 */
/*global $:true, gapi:true */

(function () {
    "use strict";
    
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
        
        participant_init,
        state_init,
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
    
    init = function () {
        
        participant_init();
        state_init();
        
    };
    
    window.init = init;

}());