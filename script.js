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

document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('a.fade-link');

  links.forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      e.preventDefault();
      document.body.classList.add('fade-out');

      setTimeout(() => {
        window.location.href = href;
      }, 500); // match transition duration
    });
  });
});