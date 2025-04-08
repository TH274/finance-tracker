import { Response, Server } from 'miragejs';

const routes = (server: Server) => {
  server.namespace = 'api';

  // Login/Register
  server.post('/auth/login', (schema, request) => {
    const { email, password } = JSON.parse(request.requestBody);
    const user = schema.db.users.findBy({ email });

    if (user && user.password === password) {
      // Create a user object matching the expected interface in authSlice
      const userData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName || user.name.split(' ')[0],
        lastName: user.lastName || user.name.split(' ')[1] || '',
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString()
      };
      
      return { 
        user: userData, 
        token: 'fake-jwt-token' 
      };
    }
    return new Response(401, {}, { error: 'Invalid credentials' });
  });

  // Google Authentication
  server.post('/auth/google', (schema, request) => {
    const { credential } = JSON.parse(request.requestBody);
    
    if (!credential) {
      return new Response(400, {}, { error: 'Invalid Google credential' });
    }
    
    const googleUserId = `google-${Date.now()}`;
    
    let user = schema.db.users.findBy({ googleId: googleUserId });
    
    if (!user) {
      // Create a new user entry for this Google user
      user = schema.create('user', {
        id: googleUserId,
        email: 'google-user@example.com',
        firstName: 'Google',
        lastName: 'User',
        googleId: googleUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }).attrs;
    }
    
    // Format user data to match the expected structure
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName || 'Google',
      lastName: user.lastName || 'User',
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString()
    };
    
    return {
      user: userData,
      token: 'fake-google-jwt-token'
    };
  });

  server.post('/auth/register', (schema, request) => {
    const attrs = JSON.parse(request.requestBody);
    const existingUser = schema.db.users.findBy({ email: attrs.email });

    if (existingUser) {
      return new Response(400, {}, { error: 'User already exists' });
    }

    // Generate a new user ID as string (to match MirageJS expectations)
    const newId = (schema.db.users.length + 1).toString();
    
    // Create new record - user
    const newUser = schema.create('user', {
      ...attrs,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Format the response to match expected structure
    const userData = {
      id: newId,
      email: attrs.email,
      firstName: attrs.firstName || '',
      lastName: attrs.lastName || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return { 
      user: userData, 
      token: 'fake-jwt-token' 
    };
  });

  // Add support for json-server style queries
  server.get('/users', (schema, request) => {
    const { email, password } = request.queryParams;
    
    // If both email and password provided, it's a login attempt
    if (email && password) {
      const user = schema.db.users.findBy({ email, password });
      
      if (user) {
        return [user];
      }
      return [];
    }
    
    // If only email provided, it's a user existence check
    if (email) {
      const user = schema.db.users.findBy({ email });
      if (user) {
        return [user];
      }
      return [];
    }
    
    // Return all users if no filters
    return schema.db.users;
  });

  // Get user by ID
  server.get('/users/:id', (schema, request) => {
    const id = request.params.id;
    return schema.db.users.find(id);
  });

  // Create a new user (json-server style)
  server.post('/users', (schema, request) => {
    const attrs = JSON.parse(request.requestBody);
    
    // Check if user exists
    const existingUser = schema.db.users.findBy({ email: attrs.email });
    if (existingUser) {
      return new Response(400, {}, { error: 'User already exists' });
    }
    
    // Generate a new ID
    const newId = (schema.db.users.length + 1).toString();
    
    // Create new user
    const newUser = schema.create('user', {
      ...attrs,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return newUser.attrs;
  });

  // Transactions
  server.get('/transactions', (schema, request) => {
    const { userId, type, startDate, endDate, search } = request.queryParams;
    const transactionCollection = schema.db.transactions;
    
    // Create a regular array from the collection
    let transactionList = [...transactionCollection];
    
    // Filter by userId
    if (userId) {
      transactionList = transactionList.filter((t) => t.userId.toString() === userId);
    }
    
    // Filter by type
    if (type && type !== 'all') {
      transactionList = transactionList.filter((t) => t.type === type);
    }
    
    // Filter by date range
    if (startDate) {
      transactionList = transactionList.filter((t) => t.date >= startDate);
    }
    
    if (endDate) {
      transactionList = transactionList.filter((t) => t.date <= endDate);
    }
    
    // Filter by search term
    if (search) {
      const searchLower = String(search).toLowerCase();
      transactionList = transactionList.filter(
        (t) => 
          String(t.description || '').toLowerCase().includes(searchLower) ||
          String(t.category || '').toLowerCase().includes(searchLower)
      );
    }
    
    // Add createdAt and updatedAt if missing and format IDs as strings
    const formattedTransactions = transactionList.map(transaction => {
      return {
        ...transaction,
        id: transaction.id.toString(),
        userId: transaction.userId.toString(),
        createdAt: transaction.createdAt || new Date().toISOString(),
        updatedAt: transaction.updatedAt || new Date().toISOString()
      };
    });
    
    console.log('Mirage - Returning transactions:', formattedTransactions);
    return formattedTransactions;
  });

  server.get('/transactions/:id', (schema, request) => {
    const id = request.params.id;
    return schema.db.transactions.find(id);
  });

  server.post('/transactions', (schema, request) => {
    const attrs = JSON.parse(request.requestBody);
    console.log('Mirage - Creating transaction with data:', attrs);
    
    const newTransaction = schema.create('transaction', {
      ...attrs,
      id: schema.db.transactions.length + 1,
      date: attrs.date || new Date().toISOString().split('T')[0],
    });
    
    // Use type assertion to handle MirageJS model attributes
    const attributes = newTransaction.attrs as any;
    
    // Convert the Mirage model to a plain object and ensure ID is a string
    const transactionData = {
      ...attributes,
      id: String(attributes.id || ''),
      userId: String(attributes.userId || ''),
      createdAt: attributes.createdAt || new Date().toISOString(),
      updatedAt: attributes.updatedAt || new Date().toISOString()
    };
    
    console.log('Mirage - Returning transaction:', transactionData);
    return transactionData;
  });

  server.put('/transactions/:id', (schema, request) => {
    const id = request.params.id;
    const attrs = JSON.parse(request.requestBody);
    return schema.db.transactions.update(id, attrs);
  });

  server.delete('/transactions/:id', (schema, request) => {
    const id = request.params.id;
    schema.db.transactions.remove(id);
    return { success: true };
  });

  // Budgets
  server.get('/budgets', (schema, request) => {
    const { userId } = request.queryParams;
    const budgetCollection = schema.db.budgets;
    
    // Create a regular array from the collection
    let budgetList = [...budgetCollection];
    
    // Filter by userId
    if (userId) {
      budgetList = budgetList.filter((b) => b.userId.toString() === userId);
    }

    const formattedBudgets = budgetList.map(budget => {
      return {
        ...budget,
        id: budget.id.toString(),
        userId: budget.userId.toString(),
        createdAt: budget.createdAt || new Date().toISOString(),
        updatedAt: budget.updatedAt || new Date().toISOString()
      };
    });

    console.log('Mirage - Returning budgets:', formattedBudgets);
    return formattedBudgets;
  });

  server.get('/budgets/:id', (schema, request) => {
    const id = request.params.id;
    return schema.db.budgets.find(id);
  });

  server.post('/budgets', (schema, request) => {
    const attrs = JSON.parse(request.requestBody);
    return schema.create('budget', {
      ...attrs,
      id: schema.db.budgets.length + 1,
    });
  });

  server.put('/budgets/:id', (schema, request) => {
    const id = request.params.id;
    const attrs = JSON.parse(request.requestBody);
    return schema.db.budgets.update(id, attrs);
  });

  server.delete('/budgets/:id', (schema, request) => {
    const id = request.params.id;
    schema.db.budgets.remove(id);
    return { success: true };
  });

  server.passthrough();
};

export default routes; 