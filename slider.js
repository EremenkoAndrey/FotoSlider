$(document).ready(function () {

    "use strict";

    function Slider(element, settings) {
        /*Настройки общие*/
        this.repeat = settings.repeat || true, //Зацикливание
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
    }

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
                this.createAdditionalChilde();
            }

            this.updateElementsClasses();

            // Устанавливаем обработчики
            $(this.next).on('click', function (e) {
                e.preventDefault();
                if (self.animate)
                    return false;
                self.slide('next', self.speed, self.counter);
            });
            $(this.prev).on('click', function (e) {
                e.preventDefault();
                if (self.animate)
                    return false;
                self.slide('prev', self.speed, self.counter);
            });
            
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
        },
        /**
         * Получение массива из трех элементов: левого, правого и центрального
         * @param {number} counter // по номеру центрального элемента
         * @returns {array} // массив активных элементов
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
         * Обновляем классы активных элементов
         * @param {array} // необязательный параметр - массив с предыдущими 
         * активными элементами для удаления классов
         */
        updateElementsClasses: function (arrElements) {
            var oldActiveElements = arrElements || false;
            var newActiveElements = this.getElementsSet(this.counter);

            if (oldActiveElements) {
                $(oldActiveElements.mainElement).removeClass('slider__item_active');
                $(oldActiveElements.rightSibling).removeClass('slider__item_right');
                $(oldActiveElements.leftSibling).removeClass('slider__item_left');
            }

            $(newActiveElements.mainElement).addClass('slider__item_active');
            $(newActiveElements.rightSibling).addClass('slider__item_right');
            $(newActiveElements.leftSibling).addClass('slider__item_left');

            this.clearInlineCss();

            this.animate = false;
        },
        /**
         * Обновляет значение счетчика. В большую или меньшую сторону -
         * определяет переданная строка
         * @param {string} // 'plus' или 'minus'
         * При изменении значения счетчика генерирует глобальное событие 
         * 'counterUpdate'
         */
        updateCounter: function (action) {
            var number = this.counter,
                    elementsCount = this.items.length;

            var operation = {
                plus: function () {
                    return number + 1;
                },
                minus: function () {
                    return number - 1;
                }
            };

            number = operation[action]();

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
         * @param {type} speed // скорость анимации
         * @param {type} counter // текущее значение счетчика (до смены слайдов)
         * @returns {undefined}
         */
        slide: function (direction, speed, counter) {
            var self = this,
                    animationSpeed = speed || this.speed,
                    transitionControl = true, //флаг контроля единичного срабатывания обработчика события завершения анимации
                    elementsSet = this.getElementsSet(counter); //получаем текущие активные элементы по старому значеню счетчика

            var directions = {
                next: {left: '-200%', center: '-100%', right: '0'},
                prev: {left: '0', center: '100%', right: '200%'}
            };
            var endPosition = directions[direction];

            if (direction === 'next') {
                this.updateCounter('plus');
            }
            else if (direction === 'prev') {
                this.updateCounter('minus');
            }

            this.animate = true;

            $(elementsSet.leftSibling).css({'transform': 'translateX(' + endPosition.left + ')', 'transition': 'transform ' + animationSpeed / 1000 + 's linear'});
            $(elementsSet.mainElement).css({'transform': 'translateX(' + endPosition.center + ')', 'transition': 'transform ' + animationSpeed / 1000 + 's linear', opacity: '0.5'});
            $(elementsSet.rightSibling).css({'transform': 'translateX(' + endPosition.right + ')', 'transition': 'transform ' + animationSpeed / 1000 + 's linear'});
            $(elementsSet.mainElement).on('transitionend webkitTransitionEnd oTransitionEnd', function () {
                if (transitionControl) {
                    self.updateElementsClasses(elementsSet);   //По завершению анимации выставляем новые значения 
                }
                transitionControl = false;
            });
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
                    self.slide('prev', self.speed, self.counter);
                }
                else if (shiftElement > self.percentReturn) {
                    self.slide('next', self.speed, self.counter);
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
                    $(siblings.mainElement).on('transitionend webkitTransitionEnd oTransitionEnd', function () {
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
                    $(self.prev).hide(self.speed);
                    hideElement = self.prev;
                }
                else if (self.counter === countElements) {
                    $(self.next).hide(self.speed);
                    hideElement = self.next;
                }
                else if (hideElement) {
                    $(hideElement).show(self.speed);
                    hideElement = null;
                }
            }
        },
        /**
         * Создает дополнительные элементы, если в слайдере меньше 3 картинок.
         */
        createAdditionalChilde: function() {
            $(this.items[0]).clone().removeClass('slider__item_active').appendTo(this.list);
            $(this.items[1]).clone().appendTo(this.list);
            this.items = $(this.box).find('.slider__item');  //обновляем массив картинок
        },
        /**
         * Управляет режимом автоматической прокрутки
         */
        autoScroll: function() {
            var self = this,
                    speed = setAutoSlideSpeed(this.auto),
                    autoScrollFlag = false;  //Флаг автоскролла
    
            $(this.box).hover(
                    function() {
                        autoScrollFlag = true;
                    },
                    function() {
                        autoScrollFlag = false;
                    }
            );
            
            setInterval(function () {
                if (!autoScrollFlag) {
                    self.slide('next', self.speed, self.counter);
                }
            }, speed);
            /**
             * Валидация скорости автопрокрутки
             * @returns {nember} // скорость автопрокрутки
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
 
/*****EXTENDS****/


    var arrSliders = slidersCollection('.slider_js');

    for (var i = 0; i < arrSliders.length; i++) {
        arrSliders[i].init();
    }

    function slidersCollection(className) {
        var sliders = $(className);

        for (var i = 0; i < sliders.length; i++) {
            sliders[i] = new Slider(sliders[i], {
                speed: parseInt($(sliders[i]).data('speed')),
                repeat: $(sliders[i]).data('repeat'),
                auto: $(sliders[i]).data('auto')
            });
        }
        return sliders;
    }
    
});
