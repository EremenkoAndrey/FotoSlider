$(document).ready(function () {

    slidersCollection('.slider_js');

    function Slider(element, settings) {
        var box = element.box,
                boxBody = element.boxBody,
                list = element.list,
                items = element.items, //Ссылка на массив картинок
                prev = element.prev, //Ссылка на кнопку >
                next = element.next;     //Ссылка на кнопку <

        var speed = settings.speed || 500,
            counter = settings.counter || false,
            auto = settings.auto || false,
            full = settings.full || false;
    
        var animate = false,          //Флаг анимации
            siblings = getSiblings(activeItemNumber),
            activeItemNumber = 0,     //Счетчик элементов
            boxWidth = $(box).width(), //Ширина блока
            percentReturn = 15,        //При сдвиге на сколько процентов возвращать изображение вместо перелистывания
            is_touch_device = is_touch_device(),
            is_transform = is_transform();
            
        if (!is_transform) {
            $(box).addClass('no-transform_js');
        }

        if (element.items.length < 2) return false; //если меньше 1 картинки

        if (element.items.length === 2) {
            full = false;                    //Отключаем широкоэкранный режим
            createChilde();                  //если 2 картинки - клонируем их
        }

        if (counter) {
            createCounter();
            var countNumber = $(box).find('.slider__current-count').get(0);
        }

        if (full) {
            var scrollWidth;
            /**
             * Если на странице нет скролла, то получаем ширину стандартного
             * скролла текущего браузера
             */
            if (document.documentElement.scrollHeight === document.documentElement.clientHeight) {
                scrollWidth = getScrollbarWidth();
            }
            else {
                scrollWidth = 0;
            }
            wightWatch();
            $(window).resize(function () {
                wightWatch();
            });
        }
        
        if (auto) {
            autoScroll();
        }
        
        setNewActiveImage();
        
        /**
         * обработчики событий
         */
        $(next).on('click', function (e) {
            e.preventDefault();
            if (animate) return false;
            nextSlide(activeItemNumber++);;//Запускаем функцию, передаем ей старое значение счетчика и увеличиваем его на 1
        });
        $(prev).on('click', function (e) {
            e.preventDefault();
            if (animate) return false;
            prevSlide(activeItemNumber--)
        });
        
        /**********************************************************************
         ****************************Листалка*********************************
         *********************************************************************/
        
        /**
         * Аргумент - активный элемент
         * @param {type} elem 
         * Функция отвечает за тач-свайп слайдера 
         */
        function swipe(elem) {
            var interval,
                    startPoint,
                    activeMooved; //Флаг, отключающий слежение за перемещением мышки после mouseup

            if (is_touch_device) {
                elem.addEventListener('touchstart', touchstartEvent, false);
                elem.addEventListener('touchmove', touchmoveEvent, true);
                elem.addEventListener('touchend', touchendEvent, true);
            }
            else {
                if (animate === false) {
                    $(elem).bind('mousedown', function (e) {
                        e.preventDefault();
                        startPoint = e.pageX;
                        activeMooved = true;
                        $(elem).bind('mousemove', function (e) {

                            e.preventDefault();
                            if (activeMooved && animate === false) {
                                interval = (startPoint - e.pageX) * 100 / boxWidth;
                                mooved(interval);
                            }

                        });

                        $(document).bind('mouseup', function () {
                            if (interval < -percentReturn) {
                                prevSlide(activeItemNumber--);
                            }
                            else if (interval > percentReturn) {
                                nextSlide(activeItemNumber++);
                            }
                            else {
                                mooveReturn();
                            }
                            activeMooved = false;
                        });

                    });
                }
            }

            function mooved(interval) {
                if (is_transform) {
                    $(siblings.leftSibling).css({'transform': 'translateX(' + -(100 + interval) + '%)'});
                    $(siblings.mainElement).css({'transform': 'translateX(' + (0 - interval) + '%)'});
                    $(siblings.rightSibling).css({'transform': 'translateX(' + (100 - interval) + '%)'});
                }
                else {
                    $(siblings.leftSibling).css({left: -100 - interval + '%'});
                    $(siblings.mainElement).css({left: -interval + '%'});
                    $(siblings.rightSibling).css({left: 100 - interval + '%'});
                }
            }

            function mooveReturn() {
                animate = true;
//$('#test3').html(animate + '2');
                if (is_transform) {
                    $(siblings.leftSibling).css({'transform': 'translateX(-100%)', 'transition': 'transform ' + speed / 1000 + 's cubic-bezier(0.175, 0.885, 0.32, 1.275)'});
                    $(siblings.mainElement).css({'transform': 'translateX(0%)', 'transition': 'transform ' + speed / 1000 + 's cubic-bezier(0.175, 0.885, 0.32, 1.275)'});
                    $(siblings.rightSibling).css({'transform': 'translateX(100%)', 'transition': 'transform ' + speed / 1000 + 's cubic-bezier(0.175, 0.885, 0.32, 1.275)'});
                    $(siblings.mainElement).on('transitionend webkitTransitionEnd oTransitionEnd', function () {
                        clearInlineCss();
                        unbindEvents();
                        animate = false;
                        swipe(siblings.mainElement);
                    });
                }
                else {
                    $(siblings.leftSibling).animate({left: '-100%'}, speed / 1.5);
                    $(siblings.mainElement).animate({left: '0'}, speed / 1.5);
                    $(siblings.rightSibling).animate({left: '100%'}, speed / 1.5,
                            function () {
                                clearInlineCss();
                                unbindEvents();
                                animate = false;
                                swipe(siblings.mainElement);
                            });
                }
            }
            
            function touchstartEvent(e) {
                if (e.touches.length !== 1) {
                    return;
                }
                var touch = e.changedTouches[0]; //Данные о касании 1-ым пальцем
                startPoint = touch.pageX;
                activeMooved = true;

            }

            /**
             * Функция обрабатывает событие touchmove
             * Вынесена за пределы обработчика, чтобы можно было впоследствии снять обработчик
             */
            function touchmoveEvent(e) {

                if (!activeMooved) {
                    return;
                }

                if (e.targetTouches.length === 1) { // Если 1 палец внутри элемента
                    var touch = e.targetTouches[0];
                    interval = (startPoint - touch.pageX) * 100 / boxWidth;
                    mooved(interval);
                }
                e.stopPropagation();
            }
            
            /**
             * Функция обрабатывает событие touchend
             * Вынесена за пределы обработчика, чтобы можно было впоследствии снять обработчик
             * снимает обработчик эта же ф-ция
             */
            function touchendEvent(e) {
                e.stopPropagation();
                if (interval < -percentReturn) {
                    prevSlide(activeItemNumber--);
                }
                else if (interval > percentReturn) {
                    nextSlide(activeItemNumber++);
                }
                else {
                    mooveReturn();
                }

                activeMooved = false;
                for (var i = 0; i < items.length; i++) {
                    items[i].removeEventListener("touchstart", touchstartEvent, false);
                    items[i].removeEventListener("touchmove", touchmoveEvent, true);
                    items[i].removeEventListener("touchend", touchendEvent, true);
                }
            }
        }
         /**********************************************************************/


        /**
         * @param {type} number - принимает старое значение счетчика элементов
         * Функция анимирует текущие активные элементы
         */
        function prevSlide(number) {
            animate = true;
            var currentElements = getSiblings(number); //получаем текущие активные элементы по старому значеню счетчика
            var transitionControl = true;              //флаг контроля единичного срабатывания обработчика события анимации
                    unbindEvents();
            if (is_transform) {
                $(currentElements.leftSibling).css({'transform': 'translateX(0)', 'transition': 'transform ' + speed / 1000 + 's linear'});
                $(currentElements.mainElement).css({'transform': 'translateX(100%)', 'transition': 'transform ' + speed / 1000 + 's linear', opacity: '0.5'});
                $(currentElements.rightSibling).css({'transform': 'translateX(200%)', 'transition': 'transform ' + speed / 1000 + 's linear'});
                $(currentElements.mainElement).on('transitionend webkitTransitionEnd oTransitionEnd', function () {
                    if (transitionControl) {
                        setNewActiveImage();   //По завершению анимации выставляем новые значения 
                    }
                    transitionControl = false;
                });
            }
            else {
                $(currentElements.leftSibling).animate({left: '0'}, speed);
                $(currentElements.mainElement).css({opacity: '0.5'}).animate({left: '100%'}, speed);
                $(currentElements.rightSibling).animate({left: '200%'}, speed,
                        function () {
                            setNewActiveImage(); //По завершению анимации выставляем новые значения
                        });
            }
        }

        /**
         * @param {type} number - принимает старое значение счетчика элементов
         * Функция анимирует текущие активные элементы
         */
        function nextSlide(number) {
            animate = true;
            var currentElements = getSiblings(number); //получаем текущие активные элементы по старому значеню счетчика
            var transitionControl = true;              //флаг контроля единичного срабатывания обработчика события анимации
                    unbindEvents();
            if (is_transform) {
                $(currentElements.leftSibling).css({'transform': 'translateX(-200%)', 'transition': 'transform ' + speed / 1000 + 's linear'});
                $(currentElements.mainElement).css({'transform': 'translateX(-100%)', 'transition': 'transform ' + speed / 1000 + 's linear', opacity: '0.5'});
                $(currentElements.rightSibling).css({'transform': 'translateX(0)', 'transition': 'transform ' + speed / 1000 + 's linear'});
                $(currentElements.mainElement).on('transitionend webkitTransitionEnd oTransitionEnd', function () {
                    if (transitionControl) {
                        setNewActiveImage();   //По завершению анимации выставляем новые значения 
                    }
                    transitionControl = false;
                });
            }
            else {
                $(currentElements.leftSibling).animate({left: '-200%'}, speed);
                $(currentElements.mainElement).css({opacity: '0.5'}).animate({left: '-100%'}, speed);
                $(currentElements.rightSibling).animate({left: '0'}, speed,
                        function () {
                            setNewActiveImage();  //По завершению анимации выставляем новые значения
                        });
            }
        }

        /**
         * Функция получает правый и левый соседние с элементом, соответствующим переданному номеру
         * @param {type} number -принимает номер элемента
         * @returns {arrSiblings} - Возвращает соседей и сам элемент в виде объекта
         * number - соответствует предыдущему активному элементу, а 
         * activeItemNumber - текущему
         */
        function getSiblings(number) {

            var arrSiblings = {};

            if (number < (items.length - 1)) {
                arrSiblings.rightSibling = items[number + 1];
            }
            else {
                arrSiblings.rightSibling = items[0];
            }
            if (number === 0) {
                arrSiblings.leftSibling = items[items.length - 1];
            }
            else {
                arrSiblings.leftSibling = items[number - 1];
            }
            arrSiblings.mainElement = items[number];
            return arrSiblings;
        }

        /**
         * Функция устанавливает класс активного элемента и удаляет его у всех соседних элементов
         */
        function setNewActiveImage() {

            reset(activeItemNumber);  //Проверяем и сбрасываем счетчик

            siblings = getSiblings(activeItemNumber); //Устанавливаем глобально новые активные элементы
            
            $(siblings.mainElement).siblings().removeClass('slider__item_active');
            $(siblings.mainElement).addClass('slider__item_active');

            $(siblings.rightSibling).siblings().removeClass('slider__item_right');
            $(siblings.rightSibling).addClass('slider__item_right');

            $(siblings.leftSibling).siblings().removeClass('slider__item_left');
            $(siblings.leftSibling).addClass('slider__item_left');

            clearInlineCss();

            if (counter && element.items.length !== 2) {
                $(countNumber).html(activeItemNumber + 1);
            }
            else if (element.items.length === 2) {
                $(countNumber).html((activeItemNumber % 2) + 1);
            }
            
            animate = false;
            
            swipe(siblings.mainElement);
        }

        function clearInlineCss() {
            $(items).css({'left': '', 'opacity': '','transform':'','transition':''});
        }
        
        function unbindEvents() {
            $(items).unbind();
            $(document).unbind();
        }


        /**
         * Функция сбрасывает глобальный счетчик, если он выходит за ограничения длины массива
         * @param number - значение счетчика
         * возвращает начальное значение счетчика
         */
        function reset(number) {
            if (number === (items.length)) {
                activeItemNumber = 0;
            }
            if (number < 0) {
                activeItemNumber = (items.length + number);
            }
            return number;
        }

        /**
         * Функция устанавливает css-свойства в зависимости от ширины экрана
         * scrollWidth - ширина скроллбара браузера вычитается из ширины 
         * окна даже если скролла нет
         */
        function wightWatch() {
            var windowWidth = $(window).width() - scrollWidth;
            var interval = (windowWidth - boxWidth) / 2;

            if (windowWidth > boxWidth) {
                $(boxBody).css({'padding-left': interval, 'padding-right': interval, 'margin-left': -interval, 'margin-right': -interval});
            }
            else if (windowWidth <= boxWidth) {
                $(boxBody).css({'padding-left': '', 'padding-right': '', 'margin-left': '', 'margin-right': ''});
            }
        }

        /**
         * Функция вычисляет и возвращает щирину скроллбара браузера
         */
        function getScrollbarWidth() {
            var scrollDiv = document.createElement("div");
            scrollDiv.className = "slider_js_scrollbar-measure";
            document.body.appendChild(scrollDiv);
            var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
            document.body.removeChild(scrollDiv);
            return scrollbarWidth;
        }

        function createCounter() {
            $(box).append('<div class="slider__counter"><b class="slider__current-count"></b> / ' + element.items.length + '</div>');
        }

        function createChilde() {
            $(items[0]).clone().appendTo(list);
            $(items[1]).clone().appendTo(list);
            items = $(list).find('.slider__item');  //обновляем массив картинок
        }
        
        /**
         * Функция запускает автоскролл, инициируя событие клика next
         */
        function autoScroll() {
            var speedScroll = autoSpeed(auto),
                    autoScrollFlag = false;  //Флаг автоскролла
    
            $(box).hover(
                    function () {
                        autoScrollFlag = true;
                    },
                    function () {
                        autoScrollFlag = false;
                    }
            );
            
            setInterval(function () {
                if (!autoScrollFlag) {
                    $(next).click();
                }
            }, speedScroll);

        /**
         * Функция принимает значение скорости автоскролла из настроек
         * проверяет их и устанавливает значение скорости смены слайдов
         * применяет значение по умолчанию, если данные не корректны или 
         * скорость меньше установленной скорости анимации умноженной на 2
         */
            function autoSpeed(settingsData) {
                var speedScroll = parseInt(settingsData),
                        defaultSpeedScroll = speed * 2;
                if (speedScroll === NaN) {
                    speedScroll = defaultSpeedScroll;
                }
                else {
                    if (speedScroll < defaultSpeedScroll) {
                        speedScroll = defaultSpeedScroll;
                    }
                }
                return speedScroll;
            }
        }
        
        /**
         * Проверяем поддержку браузером css-свойства transform
         * @returns {Boolean}
         */
        function is_transform() {
            var browser = browserDetect();
            if (!!('transform' in document.body.style) && 
                    browser.opera !== true) //У Оперы свойство transform включает аппаратное торможение вместо ускорения
            {
                return true;
            }
            else return false;
        }
        
        /**
         * Проверяем поддержку браузером touch-событий
         * @returns {Boolean}
         */
        function is_touch_device() {
            return !!('ontouchstart' in window);
        } 

        function browserDetect() {
            var browser = {};
            
            if(window.opera){
                browser.opera = true;
                browser.operaVersion = window.opera.version();
            }
            return browser;
        }

    }

    function slidersCollection(className) {
        var sliders$ = $(className);

        /**
         * Создаем экземпляры функции Slider, для каждого слайдера свой.
         * Передаем в нее первым аргументом массив значимых HTML-элементов
         */
        for (var i = 0; i < sliders$.length; i++) {
            new Slider({
                box: sliders$[i],
                boxBody: $(sliders$[i]).find('.slider__body').get(0),
                list: $(sliders$[i]).find('.slider__list').get(0),
                items: $(sliders$[i]).find('.slider__item'),
                prev: $(sliders$[i]).find('.slider__control_prev').get(0),
                next: $(sliders$[i]).find('.slider__control_next').get(0)
            }, {
                speed: $(sliders$[i]).data('speed'),
                full: $(sliders$[i]).data('full'),
                auto: $(sliders$[i]).data('auto'),
                counter: $(sliders$[i]).data('counter')
            });
        }
    }

});