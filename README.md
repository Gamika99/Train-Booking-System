# Train Booking System

## Sri Lanka Colombo Fort-Badulla Line

A segment-based train seat booking system that allows seats to be booked independently for non-overlapping legs of the journey. Built as a production-ready application with proper concurrency handling and a clean UI.

## Features

### Core Features
- ✅ **Segment-based booking** - Seats can be booked for specific legs of the journey
- ✅ **Concurrent booking handling** - MongoDB transactions ensure atomic operations
- ✅ **Real-time availability** - Check seat availability instantly
- ✅ **Configurable system** - Stations, coaches, and seats are configurable
- ✅ **Responsive UI** - Works on desktop and mobile

### Booking Flow
1. Select origin and destination stations
2. View available seats on a visual map
3. Select a seat and enter passenger details
4. Confirm booking with atomic transaction
5. View and manage bookings by email

## Technology Stack

### Backend
- Node.js with Express
- TypeScript for type safety
- MongoDB with Mongoose ODM
- Atomic transactions for booking integrity
- Express-rate-limit for security

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- React Select for dropdowns
- React Hot Toast for notifications

### Infrastructure
- Docker and Docker Compose
- Nginx for frontend serving
- Environment variables for configuration

## Architecture Decisions

### Database Design
- **Stations**: Store station information with order and distance
- **Coaches**: Configurable coach types (reserved/unreserved)
- **Seats**: Individual seats with position data
- **Bookings**: Track bookings with status and leg information

### Concurrency Handling
Used MongoDB transactions with session management to ensure:
- No double-booking of seats
- Atomic creation of bookings
- Consistent state across collections

### Availability Checking
Complex query to check overlapping bookings:
- Booking starts within requested leg
- Booking ends within requested leg
- Booking completely overlaps
- Booking partially overlaps

### Price Calculation
Simple distance-based pricing:
- Base rate: LKR 10 per km
- Future enhancements planned for dynamic pricing

## Setup Instructions

### Prerequisites
- Docker and Docker Compose
- Git

### Quick Start

```bash
# Clone and start
git clone <your-repo-url>
cd train-booking-system
docker-compose up -d

# Seed database (first time only)
docker-compose exec backend npm run seed

# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm start