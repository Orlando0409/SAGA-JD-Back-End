import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Costos_Por_Bloque')
export abstract class CostosPorBloque {
    @PrimaryGeneratedColumn()
    Id_Costo_Por_Bloque: number;

    @Column({ type: 'int', nullable: false })
    Id_Tipo_Tarifa_Lectura: number;

    @Column({ type: 'int', nullable: false })
    Id_Bloque: number;
}



// Residencial
@Entity('Costos_Por_Bloque_Residencial_Uno')
export class CostosPorBloqueResidencialUno extends CostosPorBloque { }

@Entity('Costos_Por_Bloque_Residencial_Dos')
export class CostosPorBloqueResidencialDos extends CostosPorBloque { }

@Entity('Costos_Por_Bloque_Residencial_Tres')
export class CostosPorBloqueResidencialTres extends CostosPorBloque { }

@Entity('Costos_Por_Bloque_Residencial_Cuatro')
export class CostosPorBloqueResidencialCuatro extends CostosPorBloque { }



// Comercio y Servicios
@Entity('Costos_Por_Bloque_Comercio_Y_Servicios_Uno')
export class CostosPorBloqueComercioYServiciosUno extends CostosPorBloque { }

@Entity('Costos_Por_Bloque_Comercio_Y_Servicios_Dos')
export class CostosPorBloqueComercioYServiciosDos extends CostosPorBloque { }

@Entity('Costos_Por_Bloque_Comercio_Y_Servicios_Tres')
export class CostosPorBloqueComercioYServiciosTres extends CostosPorBloque { }

@Entity('Costos_Por_Bloque_Comercio_Y_Servicios_Cuatro')
export class CostosPorBloqueComercioYServiciosCuatro extends CostosPorBloque { }



// Industrial
@Entity('Costos_Por_Bloque_Industrial_Uno')
export class CostosPorBloqueIndustrialUno extends CostosPorBloque { }

@Entity('Costos_Por_Bloque_Industrial_Dos')
export class CostosPorBloqueIndustrialDos extends CostosPorBloque { }

@Entity('Costos_Por_Bloque_Industrial_Tres')
export class CostosPorBloqueIndustrialTres extends CostosPorBloque { }

@Entity('Costos_Por_Bloque_Industrial_Cuatro')
export class CostosPorBloqueIndustrialCuatro extends CostosPorBloque { }



// Preferencial
@Entity('Costos_Por_Bloque_Preferencial_Uno')
export class CostosPorBloquePreferencialUno extends CostosPorBloque { }

@Entity('Costos_Por_Bloque_Preferencial_Dos')
export class CostosPorBloquePreferencialDos extends CostosPorBloque { }

@Entity('Costos_Por_Bloque_Preferencial_Tres')
export class CostosPorBloquePreferencialTres extends CostosPorBloque { }

@Entity('Costos_Por_Bloque_Preferencial_Cuatro')
export class CostosPorBloquePreferencialCuatro extends CostosPorBloque { }



// Grandes Consumidores
@Entity('Costos_Por_Bloque_Grandes_Consumidores_Uno')
export class CostosPorBloqueGrandesConsumidoresUno extends CostosPorBloque { }

@Entity('Costos_Por_Bloque_Grandes_Consumidores_Dos')
export class CostosPorBloqueGrandesConsumidoresDos extends CostosPorBloque { }

@Entity('Costos_Por_Bloque_Grandes_Consumidores_Tres')
export class CostosPorBloqueGrandesConsumidoresTres extends CostosPorBloque { }

@Entity('Costos_Por_Bloque_Grandes_Consumidores_Cuatro')
export class CostosPorBloqueGrandesConsumidoresCuatro extends CostosPorBloque { }



// Residencial Pobreza Basica
@Entity('Costos_Por_Bloque_Residencial_Pobreza_Basica_Uno')
export class CostosPorBloqueResidencialPobrezaBasicaUno extends CostosPorBloque {}

@Entity('Costos_Por_Bloque_Residencial_Pobreza_Basica_Dos')
export class CostosPorBloqueResidencialPobrezaBasicaDos extends CostosPorBloque {}

@Entity('Costos_Por_Bloque_Residencial_Pobreza_Basica_Tres')
export class CostosPorBloqueResidencialPobrezaBasicaTres extends CostosPorBloque {}

@Entity('Costos_Por_Bloque_Residencial_Pobreza_Basica_Cuatro')
export class CostosPorBloqueResidencialPobrezaBasicaCuatro extends CostosPorBloque {}