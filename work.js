// Add this to your script.js file (or merge with existing code)

// Show first slide and play video when details opens
document.querySelectorAll('details').forEach(details => {
    details.addEventListener('toggle', function() {
        const carousel = this.querySelector('.img-carousel');
        
        if (this.open && carousel) {
            // Set slide index to 1 for this carousel
            carousel.dataset.slideIndex = '1';
            
            const slides = carousel.querySelectorAll('.cover');
            slides.forEach((slide, index) => {
                if (index === 0) {
                    slide.style.display = 'block';
                    // Play video if first slide has one
                    const video = slide.querySelector('video');
                    if (video) {
                        video.currentTime = 0;
                        video.play().catch(err => {
                            console.log('Video autoplay failed:', err);
                        });
                    }
                } else {
                    slide.style.display = 'none';
                }
            });
        } else if (carousel) {
            // Pause all videos when details closes
            const videos = this.querySelectorAll('video');
            videos.forEach(video => {
                video.pause();
            });
        }
    });
});

// Setup individual carousel navigation for each card
document.querySelectorAll('.img-carousel').forEach(carousel => {
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            navigateSlides(carousel, -1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            navigateSlides(carousel, 1);
        });
    }
});

// Navigate slides for a specific carousel
function navigateSlides(carousel, direction) {
    const slides = carousel.querySelectorAll('.cover');
    if (slides.length === 0) return;
    
    // Get current index for THIS carousel
    let slideIndex = parseInt(carousel.dataset.slideIndex) || 1;
    
    // Update index
    slideIndex += direction;
    
    // Wrap around
    if (slideIndex > slides.length) { slideIndex = 1; }
    if (slideIndex < 1) { slideIndex = slides.length; }
    
    // Store updated index
    carousel.dataset.slideIndex = slideIndex.toString();
    
    // Hide all slides and pause videos
    slides.forEach(slide => {
        slide.style.display = 'none';
        const video = slide.querySelector('video');
        if (video) {
            video.pause();
        }
    });
    
    // Show current slide
    if (slides[slideIndex - 1]) {
        slides[slideIndex - 1].style.display = 'block';
        
        // Play video if current slide has one
        const video = slides[slideIndex - 1].querySelector('video');
        if (video) {
            video.currentTime = 0;
            video.play().catch(err => {
                console.log('Video play failed:', err);
            });
        }
    }
}

// Keep plusSlides function for backwards compatibility (if called elsewhere)
function plusSlides(n) {
    const openDetails = document.querySelector('details[open]');
    if (!openDetails) return;
    
    const carousel = openDetails.querySelector('.img-carousel');
    if (carousel) {
        navigateSlides(carousel, n);
    }
}

// Close details when clicking outside
document.addEventListener('click', function(e) {
    // Don't close if clicking on filter buttons or filter details
    const filterArea = e.target.closest('.filter-buttons') || e.target.closest('details .text');
    if (filterArea) return;
    
    // Check if click is outside any open details element (except the filter details)
    const openDetails = document.querySelectorAll('details[open]');
    
    openDetails.forEach(details => {
        // Skip if this is the filter details element
        const isFilterDetails = details.querySelector('.filter-buttons');
        if (isFilterDetails) return;
        
        // Check if the click is outside this details element
        if (!details.contains(e.target)) {
            details.open = false;
        }
    });
});