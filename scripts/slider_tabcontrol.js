define(['jquery', 'slider'], function ($, Slider) {
    "use strict";

    // Добавляет нижние элементы управления
    // по ховеру меняется картинка в слайдере
    // ховер можно заменить на клик, просто заменив событие 'mouseover'
    // на 'click'
    Slider.prototype.slider_tabcontrol = function () {

        var self = this,
                controlElements = $('.controls-item_js', this.box);

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

                this.$element.on('mouseover', function () {
                    if (this.index === self.counter || self.animate) {
                        return;
                    }
                    switchActiveItem(this.index);
                }.bind(this));
            },
            // Слушает событие изменения значения счетчика и меняет свой css-класс
            watch: function () {
                $(document).on('counterUpdate', function () {

                    if (this.index === self.counter) {
                        this.$element.addClass('controls-item_active_js');
                        this.active = true;
                    } else if (this.active) {
                        this.$element.removeClass('controls-item_active_js');
                    }

                }.bind(this));
            }
        };

        if (controlElements.length === 0) {
            createView();
        } else {
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
                $(element).addClass('controls-item_js');
                if (i === 0) {
                    $(element).addClass('controls-item_active_js');
                }
                elements.push(element);
                fragment.appendChild(element);
            }

            createModelCollection(elements);

            var list = document.createElement('ul');
            $(list).addClass('controls-list_js');
            list.appendChild(fragment);
            $(self.box).append(list);
        }
        // Переключает активный элемент блока
        function switchActiveItem(index) {
            var oldActiveElements = self.getElementsSet(self.counter);

            self.updateCounter(index);
            self.updateElementsClasses().removeOld(oldActiveElements);
            self.updateElementsClasses().setNew();
        }

    };
});



