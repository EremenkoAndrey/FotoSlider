$(function () {

    "use strict";
    
    var Slider = function (element, settings, ext) {
        this.extends = ext || false,
        /*Настройки общие. Задаются в data-атрибутах*/
        this.repeat = settings.repeat || true, 
                this.speed = settings.speed || 1000,
                this.auto = settings.auto || false,
        /*Touch*/
                // Минимальный сдвиг элемента для перелистывания (в  процентах)
                this.percentReturn = 15, 
        /*Служебные переменные*/
                this.counter = 0, // Счетчик
                this.animate = false, // Флаг анимации
                
        /* Ссылки на HTML элементы */
                this.box = element,
                this.list = $(element).find('.slider__list').get(0),
                this.items = $(element).find('.slider__item'),
                this.prev = $(element).find('.slider__control_prev').get(0), //Ссылка на кнопку >
                this.next = $(element).find('.slider__control_next').get(0), //Ссылка на кнопку <
                this.boxWidth = $(element).width();
                
                Window.RTSlider = this; // Экспорт в глобальное пр-во имен
                $.event.trigger('sliderReady'); // Извещаем подписчиков по готовности модуля
    };

    // Методы, необходимые для работы слайдера
    Slider.prototype = {
        /**
         * Инициализация слайдера
         */
        init: function () {
            var self = this,
                    countItems = this.items.length;
            // если картинок меньше 2 слайдер не работает
            if (countItems < 2) return false;
            if (countItems === 2) {
                this.repeat === 'norepeat';
            }
            
            if (this.extends) {
                for (var i = 0, max = this.extends.length; i < max; i++) {
                    this[this.extends[i]]();
                }
            }
            
            // Проверяем и включаем настройки
            
            /**
             * Проверка поддержки тач-событий. Использован метод Modernizr
             * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touchevents.js
             * Может не работать в FF при ручном изменении параметра
             * dom.w3c_touch_events.enabled = 1 в настройках about:config
             */
            if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
                this.swipe();
            }
            if (this.auto && this.repeat !== 'norepeat') {
                this.autoScroll();
            }
            if (this.repeat === 'norepeat') {
                this.repeat = false;
                this.norepeat();
            }

            this.updateElementsClasses().setNew();

            // Устанавливаем обработчики
            $(this.next).on('click', function (e) {
                e.preventDefault();
                if (self.animate)
                    return false;
                self.slide('next', self.counter);
            });
            $(this.prev).on('click', function (e) {
                e.preventDefault();
                if (self.animate)
                    return false;
                self.slide('prev', self.counter);
            });

        },
        /**
         * Получение массива из трех элементов: левого, правого и центрального
         * @param {number} counter // по номеру центрального элемента
         * @returns {array} массив активных элементов, в зависимости от
         * режима можно получать:
         * repeat // всегда полный набор элементов (для "бесконечного" режима) 
         * norepeat// полный набор только если имеются все соседние элементы 
         */
        getElementsSet: function (counter) {
            var arrElements = {
                repeat: {},
                norepeat: {}
            };

            if (counter < (this.items.length - 1)) {
                arrElements.repeat.rightSibling = this.items[counter + 1], 
                        arrElements.norepeat.rightSibling = this.items[counter + 1];
            }
            else {
                arrElements.repeat.rightSibling = this.items[0];
                arrElements.norepeat.rightSibling = null;
            }

            if (counter === 0) {
                arrElements.repeat.leftSibling = this.items[this.items.length - 1];
                arrElements.norepeat.leftSibling = null;
            }
            else {
                arrElements.repeat.leftSibling = this.items[counter - 1], 
                        arrElements.norepeat.leftSibling = this.items[counter - 1];
            }

            arrElements.repeat.mainElement = this.items[counter],
                        arrElements.norepeat.mainElement = this.items[counter];

            if (this.repeat) {
                return arrElements.repeat;
            }
            return arrElements.norepeat;
        },
        /**
         * Возвращает объект с двумя методами: 
         * setNew: @param {array} // устанавливает элементам новые классы
         * принимает необязательный параметр - массив элементов
         * removeOld: @param {array} // удаляет классы у элементов 
         * принимает один обязательный параметр - массив элементов
         */
        updateElementsClasses: function () {
          var self = this;
            return {
                setNew: function (arrElements) {
                    var newElements = arrElements || self.getElementsSet(self.counter);
                    $(newElements.mainElement).addClass('slider__item_active');
                    $(newElements.rightSibling).addClass('slider__item_right');
                    $(newElements.leftSibling).addClass('slider__item_left');
                },
                removeOld: function (arrElements) {
                    var oldElements = arrElements || false;
                    if (!oldElements) {
                        throw new Error("Необходимо передать аргумент с массивом элементов");
                    }
                    $(oldElements.mainElement).removeClass('slider__item_active');
                    $(oldElements.rightSibling).removeClass('slider__item_right');
                    $(oldElements.leftSibling).removeClass('slider__item_left');
                }
            };
        },
        /**
         * Обновляет значение счетчика. В большую или меньшую сторону -
         * определяет переданная строка
         * @param 'plus' или 'minus' изменяют значение на единицу, 
         * можно передать конкретное число
         * При изменении значения счетчика метод генерирует глобальное событие 
         * 'counterUpdate'
         */
        updateCounter: function (value) {
            var number = this.counter,
                    elementsCount = this.items.length;
            
            if(!isNaN(parseFloat(value)) && isFinite(value)) {
                this.counter = value;
                $.event.trigger('counterUpdate');
                return;
            }

            var operation = {
                plus: function () {
                    return number + 1;
                },
                minus: function () {
                    return number - 1;
                }
            };

            number = operation[value]();

            if (number === (elementsCount)) {
                this.counter = 0;
            }
            else if (number < 0) {
                this.counter = (elementsCount + number);
            }
            else {
                this.counter = number;
            }

            $.event.trigger('counterUpdate');
        },
        /**
         * Функция обеспечивает перемещение, смену активных элементов
         * @param {type} direction // направление 'next' (следующ.) или 'prev' (предыд.)
         * @param {type} counter // текущее значение счетчика
         * @param {type} speed // скорость анимации (необязательный)
         * @returns {Bolean} возвращает false в случае не срабатывания
         */
        slide: function (direction, counter, speed) {
            var self = this,
                    animationSpeed = speed || this.speed,
                    elementsSet = this.getElementsSet(counter); //получаем текущие активные элементы по старому значеню счетчика
            var directions = {
                next: {left: '-200%', center: '-100%', right: '0'},
                prev: {left: '0', center: '100%', right: '200%'}
            };
            var endPosition = directions[direction];
            
            if(this.animate) return false;
            
            this.animate = true;

            if (direction === 'next') {
                this.updateCounter('plus');
            }
            else if (direction === 'prev') {
                this.updateCounter('minus');
            }

            $(elementsSet.leftSibling).css({'transform': 'translateX(' + endPosition.left + ')', 'transition': 'transform ' + animationSpeed / 1000 + 's linear'});
            $(elementsSet.mainElement).css({'transform': 'translateX(' + endPosition.center + ')', 'transition': 'transform ' + animationSpeed / 1000 + 's linear'});
            $(elementsSet.rightSibling).css({'transform': 'translateX(' + endPosition.right + ')', 'transition': 'transform ' + animationSpeed / 1000 + 's linear'});
            $(elementsSet.mainElement).one('transitionend webkitTransitionEnd oTransitionEnd', function () {
                $(this).unbind('transitionend webkitTransitionEnd oTransitionEnd');
                self.updateElementsClasses().removeOld(elementsSet); // По завершению анимации удаляем старые 
                self.updateElementsClasses().setNew();               // и выставляем новые значения 
                self.clearInlineCss();
                self.animate = false;
            });
                            return true;
        },
        /**
         * Функция обеспечивает обработку тач-событий и режим работы на мобильных
         * устройствах
         */
        swipe: function () {
            var self = this,
                    siblings,
                    coefficient = 1, //коэффициент "сопротивления" при отсутствующем элементе
                    shiftFinger, //запоминаем интервал смещения пальца от точки касания в процентах
                    shiftElement, //запоминаем интервал смещения элемента
                    startPoint,
                    activeMooved; //Флаг, отключающий слежение за перемещением мышки после mouseup
            
            $(this.box).addClass('slider_swipe');
            
            this.list.addEventListener('touchstart', touchStart, false);
            this.list.addEventListener('touchmove', touchMove, true);
            this.list.addEventListener('touchend', touchEnd, true);
         
            function touchStart(event) {
                event.preventDefault();
                event.stopPropagation();
                if (event.touches.length !== 1 || self.animate) {
                    return;
                }
                var touch = event.changedTouches[0]; //Данные о касании 1-ым пальцем
                startPoint = touch.pageX;
                activeMooved = true;
                siblings = self.getElementsSet(self.counter);
            }

            function touchMove(event) {
                event.preventDefault();
                event.stopPropagation();
                if (!activeMooved || self.animate) {
                    return;
                }
                if (event.targetTouches.length === 1) { // Если 1 палец внутри элемента
                    var touch = event.targetTouches[0];
                    shiftFinger = (startPoint - touch.pageX) * 100 / self.boxWidth;
                    actions.mooved();
                }
                event.stopPropagation();
            }

            function touchEnd(event) {
                event.preventDefault();
                event.stopPropagation();
                if (!activeMooved || self.animate) {
                    return;
                }
                if (shiftElement < -self.percentReturn) {
                    self.slide('prev', self.counter);
                }
                else if (shiftElement > self.percentReturn) {
                    self.slide('next', self.counter);
                }
                else {
                    actions.mooveReturn();
                }
                activeMooved = false;

            }
            
            var actions = {
                /**
                 * Движение элементов, управляемое пользователем
                 */
                mooved: function () {

                    // Обрабатываем ситуацию отсутствия крайнего элемента
                    if ((!siblings.leftSibling && shiftFinger < 0) ||
                            (!siblings.rightSibling && shiftFinger > 0)) {
                        this.limitedMoovedControls();
                    }
                    else {
                        shiftElement = shiftFinger;
                    }
                    $(siblings.leftSibling).css({'transform': 'translateX(' + -(100 + shiftElement) + '%)'});
                    $(siblings.mainElement).css({'transform': 'translateX(' + (0 - shiftElement) + '%)'});
                    $(siblings.rightSibling).css({'transform': 'translateX(' + (100 - shiftElement) + '%)'});
                },
                /**
                 * Ограничивает перемещение крайних элементов в режиме "norepeat"
                 */
                limitedMoovedControls: function () {
                    // Замедляем на коэффициент, который храниться в замыкании
                    shiftElement = shiftFinger / coefficient;
                    // Увеличиваем коэффициент для получения эффекта нарастающего 
                    // затруднения движения
                    if (Math.abs(shiftElement) >= coefficient) {
                        coefficient = Math.abs(shiftElement);
                    }
                    // Не позволяем сдвинуть элемент более чем на 75% от максимально 
                    // необходимого для инициализации слайда интервала
                    if (Math.abs(shiftElement) >= self.percentReturn * 0.75) {
                        if (shiftElement < 0) {
                            shiftElement = -self.percentReturn * 0.75;
                        }
                        else {
                            shiftElement = self.percentReturn * 0.75;
                        }
                        coefficient = 1; //не накапливаем, сбрасываем коэффициент
                        return false;
                    }
                },
                /**
                 * Возвращение элементов, в случае недостаточного их смещения 
                 * для активации действия смены активных элементов (slide)
                 */
                mooveReturn: function () {
                    self.animate = true;
                    $(siblings.leftSibling).css({'transform': 'translateX(-100%)', 'transition': 'transform ' + self.speed / 1000 + 's cubic-bezier(0.175, 0.885, 0.32, 1.275)'});
                    $(siblings.mainElement).css({'transform': 'translateX(0%)', 'transition': 'transform ' + self.speed / 1000 + 's cubic-bezier(0.175, 0.885, 0.32, 1.275)'});
                    $(siblings.rightSibling).css({'transform': 'translateX(100%)', 'transition': 'transform ' + self.speed / 1000 + 's cubic-bezier(0.175, 0.885, 0.32, 1.275)'});
                    $(siblings.mainElement).one('transitionend webkitTransitionEnd oTransitionEnd', function () {
                        $(this).unbind('transitionend webkitTransitionEnd oTransitionEnd');
                        self.clearInlineCss();
                        self.animate = false;
                    });
                }
            };

        },
        /**
         * Очищаем инлайн-стили
         */
        clearInlineCss: function () {
            $(this.items).css({'left': '', 'opacity': '', 'transform': '', 'transition': ''});
        },
        /**
         * Управляет режимом "norepeat"
         */
        norepeat: function () {
            var self = this,
                    countElements = this.items.length - 1,
                    hideElement = null; //ссылка на скрытый элемент

            controlElementsMenegement();

            $(document).on('counterUpdate', function () {
                controlElementsMenegement();
            });
            /**
             * Управляет видимостью кнопок ">" и "<"
             */
            function controlElementsMenegement() {
                if (self.counter === 0) {
                    $(self.prev).hide(100);
                    if (hideElement){
                        $(hideElement).show(100);
                    }
                    hideElement = self.prev;
                }
                else if (self.counter === countElements) {
                    $(self.next).hide(100);
                    if (hideElement){
                        $(hideElement).show(100);
                    }
                    hideElement = self.next;
                }
                else if (hideElement) {
                    $(hideElement).show(100);
                    hideElement = null;
                }
            }
        },
        /**
         * Управляет режимом автоматической прокрутки
         */
        autoScroll: function() {
            var self = this,
                    time,
                    speed = setAutoSlideSpeed(this.auto),
                    autoScrollFlag = true;  //Флаг автоскролла
    
            $(this.box).hover(
                    function() {
                        autoScrollFlag = false;
                    },
                    function() {
                        autoScrollFlag = true;
                    }
            );
            
            timer();
            
            $(document).on('counterUpdate', function () {
                timer();
            });
            
            function timer() {
                time = setTimeout(function () {

                    if (autoScrollFlag) {
                        self.slide('next', self.counter);
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
        }
    };
 
    slidersCollection('.slider_js');

     function slidersCollection(className) {
        var sliders = $(className);

        for (var i = 0; i < sliders.length; i++) {
            sliders[i] = new Slider(sliders[i], {
                speed: parseInt($(sliders[i]).data('speed')),
                repeat: $(sliders[i]).data('repeat'),
                auto: $(sliders[i]).data('auto')
            }, [
               'controls' 
            ]);
            
            sliders[i].init();
        }
    }
    
});
