import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * Data Schema for Todo App
 * Defines the Todo model with owner-based authorization
 */
const schema = a.schema({
  Todo: a
    .model({
      name: a.string().required(),
      description: a.string(),
      completed: a.boolean().default(false),
      owner: a.string(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
