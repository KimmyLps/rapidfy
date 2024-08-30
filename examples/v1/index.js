const rapidfy = require('../../src/lib/app');

const app = rapidfy();
const router = rapidfy.Router();

// app.use(rapidfy.cors({
//     origins: 'http://localhost:3000',
//     methods: 'PUT',
//     headers: 'Content-Type,Authorization',
// }));
app.use(rapidfy.json());
// swagger ui
// const swaggerOptions = {
//     definition: {
//         openapi: '3.1.0',
//         info: {
//             title: 'Swagger Example',
//             version: '1.0.0',
//             description: 'A sample API',
//             contact: {
//                 name: 'John Doe',
//                 email: 'John@gmail.com',
//             },
//         },
//         servers: [
//             {
//                 url: 'http://localhost:3000',
//                 description: 'Local server'
//             },
//             {
//                 url: 'https://api.example.com',
//                 description: 'Production server'
//             }
//         ],
//         tags: [
//             {
//                 name: 'Auth',
//                 description: 'Authentication related endpoints'
//             },
//             {
//                 name: 'Items',
//                 description: 'Items related endpoints'
//             }
//         ],
//         externalDocs: {
//             description: 'Find out more about Swagger',
//             url: 'http://swagger.io'
//         }
//     },
//     apis: ['./examples/**/*.js'],
// };
// const swaggerSpec = rapidfy.createSwagger(swaggerOptions);
// app.use(rapidfy.swaggerServe({
//     spec: swaggerSpec,
//     pathDoc: '/docs',
//     pathSpec: '/swagger.json',
//     customOptions: {
//         customSiteTitle: 'My Custom API Documentation',
//     }
// }));



/**
 * @openapi
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the item
 *         name:
 *           type: string
 *           description: Name of the item
 *   responses:
 *     ItemListResponse:
 *       description: A list of items
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Item'
 * paths:
 *   /items:
 *     get:
 *       summary: Retrieve items
 *       description: Retrieve a list of items
 *       tags:
 *          - Items
 *       responses:
 *         '200':
 *           $ref: '#/components/responses/ItemListResponse'
 *   /items/{itemId}:
 *     get:
 *       summary: Retrieve a single item
 *       description: Retrieve a single item by its id
 *       tags:
 *          - Items
 *       parameters:
 *         - name: itemId
 *           in: path
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         '200':
 *           description: The item details
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Item'
 *         '404':
 *           description: Item not found
 */

router.get('/get-param/:id', (req, res) => {
    res.status(200).json(req.params);
});

router.get('/get-query', (req, res) => {
    res.status(200).json(req.query);
});

app.use('/api/v1', router);
app.use('/api', router);

app.get('/get-body', (req, res) => {
    res.status(200).json(req.body);
});

app.get('/redirect', (req, res) => {
    res.redirect('https://example.com');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});