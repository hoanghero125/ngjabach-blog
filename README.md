# **_NgJaBach Blog_**

> - Release: V2.0

**Website:** [_ngjabach.blog_](https://ngjabach.blog)

**Designed and Developed by:** _Đỗ Phạm Bảo Hoàng_ **_-_** [**_Dek_**](https://github.com/hoanghero125)

## Description

This is the source code for NgJaBach Blog, a personal blog of [**_Nguyễn Gia Bách_**](https://github.com/NgJaBach). The blog serves as a platform for sharing knowledge and insights about AI, machine learning, programming, and emerging technologies. It was built to create a space where tech enthusiasts can find valuable information, tutorials, and perspectives on the ever-evolving world of technology.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, Badge)
│   ├── BlogList.tsx    # Blog listing component
│   ├── Footer.tsx      # Site footer
│   └── Navbar.tsx      # Navigation bar
├── context/            # React context providers
│   ├── AuthContext.tsx
│   ├── FooterAnimationContext.tsx
│   └── SearchContext.tsx
├── lib/                # Utilities and configurations
│   ├── db.js          # Database connection
│   ├── middleware/    # Custom middleware
│   └── models/        # Database models (User, Blog)
├── pages/             # Next.js pages and API routes
│   ├── api/          # API endpoints
│   ├── admin/        # Admin interface
│   └── about.tsx     # About page
└── styles/           # Global styles
```

## Tech Stack

- **Frontend:** Next.js 15.2.4 with React 19
- **Backend:** Express 5.1.0
- **Database:** MongoDB with Mongoose 8.18.1
- **Styling:** Tailwind CSS 4
- **Authentication:** JWT with bcrypt
- **Editor:** React MD Editor with markdown support
- **Language:** TypeScript 5.8.2


## Features

- Responsive design for all devices
- Server-side rendering with Turbopack for improved performance
- Dynamic content management with drag & drop interface
- User authentication and admin panel
- Rich markdown editor with syntax highlighting
- Advanced search functionality
- Categories and tags system
- Mobile-optimized interface
- Syntax highlighting with highlight.js
- Modern React 19 features


## Local Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- MongoDB database


### Installation

1. Clone the repository

```bash
git clone https://github.com/hoanghero125/ngjabach-blog.git
cd ngjabach-blog
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration values:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Running the Development Server

1. Start the development server with Turbopack

```bash
npm run dev
# or
yarn dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

### Building for Production

1. Build the application

```bash
npm run build
# or
yarn build
```

2. Start the production server

```bash
npm run start:prod
# or
npm start
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
