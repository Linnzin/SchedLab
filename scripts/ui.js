'use strict';

const btnSun = document.querySelector('.btn-sun');
const btnAbout = document.querySelector('.btn-about');
const footer = document.querySelector('footer');
const btnMoon = document.querySelector('.btn-moon');

const themes = {
  "dark": darkTheme,
  "light": lightTheme
}

function changeTheme(themeFunc) { themeFunc() };

// função: ativa o modo escuro
function darkTheme() {
  document.documentElement.setAttribute("data-theme", "dark");
  btnMoon.style.display = 'none';
  btnSun.style.display = 'grid';
  sessionStorage.setItem("theme", "dark");
}

// função: ativa o modo claro
function lightTheme() {
  document.documentElement.setAttribute("data-theme", "light");
  btnSun.style.display = 'none';
  btnMoon.style.display = 'grid';
  sessionStorage.setItem("theme", "light");
}

// evento: botão modo escuro
btnMoon.addEventListener('click', function (e) {
  darkTheme();
});

// evento: botão modo claro
btnSun.addEventListener('click', function (e) {
  lightTheme();
});

// evento: desce a página para o footer
btnAbout.addEventListener('click', function (e) {
  footer.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
})
