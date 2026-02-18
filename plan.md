# Task Management SaaS - Technical Plan

## 1. Backend Choice

### Backend: NestJS

I chose **NestJS** because it provides a clean and structured architecture out of the box. Features like **modules**, **dependency injection**, **guards**, and **validation pipes** make it easier to organize code properly and apply security consistently across the application.

- Compared to **Express**, NestJS encourages better structure and scalability from the beginning.
- Compared to **Next.js API routes**, NestJS is more suitable for building a dedicated backend service.

### Database: MongoDB (Mongoose)

I chose **MongoDB** because the data model for this system is straightforward (users and tasks with a one-to-many relationship). Since there are no complex relational requirements, MongoDB works well and allows flexible schema evolution.

**Mongoose** adds:
- Schema validation
- Indexing
- Middleware support

This stack keeps the system **clean, scalable, and secure** while remaining appropriate for the scope of this assessment.

## 2. High-Level Architecture

The system follows a simple client-server architecture:

```
Next.js Frontend -> NestJS API -> MongoDB
```

The backend is structured into separate modules:

- **Auth Module** - handles registration, login, token issuance, and refresh logic
- **Tasks Module** - manages task CRUD operations
- **Users Module** - manages user schema and persistence
- **Common Layer** - guards, exception filters, decorators, and validation logic

## 3. Authentication Strategy

The system uses **JWT-based authentication**.

- A short-lived **access token** is issued after login.
- A **refresh token** is stored in an **HTTP-only**, **Secure**, `SameSite=strict` cookie.

I intentionally avoided storing tokens in `localStorage` to reduce the risk of token theft via XSS. Using HTTP-only cookies improves security while still allowing stateless authentication.

Route protection is implemented using **NestJS Guards**, and the JWT payload contains only minimal information:

- User ID
- Email

## 4. Security Considerations

Security is considered at multiple layers of the application.

### Password Security

- Passwords are hashed using **bcrypt** with proper salt rounds.
- The password field is never returned in API responses.
- Login endpoints are protected with **rate limiting**.

### Authorization

Each task query is strictly filtered by `userId`.

- Users can only access or modify their own tasks.
- Task updates and deletions always verify both:
  - Task ID
  - Authenticated user ID

This prevents horizontal privilege escalation.

### Input Validation & Injection Prevention

- DTO validation is implemented using **class-validator**.
- A global `ValidationPipe` is enabled with `whitelist` and `forbidNonWhitelisted`.

This helps prevent:
- Mass assignment vulnerabilities
- Unexpected properties in requests
- Basic NoSQL injection patterns

### Rate Limiting

- Global rate limiting is enabled, with stricter limits on authentication routes.
- In a production scenario, this could be extended using **Redis-backed throttling** for distributed systems.

### Client-Side Security

- React's default escaping prevents most XSS risks.
- No use of `dangerouslySetInnerHTML`.
- Secure cookie configuration is used instead of `localStorage`.
- CORS is properly configured.
- Security headers such as Content Security Policy can be applied.

### Error Handling

A global exception filter ensures:

- Consistent error responses
- No stack trace leaks in production

## 5. Data Model Overview

### User

- `_id`
- `email` (unique, indexed)
- `passwordHash`
- `createdAt`

### Task

- `_id`
- `title`
- `description`
- `status` (`todo` | `in-progress` | `done`)
- `priority` (`low` | `medium` | `high`)
- `userId` (indexed)
- `createdAt`
- `updatedAt`




