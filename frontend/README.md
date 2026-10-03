# Gaspronal Frontend

Next.js 16 + React 19 + TypeScript + Tailwind CSS 4.

## Instalación

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

El JWT del backend se conserva en una cookie HttpOnly a través del BFF de Next.js. El dashboard valida la sesión contra Laravel antes de renderizar contenido privado.

Los colores corporativos definitivos todavía no deben inventarse: se incorporarán después de extraer la paleta real de los activos/web vigente de Gaspronal.
