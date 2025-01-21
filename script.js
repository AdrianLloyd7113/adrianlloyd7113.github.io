window.onscroll = function() {stickyNavBar()};

var navbar = document.getElementById("navbar");

var sticky = navbar.offsetTop;

function stickyNavBar() {
  if (window.scrollY >= sticky) {
    navbar.classList.add("sticky")
  } else {
    navbar.classList.remove("sticky");
  }
}
