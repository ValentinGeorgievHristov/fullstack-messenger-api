# Messenger App

This is a small fullstack messenger project.

- `frontend` - Angular app
- `backend` - NestJS API
- database - PostgreSQL

The project has:

- register and login
- users page
- messages page

## Backend on Render

The backend is deployed on Render.

Production API URL:

```txt
https://messenger-backend-rshv.onrender.com
```

Production frontend URL:

```txt
https://messenger-frontend-yrsy.onrender.com/auth
```

## Run the project locally

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on:

```txt
http://localhost:4200
```

### Backend

```bash
cd backend
npm install
npm run start:dev
```

Backend runs on:

```txt
http://localhost:3000
```

## Backend environment variables

Create `.env` file in `backend` folder and add:

```env
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secret_key
```

## Frontend environment files

- `frontend/src/environments/environment.development.ts`
- `frontend/src/environments/environment.ts`

`environment.ts` uses the Render backend.

## Notes

- local frontend uses local backend in development
- production frontend uses the Render backend
