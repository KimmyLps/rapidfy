const mongoose = require('mongoose');
const mysql = require('mysql2/promise');

class DatabaseManager {
    constructor() {
        this.connections = {};
    }

    connMongoDB(name, url, options = {}) {
        if (this.connections[name]) {
            return this.connections[name];
        }

        try {
            const connection = mongoose.createConnection(url, options);
            this.connections[name] = connection;
            return connection;
        } catch (error) {
            throw error;
        }
    }

    async connMySQL(name, config) {
        if (this.connections[name]) {
            return this.connections[name];
        }

        try {
            const connection = await mysql.createConnection(config);
            this.connections[name] = connection;
            return connection;
        } catch (error) {
            throw error;
        }
    }

    getConn(name) {
        return this.connections[name];
    }

    close(name) {
        if (this.connections[name]) {
            this.connections[name].close();
            delete this.connections[name];
        }
    }

    closeAll() {
        for (const name in this.connections) {
            this.close(name);
        }
    }
}

module.exports = DatabaseManager;