import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

/**
 * Amplify Gen 2 Backend Definition
 * Defines the complete backend infrastructure for the Todo application
 */
export const backend = defineBackend({
  auth,
  data,
});
