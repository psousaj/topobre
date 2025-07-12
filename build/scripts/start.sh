echo "🔍 Ambiente disponível no container:"
printenv | grep -E "PG|REDIS|NODE|API|JWT|COOKIE|OTEL|RESEND|UPSTASH|PORT"
