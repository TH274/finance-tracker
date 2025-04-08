import { Server } from 'miragejs';
import { users, transactions, budgets } from '../../../contains/mirageData';

const seeds = (server: Server) => {
  users.forEach((user) => {
    server.create('user', {
      ...user,
      id: user.id.toString()
    });
  });
  
  transactions.forEach((transaction) => {
    server.create('transaction', {
      ...transaction,
      id: transaction.id.toString(),
      userId: transaction.userId.toString()
    });
  });
  
  budgets.forEach((budget) => {
    server.create('budget', {
      ...budget,
      id: budget.id.toString(),
      userId: budget.userId.toString()
    });
  });
};

export default seeds; 