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

//WEEK03: FEATURE-SET-03: SCRIPT FOR CLIENT-SERVER SIDE RENDERING
 document.addEventListener('DOMContentLoaded', async () => {
  const tableEl = document.getElementById('bookingsTable');
  
  // Guard clause: Only run this script if the admin table exists on the page
  if (!tableEl) return;

  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error-message');
  const tbodyEl = document.getElementById('bookingsTableBody');

  try {
    const response = await fetch('/api/bookings');
    if (!response.ok) throw new Error('Network error fetching bookings');

    const bookings = await response.json();
    loadingEl.classList.add('d-none');

    if (bookings.length === 0) {
      loadingEl.textContent = 'No bookings found in database.';
      loadingEl.classList.remove('d-none');
      return;
    }

    tbodyEl.innerHTML = bookings.map(b => `
      <tr>
        <td><strong>${b.bookingCode || 'N/A'}</strong></td>
        <td>${b.scheduleId}</td>
        <td>${b.routeId}</td>
        <td><span class="badge bg-secondary">${b.ticketClass}</span></td>
        <td>${b.selectedDay}</td>
        <td>${b.passengers ? b.passengers.length : 0} passenger(s)</td>
        <td>${new Date(b.createdAt).toLocaleDateString()}</td>
      </tr>
    `).join('');

    tableEl.classList.remove('d-none');
  } catch (err) {
    console.error(err);
    if (loadingEl) loadingEl.classList.add('d-none');
    if (errorEl) errorEl.classList.remove('d-none');
  }
});