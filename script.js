const hamMenu = document.querySelector('nav');

const icon = document.querySelector('.icon');

const offScreenMenu = document.querySelector('.navOpen');

hamMenu.addEventListener('click', () => {
    icon.classList.toggle('active');
    offScreenMenu.classList.toggle('active');
})