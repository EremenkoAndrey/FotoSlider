requirejs.config({
    baseUrl: "scripts/",

    paths: {
        'jquery': 'http://yastatic.net/jquery/2.1.4/jquery.min'
    },

    shim: {}

});
//require(['slider_autoscroll']);
require(['slider', 'slider_autoscroll', 'slider_tabcontrol'], function (Slider) {

    slidersCollection('.slider_js');

    function slidersCollection(className) {
        var sliders = $(className);

        for (var i = 0; i < sliders.length; i++) {
            sliders[i] = new Slider(sliders[i], {
                speed: parseInt($(sliders[i]).data('speed')),
                repeat: $(sliders[i]).data('repeat'),
                animation: $(sliders[i]).data('animation')
            });
            sliders[i].slider_autoscroll();
           // sliders[i].slider_tabcontrol();
        }
    }
});