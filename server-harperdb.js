const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// HarperDB configuration
const HARPERDB_URL = 'https://trading-api-jphelps.harperdbcloud.com';
const HARPERDB_USERNAME = 'USERNAME';
const HARPERDB_PASSWORD = 'PASSWORD';

// Middleware
app.use(express.json());

// Helper function to make HarperDB requests
async function harperDBRequest(operation) {
  try {
    const response = await axios.post(HARPERDB_URL, operation, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${HARPERDB_USERNAME}:${HARPERDB_PASSWORD}`).toString('base64')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('HarperDB Error:', error.response?.data || error.message);
    throw error;
  }
}

// Test HarperDB connection
async function testConnection() {
  try {
    console.log('Testing connection to:', HARPERDB_URL);
    const result = await harperDBRequest({
      operation: 'describe_all'
    });
    console.log('Connection successful! Response:', result);
    return true;
  } catch (error) {
    console.error('Connection failed:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Initialize database (create schema and tables)
async function initializeDB() {
  try {
    // Create schema
    await harperDBRequest({
      operation: 'create_schema',
      schema: 'trading'
    });
    
    // Create trades table
    await harperDBRequest({
      operation: 'create_table',
      schema: 'trading',
      table: 'trades',
      hash_attribute: 'id'
    });
    
    // Create portfolio table
    await harperDBRequest({
      operation: 'create_table',
      schema: 'trading',
      table: 'portfolio',
      hash_attribute: 'symbol'
    });
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.log('Database may already exist, continuing...');
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'HarperDB Trading API is running!',
    timestamp: new Date().toISOString()
  });
});


// Get portfolio from HarperDB
app.get('/portfolio', async (req, res) => {
  try {
    const result = await harperDBRequest({
      operation: 'sql',
      sql: 'SELECT * FROM trading.portfolio'
    });
    
    // Calculate total value
    const totalValue = result.reduce((sum, stock) => {
      return sum + (stock.quantity * stock.avg_price);
    }, 0);
    
    res.json({
      portfolio: result,
      totalValue: totalValue
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Get trades from HarperDB
app.get('/trades', async (req, res) => {
  try {
    const result = await harperDBRequest({
      operation: 'sql',
      sql: 'SELECT * FROM trading.trades ORDER BY date DESC'
    });
    
    res.json({ trades: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

// Record new trade in HarperDB
app.post('/trades', async (req, res) => {
  try {
    const { symbol, type, quantity, price } = req.body;
    
    // Validation
    if (!symbol || !type || !quantity || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (type !== 'BUY' && type !== 'SELL') {
      return res.status(400).json({ error: 'Type must be BUY or SELL' });
    }
    
    // Create trade record
    const trade = {
      id: Date.now().toString(), // Simple ID generation
      symbol: symbol.toUpperCase(),
      type: type.toUpperCase(),
      quantity: parseInt(quantity),
      price: parseFloat(price),
      date: new Date().toISOString().split('T')[0]
    };
    
    // Insert trade into HarperDB
    await harperDBRequest({
      operation: 'insert',
      schema: 'trading',
      table: 'trades',
      records: [trade]
    });
    
    // Update portfolio
    await updatePortfolioInDB(trade);
    
    res.status(201).json({ 
      message: 'Trade recorded successfully', 
      trade: trade 
    });
    
  } catch (error) {
    console.error('Error recording trade:', error);
    res.status(500).json({ error: 'Failed to record trade' });
  }
});

// Helper function to update portfolio in HarperDB
async function updatePortfolioInDB(trade) {
  try {
    // Check if position exists
    const existingPosition = await harperDBRequest({
      operation: 'sql',
      sql: `SELECT * FROM trading.portfolio WHERE symbol = '${trade.symbol}'`
    });
    
    if (trade.type === 'BUY') {
      if (existingPosition.length > 0) {
        // Update existing position
        const position = existingPosition[0];
        const totalValue = (position.quantity * position.avg_price) + (trade.quantity * trade.price);
        const newQuantity = position.quantity + trade.quantity;
        const newAvgPrice = totalValue / newQuantity;
        
        await harperDBRequest({
          operation: 'update',
          schema: 'trading',
          table: 'portfolio',
          records: [{
            symbol: trade.symbol,
            quantity: newQuantity,
            avg_price: newAvgPrice
          }]
        });
      } else {
        // Create new position
        await harperDBRequest({
          operation: 'insert',
          schema: 'trading',
          table: 'portfolio',
          records: [{
            symbol: trade.symbol,
            quantity: trade.quantity,
            avg_price: trade.price
          }]
        });
      }
    }
  } catch (error) {
    console.error('Error updating portfolio:', error);
  }
}

// Start the server
app.listen(PORT, async () => {
  console.log(`Trading API server running on http://localhost:${PORT}`);
  
  const connected = await testConnection();
  if (connected) {
    console.log('HarperDB connection successful! Database and tables already exist.');
  } else {
    console.log('Connection failed');
  }
});
