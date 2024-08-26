const rapidfy = require('../index');

test('Framework should initialize without errors', () => {
    const app = rapidfy();
    expect(app).toBeDefined();
});

test('Test use bodyParser', () => {
    const app = rapidfy();
    app.use(rapidfy.json());
    expect(app).toBeDefined();
});

test('Test Router', () => {
    const router = rapidfy.Router();
    expect(router).toBeDefined();
});