/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, indent:4, maxerr:50 */
/*global x$:true, gapi:true */

(function () {
    "use strict";

    Array.toArray = function (iterable) {
        return Array.prototype.slice.apply(iterable);
    };
    
    var participants = {
            'list': x$('section#participants ul'),
            'template': x$('section#participants ul li.template')
                .remove().removeClass('template'),
            'update': null,
            'appUpdate': null
        },
        state = {
            'fieldset': x$('section#state fieldset'),
            'template': x$('section#state fieldset div.template')
                .remove().removeClass('template'),
            'update': null
        },
        
        participant_init,
        state_init,
        init;
    
    participants.update = function (participants) {
    
        var current_list,
            add_list,
            remove_list;
        
        try {
    
            // Determine the status of users
            current_list = Array.toArray(x$('section#participants ul li'));
            add_list = participants.map('id').subtract(current_list.map('id'));
            remove_list = current_list.map('id').subtract(participants.map('id'));
            
            // Remove all old participants
            current_list
                .map(function (x) { return remove_list.some(x.id); })
                .each(function (x) { x$(x).remove(); });
            
            // Add all new participants
            participants
                .map(function (x) { return add_list.some(x.id); })
                .each(function (x) {
                
                    var el = participants.template.clone();
                    
                    el.attr('id', x.id);
                    if (!x.hasAppEnabled) { el.addClass('disabled'); }
                    
                    el.find('.name').html('inner', x.person.displayName);
                    el.find('img').attr('alt', x.person.displayName);
                    
                    if (x.person.image && x.person.image.url) {
                        el.find('img').attr('src', x.person.image.url + '?sz=60');
                    }
                    
                    if (x.hasMicrophone) { el.find('.capabilities').html('bottom', '<span>Microphone<span> '); }
                    if (x.hasCamera) { el.find('.capabilities').html('bottom', '<span>Camera</span> '); }
                    
                    el.find('.link').html('inner', '<a href="' + x.person.url + '">Profile</a>');
                    
                    participants.list.html('bottom', el);
                
                });
    
        } catch (e) {
        
            console.error('Unexcepted exception has just happened in `participants.update`.');
            console.exception(e);
        
        }
    
    };
    
    participants.appUpdate = function (participants) {
    
        try {
    
        var current_ids = Array.toArray(x$('section#participants ul li')).map('id');
        participants
            .map(function (x) { current_ids.some(x.id); })
            .each(function (x) {
            
                var el = x$('#' + x.id);
                if (x.hasAppEnabled) {
                    el.removeClass('disabled');
                } else {
                    el.addClass('disabled');
                }
            
            });
        
        } catch (e) {
        
            console.error('Unexcepted exception has just happened in `participants.appUpdate`.');
            console.exception(e);
        
        }
    
    };
    
    participant_init = function () {
    
        try {
    
        gapi.hangout.onParticipantsChanged.add(participants.update);
        gapi.hangout.onEnabledParticipantsChanged.add(participants.appUpdate);
        participants.update(gapi.hangout.getParticipants());
        
        } catch (e) {
        
            console.error('Unexcepted exception has just happened in `participant_init`.');
            console.exception(e);
        
        }
    
    };
    
    init = function () {
        
        participant_init();
        
    };
    
    window.init = init;

}());