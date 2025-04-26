document.addEventListener('DOMContentLoaded', () => {
    // --- Get DOM Elements ---
    const logDateInput = document.getElementById('log-date');
    const logFeelings = document.getElementById('log-feelings');
    const logPlace = document.getElementById('log-place');
    const logFood = document.getElementById('log-food');
    const ratingContainer = document.getElementById('log-rating');
    const ratingStars = ratingContainer.querySelectorAll('i');
    const ratingValueInput = document.getElementById('rating-value');
    const saveButton = document.getElementById('save-button');
    const saveStatus = document.getElementById('save-status');
    const loadStatus = document.getElementById('load-status');

    const STORAGE_PREFIX = "dailyLog_"; // Prefix for localStorage keys

    // --- Star Rating Logic ---
    function updateStarRating(value) {
        const rating = parseInt(value) || 0; // Ensure it's a number, default 0
        ratingValueInput.value = rating;
        ratingStars.forEach(star => {
            const starValue = parseInt(star.getAttribute('data-value'));
            if (starValue <= rating) {
                star.classList.remove('fa-regular');
                star.classList.add('fa-solid', 'selected'); // Use solid icon
            } else {
                star.classList.remove('fa-solid', 'selected');
                star.classList.add('fa-regular'); // Use regular icon
            }
        });
    }

    ratingStars.forEach(star => {
        // --- Hover effects ---
        star.addEventListener('mouseover', () => {
            const hoverValue = parseInt(star.getAttribute('data-value'));
            ratingStars.forEach((s, index) => {
                 if (index < hoverValue) { // Apply hover class up to the hovered star
                     s.classList.add('hover');
                 } else {
                     s.classList.remove('hover');
                 }
            });
             // Ensure selected stays filled during hover
             ratingStars.forEach(s => {
                 if(s.classList.contains('selected')) {
                     s.classList.remove('hover'); // remove hover if selected
                 } else {
                      // if not selected, allow hover to make it yellow
                      if(parseInt(s.getAttribute('data-value')) <= hoverValue) {
                          s.classList.add('hover')
                      }
                 }
             })
        });
        star.addEventListener('mouseout', () => {
             ratingStars.forEach(s => s.classList.remove('hover'));
        });
        // --- Click to select ---
        star.addEventListener('click', () => {
            const clickedValue = parseInt(star.getAttribute('data-value'));
            updateStarRating(clickedValue);
        });
    });

    // --- Data Collection ---
    function collectFormData() {
        return {
            // date is handled by the key, but can include if needed
            feelings: logFeelings.value.trim(),
            place: logPlace.value.trim(),
            food: logFood.value.trim(),
            rating: parseInt(ratingValueInput.value) || 0,
            lastUpdated: new Date().toISOString()
        };
    }

     // --- Clear Form Fields ---
    function clearForm() {
        logFeelings.value = '';
        logPlace.value = '';
        logFood.value = '';
        updateStarRating(0); // Reset stars
        saveStatus.textContent = ''; // Clear save status too
    }


    // --- Load Data from Local Storage ---
    function loadDataForDate(dateString) {
        if (!dateString) {
            loadStatus.textContent = 'Please select a date.';
            clearForm();
            return;
        }
        const key = STORAGE_PREFIX + dateString;
        loadStatus.textContent = 'Loading...';
        saveStatus.textContent = ''; // Clear save status on load

        try {
            const storedData = localStorage.getItem(key);
            if (storedData) {
                const data = JSON.parse(storedData);
                logFeelings.value = data.feelings || '';
                logPlace.value = data.place || '';
                logFood.value = data.food || '';
                updateStarRating(data.rating || 0);
                loadStatus.textContent = `Entry loaded (Last saved: ${data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'N/A'})`;
            } else {
                clearForm(); // Clear form if no data found for this date
                loadStatus.textContent = 'No entry found for this date. Create one!';
            }
        } catch (error) {
            console.error("Error loading data from localStorage:", error);
            loadStatus.textContent = 'Error loading entry.';
            clearForm(); // Clear form on error
        }
    }

    // --- Save Data to Local Storage ---
    function saveDataForDate() {
        const dateString = logDateInput.value;
        if (!dateString) {
            saveStatus.textContent = 'Please select a date before saving.';
            return; // Don't save without a date
        }

        const key = STORAGE_PREFIX + dateString;
        const currentData = collectFormData();
        saveStatus.textContent = 'Saving...';

        try {
            localStorage.setItem(key, JSON.stringify(currentData));
            // Use setTimeout to make the "Saved" message more noticeable
            setTimeout(() => {
                 saveStatus.textContent = `Entry saved for ${dateString} at ${new Date().toLocaleTimeString()}`;
                 loadStatus.textContent = ''; // Clear loading status after save
             }, 300); // Short delay

        } catch (error) {
            console.error("Error saving data to localStorage:", error);
            // Handle potential storage errors (like quota exceeded)
            if (error.name === 'QuotaExceededError') {
                 saveStatus.textContent = 'Error: Storage limit reached. Cannot save.';
            } else {
                 saveStatus.textContent = 'Error saving entry.';
            }
        }
    }

    // --- Event Listeners ---
    // Load data when the date changes
    logDateInput.addEventListener('change', () => {
        loadDataForDate(logDateInput.value);
    });

    // Save data when the button is clicked
    saveButton.addEventListener('click', saveDataForDate);

    // --- Initial Setup ---
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    logDateInput.value = today;

    // Load data for the initial date (today)
    loadDataForDate(today);

});
