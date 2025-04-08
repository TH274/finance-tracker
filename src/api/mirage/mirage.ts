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
      // Set namespace for all routes
      this.namespace = 'api';
      
      // Add routes from routes file
      routes(this);
      
      // Allow passthrough for anything not handled by MirageJS
      // This is important when mixing real server calls with mirage
      this.passthrough();
      
      // Reset namespace after defining routes to avoid prefixing external requests
      this.namespace = '';
    }
  });
}

export default startMirage; 