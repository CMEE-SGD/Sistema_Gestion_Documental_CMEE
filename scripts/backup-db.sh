#!/bin/sh
# Respaldo diario de la base de datos de CMEE_SGD.
#
# Se guarda FUERA del repositorio (por defecto en ~/backups-cmee-sgd), para
# que un dump con datos reales nunca pueda terminar versionado por accidente
# en git (ya pasó una vez con datos.sql — ver historial del repo).
#
# Uso en el servidor de producción, vía cron (ver README junto a este script
# o pedirle a Claude el comando de crontab exacto).
set -eu

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups-cmee-sgd}"
RETENCION_DIAS="${RETENCION_DIAS:-14}"
FECHA="$(date +%F_%H%M%S)"

mkdir -p "$BACKUP_DIR"

cd "$REPO_DIR"
set -a
. ./.env
set +a

ARCHIVO="$BACKUP_DIR/cmee_sgd_${FECHA}.sql.gz"

docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" | gzip > "$ARCHIVO"

echo "Respaldo creado: $ARCHIVO ($(du -h "$ARCHIVO" | cut -f1))"

# Retención: borra dumps más viejos que RETENCION_DIAS para no llenar el disco.
find "$BACKUP_DIR" -name 'cmee_sgd_*.sql.gz' -mtime +"$RETENCION_DIAS" -delete

echo "Respaldos actuales en $BACKUP_DIR:"
ls -lh "$BACKUP_DIR"
