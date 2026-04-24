# 📦 Migraciones con TypeORM en NestJS

Este proyecto usa **TypeORM + migraciones** para mantener la base de datos sincronizada de forma controlada y evitar tener que borrar y recrear datos cada vez que hay cambios.

---

## ⚙️ Scripts disponibles

Antes de generar una migracion deben correr el siguiente comando:

npm run build

En el `package.json` ya están definidos los siguientes comandos para trabajar con migraciones:

npm run mig:gen                                       Genera una nueva migracion (sin nombre).
npm run mig:run                                       Corre la ultima migracion creada en la carpeta de 'Migrations'.
npm run mig:rev                                       Revierte la migracion actual a la anterior, por si hay errores.
npm run mig: -- src/Migrations/                       Genera una migracion con el nombre que se le de luego del 'Migrations/'.

PD: No es necesario volver a tocar el app.module ademas de para agregar nuevas entidades, el synchronize ya no debe usarse, todo se maneja con migraciones.