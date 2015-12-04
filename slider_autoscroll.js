"use strict";

/*****EXTENDS****/

$(document).on('sliderReady', function () {

    var Slider = {};
    Slider.prototype = Window.RTSlider;

        /**
         * Управляет режимом автоматической прокрутки
         */
   Slider.prototype.slider_autoscroll = function() {

            var settingsSpeed =  $(this.box).data('auto') || false;

            var self = this,
                    time,
                    speed = setAutoSlideSpeed(settingsSpeed),
                    autoScrollFlag = true;  //Флаг автоскролла
            
            // Если слайдер не зациклен или управляется с тач-устройства - 
            // выход из ф-ции
            if (this.repeat === 'norepeat' || this.touch) return false;

            $(this.box).hover(
                    function() {
                        autoScrollFlag = false;
                    },
                    function() {
                        autoScrollFlag = true;
                        timer();
                    }
            );

            timer();
       
            function timer() {
                time = setTimeout(function () {
                    if (autoScrollFlag) {
                        self.slide('next');
                        clearTimeout(time);
                        timer();
                    }
                }, speed);
            }

            /**
             * Валидация передаваемой в настройках скорости автопрокрутки
             * @returns {number} // скорость автопрокрутки
             */
            function setAutoSlideSpeed(settingsSpeed) {
                var speed = parseInt(settingsSpeed),
                    defaultSpeed = self.speed * 2;

                if (isNaN(speed) || speed < self.speed) {
                    return defaultSpeed;
                }
                return speed;
            }
        };

});
