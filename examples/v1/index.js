const rapidfy = require('../../src/lib/app');

const app = rapidfy();
const router = rapidfy.Router();

app.use(rapidfy.json());

// swagger ui
// const swagger = rapidfy.swaggerUI();
// swagger.setSwaggerSpec({
//     swagger: '2.0',
//     info: {
//         title: 'Swagger Example',
//         version: '1.0.0',
//         description: 'A sample API'
//     },
//     host: 'localhost:3000',
//     basePath: '/',
//     servers: [
//         {
//             url: 'http://localhost:3000',
//             description: 'Local server'
//         }
//     ],
//     paths: {}
// }).serve('/swagger.json', '/docs');

// app.use(swagger);

router.get('/get-param/:id', (req, res) => {
    res.status(200).json(req.params);
});

router.get('/get-query', (req, res) => {
    res.status(200).json(req.query);
});

app.use('/api/v1',router);
app.use('/api',router);

// app.get('/get-body', (req, res) => {
//     res.status(200).json(req.body);
// });

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});