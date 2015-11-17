"use strict";

/*****EXTENDS****/

$(document).on('sliderReady', function () {

    // 
    var Slider = Window.RTSlider;
    Slider.prototype = Window.RTSlider.__proto__;
    
    // Добавляет нижние элементы управления
    Slider.prototype.controls = function () {

        var self = this,
                controlElements = $('.slider__control-item', this.box);

        // Объект одного элемента управления
        function ElementModel() {
            this.active = false, // Флаг активноссти
                    this.index = null, // Порядковый номер 
                    this.$element = null; // Ссылка на элемент, обернутый Jquery
        }

        // Методы объекта одного элемента управления
        ElementModel.prototype = {
            // Инициация методов
            init: function () {
                this.watch();

                this.$element.on('click', function () {
                    if (this.index === self.counter) {
                        return false;
                    }
                    switchActiveItem(this.index);
                }.bind(this));
            },
            // Слушает событие изменения значения счетчика и меняет свой css-класс
            watch: function () {
                $(document).on('counterUpdate', function () {

                    if (this.index === self.counter) {
                        this.$element.addClass('slider__control-item_active');
                        this.active = true;
                    }
                    else if (this.active) {
                        this.$element.removeClass('slider__control-item_active');
                    }

                }.bind(this));
            }
        };

        if (controlElements.length === 0) {
            createView();
        }
        else {
            createModelCollection(controlElements);
        }

        // Создает и заполняет данными экземпляры модели
        function createModelCollection(arrElements) {
            self.model = [];

            for (var i = 0, max = arrElements.length; i < max; i++) {
                self.model[i] = new ElementModel;
                if (i === 0)
                    self.model[i].active = true;
                self.model[i].index = i;
                self.model[i].$element = $(arrElements[i]);
                self.model[i].init();
            }
        }
        // Создает и вставляет блок элементов управления
        function createView() {
            var fragment = document.createDocumentFragment(),
                    elements = [];

            for (var i = 0, max = self.items.length; i < max; i++) {
                var element = document.createElement('li');
                $(element).addClass('slider__control-item');
                if (i === 0) {
                    $(element).addClass('slider__control-item_active');
                }
                elements.push(element);
                fragment.appendChild(element);
            }

            createModelCollection(elements);

            var list = document.createElement('ul');
            $(list).addClass('slider__control-list');
            list.appendChild(fragment);
            $(self.box).append(list);
        }
        // Переключает активный элемент блока
        function switchActiveItem(index) {
            var i = 2;

trall();
            //setTimeout(trall, 0);

            function trall() {
                if (!i) return ; 
                if (self.slide('next', self.counter, 100)) {
                                    console.log(5);
                    trall();
                    i--;
                }

                setTimeout(trall, 0);
            }

            


           /* var oldActiveElements = self.getElementsSet(self.counter);

            self.updateCounter(index);
            self.updateElementsClasses().removeOld(oldActiveElements);
            self.updateElementsClasses().setNew();*/
        }
        
    };

});

