#!/bin/bash
# HTTPS 개발 서버 시작 스크립트

echo "🔐 Starting Next.js with HTTPS..."
echo "Frontend: https://localhost:3000"
echo "Backend: https://localhost:8443"

# SSL 검증 비활성화하고 HTTPS 개발 서버 실행
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev:https
