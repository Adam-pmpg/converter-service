# Rozdziały

## Wyciąganie istniejących rozdziałów

ffmpeg -i input.mp4 -f ffmetadata chapters.txt

## Obsługiwane formaty

MP4
MKV
MOV

Uwaga: HLS  (HTTP Live Streaming) nie obsługuje rozdziałów (Chapters)

## Workaround tworzenia rozdziałów dla HLS

Można mieć linki ustawiające video na określonej sekundzie
Trzeba by tylko gdzieś mieć zapisane te nastawy Rozdziałów, np. w bazie danych

```
<button onclick="jumpTo(0)">Rozdział 1</button>
<script>
    function jumpTo(seconds) {
        player.currentTime = seconds;
    }
</script>
```
