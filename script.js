const hamMenu = document.querySelector('nav');
const icon = document.querySelector('.icon');
const offScreenMenu = document.querySelector('.navOpen');
const header = document.querySelector('header');

hamMenu.addEventListener('click', () => {
    icon.classList.toggle('active');
    offScreenMenu.classList.toggle('active');
    header.classList.toggle('active');
})