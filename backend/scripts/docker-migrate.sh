#!/bin/sh
# Run Prisma migration inside Docker container
# This avoids Windows -> Docker authentication issues

cd /app
npx prisma migrate deploy

