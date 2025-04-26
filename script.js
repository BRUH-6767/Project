document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const DEBOUNCE_DELAY = 1500; // ms (1.5 seconds) - wait time after inactivity to save

    // --- Get DOM Elements ---
    const logForm = document.getElementById('log-form');
    const logDate = document.getElementById('log-date');
    const logFeelings = document.getElementById('log-feelings');
    const logPlace = document.getElementById('log-place');
    const logFood = document.getElementById('log-food');
    const ratingContainer = document.getElementById('log-rating');
    const ratingStars = ratingContainer.querySelectorAll('i');
    const ratingValueInput = document.getElementById('rating-value');
    const saveStatus = document.getElementById('save-status');

    // --- Debounce Function ---
    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds.
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // --- Star Rating Logic ---
    function updateStarRating(value) {
        ratingValueInput.value = value; // Update hidden input
        ratingStars.forEach(star => {
            const starValue = parseInt(star.getAttribute('data-value'));
            if (starValue <= value) {
                star.classList.remove('fa-regular'); // Use regular (empty) icon class
                star.classList.add('fa-solid', 'selected'); // Use solid (filled) icon class
            } else {
                star.classList.remove('fa-solid', 'selected');
                star.classList.add('fa-regular');
            }
        });
    }

    ratingStars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const hoverValue = parseInt(star.getAttribute('data-value'));
            ratingStars.forEach(s => {
                 const sValue = parseInt(s.getAttribute('data-value'));
                 if (sValue <= hoverValue) {
                     s.classList.add('hover');
                 } else {
                     s.classList.remove('hover');
                 }
                 // Ensure selected state overrides hover visually if needed
                 if(s.classList.contains('selected')) {
                    s.classList.remove('hover');
                 }
            });
        });

        star.addEventListener('mouseout', () => {
             ratingStars.forEach(s => s.classList.remove('hover')); // Remove all hover classes on mouse out
        });

        star.addEventListener('click', () => {
            const clickedValue = parseInt(star.getAttribute('data-value'));
            updateStarRating(clickedValue);
            // Trigger save immediately after rating click (or use debounced version)
            debouncedSave();
        });
    });

    // --- Data Collection ---
    function collectFormData() {
        return {
            date: logDate.value,
            feelings: logFeelings.value.trim(),
            place: logPlace.value.trim(),
            food: logFood.value.trim(),
            rating: parseInt(ratingValueInput.value) || 0, // Get rating from hidden input
            lastUpdated: new Date().toISOString() // Add a timestamp
        };
    }

    // --- Simulate Saving Data ---
    // !! IMPORTANT !!
    // Replace this function with actual logic to send data to your backend/BaaS
    async function saveDataToServer(data) {
        console.log("Simulating save:", data);
        saveStatus.textContent = 'Saving...';

        // --- Replace this block ---
        // Example using fetch to send data to a hypothetical backend endpoint:
        /*
        try {
            const response = await fetch('/api/log-entry', { // Your backend URL
                method: 'POST', // or 'PUT' if updating an existing entry
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Save successful:', result);
            saveStatus.textContent = `Saved at ${new Date().toLocaleTimeString()}`;
            // Maybe store the entry ID returned from the server if needed
            // e.g., logForm.dataset.entryId = result.id;

        } catch (error) {
            console.error("Error saving data:", error);
            saveStatus.textContent = 'Error saving data!';
        }
        */

        // --- Simulation Placeholder ---
        return new Promise(resolve => {
            setTimeout(() => {
                console.log("Simulated save complete.");
                saveStatus.textContent = `Saved at ${new Date().toLocaleTimeString()}`;
                resolve({ success: true, savedData: data }); // Simulate successful response
            }, 800); // Simulate network delay
        });
        // --- End of Replaceable Block ---
    }


    // --- Auto-Save Trigger ---
    const handleAutoSave = () => {
        const currentData = collectFormData();
        // Optional: Add validation here if needed before saving
        if (!currentData.date) {
            // Maybe don't save if the date isn't set yet, or prompt user
            // console.log("Date not set, skipping auto-save for now.");
           // return;
        }
        saveDataToServer(currentData);
    };

    // Debounced version of the save handler
    const debouncedSave = debounce(handleAutoSave, DEBOUNCE_DELAY);

    // --- Attach Event Listeners ---
    // Listen for 'input' on text fields and date
    logDate.addEventListener('input', debouncedSave);
    logFeelings.addEventListener('input', debouncedSave);
    logPlace.addEventListener('input', debouncedSave);
    logFood.addEventListener('input', debouncedSave);
    // Note: Rating click already triggers save via its own listener

    // --- Initial Setup ---
    // Set default date to today
    if (!logDate.value) {
      const today = new Date().toISOString().split('T')[0];
      logDate.value = today;
    }
    saveStatus.textContent = 'Ready.'; // Initial status

    // Optional: Load existing data if applicable
    // If you were loading an existing entry (e.g., based on a URL parameter),
    // you would fetch that data here and populate the form fields,
    // including calling updateStarRating().
});
