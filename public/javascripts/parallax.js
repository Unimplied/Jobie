// Gyro parallax (Not working)
// isMobile = false;
// const strength = 0.2;
// const parallaxBox = document.querySelector("body");

// if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
//  isMobile = true;
// }

// if( isMobile ){
// function parallaxMove (parallaxContainer, x, y, boxWidth, boxHeight) {
//   $(parallaxContainer).find('.parallax-layer').each(function() {
//     var depth = $(this).data('depth');
//     var moveX = ((boxWidth / 2) - x) * (strength * depth);
//     var moveY = ((boxHeight / 2) - y) * (strength * depth);

//     $(this).css({transform: "translate3d(" + moveX + "px, " + moveY + "px, 0)"});
//     //$(this).removeClass('is-out');
//   });
// }

// function resetParallaxPosition (parallaxContainer) {
//   $(parallaxContainer).find('.parallax-layer').each(function() {
//     $(this).css({ transform: "translate3d( 0, 0, 0 )"});
//     //$(this).addClass('is-out');
//   });
//   event.stopPropagation();
// }
// } else {
if(window.innerWidth > 1242){ //display parallax only if on non-mobile displays
    (function() {
        // Add event listener for mouse movement
        document.addEventListener("mousemove", parallax);
        const elem = document.querySelector("body");
        // Parallax scrolling calculations
        function parallax(e) {
            let _w = window.innerWidth/2;
            let _h = window.innerHeight/2;
            let _mouseX = e.clientX;
            let _mouseY = e.clientY;
            let _depth1 = `${50 - (_mouseX - _w) * 0.01}% ${50 - (_mouseY - _h) * 0.01}%`;
            let x = `${_depth1}`;
            console.log(x);
            elem.style.backgroundPosition = x;
        }

    })()
};