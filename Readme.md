# Converter Service

## Konwersja mp4 na hls

## Docker

### Uruchomienie

W root'cie projektu jest docker-compose.yml

```
docker-compose up --build
```

### Struktura aplikacji
- developuję na dockerach

```
|
dokcer-compose.yml
|
-- chunk-uploader-service
-- Dockerfile
|
-- converter-service
-- Dockerfile
```

