// Sample data to use when offline
const users = [
    {
      id: 1,
      email: 'user@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      createdAt: '2025-04-01T00:00:00.000Z',
      updatedAt: '2025-04-01T00:00:00.000Z'
    },
    {
      id: 2,
      email: 'test@example.com',
      password: 'test123',
      firstName: 'Test',
      lastName: 'User',
      name: 'Test User',
      createdAt: '2025-04-02T00:00:00.000Z',
      updatedAt: '2025-04-02T00:00:00.000Z'
    }
  ];
  
  const transactions = [
    {
      id: 1,
      userId: 1,
      type: 'income',
      category: 'Salary',
      amount: 5000,
      date: '2025-04-01',
      description: 'Monthly salary',
    },
    {
      id: 2,
      userId: 1,
      type: 'expense',
      category: 'Groceries',
      amount: 150,
      date: '2025-04-02',
      description: 'Weekly groceries',
    },
    {
      id: 3,
      userId: 1,
      type: 'expense',
      category: 'Utilities',
      amount: 200,
      date: '2025-04-03',
      description: 'Electricity bill',
    },
    {
      id: 4,
      userId: 1,
      type: 'income',
      category: 'Freelance',
      amount: 1000,
      date: '2025-04-05',
      description: 'Freelance project',
    },
    {
      id: 5,
      userId: 1,
      type: 'expense',
      category: 'Dining',
      amount: 75,
      date: '2025-04-07',
      description: 'Dinner with friends',
    },
  ];
  
  const budgets = [
    {
      id: 1,
      userId: 1,
      category: 'Groceries',
      limit: 500,
      period: 'monthly',
    },
    {
      id: 2,
      userId: 1,
      category: 'Dining',
      limit: 300,
      period: 'monthly',
    },
    {
      id: 3,
      userId: 1,
      category: 'Entertainment',
      limit: 200,
      period: 'monthly',
    },
    {
      id: 4,
      userId: 1,
      category: 'Utilities',
      limit: 250,
      period: 'monthly',
    },
  ];

  export { users, transactions, budgets };