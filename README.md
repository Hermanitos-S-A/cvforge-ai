# ePersona

**Crea tu currículum profesional, analiza su compatibilidad ATS y mejora tu presentación con inteligencia artificial.**

Con ePersona puedes organizar tu experiencia, elegir plantillas, exportar tu CV en PDF y crear un portafolio. Está disponible en español, inglés y portugués.

## ¿Cómo funciona?

1. Crea tu cuenta y verifica tu correo electrónico.
2. Completa tu información profesional y elige una plantilla.
3. Mejora tu perfil con IA y analiza ofertas de empleo.
4. Exporta tu CV o genera tu portafolio.

La plataforma ofrece **Free** (con límites de uso) y **Pro** (suscripción procesada por Stripe). La IA utiliza Ollama de forma local de manera predeterminada; el uso de proveedores externos requiere consentimiento.

## Ejecutar en tu equipo

Necesitas Docker y Docker Compose. Antes de iniciar, configura una clave secreta segura en tu terminal; no debes guardarla en el repositorio.

```bash
export SECRET_KEY="$(python3 -c 'import secrets; print(secrets.token_urlsafe(48))')"
docker compose up -d --build
docker exec epersona-ollama ollama pull mistral
```

Abre **http://localhost:3000**. Los contenedores y las imágenes se identifican como **ePersona** y el backend utiliza un volumen administrado por Docker para evitar errores de permisos de SQLite en Windows. Ollama no expone su puerto al exterior.

Si utilizabas una versión anterior que guardaba usuarios y currículums en `./data`, detén el proyecto antiguo **sin `-v`**, conserva esa carpeta, ejecuta una sola vez `bash scripts/import-existing-data.sh` desde la raíz del proyecto y después inicia el nuevo Compose. El script crea una copia de respaldo y se niega a sobrescribir datos existentes. No ejecutes `docker compose down -v` porque eliminaría los volúmenes.

Para registrar usuarios debes configurar un servidor de correo SMTP. Para habilitar Pro configura tus propias claves y precios de Stripe; sin ellas los pagos permanecen desactivados. En producción también necesitas HTTPS, una base de datos protegida y ejecutar las migraciones Alembic.

## Tecnologías

Next.js, React, Tailwind CSS, FastAPI, SQLAlchemy, Alembic, Ollama, Stripe y ReportLab.

## Privacidad

Los currículums y el historial de IA se guardan hasta que los elimines o solicites borrar tu cuenta. Puedes exportar tus datos desde la API autenticada. Los pagos están sujetos a la política de retención de Stripe.

**Proyecto en evolución.** La disponibilidad de funciones depende de la configuración y del plan contratado.
