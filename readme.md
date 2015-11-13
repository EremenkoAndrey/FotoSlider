# Простой адаптивный слайдер

Достаточно просто поместить две или более картинок с классом "slider__image" подряд 
и слайдер создастся сам! 

## Подключение скрипта

Для работы потребуется подключенная библиотека jquery!

Слайдер состоит из двух независимых файлов: 
slider-constructor.js - ищет картинки на странице и создает из них слайдер
slider.js - собственно, сам слайдер
Вы можете не подключать первый файл, если вам не нужна автоматическая сборка слайдера из картинок.

Первым подключается slider-constructor.js, затем slider.js

В файле slider-constructor.js вы можете установить настройки для всех собираемых
слайдеров:

   - settings.full - установите значение 'true', чтобы слайдер работал в широкоформатном режиме (при наличии в нем 3 и более картинок);
   - settings.counter - установите значение 'true', чтобы включить счетчик слайдов;
   - settings.speed = длительность анимации перемещения картинок в милисекундах;

Кроме того, если вы добавите картинкам, из которых строится слайдер атрибут title,
то значение этого атрибута будет использовано как подпись к изображению в слайде. 

Сам слайдер имеет аналогичные настроки, которые задаются через атрибуты data- в
теге .slider:

  - data-speed="" - скорость слайдера, значение по умолчанию: 500
  - data-full="" - любое установленное значение включает широкий формат слайдера значение по умолчанию: false
  - data-counter="" - любое установленное значение включает счетчик слайдов, значение по умолчанию: false
  - data-auto="число" - параметр с установленным числом включает автоскролл со скоростью смены слайдов, равной "число" милисекунд

Ограничения:
  - Если картинка 1 - слайдер не работает
  - Если картинок 2, то не доступен широкий режим
