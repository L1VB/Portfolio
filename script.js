// MODEL
const model = document.getElementById("model");
const sections = Array.from(document.querySelectorAll("main, footer"));

const shiftPositions = [0, 0, 0, -5];
const shiftPositionsY = [0, -5, -23, 30];
const shiftScale = [1, 1.25, 0.8, 0.5];
const cameraOrbits = [[45, 45], [-180, 90], [90, 0], [0, 90]];

const lastSectionIndex = sections.length - 1;

// Function to get current section offsets (recalculated dynamically)
const getCurrentSectionOffsets = () => sections.map(section => section.offsetTop);

const interpolate = (start, end, progress) => start + (end - start) * progress;

const getScrollProgress = (scrollY, sectionOffsets) => {
    for (let i = 0; i < lastSectionIndex; i++) {
        if (scrollY >= sectionOffsets[i] && scrollY < sectionOffsets[i + 1]) {
            return i + (scrollY - sectionOffsets[i]) / (sectionOffsets[i + 1] - sectionOffsets[i]);
        }
    }
    return lastSectionIndex;
};

const updateModel = (scrollY) => {
    const currentSectionOffsets = getCurrentSectionOffsets(); // Recalculate each time
    const scrollProgess = getScrollProgress(scrollY, currentSectionOffsets);
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

const getCurrentSectionIndex = (scrollY) => {
    const currentSectionOffsets = getCurrentSectionOffsets(); // Recalculate offsets
    
    for (let i = 0; i < sections.length; i++) {
        const sectionTop = currentSectionOffsets[i];
        const sectionBottom = currentSectionOffsets[i + 1] || document.body.scrollHeight;
        
        // Use a more forgiving calculation for section detection
        const tolerance = window.innerHeight * 0.3; // 30% of viewport height tolerance
        
        if (scrollY >= sectionTop - tolerance && scrollY < sectionBottom - tolerance) {
            return i;
        }
    }
    
    // Fallback: find closest section
    let closestIndex = 0;
    let closestDistance = Math.abs(scrollY - currentSectionOffsets[0]);
    
    for (let i = 1; i < currentSectionOffsets.length; i++) {
        const distance = Math.abs(scrollY - currentSectionOffsets[i]);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = i;
        }
    }
    
    return Math.min(Math.max(closestIndex, 0), lastSectionIndex);
};

const snapToSection = (targetIndex) => {
    if (targetIndex < 0 || targetIndex > lastSectionIndex) return;
    
    isScrolling = true;
    const currentSectionOffsets = getCurrentSectionOffsets(); // Get fresh offsets
    const targetOffset = currentSectionOffsets[targetIndex];
    
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

// Debounced resize handler to recalculate on viewport changes
let resizeTimeout;
const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Recalculate current section after resize
        const currentScrollY = window.scrollY;
        currentSectionIndex = getCurrentSectionIndex(currentScrollY);
    }, 150);
};

window.addEventListener("resize", handleResize);
window.addEventListener("orientationchange", handleResize);

window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    
    updateModel(currentScrollY);
    
    if (isScrolling) return;
    
    scrollDirection = currentScrollY > lastScrollY ? 1 : -1;
    lastScrollY = currentScrollY;
    
    clearTimeout(scrollTimeout);
    
    scrollTimeout = setTimeout(() => {
        const currentSectionOffsets = getCurrentSectionOffsets(); // Fresh offsets
        const detectedSectionIndex = getCurrentSectionIndex(currentScrollY);
        const scrollDistance = Math.abs(currentScrollY - currentSectionOffsets[currentSectionIndex]);
        
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
    // Wait a bit for dvh to stabilize, then initialize
    setTimeout(() => {
        currentSectionIndex = getCurrentSectionIndex(window.scrollY);
    }, 100);
});