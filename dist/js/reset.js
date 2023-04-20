   /*字体的根元素适配*/
   (function (doc, win) {
       var docEle = doc.documentElement;
       var resizeEvt = 'orientationchange' in win ? 'orientationchange' : 'resize';
       var recalc = function () {
           var clientWidth = docEle.clientWidth;
           if (!clientWidth)
               return;
           if (clientWidth >= 1920) {
               docEle.style.fontSize = '100px';
           } else if (clientWidth <= 1200) {
               docEle.style.fontSize = '60px';
           } else {
               docEle.style.fontSize = 100 * (clientWidth / 1920) + 'px';
           }
       };
       if (!doc.addEventListener)
           return;
       win.addEventListener(resizeEvt, recalc, false);
       doc.addEventListener('DOMContentLoaded', recalc, false);
   })(document, window);