import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*
 * Define the Todo data model
 * @see https://docs.amplify.aws/gen2/build-a-backend/data/
 */
const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
      isDone: a.boolean(),
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
