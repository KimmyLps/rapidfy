const rapidfy = require('../src/index');

const app = rapidfy();

app.parsBody({ limit: 100 });
app.requestLogger('combined');

app.get('/', (req, res) => {
    const hasContentType = req.get('name');
    res.status(200).json({hasContentType});
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});