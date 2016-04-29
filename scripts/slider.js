/*
 ПОДКЛЮЧЕНИЕ
 
 Если на странице есть require.js, то скрипт будет подключен через него,
 иначе скрипт подключается как плагин jQuery.fn.Slider
 
 ПОДКЛЮЧЕНИЕ КАК ПЛАГИН
 
 new jQuery.fn.Slider(element)
 где element - сслыка на HTML-элемент слайдера
 
 ПОДКЛЮЧЕНИЕ ЧЕРЕЗ Require.js
 
 new Slider(element)
 где element - сслыка на HTML-элемент слайдера
 
 ПЕРЕДАВАЕМЫЕ ПАРАМЕТРЫ:
 
 Во втором необязательном аргументе экземпляра функции слайдера можно передать 
 массив с настройками:

 new Slider(element, {
    speed: 500 // Тип: число. Дефолтная скорость перемещения слайдов. По-умолчанию равна 500мс;
    repeat="norepeat" // Тип: строка. Отключает "зацикленный" режим;
    animation=".69,.18,.02,.99" // Тип: строка. Параметры анимации функции cubic-bezier;
 })
 
 Корректность и соответствие типу передаваемых параметров не проверяется. 
 
 */

(function(factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], function($) {
        return factory($);
    });
  } else {
      if(!jQuery) throw  'For slider need jQuery';
      jQuery.fn.Slider = factory();
  }
})(function ($){

    "use strict";

    var Slider = function (element, settings) {
        /*Настройки общие. Передаются в параметрах*/
        this.repeat = settings.repeat || true,
                this.speed = settings.speed || 1000,
                this.bezier = (function () {
                    if (settings.animation) {
                        return 'cubic-bezier(' + settings.animation + ')';
                    }
                    return 'linear';
                }()),
                
                /*Touch*/
                // Минимальный сдвиг элемента для перелистывания (в  процентах)
                this.percentReturn = 15,

                /*Служебные переменные*/
                this.counter = 0, // Счетчик
                this.animate = false, // Флаг анимации
                /**
                * Проверка поддержки тач-событий. Использован метод Modernizr
                * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touchevents.js
                * Может не работать в FF при ручном изменении параметра
                * dom.w3c_touch_events.enabled = 1 в настройках about:config
                */
                this.touch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,

                /* Ссылки на HTML элементы */
                this.box = element,
                this.list = $(element).find('.slider__list_js').get(0),
                this.items = $(element).find('.slider__item_js'),
                this.prev = $(element).find('.slider__control_prev_js').get(0), //Ссылка на кнопку >
                this.next = $(element).find('.slider__control_next_js').get(0), //Ссылка на кнопку <
                this.boxWidth = $(element).width();
                
                this.init();

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
            if (countItems < 2)
                return false;
            if (countItems === 2) {
                this.repeat === 'norepeat';
            }
            
            // Проверяем и включаем настройки

            if (this.touch) {
                this.swipe();
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
                self.slide('next');
            });
            $(this.prev).on('click', function (e) {
                e.preventDefault();
                if (self.animate)
                    return false;
                self.slide('prev');
            });

        },
        /**
         * Получение массива из трех элементов: левого, правого и центрального
         * @param {number} counter // по номеру центрального элемента
         * @returns {array} массив активных элементов, в зависимости от
         * режима работы слайдера вы будете получать:
         * если repeat - всегда полный набор элементов (для "бесконечного" режима) 
         * если norepeat - полный набор только если имеются все соседние элементы 
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
                    $(newElements.mainElement).addClass('slider__item_active_js');
                    $(newElements.rightSibling).addClass('slider__item_right_js');
                    $(newElements.leftSibling).addClass('slider__item_left_js');
                },
                removeOld: function (arrElements) {
                    var oldElements = arrElements || false;
                    if (!oldElements) {
                        throw new Error("Необходимо передать аргумент с массивом элементов");
                    }
                    $(oldElements.mainElement).removeClass('slider__item_active_js');
                    $(oldElements.rightSibling).removeClass('slider__item_right_js');
                    $(oldElements.leftSibling).removeClass('slider__item_left_js');
                }
            };
        },
        /**
         * Обновляет значение счетчика. В большую или меньшую сторону -
         * определяет переданная строка:
         * @param {stirng || number} строки 'plus' или 'minus' изменяют значение
         * на единицу, можно передать конкретное число - номер элемента, 
         * на который следует перейти
         * При изменении значения счетчика метод генерирует глобальное событие 
         * 'counterUpdate'
         */
        updateCounter: function (value) {
            var number = this.counter,
                    elementsCount = this.items.length;

            if (!isNaN(parseFloat(value)) && isFinite(value)) {
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
         * Функция обеспечивает перемещение слайда - смену активных элементов
         * @param {stirng} direction // направление 'next' (следующ.) или 'prev' (предыд.)
         * @param {stirng} speed // скорость анимации (необязательный)
         * @param {stirng} animation // функция анимации cubic-bezier (необязательный)
         * @returns {Bolean} возвращает false в случае не срабатывания или true
         */
        slide: function (direction, speed, animation) {
            var self = this,
                    animationSpeed = speed || this.speed,
                    bezier = animation || this.bezier,
                    elementsSet = this.getElementsSet(this.counter); //получаем текущие активные элементы по старому значеню счетчика

            var directions = {
                next: {left: '-200%', center: '-100%', right: '0'},
                prev: {left: '0', center: '100%', right: '200%'}
            };
            var endPosition = directions[direction];

            if (this.animate)
                return false;

            this.animate = true;

            if (direction === 'next') {
                this.updateCounter('plus');
            }
            else if (direction === 'prev') {
                this.updateCounter('minus');
            }


            $(elementsSet.leftSibling).css({
                '-webkit-transform': 'translateX(' + endPosition.left + ')',
                'transform': 'translateX(' + endPosition.left + ')',
                '-webkit-transition': '-webkit-transform ' + animationSpeed / 1000 + 's ' + bezier,
                'transition': 'transform ' + animationSpeed / 1000 + 's ' + bezier
            });
            $(elementsSet.mainElement).css({
                '-webkit-transform': 'translateX(' + endPosition.center + ')',
                'transform': 'translateX(' + endPosition.center + ')',
                '-webkit-transition': '-webkit-transform ' + animationSpeed / 1000 + 's ' + bezier,
                'transition': 'transform ' + animationSpeed / 1000 + 's ' + bezier
            });
            $(elementsSet.rightSibling).css({
                '-webkit-transform': 'translateX(' + endPosition.right + ')',
                'transform': 'translateX(' + endPosition.right + ')',
                '-webkit-transition': '-webkit-transform ' + animationSpeed / 1000 + 's ' + bezier,
                'transition': 'transform ' + animationSpeed / 1000 + 's ' + bezier
            });

            // Страховочная функция на случай если не сработает событие,
            // через двухкратный интервал анимации функция будет вызвана в обход события
            // триггер здесь не подходит - некоторые недобраузеры просто не слушают
            // события в неактивной влкадке
            var insurance = setTimeout(afterAnimation, animationSpeed * 2);

            $(self.box).one('transitionend webkitTransitionEnd oTransitionEnd', function () {
                afterAnimation();
            });

            function afterAnimation() {
                $(self.box).unbind('transitionend webkitTransitionEnd oTransitionEnd');
                self.updateElementsClasses().removeOld(elementsSet); // По завершению анимации удаляем старые 
                self.updateElementsClasses().setNew();               // и выставляем новые значения 
                self.clearInlineCss();
                self.animate = false;
                clearTimeout(insurance);
            }

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
                    shiftFinger, //запоминаем интервал смещения пальца от точки касания в процентах от ширины блока
                    shiftElement, //запоминаем интервал смещения элемента
                    startPoint,
                    activeMooved; //Флаг, отключающий слежение за перемещением мышки после mouseup

            $(this.box).addClass('slider_swipe_js');

            this.list.addEventListener('touchstart', touchStart, false);
            this.list.addEventListener('touchmove', touchMove, true);
            this.list.addEventListener('touchend', touchEnd, true);

            function touchStart(event) {

                if (event.touches.length !== 1 || self.animate) {
                    return;
                }
                var touch = event.changedTouches[0]; //Данные о касании 1-ым пальцем
                startPoint = touch.pageX;
                activeMooved = true;
                siblings = self.getElementsSet(self.counter);
            }

            function touchMove(event) {

                if (!activeMooved || self.animate) {
                    return;
                }
                if (event.targetTouches.length === 1) { // Если 1 палец внутри элемента
                    var touch = event.targetTouches[0];
                    shiftFinger = startPoint - touch.pageX;
                    actions.moove();
                }
                event.stopPropagation();
            }

            function touchEnd(event) {

                if (!activeMooved || self.animate) {
                    return;
                }
                if (shiftElement < -self.percentReturn) {
                    self.updateCounter('minus');
                    self.clearInlineCss(siblings);
                    self.updateElementsClasses().removeOld(siblings);
                    self.updateElementsClasses().setNew();
                    // self.slide('prev', 300, 'linear'); анимация тормозит в мобильных
                }
                else if (shiftElement > self.percentReturn) {
                    self.updateCounter('plus');
                    self.clearInlineCss(siblings);
                    self.updateElementsClasses().removeOld(siblings);
                    self.updateElementsClasses().setNew();
                    //self.slide('next', 300, 'linear'); анимация тормозит в мобильных
                }
                else {
                    actions.mooveReturn();
                }
                // Сбрасываем врЕменные значения
                shiftElement = 0;
                activeMooved = false;

            }

            var actions = {
                /**
                 * Движение элементов, управляемое пользователем
                 */
                moove: function () {

                    // Обрабатываем ситуацию отсутствия крайнего элемента
                    if ((!siblings.leftSibling && shiftFinger < 0) ||
                            (!siblings.rightSibling && shiftFinger > 0)) {
                        this.limitedMoovedControls();
                    }
                    else {
                        shiftElement = shiftFinger;
                    }

                    $(siblings.leftSibling).css({
                        '-webkit-transform': 'translate3d(' + -(self.boxWidth + shiftElement) + 'px,0,0)',
                        'transform': 'translate3d(' + -(self.boxWidth + shiftElement) + 'px,0,0)'
                    });
                    $(siblings.mainElement).css({
                        '-webkit-transform': 'translate3d(' + (0 - shiftElement) + 'px,0,0)',
                        'transform': 'translate3d(' + (0 - shiftElement) + 'px,0,0)'
                    });
                    $(siblings.rightSibling).css({
                        '-webkit-transform': 'translate3d(' + (self.boxWidth - shiftElement) + 'px,0,0)',
                        'transform': 'translate3d(' + (self.boxWidth - shiftElement) + 'px,0,0)'
                    });
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
                    $(siblings.leftSibling).css({
                        '-webkit-transform': 'translateX(-100%)',
                        'transform': 'translateX(-100%)',
                        '-webkit-transition': '-webkit-transform ' + self.speed / 1000 + 's cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        'transition': 'transform ' + self.speed / 1000 + 's cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    });
                    $(siblings.mainElement).css({
                        '-webkit-transform': 'translateX(0%)',
                        'transform': 'translateX(0%)',
                        '-webkit-transition': '-webkit-transform ' + self.speed / 1000 + 's cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        'transition': 'transform ' + self.speed / 1000 + 's cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    });
                    $(siblings.rightSibling).css({
                        '-webkit-transform': 'translateX(100%)',
                        'transform': 'translateX(100%)',
                        '-webkit-transition': '-webkit-transform ' + self.speed / 1000 + 's cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        'transition': 'transform ' + self.speed / 1000 + 's cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    });
                    $(siblings.mainElement).one('transitionend webkitTransitionEnd oTransitionEnd', function () {
                        $(this).unbind('transitionend webkitTransitionEnd oTransitionEnd');
                        self.clearInlineCss();
                        self.animate = false;
                    });
                }
            };

        },
        /**
         * Очищает инлайн-стили
         * @param {obj} //принимает объект с элементами для очистки (необязательный)
         * если аргумент не передан - очистит стили у всех элементов 
         */
        clearInlineCss: function (elements) {

            if (elements) {
                $.each(elements, function (key) {
                    $(elements[key]).removeAttr('style');
                })
            } else {
                $(this.items).removeAttr('style');
            }
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
                    if (hideElement) {
                        $(hideElement).show(100);
                    }
                    hideElement = self.prev;
                }
                else if (self.counter === countElements) {
                    $(self.next).hide(100);
                    if (hideElement) {
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
    };
    
    return Slider;
})

