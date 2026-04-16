# Pensamientos Bot

Bot que escucha mensajes en un grupo de WhatsApp y guarda los pensamientos en Google Sheets.

## Formato de mensaje

Solo necesita contener la palabra **"pensamiento"** en cualquier parte del mensaje. Case insensitive.

```
pensamiento texto
pensamiento 14:30 texto
pEnsamiento 14:30 texto
texto random pensamiento texto
pensamiento texto random
```

La hora es opcional. Si no se provee, se registra como "—".

## Setup

### 1. Google Cloud (Service Account)

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear proyecto nuevo
3. Habilitar **Google Sheets API**
4. Crear Service Account → descargar JSON
5. Crear un Google Sheet nuevo
6. Compartir el Sheet con el email del service account (algo como `bot@proyecto.iam.gserviceaccount.com`)

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con los valores del JSON del service account:

```
GOOGLE_PROJECT_ID=tu-project-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=tu-service-account@tu-proyecto.iam.gserviceaccount.com
GOOGLE_SHEET_ID=el-id-de-tu-sheet (esta en la URL del sheet)
```

### 3. Instalar y ejecutar

```bash
npm install
npm start
```

La primera vez escanea el QR con WhatsApp.

### 4. Agregar el bot al grupo

1. Abrir WhatsApp en el celular
2. Ir al grupo → info del grupo
3. Agregar participante: el numero del bot (o el numero asociado)

## Deployment en Render

1. Subir codigo a GitHub (ya esta hecho)
2. Ir a [render.com](https://render.com) → New → Web Service
3. Conectar repo `jstejman/pensamientos-bot`
4. Configurar:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Agregar variables de entorno desde `.env`
6. Deploy

**Nota:** Render duerme los servicios gratis despues de 15 min de inactividad. Para un bot pasivo esto puede ser problematico. Soluciones:
- Usar Render Plus (de pago)
- Implementar un cron que haga ping al servicio
- Usar Railway que tiene mas horas gratuitas

## Estructura

```
pensamientos-bot/
├── src/
│   ├── index.js      # Entry point
│   ├── bot.js        # WhatsApp connection
│   └── sheets.js     # Google Sheets integration
├── .env.example
├── .gitignore
└── package.json
```

## Funcionamiento

1. El bot se conecta a WhatsApp via Baileys (API no oficial)
2. Escucha todos los mensajes del grupo
3. Filtra los que matchean el patron `pensamiento hh:mm ...`
4. Guarda en Google Sheets: timestamp | hora | contenido | remitente | grupo
5. No responde en el grupo (solo observa)
