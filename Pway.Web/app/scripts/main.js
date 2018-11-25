var items = ['you', 'game-idea', 'create-game-demo', 'game-production', 'profit-share'];


$(function () {

    $(document).scroll(function () {
        var $nav = $(".navbar");
        $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
    });

});