//jquery-click-scroll
//by syamsul'isul' Arifin

$(document).ready(function(){
    // Pobierz aktualny URL strony
    var currentUrl = window.location.href;

    // Sprawdź każdy link w pasku nawigacyjnym
    $('.navbar-nav .nav-item .nav-link').each(function(){
        var linkUrl = $(this).attr('href');

        // Jeżeli URL linku zgadza się z aktualnym URL
        if(currentUrl.indexOf(linkUrl) !== -1){
            // Dodaj klasę "active" i usuń "inactive" dla odpowiedniego linku
            $(this).addClass('active').removeClass('inactive');
        } else {
            // Dodaj klasę "inactive" i usuń "active" dla pozostałych linków
            $(this).addClass('inactive').removeClass('active');
        }
    });

    // Dodaj obsługę kliknięcia na linki
    $('.navbar-nav .nav-item .nav-link').on('click', function(){
        // Usuń klasę "active" ze wszystkich linków
        $('.navbar-nav .nav-item .nav-link').removeClass('active');
        // Dodaj klasę "active" do klikniętego linku
        $(this).addClass('active');
    });
});
