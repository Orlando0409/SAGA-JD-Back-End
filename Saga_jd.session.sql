create database proyecto;

use proyecto;
insert into Proyecto_Estado
values(1, 'En progreso'), (2, 'Activo'), (3, 'Terminado');

use proyecto;
insert into Solicitud_Estado
values(1, 'Enviada'), (2, 'En proceso'), (3, 'Finalizada');

use proyecto;
select * from Proyecto_Estado;

use proyecto;
select * from Proyecto;

select * from permisos;

use proyecto;
select * from Solicitud_Estado;

use proyecto;
select * from Solicitudes_Afiliacion;

use proyecto;
select * from Solicitud_Desconexion;

use proyecto;
select * from Solicitudes_Cambio_Medidor;

show tables;

drop database proyecto;