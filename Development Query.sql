drop database proyecto;

create database proyecto;

use proyecto;

show tables;

select * from migrations;

select * from estado_solicitud;

select * from estado_afiliado;

select * from estado_proveedor;

select * from estado_material;

select * from estado_categoria;

select * from estado_unidad_medicion;

select * from estado_proyecto;

select * from estado_calidad_agua;

select * from estado_medidor;

select * from solicitud;

select * from solicitud_fisica;

select * from solicitud_juridica;

select * from solicitud_afiliacion_fisica;

select * from solicitud_afiliacion_juridica;

select * from solicitud_cambio_medidor_fisica;

select * from solicitud_cambio_medidor_juridica;

select * from solicitud_desconexion_fisica;

select * from solicitud_desconexion_juridica;

select * from solicitud_asociado_fisica;

select * from solicitud_asociado_juridica;

select * from proyecto;

select * from afiliado;

select * from afiliado_fisico;

select * from afiliado_juridico;

select * from proveedor;

select * from proveedor_fisico;

select * from proveedor_juridico;

select * from calidad_agua;

select * from acta;

select * from archivo_acta;

select * from usuario;

select * from permisos;

select * from rol_permiso;

select * from material;

select * from material_categoria;

select * from categoria;

select * from unidades_medicion;

select * from movimiento;

select * from medidor;

select * from lectura;

select * from faq;

select * from auditoria;

select * from manuales;

select * from tipo_tarifa_lectura;

SELECT * FROM rango_afiliados;

SELECT * FROM rango_consumo;

SELECT * FROM cargo_fijo_tarifas;

SELECT * FROM tipo_tarifa_cargo_fijo;

select * from aplicar_sello_calidad;

select * from tarifa_lectura_sin_sello;

select * from rango_afiliados_sin_sello;

select * from rango_consumo_sin_sello;

select * from cargo_fijo_tarifas_sin_sello;

select * from precio_bloque_consumo_sin_sello;

select * from recurso_hidrico_sin_sello;

select * from bloque_recurso_hidrico_sin_sello;

select * from precio_recurso_hidrico_sin_sello;

select * from tarifa_hidrante_sin_sello;

select * from factura;