import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

/**
 * Configure Amplify with the generated outputs
 * This file is auto-generated during deployment
 */
Amplify.configure(outputs);

export default Amplify;
