# Harper_Challange
A real-time trading portfolio API that tracks stock trades and calculates portfolio performance.


# Trading Portfolio API

A real-time trading portfolio management API built with Node.js and HarperDB Cloud. This application demonstrates modern backend development practices including RESTful API design, cloud database integration, and asynchronous programming patterns.

##  Features

- **Portfolio Management**: Track stock holdings with automatic average cost basis calculations
- **Transaction History**: Complete audit trail of all buy/sell trades
- **Real-time Updates**: Instant portfolio updates when trades are recorded
- **Cloud Persistence**: Data stored in HarperDB Cloud for scalability and reliability
- **RESTful Design**: Clean API endpoints following REST conventions

## Tech Stack

- **Runtime**: Node.js
- **Web Framework**: Express.js
- **Database**: HarperDB Cloud
- **HTTP Client**: Axios
- **Development**: VS Code, REST Client extension

##  Prerequisites

- Node.js (v14+ recommended)
- HarperDB Cloud account
- Git

##  Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Crypton2006-25/Harper_Challange.git
   cd trading-portfolio-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure HarperDB connection**
   
   Update the connection details in `server-harperdb.js`:
   ```javascript
   const HARPERDB_URL = 'https://your-instance.harperdbcloud.com';
   const HARPERDB_USERNAME = 'your-username';
   const HARPERDB_PASSWORD = 'your-password';
   ```

4. **Set up HarperDB schema and tables**
   
   In your HarperDB Cloud dashboard, create:
   - Schema: `trading`
   - Table: `trades` (hash_attribute: `id`)
   - Table: `portfolio` (hash_attribute: `symbol`)

##  Running the Application

1. **Start the server**
   ```bash
   node server-harperdb.js
   ```

2. **Verify connection**
   
   You should see:
   ```
   Trading API server running on http://localhost:3000
   Testing connection to: https://your-instance.harperdbcloud.com
   Connection successful!
   HarperDB connection successful! Database and tables already exist.
   ```

3. **Test the API**
   
   Visit `http://localhost:3000` to confirm the server is running.

##  API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### Get Portfolio
```http
GET /portfolio
```
Returns current stock holdings and total portfolio value.

**Response:**
```json
{
  "portfolio": [
    {
      "symbol": "AAPL",
      "quantity": 15,
      "avg_price": 153.33
    }
  ],
  "totalValue": 2299.95
}
```

#### Get Trade History
```http
GET /trades
```
Returns all trades ordered by date (newest first).

**Response:**
```json
{
  "trades": [
    {
      "id": "1642123456789",
      "symbol": "AAPL",
      "type": "BUY",
      "quantity": 10,
      "price": 150.00,
      "date": "2025-01-31"
    }
  ]
}
```

#### Record New Trade
```http
POST /trades
Content-Type: application/json

{
  "symbol": "AAPL",
  "type": "BUY",
  "quantity": 10,
  "price": 150.00
}
```

**Response:**
```json
{
  "message": "Trade recorded successfully",
  "trade": {
    "id": "1642123456789",
    "symbol": "AAPL",
    "type": "BUY",
    "quantity": 10,
    "price": 150.00,
    "date": "2025-01-31"
  }
}
```

## 🧪 Testing

Use the included `test-api.http` file with VS Code's REST Client extension:

```http
### Get current portfolio
GET http://localhost:3000/portfolio

### Record a trade
POST http://localhost:3000/trades
Content-Type: application/json

{
  "symbol": "AAPL",
  "type": "BUY",
  "quantity": 10,
  "price": 150.00
}
```

## 🏗 Architecture

### Application Flow
```
Client Request → Express Router → Business Logic → HarperDB Cloud → Response
```

### Key Components

- **Express Server**: Handles HTTP requests and routing
- **HarperDB Integration**: Cloud database for data persistence
- **Portfolio Calculator**: Business logic for average cost basis
- **Error Handling**: Comprehensive error management throughout

### Database Schema

**Trades Table:**
- `id` (string, hash attribute): Unique trade identifier
- `symbol` (string): Stock ticker symbol
- `type` (string): "BUY" or "SELL"
- `quantity` (number): Number of shares
- `price` (number): Price per share
- `date` (string): Trade date (YYYY-MM-DD)

**Portfolio Table:**
- `symbol` (string, hash attribute): Stock ticker symbol
- `quantity` (number): Total shares owned
- `avg_price` (number): Average cost basis per share

##  Technical Highlights

### Asynchronous Programming
- Uses `async/await` throughout for clean, readable code
- Non-blocking database operations for optimal performance
- Proper error handling with try/catch blocks

### Business Logic
- Automatic average cost basis calculation when buying additional shares
- Portfolio updates happen atomically with trade recording
- Input validation for all API endpoints

### Cloud Integration
- HarperDB Cloud provides managed database infrastructure
- RESTful communication using axios HTTP client
- Basic Authentication for secure database access

##  Why This Tech Stack?

**Node.js**: Perfect for I/O-heavy applications like trading systems. The event loop handles multiple concurrent requests without blocking.

**HarperDB**: Combines SQL and NoSQL capabilities. Ideal for financial applications requiring both structured data (trades) and flexible schemas (metadata).

**Express.js**: Minimal, fast web framework that doesn't get in the way of business logic.

##  Potential Enhancements

- **Real-time Price Integration**: Connect to financial APIs for live stock prices
- **Portfolio Analytics**: Add performance metrics, profit/loss calculations
- **Multi-user Support**: User authentication and isolated portfolios
- **WebSocket Integration**: Real-time portfolio updates for connected clients
- **Sell Order Logic**: Complete the trading cycle with sell order processing

##  Contributing

This project was built as a demonstration of Node.js and HarperDB integration. Feel free to fork and extend!

## 📄 License

MIT License - Feel free to use this code for learning and development.

---

**Built with ❤️ using Node.js and HarperDB**
