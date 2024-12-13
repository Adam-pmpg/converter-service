# ffmpeg | wyciąganie klatek

## Wyciąganie jednej klatki z filmu

ffmpeg -i input_video.mp4 -vf "select=eq(n\,100)" -vsync vfr frame_100.png

```
-i input_video.mp4: Wskazuje plik wideo, z którego chcesz wyodrębnić klatkę.
-vf "select=eq(n\,100)": Określa, że chcesz wybrać klatkę o numerze 100. Możesz zmienić numer klatki w zależności od potrzeb.
-vsync vfr: Zapewnia, że tylko jedna klatka jest zapisana.
frame_100.png: Nazwa pliku wyjściowego (w tym przypadku zapisuje ją w formacie PNG).
```

## Wyciąganie klatki z konkretnego czasu


ffmpeg -ss 00:00:30 -i input_video.mp4 -frames:v 1 frame_at_30sec.png

```
-ss 00:00:30: Określa, że chcesz rozpocząć od 30. sekundy w wideo.
-frames:v 1: Określa, że chcesz wyciągnąć tylko jedną klatkę.
frame_at_30sec.png: Określa nazwę pliku wyjściowego.
```

## Zmiana formatu obrazu
- Możesz wybrać różne formaty obrazu, np. PNG, JPEG, BMP, itd.
- Jakość obrazu

```
ffmpeg -i input_video.mp4 -vf "select=eq(n\,100)" -vsync vfr -q:v 2 frame_100.jpg
```
```
-q:v 2: Określa jakość obrazu (dla JPEG, 1 to najlepsza jakość, 31 to najgorsza)
```

