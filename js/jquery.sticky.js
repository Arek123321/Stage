// Sticky Plugin v1.0.3 for jQuery
// =============
// Author: Anthony Garand
// Improvements by German M. Bravo (Kronuz) and Ruud Kamphuis (ruudk)
// Improvements by Leonardo C. Daronco (daronco)
// Created: 02/14/2011
// Date: 07/20/2015
// Website: http://stickyjs.com/
// Description: Makes an element on the page stick on the screen as you scroll
//              It will only set the 'top' and 'position' of your element, you
//              might need to adjust the width in some cases.

(function($) {
    var slice = Array.prototype.slice; // save ref to original slice()
    var splice = Array.prototype.splice; // save ref to original slice()

  var defaults = {
      topSpacing: 0,
      bottomSpacing: 0,
      className: 'is-sticky',
      wrapperClassName: 'sticky-wrapper',
      center: false,
      getWidthFrom: '',
      widthFromWrapper: true, // works only when .getWidthFrom is empty
      responsiveWidth: false
    },
    $window = $(window),
    $document = $(document),
    sticked = [],
    windowHeight = $window.height(),
    scroller = function() {
      var scrollTop = $window.scrollTop(),
        documentHeight = $document.height(),
        dwh = documentHeight - windowHeight,
        extra = (scrollTop > dwh) ? dwh - scrollTop : 0;

      for (var i = 0; i < sticked.length; i++) {
        var s = sticked[i],
          elementTop = s.stickyWrapper.offset().top,
          etse = elementTop - s.topSpacing - extra;

    //update height in case of dynamic content
    s.stickyWrapper.css('height', s.stickyElement.outerHeight());

        if (scrollTop <= etse) {
          if (s.currentTop !== null) {
            s.stickyElement
              .css({
                'width': '',
                'position': '',
                'top': ''
              });
            s.stickyElement.parent().removeClass(s.className);
            s.stickyElement.trigger('sticky-end', [s]);
            s.currentTop = null;
          }
        }
        else {
          var newTop = documentHeight - s.stickyElement.outerHeight()
            - s.topSpacing - s.bottomSpacing - scrollTop - extra;
          if (newTop < 0) {
            newTop = newTop + s.topSpacing;
          } else {
            newTop = s.topSpacing;
          }
          if (s.currentTop != newTop) {
            var newWidth;
            if (s.getWidthFrom) {
                newWidth = $(s.getWidthFrom).width() || null;
            } else if (s.widthFromWrapper) {
                newWidth = s.stickyWrapper.width();
            }
            if (newWidth == null) {
                newWidth = s.stickyElement.width();
            }
            s.stickyElement
              .css('width', newWidth)
              .css('position', 'fixed')
              .css('top', newTop);

            s.stickyElement.parent().addClass(s.className);

            if (s.currentTop === null) {
              s.stickyElement.trigger('sticky-start', [s]);
            } else {
              // sticky is started but it have to be repositioned
              s.stickyElement.trigger('sticky-update', [s]);
            }

            if (s.currentTop === s.topSpacing && s.currentTop > newTop || s.currentTop === null && newTop < s.topSpacing) {
              // just reached bottom || just started to stick but bottom is already reached
              s.stickyElement.trigger('sticky-bottom-reached', [s]);
            } else if(s.currentTop !== null && newTop === s.topSpacing && s.currentTop < newTop) {
              // sticky is started && sticked at topSpacing && overflowing from top just finished
              s.stickyElement.trigger('sticky-bottom-unreached', [s]);
            }

            s.currentTop = newTop;
          }
        }
      }
    },
    resizer = function() {
      windowHeight = $window.height();

      for (var i = 0; i < sticked.length; i++) {
        var s = sticked[i];
        var newWidth = null;
        if (s.getWidthFrom) {
            if (s.responsiveWidth === true) {
                newWidth = $(s.getWidthFrom).width();
            }
        } else if(s.widthFromWrapper) {
            newWidth = s.stickyWrapper.width();
        }
        if (newWidth != null) {
            s.stickyElement.css('width', newWidth);
        }
      }
    },
    methods = {
      init: function(options) {
        var o = $.extend({}, defaults, options);
        return this.each(function() {
          var stickyElement = $(this);

          var stickyId = stickyElement.attr('id');
          var stickyHeight = stickyElement.outerHeight();
          var wrapperId = stickyId ? stickyId + '-' + defaults.wrapperClassName : defaults.wrapperClassName
          var wrapper = $('<div></div>')
            .attr('id', wrapperId)
            .addClass(o.wrapperClassName);

          stickyElement.wrapAll(wrapper);

          var stickyWrapper = stickyElement.parent();

          if (o.center) {
            stickyWrapper.css({width:stickyElement.outerWidth(),marginLeft:"auto",marginRight:"auto"});
          }

          if (stickyElement.css("float") == "right") {
            stickyElement.css({"float":"none"}).parent().css({"float":"right"});
          }

          stickyWrapper.css('height', stickyHeight);

          o.stickyElement = stickyElement;
          o.stickyWrapper = stickyWrapper;
          o.currentTop    = null;

          sticked.push(o);
        });
      },
      update: scroller,
      unstick: function(options) {
        return this.each(function() {
          var that = this;
          var unstickyElement = $(that);

          var removeIdx = -1;
          var i = sticked.length;
          while (i-- > 0) {
            if (sticked[i].stickyElement.get(0) === that) {
                splice.call(sticked,i,1);
                removeIdx = i;
            }
          }
          if(removeIdx != -1) {
            unstickyElement.unwrap();
            unstickyElement
              .css({
                'width': '',
                'position': '',
                'top': '',
                'float': ''
              })
            ;
          }
        });
      }
    };

  // should be more efficient than using $window.scroll(scroller) and $window.resize(resizer):
  if (window.addEventListener) {
    window.addEventListener('scroll', scroller, false);
    window.addEventListener('resize', resizer, false);
  } else if (window.attachEvent) {
    window.attachEvent('onscroll', scroller);
    window.attachEvent('onresize', resizer);
  }

  $.fn.sticky = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.sticky');
    }
  };

  $.fn.unstick = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method ) {
      return methods.unstick.apply( this, arguments );
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.sticky');
    }
  };
  $(function() {
    setTimeout(scroller, 0);
  });
})(jQuery);

$(document).ready(function(){
      $(".navbar").sticky({topSpacing:0});
    });

    document.querySelectorAll('.carousel-item.first-carousel').forEach(item => {
      item.addEventListener('click', () => {
          window.location.href = 'projet.html';
      });
  });
  
  document.querySelectorAll('.carousel-item.second-carousel').forEach(item => {
      item.addEventListener('click', () => {
          window.location.href = 'meble.html';
      });
  });
  

  document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('.carousel-item').forEach(item => {
      const caption = document.createElement('div');
      caption.classList.add("custom-caption"); // Zastosuj tę samą klasę dla wszystkich wersji językowych
  
      // Ustawienie stylów dla tekstowego napisu (przykładowe, dostosuj według potrzeb)
      caption.style.position = "absolute";
      caption.style.top = "50%";
      caption.style.left = "50%";
      caption.style.transform = "translate(-50%, -50%)";
      caption.style.color = "white";
      caption.style.fontSize = "40px";
      caption.style.fontWeight = "bold";
      caption.style.textAlign = "center";
      caption.style.pointerEvents = "none";
      
      // Sprawdzenie ścieżki URL, aby ustawić odpowiedni tekst
      if(window.location.pathname.endsWith('indexpl.html') || window.location.pathname.endsWith('projectpl.html')) {
        caption.innerHTML = "Zobacz więcej"; // Tekst po polsku
      } else if(window.location.pathname.endsWith('indexen.html')) {
        caption.innerHTML = "See more"; // Tekst po angielsku
      } else {
        caption.innerHTML = "Voir plus"; // Domyślny tekst po francusku
      }
  
      // Dodaj napis do każdego elementu .carousel-item
      item.appendChild(caption);
  
      // Pokaż i ukryj tekst na zdarzenia myszy
      item.addEventListener('mouseenter', () => {
        caption.style.display = "block";
      });
      item.addEventListener('mouseleave', () => {
        caption.style.display = "none";
      });
    });
  });

  document.addEventListener("DOMContentLoaded", function() {
    const projectItems = document.querySelectorAll('.my-projects .project-item');
    const captions = ["CUISINE", "SALLE DE BAIN", "BIBLIOTHEQUE", "AUTRES"];

    

    projectItems.forEach((item, index) => {
        // Tworzenie i dodawanie napisu do elementu
        const caption = document.createElement('div');
        caption.textContent = captions[index];
        caption.style.position = 'absolute';
        caption.style.top = '50%';
        caption.style.left = '50%';
        caption.style.transform = 'translate(-50%, -50%)';
        caption.style.color = 'white';
        caption.style.fontSize = '40px';
        caption.style.fontWeight = 'bold';
        caption.style.textAlign = 'center';
        item.style.position = 'relative';
        item.style.display = 'flex';
        item.style.justifyContent = 'center';
        item.style.alignItems = 'center';
        item.appendChild(caption);

        // Dodawanie zachowania powiększania i oddalania
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'scale(1.05)';
            item.style.transition = 'transform .3s ease-in-out';
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'scale(1)';
            item.style.transition = 'transform .3s ease-in-out';
        });
    });
});
document.addEventListener("DOMContentLoaded", function() {
  const projectItems = document.querySelectorAll('.my-projects1 .project-item1');
  const captions = ["MEUBLES", "DÉCOUPAGE "];

  projectItems.forEach((item, index) => {
      // Tworzenie i dodawanie napisu do elementu
      const caption = document.createElement('div');
      caption.textContent = captions[index];
      caption.style.position = 'absolute';
      caption.style.top = '50%';
      caption.style.left = '50%';
      caption.style.transform = 'translate(-50%, -50%)';
      caption.style.color = 'white';
      caption.style.fontSize = '40px';
      caption.style.fontWeight = 'bold';
      caption.style.textAlign = 'center';
      item.style.position = 'relative';
      item.style.display = 'flex';
      item.style.justifyContent = 'center';
      item.style.alignItems = 'center';
      item.appendChild(caption);

      // Dodawanie zachowania powiększania i oddalania
      item.addEventListener('mouseenter', () => {
          item.style.transform = 'scale(1.05)';
          item.style.transition = 'transform .3s ease-in-out';
      });

      item.addEventListener('mouseleave', () => {
          item.style.transform = 'scale(1)';
          item.style.transition = 'transform .3s ease-in-out';
      });
  });
});


document.querySelectorAll('.my-project-item').forEach((item, index) => {
  item.addEventListener('click', () => {
    switch (index) {
      case 0:
        window.location.href = 'cuisine.html'; // Adres URL dla projektu 1
        break;
      case 1:
        window.location.href = 'salle_de_bain.html'; // Adres URL dla projektu 2
        break;
      case 2:
        window.location.href = 'bibliotheque.html'; // Adres URL dla projektu 3
        break;
      case 3:
        window.location.href = 'autres.html'; // Adres URL dla projektu 4
        break;
    }
  });
});
document.querySelectorAll('.my-project-item1').forEach((item, index) => {
  item.addEventListener('click', () => {
    switch (index) {
      case 0:
        window.location.href = 'services.html'; // Adres URL dla projektu 1
        break;
      case 1:
        window.location.href = 'decoupage.html'; // Adres URL dla projektu 2
        break;
      
    }
  });
});


function openModal() {
  document.getElementById('myModal').style.display = "block";
}

function closeModal() {
  document.getElementById('myModal').style.display = "none";
}

var slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  slides[slideIndex-1].style.display = "block";
}



$(document).ready(function () {
  $('.navbar .nav-item.dropdown').hover(function () {
      $(this).find('.dropdown-menu').first().stop(true, true).slideDown(150);
  }, function () {
      $(this).find('.dropdown-menu').first().stop(true, true).slideUp(100);
  });
});




