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
git clone https://github.com/yourusername/youtube_backend.git
cd youtube_backend
```

### Install dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=your_port_number
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
/youtube_backend
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
