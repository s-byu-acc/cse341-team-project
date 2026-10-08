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

//Wk3:Feature:3: Bookings
// 1. Client-side dynamically load on page ge 
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
    
    // FIX 2: Changed const to let so they can be updated
    // Wk05:Pagination features
    let bookings = [];
    let currentPage = 1;
    let totalPages = 1;

    // Wk5:Feature-3: Creting Filtering UI
    const filterContainer = document.createElement('div');
    filterContainer.innerHTML = `
        <form id="filterBookingsForm" style="margin-bottom: 20px; display: flex; gap: 15px; align-items: flex-end; flex-wrap: wrap;">
            <label style="display: flex; flex-direction: column;">
                Ticket Class: 
                <select name="ticketClass" style="padding: 5px;">
                    <option value="">All</option>
                    <option value="premium">Premium</option>
                    <option value="first">First</option>
                    <option value="standard">Standard</option>
                </select>
            </label>
            <label style="display: flex; flex-direction: column;">
                Start Date: 
                <input type="date" name="startDate" style="padding: 5px;">
            </label>
            <label style="display: flex; flex-direction: column;">
                End Date: 
                <input type="date" name="endDate" style="padding: 5px;">
            </label>
            <button type="submit" style="padding: 6px 15px; cursor: pointer;">Apply Filters</button>
            <button type="button" id="clearFiltersBtn" style="padding: 6px 15px; cursor: pointer;">Clear</button>
        </form>
    `;
    tableEl.parentNode.insertBefore(filterContainer, tableEl);

    const filterForm = document.getElementById('filterBookingsForm');

    // Event listeners for filtering
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentPage = 1; // Always reset to page 1 when applying a new filter
        loadBookings();
    });

    document.getElementById('clearFiltersBtn').addEventListener('click', () => {
        filterForm.reset();
        currentPage = 1;
        loadBookings();
    });

    //Table UI Features
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
            // FIX 3 (for delete): Just reload the current page from the server
            // Wk05:Pagination feature
            loadBookings();
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
            await sendBookingRequest(`/api/bookings/${encodeURIComponent(bookingCode)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            
            // FIX 3 (for edit): Just reload the current page from the server
            // Wk05:Pagination feature
            loadBookings();
            dialogEl.close();
            showStatus('Booking updated.');
        } catch (error) {
            showError(error.message);
        } finally {
            saveButton.disabled = false;
        }
    });

    //Wk5:Feature-3:pagination UI features
    const paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination-controls';
    // Updated layout to stack items vertically and center them
    paginationContainer.style = 'display: flex; flex-direction: column; align-items: center; margin-top: 15px; gap: 10px;';
    paginationContainer.classList.add('d-none');
    paginationContainer.innerHTML = `
        <div style="display: flex; gap: 15px; align-items: center;">
            <button id="prevPageBtn" type="button" style="padding: 5px 15px;">Previous</button>
            <span id="pageIndicator" style="font-weight: bold;">Page 1</span>
            <button id="nextPageBtn" type="button" style="padding: 5px 15px;">Next</button>
        </div>
        <div id="totalBookingsSummary" style="color: #666;"></div>
    `;
    tableEl.parentNode.insertBefore(paginationContainer, tableEl.nextSibling);

    document.getElementById('prevPageBtn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadBookings();
        }
    });

    document.getElementById('nextPageBtn').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadBookings();
        }
    });

    // FIX 1: Reusable function moved INSIDE the DOMContentLoaded listener
    // Wk05:Pagination feature
    const loadBookings = async () => {
        try {
            loadingEl.classList.remove('d-none');
            tableEl.classList.add('d-none');
            paginationContainer.classList.add('d-none');

            // Build dynamic URL with pagination and filters
            let fetchUrl = `/api/bookings?page=${currentPage}&limit=10`;
            
            const tc = filterForm.elements.ticketClass.value;
            const sd = filterForm.elements.startDate.value;
            const ed = filterForm.elements.endDate.value;

            if (tc) fetchUrl += `&ticketClass=${tc}`;
            if (sd) fetchUrl += `&startDate=${sd}`;
            if (ed) fetchUrl += `&endDate=${ed}`;

            const response = await fetch(fetchUrl);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Unable to load bookings.');
            }

            bookings = result.data;
            currentPage = result.metadata.currentPage;
            totalPages = result.metadata.totalPages;

            renderBookings(); 

            document.getElementById('pageIndicator').textContent = `Page ${currentPage} of ${totalPages}`;
            // ADD THIS NEW LINE to display the total bookings found:
            document.getElementById('totalBookingsSummary').textContent = `${result.metadata.totalItems} booking(s) found`;
            document.getElementById('prevPageBtn').disabled = currentPage === 1;
            document.getElementById('nextPageBtn').disabled = currentPage === totalPages || totalPages === 0;

            if (totalPages > 0) {
                paginationContainer.classList.remove('d-none');
            }

        } catch (err) {
            console.error(err);
            loadingEl.classList.add('d-none');
            showError(err.message || 'Unable to load bookings.');
        }
    };

    // Initialize page
    loadBookings();
});


//Wk4:Feature:3: Protected User-Admin-Page
// 1. Fetch Users dynamically on page load
async function loadUsers() {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return; // Prevents errors on pages that do not have the user table

    const response = await fetch('/api/users');
    const users = await response.json();
    tbody.innerHTML = ''; // Clear existing rows

    users.forEach(user => {
        tbody.innerHTML += `
            <tr>
                <td>${user.displayName}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button onclick="editUser('${user._id}', '${user.displayName}', '${user.email}', '${user.role}')">Edit</button>
                    <button onclick="deleteUser('${user._id}')">Delete</button>
                </td>
            </tr>
        `;
    });
}

// 2. Show the edit form with current user data
function editUser(id, name, email, role) {
    document.getElementById('editUserId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editEmail').value = email;
    document.getElementById('editRole').value = role;
    document.getElementById('editFormContainer').style.display = 'block';
}

function cancelEdit() {
    document.getElementById('editFormContainer').style.display = 'none';
}

// 3. Submit Update via PUT request
async function submitUpdate() {
    const id = document.getElementById('editUserId').value;
    const updatedData = {
        displayName: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value,
        role: document.getElementById('editRole').value
    };

    const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to update: ${errorData.message || errorData.error}`);
        return; // Stop here if it failed
    }

    cancelEdit();
    loadUsers(); // Refresh table dynamically without page reload
}

// 4. Submit Delete via DELETE request
async function deleteUser(id) {
   if(confirm("Are you sure you want to delete this user?")) {
        const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        
        if (!response.ok) {
            alert("You do not have permission to delete users.");
            return;
        }
        
        loadUsers(); // Refresh table dynamically without page reload
    }
}

// Initialize page load
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});