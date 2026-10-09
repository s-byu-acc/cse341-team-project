document.addEventListener('DOMContentLoaded', () => {
    const loading = document.getElementById('trains-loading');
    const error = document.getElementById('trains-error');
    const list = document.getElementById('trains-list');
    if (!list) return;

    const previousButton = document.getElementById('trains-previous');
    const nextButton = document.getElementById('trains-next');
    const pageStatus = document.getElementById('trains-page-status');
    const cardTemplate = document.getElementById('train-card-template');
    let page = 1;

    const renderTrain = (train) => {
        const card = cardTemplate.content.firstElementChild.cloneNode(true);
        const image = card.querySelector('[data-field="image"]');
        const values = {
            name: train.name,
            operator: train.operator,
            description: train.description,
            type: train.type,
            speed: train.maxSpeedKmh ? `${train.maxSpeedKmh} km/h` : 'Not listed',
            seats: train.capacity ? `${train.capacity} passengers` : 'Not listed',
            power: train.powerSource,
            'best-for': train.bestFor
        };

        if (train.imageUrl) {
            image.src = train.imageUrl;
            image.alt = train.imageAlt || train.name || 'Train';
        } else {
            image.closest('.train-image-wrap').hidden = true;
        }

        card.querySelectorAll('[data-field]').forEach((field) => {
            if (field.dataset.field !== 'image') {
                field.textContent = values[field.dataset.field] || 'Not listed';
            }
        });
        return card;
    };

    const loadTrains = async () => {
        const params = new URLSearchParams({ page: String(page), limit: '10' });

        loading.hidden = false;
        loading.textContent = 'Loading trains...';
        error.hidden = true;
        list.replaceChildren();
        previousButton.disabled = true;
        nextButton.disabled = true;

        try {
            const response = await fetch(`/api/trains?${params}`);
            if (!response.ok) throw new Error('Unable to load trains. Please try again.');

            const result = await response.json();
            result.trains.forEach((train) => list.append(renderTrain(train)));
            const pagination = result.pagination;

            loading.hidden = result.trains.length > 0;
            if (result.trains.length === 0) {
                loading.textContent = 'No trains found.';
            }
            pageStatus.textContent = `${pagination.totalItems} trains - Page ${pagination.page} of ${Math.max(pagination.totalPages, 1)}`;
            previousButton.disabled = !pagination.hasPreviousPage;
            nextButton.disabled = !pagination.hasNextPage;
        } catch (requestError) {
            loading.hidden = true;
            error.textContent = requestError.message;
            error.hidden = false;
            pageStatus.textContent = '';
        }
    };

    previousButton.addEventListener('click', () => {
        page -= 1;
        loadTrains();
    });

    nextButton.addEventListener('click', () => {
        page += 1;
        loadTrains();
    });

    loadTrains();
});
