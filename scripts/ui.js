'use strict';

const btnSun = document.querySelector('.btn-sun');
const btnAbout = document.querySelector('.btn-about');
const footer = document.querySelector('footer');
const btnMoon = document.querySelector('.btn-moon');

// ativa o modo escuro
btnMoon.addEventListener('click', function (e) {
  document.documentElement.setAttribute("data-theme", "dark");
  this.disable = true;
  this.style.display = 'none';
  btnSun.style.display = 'grid';
});

// ativa o modo claro
btnSun.addEventListener('click', function (e) {
  document.documentElement.setAttribute("data-theme", "light");
  this.disable = true;
  this.style.display = 'none';
  btnMoon.style.display = 'grid';
});

// desce a página para o footer
btnAbout.addEventListener('click', function (e) {
  footer.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
})
