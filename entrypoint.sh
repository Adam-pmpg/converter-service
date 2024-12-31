#!/bin/bash

# Tworzenie katalogów, jeśli nie istnieją
mkdir -p /app/hls-files

# Sprawdzamy, czy mamy uprawnienia do zmiany właściciela
if [ "$(id -u)" -eq 0 ]; then
  # Ustawiamy właściciela na użytkownika 'node'
  chown -R node:node /app/hls-files
fi

# Uruchamiamy aplikację jako 'node'
exec su-exec node "$@"

