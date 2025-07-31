const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Sample trading data (in a real app, this would be in a database)
let portfolio = [
  { symbol: 'AAPL', quantity: 10, avgPrice: 150.00 },
  { symbol: 'TSLA', quantity: 5, avgPrice: 250.00 },
  { symbol: 'MSFT', quantity: 8, avgPrice: 300.00 }
];

let trades = [
  { id: 1, symbol: 'AAPL', type: 'BUY', quantity: 10, price: 150.00, date: '2025-07-20' },
  { id: 2, symbol: 'TSLA', type: 'BUY', quantity: 5, price: 250.00, date: '2025-07-21' }
];

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Day Trading API is running!',
    timestamp: new Date().toISOString()
  });
});

// Get current portfolio
app.get('/portfolio', (req, res) => {
  res.json({
    portfolio: portfolio,
    totalValue: portfolio.reduce((sum, stock) => sum + (stock.quantity * stock.avgPrice), 0)
  });
});

// Get trade history
app.get('/trades', (req, res) => {
  res.json({ trades: trades });
});

// Record a new trade
app.post('/trades', (req, res) => {
  const { symbol, type, quantity, price } = req.body;
  
  // Simple validation
  if (!symbol || !type || !quantity || !price) {
    return res.status(400).json({ error: 'Missing required fields: symbol, type, quantity, price' });
  }
  
  if (type !== 'BUY' && type !== 'SELL') {
    return res.status(400).json({ error: 'Type must be BUY or SELL' });
  }
  
  // Create new trade
  const newTrade = {
    id: trades.length + 1,
    symbol: symbol.toUpperCase(),
    type: type.toUpperCase(),
    quantity: parseInt(quantity),
    price: parseFloat(price),
    date: new Date().toISOString().split('T')[0] // Today's date
  };
  
  // Add to trades array
  trades.push(newTrade);
  
  // Update portfolio (simplified logic)
  updatePortfolio(newTrade);
  
  res.status(201).json({ message: 'Trade recorded successfully', trade: newTrade });
});

// Helper function to update portfolio
function updatePortfolio(trade) {
  console.log('Updating portfolio with trade:', trade);
  console.log('Current portfolio before update:', portfolio);
  
  const existingPosition = portfolio.find(p => p.symbol === trade.symbol);
  console.log('Existing position found:', existingPosition);
  
  if (trade.type === 'BUY') {
    if (existingPosition) {
      // Update average price and quantity
      const totalValue = (existingPosition.quantity * existingPosition.avgPrice) + (trade.quantity * trade.price);
      const newQuantity = existingPosition.quantity + trade.quantity;
      const newAvgPrice = totalValue / newQuantity;
      
      console.log(`Updating ${trade.symbol}: ${existingPosition.quantity} + ${trade.quantity} = ${newQuantity}`);
      console.log(`New avg price: ${newAvgPrice}`);
      
      existingPosition.quantity = newQuantity;
      existingPosition.avgPrice = newAvgPrice;
    } else {
      // New position
      console.log(`Adding new position for ${trade.symbol}`);
      portfolio.push({
        symbol: trade.symbol,
        quantity: trade.quantity,
        avgPrice: trade.price
      });
    }
  }
  
  console.log('Portfolio after update:', portfolio);
}

// Start the server
app.listen(PORT, () => {
  console.log(`Trading API server running on http://localhost:${PORT}`);
});