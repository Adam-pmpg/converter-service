# Wybieramy oficjalny obraz Node.js
FROM node:18

# Instalujemy wymagane narzędzia i su-exec
RUN apt-get update && apt-get install -y \
    gcc \
    make \
    musl-dev \
    wget && \
    wget https://github.com/ncopa/su-exec/archive/refs/tags/v0.2.tar.gz && \
    tar -xzvf v0.2.tar.gz && \
    cd su-exec-0.2 && \
    make && \
    mv su-exec /usr/local/bin/su-exec && \
    cd .. && \
    rm -rf su-exec-0.2 v0.2.tar.gz && \
    apt-get remove -y gcc make musl-dev wget && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/* \

# Ustawiamy katalog roboczy w kontenerze na /app
WORKDIR /app

# Instalacja zależności systemowych (w tym FFmpeg)
RUN apt-get update && apt-get install -y ffmpeg

# Instalujemy nodemon globalnie
RUN npm install -g nodemon multer

# Kopiujemy tylko pliki package.json oraz package-lock.json
COPY package*.json ./


# Kopiujemy pliki projektu do kontenera
COPY . .

# Zmieniamy właściciela plików, aby były dostępne dla użytkownika "node"
#RUN chown -R node:node /app
#USER node

# Instalujemy zależności projektu (bez nodemon)
RUN npm install

RUN npm list --depth=0

# Kopiujemy skrypt entrypoint
COPY entrypoint.sh /usr/local/bin/
# Ustawiamy odpowiednie uprawnienia do skryptu entrypoint
RUN chmod +x /usr/local/bin/entrypoint.sh
# Ustawiamy skrypt jako domyślny entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Otwieramy port 3000, na którym nasza aplikacja będzie działać
# przeniosę to, jako mapowanie do docker-compose
# EXPOSE 3000

# Uruchamiamy aplikację za pomocą nodemon
# CMD ["nodemon", "server.js"]
CMD ["npm", "run", "dev"]
