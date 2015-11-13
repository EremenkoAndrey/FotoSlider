$(document).ready(function () {
    
    var settings = {}
    
    settings.full = 'true';
    settings.counter = 'true';
    settings.speed = 500;
    
    pageImageProcessing();
    

    /**
     * собирает по странице изображения с указанным классом и если находит 2
     * изображения подряд - делает из них HTML- блок слайдера и вставляет на 
     * страницу. Удаляет блоки, из которых "собран" слайдер
     * @returns {undefined}
     */
    function pageImageProcessing() {

        appendSliders();
        
        /**
         * Функция собирает все элементы с классом .arcticle-media_js_slider
         * на странице. Затем собирает массив из блоков идущих подряд элементов
         * и при помощи функции getImgAttr(htmlObject)получает объект с их
         * атрибутами и возвращает этот многомерный масив
         * @returns {Array}
         */
        function getSlidersSets() {
            var sliders = [];
            var className = 'slider__image';
            var imageList = $('.' + className);
            for (var i = 0; i < imageList.length; i++) {
                if ($(imageList[i]).next().hasClass(className)) {
                    var slider = [getImgAttr(imageList[i])];
                    do {
                        i++;
                        slider.push(getImgAttr(imageList[i]));
                    } while ($(imageList[i]).next().hasClass(className));
                    sliders.push(slider);
                }
                else{
                    $(imageList[i]).removeClass('arcticle-media');
                }
            }
            return sliders;
        }

        /**
         * @param {type} htmlObject принимает блок с HTML элементами
         * ищет там изображение
         * @returns {script_L1.pageSliders.getImgAttr.imageAttr}
         * возвращает атрибуты изображения в виде массива
         */
        function getImgAttr(htmlObject) {
            var image = htmlObject;
            image.src = $(image).attr('src');
            image.alt = $(image).attr('alt');
            image.title = $(image).attr('title');
            image.parent = htmlObject;         //ссылка на оригинал
            return image;
        }


        /**
         * Функция собирает слайдер с картинками, атрибуты которых переданы во
         * входящем массиве
         * @param {type} array
         * @returns {script_L1.pageSliders.creatSlider}
         */
        function createSlider(array) {
            this.slider = function () {
                var div = document.createElement('div');
                div.className = "slider slider_js";
                div.dataset.full = settings.full;
                div.dataset.counter = settings.counter;
                div.dataset.speed = settings.speed;
                div.appendChild(this.sliderBody());
                div.appendChild(this.prevLink());
                div.appendChild(this.nextLink());
                return div;
            },
                    this.sliderBody = function () {
                        var div = document.createElement('div');
                        div.className = "slider__body";
                        div.appendChild(this.sliderList());
                        return div;
                    },
                    this.sliderList = function () {
                        var ul = document.createElement('ul');
                        ul.className = "slider__list";
                        for (var i = 0; i < array.length; i++) {
                            ul.appendChild(this.sliderItem(i));
                        }
                        return ul;
                    },
                    this.prevLink = function () {
                        var a = document.createElement('a');
                        a.className = "slider__control slider__control_prev";
                        a.href = '#';
                        a.innerHTML = '&lt;';
                        return a;
                    },
                    this.nextLink = function () {
                        var a = document.createElement('a');
                        a.className = "slider__control slider__control_next";
                        a.href = '#';
                        a.innerHTML = '&gt;';
                        return a;
                    },
                    this.sliderItem = function (i) {
                        var li = document.createElement('li');
                        if (i === 0) {
                            li.className = "slider__item slider__item_active";
                        }
                        else {
                            li.className = "slider__item";
                        }
                        li.appendChild(this.sliderImage(i));
                        if (array[i].title !== 'undefined') {
                            li.appendChild(this.sliderTitle(i));
                        }
                        return li;
                    },
                    this.sliderImage = function (i) {
                        var img = document.createElement('img');
                        img.className = "slider__image";
                        img.src = array[i].src;
                        img.alt = array[i].alt;
                        return img;
                    },
                    this.sliderTitle = function (i) {
                        var div = document.createElement('div');
                        div.className = "slider__item-text";
                        div.innerHTML = array[i].title;
                        return div;
                    };
        }
        
        /**
         * Функция добавляет слайдеры на страницу и удаляет оригинальные картинки
         */
        function appendSliders() {
            var sliders = getSlidersSets();
            var newSlider;
            for (var i = 0; i < sliders.length; i++) {
                for (var k = 0; k < sliders[i].length; k++) {
                    if (k === 0) {
                        newSlider = new createSlider(sliders[i]);
                        $(sliders[i][k].parent).before(newSlider.slider()).remove();
                    }
                    else {
                        $(sliders[i][k].parent).remove();
                    }
                }
            }
        }

    }



});

