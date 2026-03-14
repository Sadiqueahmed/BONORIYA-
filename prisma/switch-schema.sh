#!/bin/bash

# Script to switch between development (SQLite) and production (PostgreSQL) schemas

if [ "$1" == "dev" ]; then
    echo "Switching to development schema (SQLite)..."
    cp prisma/schema.dev.prisma prisma/schema.prisma
    echo "Done! Now using SQLite for local development."
elif [ "$1" == "prod" ]; then
    echo "Switching to production schema (PostgreSQL)..."
    # The main schema is already PostgreSQL
    echo "Done! Now using PostgreSQL for production."
else
    echo "Usage: ./prisma/switch-schema.sh [dev|prod]"
    echo "  dev  - Use SQLite for local development"
    echo "  prod - Use PostgreSQL for production (Vercel)"
fi
