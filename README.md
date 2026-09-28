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
```

Solo necesitas configurar `GEMINI_API_KEY`. Equa intenta primero el modelo más potente y, si tarda más de 7 segundos o falla por cuota, continúa automáticamente con `gemini-3.5-flash-lite` y `gemini-3.1-flash-lite`, que tienen mayor disponibilidad. Si todos fallan, usa respuestas educativas locales de demostración. En Vercel, configura esta variable en Project Settings → Environment Variables y vuelve a desplegar.

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
