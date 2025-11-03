# Todo App with AWS Amplify Gen 2

A simple, modern todo application built with Next.js 14+ and AWS Amplify Gen 2. This app demonstrates the power of AWS Amplify's latest generation for building full-stack serverless applications with authentication and real-time data.

## Features

- ✨ Create, read, update, and delete todos
- 🔐 User authentication with AWS Cognito
- 🎨 Modern UI with Tailwind CSS
- 🌙 Dark mode support
- 📱 Responsive design
- ⚡ Real-time data synchronization
- 🔒 Per-user data isolation

## Tech Stack

- **Frontend**: Next.js 14+ with TypeScript and React 19
- **Backend**: AWS Amplify Gen 2
- **Authentication**: Amazon Cognito
- **Database**: AWS AppSync with DynamoDB
- **Styling**: Tailwind CSS
- **UI Components**: AWS Amplify UI React

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.x or later
- npm or yarn
- An AWS account (for deployment)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/justinclayton/todo-amplify-test.git
cd todo-amplify-test
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up AWS Amplify

To deploy the backend to AWS, you'll need to:

1. Install the Amplify CLI globally (if not already installed):
   ```bash
   npm install -g @aws-amplify/cli
   ```

2. Configure Amplify with your AWS credentials:
   ```bash
   amplify configure
   ```

3. Initialize and deploy the Amplify backend:
   ```bash
   npx ampx sandbox
   ```

   This will create a cloud sandbox environment for development. The sandbox will generate an `amplify_outputs.json` file with your backend configuration.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
todo-amplify-test/
├── amplify/                    # Amplify backend configuration
│   ├── auth/                   # Authentication resources
│   │   └── resource.ts
│   ├── data/                   # Data model and API
│   │   └── resource.ts
│   └── backend.ts              # Backend resource definitions
├── app/                        # Next.js app directory
│   ├── components/             # React components
│   │   ├── ConfigureAmplify.tsx
│   │   └── TodoApp.tsx
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── amplify_outputs.json        # Amplify backend configuration (generated)
└── package.json
```

## Data Model

The app uses a simple Todo model with the following schema:

```typescript
Todo {
  id: string (auto-generated)
  content: string
  isDone: boolean
  owner: string (auto-managed by Amplify)
}
```

Each todo is automatically associated with the authenticated user, ensuring data privacy.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint

## Deployment

### Deploy to AWS Amplify Hosting

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Go to the [AWS Amplify Console](https://console.aws.amazon.com/amplify/)

3. Click "New app" > "Host web app"

4. Connect your repository and select the branch

5. Amplify will automatically detect the Next.js app and configure build settings

6. Click "Save and deploy"

The app will be built and deployed automatically. Amplify will provide a URL for your live application.

## Authentication

The app uses AWS Cognito for user authentication. Users can:
- Sign up with email and password
- Sign in with their credentials
- Sign out
- Reset forgotten passwords

All todos are private to each user, with data isolation handled automatically by Amplify.

## Customization

### Modifying the Data Model

To change the todo schema, edit `amplify/data/resource.ts`:

```typescript
const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
      isDone: a.boolean(),
      // Add more fields here
    })
    .authorization((allow) => [allow.owner()]),
});
```

After making changes, redeploy the backend:
```bash
npx ampx sandbox
```

### Styling

The app uses Tailwind CSS v4 for styling. Tailwind v4 uses a new configuration approach:

- **Theme customization**: Edit the `@theme inline` block in `app/globals.css` to customize colors, fonts, and other design tokens.
- **PostCSS configuration**: The `postcss.config.mjs` file configures the Tailwind PostCSS plugin.

Example of customizing colors in `app/globals.css`:

```css
@theme inline {
  --color-primary: #your-color-here;
  --color-secondary: #your-color-here;
}
```

## Learn More

- [AWS Amplify Gen 2 Documentation](https://docs.amplify.aws/gen2/)
- [Next.js Documentation](https://nextjs.org/docs)
- [AWS Amplify UI Documentation](https://ui.docs.amplify.aws/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
