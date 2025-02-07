# MediaWave Backend

This is a backend project for a video streaming platform built with Node.js. The project provides APIs for user authentication, video upload, streaming, and more.

## Features

- User authentication (signup, login, logout)
- Video upload and streaming
- Video metadata management
- User profile management

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB

## Getting Started

### Clone the repository

```bash
git clone https://github.com/yourusername/mediaWave-backend.git
cd mediaWave-backend
```

### Install dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```
PORT=your_port_number
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=[allowed_urls]
ACCESS_TOKEN_SECRET=your_jwt_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_jwt_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Running the Project

#### Development

To run the project in development mode with hot-reloading:

```bash
npm run dev
```

#### Production

To run the project in production mode:

```bash
npm start
```

### Running Tests

To run the test suite:

```bash
npm test
```

## Project Structure

```
/mediawave_backend
├── controllers
├── models
├── routes
├── middlewares
├── utils
├── tests
├── .env
├── package.json
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User signup
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Videos

- `POST /api/videos` - Upload a new video
- `GET /api/videos/:id` - Get video details
- `GET /api/videos/stream/:id` - Stream video

### Users

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
