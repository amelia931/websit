window.onload = function () {
    let currentNum = 1;
    var mainSwiper = new Swiper('.swiper-container', {
        direction: 'vertical',
        loop: true,
        speed: 100,
        effect: 'coverflow',
        pagination: {
            el: '.aside-list',
            clickable: true,
            type: 'custom',
            renderCustom: function (swiper, current, total) {
                currentNum = current;
                if (current == 1) {
                    $('header').removeClass('black');
                    $('header').removeClass('white-bg');
                    $('.aside li').css('background-color', 'rgba(255, 255, 255, 0.2)')
                } else {
                    $('header').addClass('black');
                    $('header').addClass('white-bg');
                    $('.aside li').css('background-color', 'rgba(0, 0, 0, 0.2)')
                }
                $('.aside-list').children().eq(current - 1).addClass('active').siblings().removeClass('active');
                $('.aside-list').on('click', 'li', function () {
                    mainSwiper.slideToLoop($(this).index(), 1000, false)
                })
            }
        }
    });
    window.onresize = () => {
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

    function download() {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {
            $('.dialog').toggle()
            setTimeout(() => {
                $('.dialog').toggle()
            }, 2000)
        } else {
            var u = navigator.userAgent;
            var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
            var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
            if (isiOS) {
                return
            } else if (isAndroid) {
                window.location.href = 'https://static.scmingrizhixing.cn/tm_planet.apk'
            }
        }

    };

    $('.download-btn').click(download);
    $('.down-span').click(download);

    getUserAgent()

    function getUserAgent() {
        var u = navigator.userAgent;
        var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
        if (isiOS) {
            $('.goIosStore').show()
        } else if (isAndroid) {
            $('.goIosStore').hide()
        }
    }

    $('.navBtn').click(() => {
        $('.navMask').toggle();
        $('.navBtn span').toggleClass('active');
        if (currentNum != 1) {
            $('header').toggleClass('black');
            $('header').toggleClass('white-bg')
        }
    })
}