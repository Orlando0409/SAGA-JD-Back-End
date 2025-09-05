create database proyecto;
use proyecto;

insert into proyecto_estado
values(1, 'En planeamiento'), (2, 'En progreso'), (3, 'Terminado');

insert into solicitud_estado
values(1, 'Pendiente'), (2, 'Revisada'), (3, 'Aprobada'), (4, 'Rechazada');

select * from proyecto_estado;

select * from solicitud_estado;

select * from proyecto;

select * from solicitudes_afiliacion;

select * from solicitudes_desconexion;

select * from solicitudes_asociado;

select * from solicitudes_cambio_medidor;

select * from calidad_agua;

show tables;

drop database proyecto;
