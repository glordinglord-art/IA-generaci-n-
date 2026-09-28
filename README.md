# Equa · Chatbot de igualdad de género

Una interfaz bilingüe (español/inglés) para conversar y aprender sobre igualdad de género. Está construida con Next.js App Router y conecta con Gemini desde el servidor para que la API key nunca llegue al navegador.

## Ejecutar en local

```bash
npm install
copy .env.example .env.local
npm run dev
```

Después, abre [http://localhost:3000](http://localhost:3000). Añade tu credencial en `.env.local`:

```env
GEMINI_API_KEY=tu_clave_de_google_ai_studio
GEMINI_MODEL=gemini-3.8-flash
GEMINI_DEEP_MODEL=gemini-3.8-flash
GEMINI_FAST_MODEL=gemini-3.5-flash-lite
```

Equa usa en modo automático un modelo Flash Lite para preguntas sencillas y un Flash más potente para historia, comparaciones, países y estadísticas. Si el modelo principal falla por cuota, prueba el siguiente modelo disponible antes de activar el modo de demostración. Si `GEMINI_API_KEY` está vacío, la app sigue funcionando con respuestas educativas locales de demostración. En Vercel, configura las mismas variables en Project Settings → Environment Variables y vuelve a desplegar.

## Arquitectura

- `app/components/equity-chat.tsx`: interfaz, estado de conversación, idioma y accesibilidad.
- `app/api/chat/route.ts`: adaptador HTTP/server-side para Gemini y fallback seguro.
- `lib/chat/prompts.ts`: instrucción del asistente y conocimiento base de demostración.
- `lib/chat/types.ts`: tipos del dominio de conversación.

## Verificación

```bash
npm run lint
npm run build
```
