import { createServer } from 'miragejs';
import models from './models';
import seeds from './seeds';
import routes from './routes';

export function startMirage() {
  return createServer({
    models,
    
    seeds(server) {
      seeds(server);
    },
    
    routes() {
      routes(this);
    }
  });
}

export default startMirage; 