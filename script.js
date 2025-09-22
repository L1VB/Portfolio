const model = document.getElementById("model");
const sections = Array.from(document.querySelectorAll("main"));

const shiftPositions = [0, -20, 0, 25];
const cameraOrbits = [[45, 45], [-180, 90], [90, 0], [0, 90]];

const sectionOffsets = sections.map(section => section.offsetTop);
const lastSectionIndex = sections.length - 1;

const interpolate = (start, end, progress) => start + (end - start) * progress;

const getScrollProgress = scrollY => {
    for (let i = 0; i < lastSectionIndex; i++) {
        if (scrollY >= sectionOffsets[i] && scrollY < sectionOffsets[i + 1]) {
            return i + (scrollY - sectionOffsets[i]) / (sectionOffsets[i + 1] - sectionOffsets[i]);
        }
    }

    return lastSectionIndex;
};

window.addEventListener("scroll", () => {
    const scrollProgess = getScrollProgress(window.scrollY);
    const sectionIndex = Math.floor(scrollProgess);
    const sectionProgress = scrollProgess - sectionIndex;

    const currentShift = interpolate(
        shiftPositions[sectionIndex],
        shiftPositions[sectionIndex + 1] ?? shiftPositions[sectionIndex],
        sectionProgress
    );

    const currentOrbit = cameraOrbits[sectionIndex].map((val, i) =>
        interpolate(val, cameraOrbits[sectionIndex + 1]?.[i] ?? val, sectionProgress)
    );
    
    model.style.transform = `translateX(${currentShift}%)`;
    model.setAttribute("camera-orbit", `${currentOrbit[0]}deg ${currentOrbit[1]}deg`);
});


// nav toggle
const hamMenu = document.querySelector('nav');
const icon = document.querySelector('.icon');
const offScreenMenu = document.querySelector('.navOpen');
const header = document.querySelector('header');

hamMenu.addEventListener('click', () => {
    icon.classList.toggle('active');
    offScreenMenu.classList.toggle('active');
    header.classList.toggle('active');
})