(function () {
    "use strict";

    var /*use_webgl,
        renderer,*/
        measurements,
        
        last_event,
        last_good_event,
        
        update,
        init;
    
    update = function (track_data) {
    
        try {
    
            last_event = track_data;
            if (track_data.hasFace) {
            
                last_good_event = last_event;
                
                // Update measurements table
                Object.extended(track_data).each(function (key, val) {
                
                    // Boolean values
                    if (key === 'hasFace') {
                    
                        measurements[key].text(val ? 'TRUE' : 'FALSE');
                        
                    // Single values
                    } else if (['pan', 'roll', 'tilt'].some(key)) {
                    
                        measurements[key].text((val / Math.PI * 180).round(2) + ' degrees');
                    
                    // Double values
                    } else {
                    
                        measurements[key][0].text(val.x.round(4));
                        measurements[key][1].text(val.y.round(4));
                    
                    }
                
                });
                
            } else {
                measurements.hasFace.text('FALSE');
            }
        
        } catch (e) {
        
            console.log("");
            console.log("Error encountered in `update`:");
            if (e.stack) { console.error(e.stack); } else { console.log(e); }
        
        }
    
    };
    
    init = function () {
    
        var /*container,*/
            measurement_map/*(,
            collection = $.bind(window, 0)*/;
        
        /*(function () {
            var element = document.createElement('canvas');
            try { use_webgl = !!element.getContext("webgl") || !!element.getContext("experimental-webgl"); }
            catch (e) {  use_webgl = false; }
        }());
        
        container = $('section#facetrack .track_render .canvas');
        renderer = (use_webgl ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer());
		renderer.setSize(element.width(), element.height());
        container.prepend(renderer.domElement);*/
        
        measurement_map = $('section#facetrack .track_render .measurements tr');
        measurement_map = {
            'hasFace': measurement_map.eq(0).find('td'),
            'pan': measurement_map.eq(1).find('td'),
            'roll': measurement_map.eq(2).find('td'),
            'tilt': measurement_map.eq(3).find('td'),
            
            'leftEye': measurement_map.eq(4).find('td').selector.map($),
            'leftEyebrowLeft': measurement_map.eq(5).find('td').selector.map($),
            'leftEyebrowRight': measurement_map.eq(6).find('td').selector.map($),
            'rightEye': measurement_map.eq(7).find('td').selector.map($),
            'rightEyebrowLeft': measurement_map.eq(8).find('td').selector.map($),
            'rightEyebrowRight': measurement_map.eq(9).find('td').selector.map($),
            
            'noseRoot': measurement_map.eq(10).find('td').selector.map($),
            'noseTip': measurement_map.eq(11).find('td').selector.map($),
            'upperLip': measurement_map.eq(12).find('td').selector.map($),
            'lowerLip': measurement_map.eq(13).find('td').selector.map($),
            'mouthLeft': measurement_map.eq(14).find('td').selector.map($),
            'mouthCenter': measurement_map.eq(15).find('td').selector.map($),
            'mouthRight': measurement_map.eq(16).find('td').selector.map($)
        };
        
        measurements = measurement_map;
        gapi.hangout.av.effects.onFaceTrackingDataChanged.add(update);
        
        // Interface
        $('section#facetrack .track_render .close').on('click', function (ev) {
        
            ev.preventDefault();
            $('section#facetrack .track_render').removeClass('open');
        
        });
        
        $('section#facetrack .open_render').on('click', function (ev) {
            ev.preventDefault();
            $('section#facetrack .track_render').addClass('open');
        });
        
        console.log("Measurement map: ", measurements);
    
    };
    
    window.track_init = init;

}());