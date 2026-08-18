import { startApp } from 'modelence/server';
import exampleModule from '@/server/example';
import renaissanceModule from '@/server/renaissance';
import { createDemoUser } from '@/server/migrations/createDemoUser';

startApp({
  modules: [exampleModule, renaissanceModule],

  migrations: [{
    version: 1,
    description: 'Create demo user',
    handler: createDemoUser,
  }],
});
