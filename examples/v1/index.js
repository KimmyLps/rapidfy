const rapidfy = require('../../src/lib/app');

const app = rapidfy();
const router = rapidfy.Router();

app.use(rapidfy.json());

router.get('/get-param/:id', (req, res) => {
    res.status(200).json(req.params);
});

router.get('/get-query', (req, res) => {
    res.status(200).json(req.query);
});

app.use(router);

app.get('/get-body', (req, res) => {
    res.status(200).json(req.body);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});