document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const seatGrid = document.getElementById('seatGrid');
    const bookingForm = document.getElementById('bookingForm');
    const seatInput = document.getElementById('seatInput');
    const validationBadge = document.getElementById('validationBadge');
    const errorMessage = document.getElementById('errorMessage');
    const statsAvailable = document.getElementById('statsAvailable');
    const statsBooked = document.getElementById('statsBooked');
    const resetBtn = document.getElementById('resetBtn');

    // Layout configuration
    const rows = ['A', 'B', 'C', 'D'];
    const seatsPerRow = 25;
    const totalCapacity = rows.length * seatsPerRow;

    // Load booked seats from LocalStorage
    let bookedSeats = JSON.parse(localStorage.getItem('bookedSeats')) || [];

    // Initialize application
    init();

    function init() {
        generateSeatGrid();
        updateStats();
        setupEventListeners();
    }

    // Generate the 100 seats and grid labels
    function generateSeatGrid() {
        seatGrid.innerHTML = '';

        // 1. Generate Column Header Row (Top label row)
        // Top-left corner spacer
        const topLeftSpacer = document.createElement('div');
        topLeftSpacer.className = 'grid-label column-header';
        seatGrid.appendChild(topLeftSpacer);

        // Column numbers 1 to 25
        for (let col = 1; col <= seatsPerRow; col++) {
            const colLabel = document.createElement('div');
            colLabel.className = 'grid-label column-header';
            colLabel.textContent = col;
            seatGrid.appendChild(colLabel);
        }

        // Top-right corner spacer
        const topRightSpacer = document.createElement('div');
        topRightSpacer.className = 'grid-label column-header';
        seatGrid.appendChild(topRightSpacer);

        // 2. Generate Seat Rows (A, B, C, D)
        rows.forEach(row => {
            // Left row label
            const leftRowLabel = document.createElement('div');
            leftRowLabel.className = 'grid-label row-header';
            leftRowLabel.textContent = row;
            seatGrid.appendChild(leftRowLabel);

            // 25 Seats for this row
            for (let col = 1; col <= seatsPerRow; col++) {
                const seatCode = `${row}${col}`;
                const isBooked = bookedSeats.includes(seatCode);

                const seatElement = document.createElement('div');
                seatElement.className = `seat ${isBooked ? 'booked' : 'available'}`;
                seatElement.setAttribute('data-seat', seatCode);
                seatElement.textContent = seatCode;
                // For accessibility
                seatElement.setAttribute('role', 'button');
                seatElement.setAttribute('tabindex', isBooked ? '-1' : '0');
                seatElement.setAttribute('aria-label', `Seat ${seatCode}, ${isBooked ? 'Booked' : 'Available'}`);

                seatGrid.appendChild(seatElement);
            }

            // Right row label
            const rightRowLabel = document.createElement('div');
            rightRowLabel.className = 'grid-label row-header';
            rightRowLabel.textContent = row;
            seatGrid.appendChild(rightRowLabel);
        });
    }

    // Update seating stats (available/booked counts)
    function updateStats() {
        const bookedCount = bookedSeats.length;
        const availableCount = totalCapacity - bookedCount;

        statsAvailable.textContent = availableCount;
        statsBooked.textContent = bookedCount;
    }

    // Set up event listeners
    function setupEventListeners() {
        // Seat Click listener (Event Delegation)
        seatGrid.addEventListener('click', handleSeatClick);
        seatGrid.addEventListener('keydown', handleSeatKeydown);

        // Form Submit listener
        bookingForm.addEventListener('submit', handleFormSubmit);

        // Real-time Input validation
        seatInput.addEventListener('input', handleInputValidation);

        // Reset Bookings listener
        resetBtn.addEventListener('click', resetBookings);
    }

    // Handle seat click
    function handleSeatClick(event) {
        const seatElement = event.target.closest('.seat');
        if (!seatElement) return;

        const seatCode = seatElement.getAttribute('data-seat');
        
        if (seatElement.classList.contains('booked')) {
            // Already booked, show exact alert requested
            alert("The seat is already booked.");
            return;
        }

        // populate input and focus
        seatInput.value = seatCode;
        handleInputValidation();
        seatInput.focus();
    }

    // Handle accessibility key presses (Enter / Space) on seat
    function handleSeatKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleSeatClick(event);
        }
    }

    // Real-time Validation logic
    function handleInputValidation() {
        const rawInput = seatInput.value;
        const cleanInput = rawInput.trim().toUpperCase();

        if (cleanInput === '') {
            clearValidationUI();
            return;
        }

        // Validate format: A-D followed by 1-25
        const seatPattern = /^[A-D]([1-9]|1[0-9]|2[0-5])$/;
        const isValidFormat = seatPattern.test(cleanInput);

        if (!isValidFormat) {
            showInvalidUI("Invalid seat number (Use A1-D25)");
            return;
        }

        // Check if already booked
        if (bookedSeats.includes(cleanInput)) {
            showInvalidUI("This seat is already booked");
            return;
        }

        // If valid and available
        showValidUI();
    }

    function showValidUI() {
        seatInput.className = 'valid-seat';
        validationBadge.className = 'validation-badge valid';
        errorMessage.textContent = '';
    }

    function showInvalidUI(message) {
        seatInput.className = 'invalid-seat';
        validationBadge.className = 'validation-badge invalid';
        errorMessage.textContent = message;
    }

    function clearValidationUI() {
        seatInput.className = '';
        validationBadge.className = 'validation-badge';
        errorMessage.textContent = '';
    }

    // Handle booking submission
    function handleFormSubmit(event) {
        event.preventDefault();
        
        const rawInput = seatInput.value;
        const seatCode = rawInput.trim().toUpperCase();

        // 1. Validation check
        const seatPattern = /^[A-D]([1-9]|1[0-9]|2[0-5])$/;
        if (!seatPattern.test(seatCode)) {
            showInvalidUI("Please enter a valid seat (A1-D25)");
            return;
        }

        // 2. Check if already booked
        if (bookedSeats.includes(seatCode)) {
            // Trigger browser alert notification exactly as requested
            alert("The seat is already booked.");
            seatInput.value = '';
            clearValidationUI();
            return;
        }

        // 3. Process Booking
        // Add to array
        bookedSeats.push(seatCode);
        
        // Save to LocalStorage
        localStorage.setItem('bookedSeats', JSON.stringify(bookedSeats));

        // Update DOM seat element state dynamically
        const seatElement = document.querySelector(`.seat[data-seat="${seatCode}"]`);
        if (seatElement) {
            seatElement.classList.remove('available');
            seatElement.classList.add('booked');
            seatElement.setAttribute('tabindex', '-1');
            seatElement.setAttribute('aria-label', `Seat ${seatCode}, Booked`);
        }

        // Update statistics
        updateStats();

        // Clear input and validation UI
        seatInput.value = '';
        clearValidationUI();
    }

    // Reset bookings handler
    function resetBookings() {
        if (confirm("Are you sure you want to reset all bookings?")) {
            bookedSeats = [];
            localStorage.removeItem('bookedSeats');
            
            // Re-render
            generateSeatGrid();
            updateStats();
            seatInput.value = '';
            clearValidationUI();
        }
    }
});
