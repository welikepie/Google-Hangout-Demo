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
            'fieldset': $('section#state fieldset'),
            'template': $('section#state fieldset div.template')
                .remove().removeClass('template'),
            'update': null
        },
        
        participant_init,
        state_init,
        init;
    
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
    
    init = function () {
        
        participant_init();
        
    };
    
    window.init = init;

}());