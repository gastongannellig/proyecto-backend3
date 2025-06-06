FROM node:20-alpine

# Crear directorio de la aplicación
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias incluyendo cross-env globalmente
RUN npm install -g cross-env
RUN npm install

# Copiar el código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# Exponer el puerto
EXPOSE 3000

# Comando para ejecutar la aplicación (modificado para no usar cross-env)
CMD ["node", "dist/main"]