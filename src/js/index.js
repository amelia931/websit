window.onload = function () {

    $('header li:first-child').addClass('header-line');

    let index = 0;

    let mainSwiper = new Swiper('.swiper-container', {
        direction: 'vertical',
        loop: true,
        speed: 10,
        pagination: {
            el: '.aside-list',
            clickable: true,
            type: 'custom',
            renderCustom: function (swiper, current, total) {
                if (current == 1) {
                    $('header ul').addClass('current1')
                    $('header li:first-child').addClass('header-line').removeClass('header-line-black')
                } else {
                    $('header ul').removeClass('current1')
                    $('header li:first-child').addClass('header-line-black').removeClass('header-line')
                }
                $('.aside-list').children().eq(current - 1).addClass('active').siblings().removeClass('active');
                $('.aside-list').on('click', 'li', function () {
                    index = $(this).index()
                    mainSwiper.slideToLoop($(this).index(), 1000, false)
                })
            }
        }
    });

    window.onresize = function () {
        resize()
    };

    function resize() {
        let winw = document.documentElement.clientWidth;
        let winh = document.documentElement.clientHeight;
        $('.box').css({
            'with': winw + 'px',
            'height': winh + 'px'
        })
    };

    let flag = true;
    let timer = null;
    $(document).on('mousewheel DOMMouseScroll', onMouseScroll);

    function onMouseScroll(e) {
        let wheel = e.originalEvent.wheelDelta || -e.originalEvent.detail;
        let delta = Math.max(-1, Math.min(1, wheel));
        if (flag) {
            flag = false;
            clearTimeout(timer);
            timer = setTimeout(function () {
                if (delta < 0) {
                    index++;
                    if (index > 3) {
                        index = 0
                    };
                    mainSwiper.slideToLoop(index, 1000, false)
                } else {
                    index--;
                    if (index < 0) {
                        index = 3
                    };
                    mainSwiper.slideToLoop(index, 1000, false)
                };
                flag = true
            }, 700)
        }
    }

}