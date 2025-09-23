// MODEL
const model = document.getElementById("model");
const sections = Array.from(document.querySelectorAll("main, footer"));

const shiftPositions = [0, 0, 0, -5];
const shiftPositionsY = [0, -5, -23, -15];
const shiftScale = [1, 1.25, 0.8, 0.5];
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

const updateModel = (scrollY) => {
    const scrollProgess = getScrollProgress(scrollY);
    const sectionIndex = Math.floor(scrollProgess);
    const sectionProgress = scrollProgess - sectionIndex;

    const currentShift = interpolate(
        shiftPositions[sectionIndex],
        shiftPositions[sectionIndex + 1] ?? shiftPositions[sectionIndex],
        sectionProgress
    );

    const currentShiftY = interpolate(
        shiftPositionsY[sectionIndex],
        shiftPositionsY[sectionIndex + 1] ?? shiftPositionsY[sectionIndex],
        sectionProgress
    );

    const currentScale = interpolate(
        shiftScale[sectionIndex],
        shiftScale[sectionIndex + 1] ?? shiftScale[sectionIndex],
        sectionProgress
    );

    const currentOrbit = cameraOrbits[sectionIndex].map((val, i) =>
        interpolate(val, cameraOrbits[sectionIndex + 1]?.[i] ?? val, sectionProgress)
    );
    
    model.style.transform = `translateX(${currentShift}%) translateY(${currentShiftY}%) scale(${currentScale})`;
    model.setAttribute("camera-orbit", `${currentOrbit[0]}deg ${currentOrbit[1]}deg`);
};

// SCROLL
let isScrolling = false;
let scrollTimeout;
let currentSectionIndex = 0;
const scrollThreshold = 30;

const getCurrentSectionIndex = scrollY => {
    for (let i = 0; i < sections.length; i++) {
        const sectionTop = sectionOffsets[i];
        const sectionBottom = sectionOffsets[i + 1] || document.body.scrollHeight;
        
        if (scrollY >= sectionTop - window.innerHeight / 2 && scrollY < sectionBottom - window.innerHeight / 2) {
            return i;
        }
    }
    return Math.min(Math.max(Math.round(scrollY / window.innerHeight), 0), lastSectionIndex);
};

const snapToSection = (targetIndex) => {
    if (targetIndex < 0 || targetIndex > lastSectionIndex) return;
    
    isScrolling = true;
    const targetOffset = sectionOffsets[targetIndex];
    
    window.scrollTo({
        top: targetOffset,
        behavior: 'smooth'
    });
    
    currentSectionIndex = targetIndex;
    
    setTimeout(() => {
        isScrolling = false;
    }, 1200);
};

let lastScrollY = window.scrollY;
let scrollDirection = 0;

window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    
    updateModel(currentScrollY);
    
    if (isScrolling) return;
    
    scrollDirection = currentScrollY > lastScrollY ? 1 : -1;
    lastScrollY = currentScrollY;
    
    clearTimeout(scrollTimeout);
    
    scrollTimeout = setTimeout(() => {
        const detectedSectionIndex = getCurrentSectionIndex(currentScrollY);
        const scrollDistance = Math.abs(currentScrollY - sectionOffsets[currentSectionIndex]);
        
        if (scrollDistance > scrollThreshold && detectedSectionIndex !== currentSectionIndex) {
            snapToSection(detectedSectionIndex);
        } else if (scrollDistance > scrollThreshold) {
            const targetIndex = currentSectionIndex + scrollDirection;
            snapToSection(targetIndex);
        }
    }, 150);
});

let wheelTimeout;
window.addEventListener("wheel", (e) => {
    if (isScrolling) {
        e.preventDefault();
        return;
    }
    
    clearTimeout(wheelTimeout);
    
    wheelTimeout = setTimeout(() => {
        const delta = e.deltaY;
        const targetIndex = delta > 0 ? 
            Math.min(currentSectionIndex + 1, lastSectionIndex) : 
            Math.max(currentSectionIndex - 1, 0);
        
        if (Math.abs(delta) > 10 && targetIndex !== currentSectionIndex) {
            snapToSection(targetIndex);
        }
    }, 100);
}, { passive: false });

window.addEventListener("load", () => {
    currentSectionIndex = getCurrentSectionIndex(window.scrollY);
});