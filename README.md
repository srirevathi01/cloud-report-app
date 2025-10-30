# AWS Cloud Dashboard - Frontend

A modern React TypeScript application for managing and monitoring AWS resources across multiple accounts.

## Features

- **Multi-Account Support**: Manage multiple AWS accounts from a single dashboard
- **Comprehensive Service Coverage**: Monitor EC2, Lambda, RDS, S3, VPC, and more
- **Security Analysis**: View security findings and recommendations for your resources
- **Real-time Updates**: Fresh data with intelligent caching
- **Responsive Design**: Clean, modern UI built with Tailwind CSS

## Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Backend API running (see cloud-report-api)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure your API URL:

```env
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_ENV=development
```

**Important**: Never commit `.env` to version control. It's already in `.gitignore`.

### 3. Start Development Server

```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── components/          # React components
│   ├── AdminPage.tsx           # Account management
│   ├── CategorySidebar.tsx     # Service category navigation
│   ├── ErrorBoundary.tsx       # Error handling wrapper
│   ├── ResourceDetail.tsx      # Resource details panel
│   ├── ResourceList.tsx        # Resource listing
│   ├── ServiceTabs.tsx         # Service tabs
│   └── TopBar.tsx              # Top navigation bar
├── config/              # Configuration files
│   └── constants.ts            # App constants
├── services/            # API services
│   └── api.ts                  # API client with caching
├── types/               # TypeScript type definitions
│   └── index.ts                # Shared types
├── utils/               # Utility functions
│   ├── logger.ts               # Logging utility
│   ├── resourceHelpers.ts      # Resource utility functions
│   └── storage.ts              # LocalStorage wrapper
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
└── index.css            # Global styles
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Backend API URL | `http://localhost:8000` |
| `REACT_APP_ENV` | Environment (development/production) | `development` |

### Adding AWS Accounts

1. Click "Manage Accounts" in the top bar
2. Enter account name and 12-digit AWS account ID
3. Click "Add Account"
4. Set one account as default
5. Save changes

**Note**: The app stores account information in browser localStorage. No hardcoded credentials are used.

## Security Features

- **No Hardcoded Credentials**: All sensitive data comes from environment variables
- **Input Validation**: Strict validation on all user inputs
- **XSS Protection**: Input sanitization and React's built-in escaping
- **localStorage Validation**: Data validation when reading from storage
- **Error Boundaries**: Graceful error handling prevents app crashes

## Performance Optimizations

- **Request Caching**: API responses cached for 30 seconds
- **Component Splitting**: Modular component architecture
- **Optimized Rendering**: Minimal re-renders with proper state management
- **Type Safety**: Full TypeScript coverage for reliability

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
