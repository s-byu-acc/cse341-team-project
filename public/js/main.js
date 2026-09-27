const hookRegionSorter = () => {
    const regionSelect = document.getElementById('region-filter');
    if (regionSelect) {
        regionSelect.addEventListener('change', () => {
            const selectedRegion = regionSelect.value;
            const url = new URL(window.location.href);

            if (selectedRegion && selectedRegion !== 'all') {
                url.searchParams.set('region', selectedRegion);
            } else {
                url.searchParams.delete('region');
            }
            
            window.location.href = url.toString();
        });
    }
};

const hookSeasonSorter = () => {
    const seasonSelect = document.getElementById('season-filter');
    if (seasonSelect) {
        seasonSelect.addEventListener('change', () => {
            const selectedSeason = seasonSelect.value;
            const url = new URL(window.location.href);

            if (selectedSeason && selectedSeason !== 'all') {
                url.searchParams.set('season', selectedSeason);
            } else {
                url.searchParams.delete('season');
            }
            
            window.location.href = url.toString();
        });
    }
};

const hookScenarioTasks = () => {
    const storageKey = 'kizuna-scenario-tasks';
    const pageUrl = window.location.pathname;
    const tasks = document.querySelectorAll('.scenario-tasks .task-item');
    
    // Load all scenario data from localStorage
    let allScenarios = {};
    try {
        const stored = localStorage.getItem(storageKey);
        allScenarios = stored ? JSON.parse(stored) : {};
    } catch (e) {
        allScenarios = {};
    }
    
    // Get completed tasks for this specific page
    let completedTasks = allScenarios[pageUrl] || [];
    
    // Get all valid task IDs currently on the page
    const validTaskIds = [];
    tasks.forEach((task) => {
        const checkbox = task.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.id) {
            validTaskIds.push(checkbox.id);
        }
    });
    
    // Clean up: remove task IDs that no longer exist on this page
    completedTasks = completedTasks.filter(id => validTaskIds.includes(id));
    allScenarios[pageUrl] = completedTasks;
    localStorage.setItem(storageKey, JSON.stringify(allScenarios));
    
    // Check off tasks that were previously completed
    tasks.forEach((task) => {
        const checkbox = task.querySelector('input[type="checkbox"]');
        if (!checkbox || !checkbox.id) return;
        
        if (completedTasks.includes(checkbox.id)) {
            checkbox.checked = true;
        }
        
        // Listen for changes and update localStorage
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                if (!completedTasks.includes(checkbox.id)) {
                    completedTasks.push(checkbox.id);
                }
            } else {
                completedTasks = completedTasks.filter(id => id !== checkbox.id);
            }
            allScenarios[pageUrl] = completedTasks;
            localStorage.setItem(storageKey, JSON.stringify(allScenarios));
        });
    });
};

document.addEventListener('DOMContentLoaded', () => {
    hookRegionSorter();
    hookSeasonSorter();
    hookScenarioTasks();
});

document.addEventListener('DOMContentLoaded', async () => {
  const tableEl = document.getElementById('bookingsTable');
  if (!tableEl) return;

  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error-message');
    const statusEl = document.getElementById('booking-status');
  const tbodyEl = document.getElementById('bookingsTableBody');
    const dialogEl = document.getElementById('editBookingDialog');
    const formEl = document.getElementById('editBookingForm');
    const passengersEl = document.getElementById('editBookingPassengers');
    let bookings = [];

    const showError = (message) => {
        errorEl.textContent = message;
        errorEl.classList.remove('d-none');
    };

    const showStatus = (message) => {
        statusEl.textContent = message;
        statusEl.classList.remove('d-none');
    };

    const addPassengerEditor = (passenger = {}) => {
        const fieldset = document.createElement('fieldset');
        fieldset.className = 'booking-passenger-editor';

        [
            ['firstName', 'First name', 'text'],
            ['lastName', 'Last name', 'text'],
            ['email', 'Email', 'email'],
            ['phone', 'Phone', 'tel']
        ].forEach(([name, labelText, type]) => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.name = name;
            input.type = type;
            input.value = passenger[name] || '';
            input.required = true;
            label.append(`${labelText} `, input);
            fieldset.append(label);
        });

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.textContent = 'Remove passenger';
        removeButton.addEventListener('click', () => {
            if (passengersEl.children.length > 1) {
                fieldset.remove();
            }
        });
        fieldset.append(removeButton);
        passengersEl.append(fieldset);
    };

    const renderBookings = () => {
        tbodyEl.replaceChildren();
        if (bookings.length === 0) {
            tableEl.classList.add('d-none');
            loadingEl.textContent = 'No bookings found in database.';
            loadingEl.classList.remove('d-none');
            return;
        }

        loadingEl.classList.add('d-none');
        bookings.forEach((booking) => {
            const row = document.createElement('tr');
            const cellValues = [
                booking.bookingCode || 'N/A',
                booking.scheduleId || 'N/A',
                booking.tripId || booking.routeId || 'N/A',
                booking.ticketClass || 'N/A',
                booking.selectedDay || 'N/A',
                `${booking.passengers?.length || 0} passenger(s)`,
                booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'
            ];

            cellValues.forEach((value) => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.append(cell);
            });

            const actionsCell = document.createElement('td');
            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.dataset.action = 'edit';
            editButton.dataset.bookingCode = booking.bookingCode;
            editButton.textContent = 'Edit';

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.dataset.action = 'delete';
            deleteButton.dataset.bookingCode = booking.bookingCode;
            deleteButton.textContent = 'Delete';

            actionsCell.append(editButton, deleteButton);
            row.append(actionsCell);
            tbodyEl.append(row);
        });

        tableEl.classList.remove('d-none');
    };

    const sendBookingRequest = async (url, options) => {
        const response = await fetch(url, options);
        const payload = await response.json();
        if (!response.ok) {
            throw new Error(payload.error || 'The booking request failed.');
        }
        return payload;
    };

    tbodyEl.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        const booking = bookings.find((item) => item.bookingCode === button.dataset.bookingCode);
        if (!booking) return;

        errorEl.classList.add('d-none');
        statusEl.classList.add('d-none');

        if (button.dataset.action === 'edit') {
            formEl.elements.bookingCode.value = booking.bookingCode;
            formEl.elements.scheduleId.value = booking.scheduleId || '';
            formEl.elements.tripId.value = booking.tripId || booking.routeId || '';
            formEl.elements.ticketClass.value = booking.ticketClass || '';
            formEl.elements.selectedDay.value = booking.selectedDay || '';
            formEl.elements.totalAmount.value = booking.totalAmount ?? 0;
            passengersEl.replaceChildren();
            (booking.passengers || []).forEach(addPassengerEditor);
            dialogEl.showModal();
            return;
        }

        if (!window.confirm(`Delete booking ${booking.bookingCode}?`)) return;

        button.disabled = true;
        try {
            await sendBookingRequest(`/api/bookings/${encodeURIComponent(booking.bookingCode)}`, {
                method: 'DELETE'
            });
            bookings = bookings.filter((item) => item.bookingCode !== booking.bookingCode);
            renderBookings();
            showStatus('Booking deleted.');
        } catch (error) {
            showError(error.message);
            button.disabled = false;
        }
    });

    document.getElementById('addBookingPassenger').addEventListener('click', () => addPassengerEditor());
    document.getElementById('cancelBookingEdit').addEventListener('click', () => dialogEl.close());

    formEl.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorEl.classList.add('d-none');
        statusEl.classList.add('d-none');

        const saveButton = formEl.querySelector('button[type="submit"]');
        saveButton.disabled = true;
        const bookingCode = formEl.elements.bookingCode.value;
        const bookingData = {
            scheduleId: formEl.elements.scheduleId.value.trim(),
            tripId: formEl.elements.tripId.value.trim(),
            ticketClass: formEl.elements.ticketClass.value.trim(),
            selectedDay: formEl.elements.selectedDay.value.trim(),
            totalAmount: Number(formEl.elements.totalAmount.value),
            passengers: Array.from(passengersEl.querySelectorAll('.booking-passenger-editor'), (fieldset) =>
                Object.fromEntries(['firstName', 'lastName', 'email', 'phone'].map((name) => [
                    name,
                    fieldset.querySelector(`[name="${name}"]`).value.trim()
                ]))
            )
        };

        try {
            const result = await sendBookingRequest(`/api/bookings/${encodeURIComponent(bookingCode)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            bookings = bookings.map((booking) =>
                booking.bookingCode === result.booking.bookingCode ? result.booking : booking
            );
            renderBookings();
            dialogEl.close();
            showStatus('Booking updated.');
        } catch (error) {
            showError(error.message);
        } finally {
            saveButton.disabled = false;
        }
    });

  try {
    const response = await fetch('/api/bookings');
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Unable to load bookings.');
    }

        bookings = result;
        renderBookings();
  } catch (err) {
    console.error(err);
        loadingEl.classList.add('d-none');
        showError(err.message || 'Unable to load bookings.');
  }
});