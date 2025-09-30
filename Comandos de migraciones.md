# 📦 Migraciones con TypeORM en NestJS

Este proyecto usa **TypeORM + migraciones** para mantener la base de datos sincronizada de forma controlada y evitar tener que borrar y recrear datos cada vez que hay cambios.

---

## ⚙️ Scripts disponibles

Antes de generar una migracion deben correr el siguiente comando:

npm run build

En el `package.json` ya están definidos los siguientes comandos para trabajar con migraciones:

npm run migration:generate                                  Genera una nueva migracion (sin nombre).
npm run migration:generate -- src/Migrations/               Genera una migracion con el nombre que se le de luego del 'Migrations/'.
npm run migration:run                                       Corre la ultima migracion creada en la carpeta de 'Migrations'.
npm run migration:revert                                    Revierte la migracion actual a la anterior, por si hay errores.
