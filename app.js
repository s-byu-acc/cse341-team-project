import express from 'express';
import Path from 'path';
import { fileURLToPath } from 'url';
import pkg from './package.json' with { type: 'json' };
import globalMiddleware from './src/middleware/global.js';
import routes from './src/routes/router.js';
import apiRouter from './src/routes/api-routes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);

const app = express();

// Add version info to res.locals for access in templates.
app.use((req, res, next) => {
    res.locals.appVersion = pkg.version;
    next();
});

/* Configure static files and EJS templates. */
//1. Serve static files from the public directory
app.use(express.static(Path.join(__dirname, 'public')));
//2. Set EJS as the templating engine
app.set('view engine', 'ejs');
//3. Tell Express where to find your templates
app.set('views', Path.join(__dirname, 'src/views'));

// Parse JSON and URL-encoded request bodies.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//Global middleware
app.use(globalMiddleware);

/**
 * Routes
 */
// 1. API Routes (Order-operation:mounted BEFORE root web routes)
app.use('/api/bookings', apiRouter);

// 2. Web / Template Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/', routes);

/**
 * Error Handling
 */
// Catch requests that did not match a route.
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// 2. Global error handler
// Render the appropriate error page.
app.use((err, req, res, next) => {
    // Determine status and template
    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';

    // Prepare data for the template
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: err.message,
        stack: err.stack
    };

    // Render the appropriate error template
    res.status(status).render(`errors/${template}`, context);
});

export default app;
