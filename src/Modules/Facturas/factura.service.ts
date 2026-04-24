import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura } from './FacturaEntities/Factura.Entity';
import { EstadoFactura } from './FacturaEntities/EstadoFactura.Entity';
import { Lectura } from '../Lecturas/LecturaEntities/Lectura.Entity';
import { Afiliado, AfiliadoFisico, AfiliadoJuridico } from '../Afiliados/AfiliadoEntities/Afiliado.Entity';
import { FacturaGeneradaResponseDTO } from './FacturaDTO\'s/FacturaResponse.dto';
import { TarifaLecturaSinSello } from '../Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/TarifaLecturaSinSello.Entity';
import { RangoAfiliadosSinSello } from '../Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/RangoAfiliadosSinSello.Entity';
import { RangoConsumoSinSello } from '../Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/RangoConsumoSinSello.Entity';
import { CargoFijoTarifasSinSello } from '../Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/CargoFijoTarifasSinSello.Entity';
import { PrecioBloqueConsumoSinSello } from '../Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/PrecioBloqueConsumoSinSello.Entity';
import { RecursoHidricoSinSello } from '../Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/RecursoHidricoSinSello.Entity';
import { BloqueRecursoHidricoSinSello } from '../Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/BloqueRecursoHidricoSinSello.Entity';
import { PrecioRecursoHidricoSinSello } from '../Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/PrecioRecursoHidricoSinSello.Entity';
import { TarifaHidranteSinSello } from '../Tarifas/Sin Sello Calidad/TarifaSinSelloEntities/TarifaHidranteSinSello.Entity';

@Injectable()
export class FacturaService {
    constructor(
        @InjectRepository(Factura)
        private facturaRepository: Repository<Factura>,

        @InjectRepository(EstadoFactura)
        private estadoFacturaRepository: Repository<EstadoFactura>,

        @InjectRepository(Lectura)
        private lecturaRepository: Repository<Lectura>,

        @InjectRepository(Afiliado)
        private afiliadoRepository: Repository<Afiliado>,

        @InjectRepository(AfiliadoFisico)
        private afiliadoFisicoRepository: Repository<AfiliadoFisico>,

        @InjectRepository(AfiliadoJuridico)
        private afiliadoJuridicoRepository: Repository<AfiliadoJuridico>,

        @InjectRepository(TarifaLecturaSinSello)
        private tarifaLecturaSinSelloRepository: Repository<TarifaLecturaSinSello>,

        @InjectRepository(RangoAfiliadosSinSello)
        private rangoAfiliadosSinSelloRepository: Repository<RangoAfiliadosSinSello>,

        @InjectRepository(RangoConsumoSinSello)
        private rangoConsumoSinSelloRepository: Repository<RangoConsumoSinSello>,

        @InjectRepository(CargoFijoTarifasSinSello)
        private cargoFijoTarifasSinSelloRepository: Repository<CargoFijoTarifasSinSello>,

        @InjectRepository(PrecioBloqueConsumoSinSello)
        private precioBloqueConsumoSinSelloRepository: Repository<PrecioBloqueConsumoSinSello>,

        @InjectRepository(RecursoHidricoSinSello)
        private recursoHidricoSinSelloRepository: Repository<RecursoHidricoSinSello>,

        @InjectRepository(BloqueRecursoHidricoSinSello)
        private bloqueRecursoHidricoSinSelloRepository: Repository<BloqueRecursoHidricoSinSello>,

        @InjectRepository(PrecioRecursoHidricoSinSello)
        private precioRecursoHidricoSinSelloRepository: Repository<PrecioRecursoHidricoSinSello>,

        @InjectRepository(TarifaHidranteSinSello)
        private tarifaHidranteSinSelloRepository: Repository<TarifaHidranteSinSello>,
    ) { }

    // ====================================
    // MÉTODOS DE CONSULTA BÁSICOS
    // ====================================

    async getAllFacturas(): Promise<FacturaGeneradaResponseDTO[]> {
        const facturas = await this.facturaRepository.find({
            relations: ['Estado', 'Afiliado', 'Lectura', 'Lectura.Medidor'],
            order: { Fecha_Emision: 'DESC' }
        });

        return Promise.all(facturas.map(factura => this.formatearFacturaParaResponse(factura)));
    }

    async getFacturaByAfiliado(idAfiliado: number): Promise<FacturaGeneradaResponseDTO[]> {
        const facturas = await this.facturaRepository.find({ 
            where: { Afiliado: { Id_Afiliado: idAfiliado } },
            relations: ['Estado', 'Afiliado', 'Lectura', 'Lectura.Medidor'],
            order: { Fecha_Emision: 'DESC' }
        });

        return Promise.all(facturas.map(factura => this.formatearFacturaParaResponse(factura)));
    }

    // ====================================
    // MÉTODOS AUXILIARES DE FORMATEO
    // ====================================

    // Formatea una factura existente al DTO de respuesta con toda la información
    private async formatearFacturaParaResponse(factura: Factura): Promise<FacturaGeneradaResponseDTO> {
        // Determinar si el afiliado es físico o jurídico
        const tipoAfiliado = factura.Afiliado.Tipo_Entidad;
        const nombreCompleto = factura.Nombre_Completo_Afiliado || '';
        const identificacion = factura.Identificacion_Afiliado || '';

        return {
            Id_Factura: factura.Id_Factura,
            Numero_Factura: factura.Numero_Factura,
            Afiliado: tipoAfiliado === 1 ? {
                Id_Afiliado: factura.Afiliado.Id_Afiliado,
                Nombre_Completo: nombreCompleto,
                Identificacion: identificacion
            } : {
                Id_Afiliado: factura.Afiliado.Id_Afiliado,
                Razon_Social: nombreCompleto,
                Cedula_Juridica: identificacion
            },
            Lectura: {
                Id_Lectura: factura.Lectura.Id_Lectura,
                Numero_Medidor: factura.Lectura.Medidor.Numero_Medidor,
                Fecha_Lectura: factura.Lectura.Fecha_Lectura,
                Valor_Lectura_Anterior: factura.Lectura.Valor_Lectura_Anterior,
                Valor_Lectura_Actual: factura.Lectura.Valor_Lectura_Actual,
            },
            Consumo_M3: Number(factura.Consumo_M3),
            Cargo_Fijo: `₡${Number(factura.Cargo_Fijo).toFixed(2)}`,
            Cargo_Consumo: `₡${Number(factura.Cargo_Consumo).toFixed(2)}`,
            Cargo_Recurso_Hidrico: `₡${Number(factura.Cargo_Recurso_Hidrico || 0).toFixed(2)}`,
            Otros_Cargos: `₡${Number(factura.Otros_Cargos || 0).toFixed(2)}`,
            Subtotal: `₡${Number(factura.Subtotal).toFixed(2)}`,
            Impuestos: `₡${Number(factura.Impuestos).toFixed(2)}`,
            Total: `₡${Number(factura.Total).toFixed(2)}`,
            Fecha_Emision: factura.Fecha_Emision,
            Fecha_Vencimiento: factura.Fecha_Vencimiento,
            Estado: {
                Id_Estado_Factura: factura.Estado.Id_Estado_Factura,
                Nombre_Estado: factura.Estado.Nombre_Estado
            },
            Tipo_Tarifa_Aplicada: factura.Tipo_Tarifa_Aplicada,
            Observaciones: factura.Observaciones
        };
    }

    // ====================================
    // MÉTODOS AUXILIARES DE CÁLCULO
    // ====================================

    // Cuenta la cantidad de afiliados activos en el sistema
    private async contarAfiliadosActivos(): Promise<number> {
        return await this.afiliadoRepository.count({
            where: { Estado: { Id_Estado_Afiliado: 1 } } // 1 = Activo
        });
    }

    // Obtiene el rango de afiliados correspondiente según la cantidad actual de afiliados activos
    private async obtenerRangoAfiliadosActual(): Promise<RangoAfiliadosSinSello> {
        const totalAfiliados = await this.contarAfiliadosActivos();

        const rango = await this.rangoAfiliadosSinSelloRepository
            .createQueryBuilder('rango')
            .where('rango.Minimo_Afiliados <= :total', { total: totalAfiliados })
            .andWhere('rango.Maximo_Afiliados >= :total', { total: totalAfiliados })
            .getOne();

        if (!rango) {
            throw new NotFoundException(
                `No se encontró un rango de afiliados para ${totalAfiliados} afiliados activos`
            );
        }

        console.log(`✅ Afiliados activos: ${totalAfiliados} → Rango: ${rango.Nombre_Rango}`);
        return rango;
    }

    // Obtiene el cargo fijo según el tipo de tarifa y el rango de afiliados
    private async obtenerCargoFijo(
        idTipoTarifa: number,
        idRangoAfiliados: number
    ): Promise<number> {
        const cargoFijo = await this.cargoFijoTarifasSinSelloRepository.findOne({
            where: {
                Tipo_Tarifa: { Id_Tarifa_Lectura: idTipoTarifa },
                Rango_Afiliados: { Id_Rango_Afiliados: idRangoAfiliados },
                Activo: true
            }
        });

        if (!cargoFijo) {
            throw new NotFoundException(
                `No se encontró cargo fijo para tarifa ${idTipoTarifa} y rango ${idRangoAfiliados}`
            );
        }

        return Number(cargoFijo.Cargo_Fijo_Por_Mes);
    }

    // Calcula el cargo por consumo de agua según rangos progresivos (similar a impuestos)
    private async calcularCargoConsumo(
        consumoM3: number,
        idTipoTarifa: number,
        idRangoAfiliados: number
    ): Promise<{ cargo: number; detalles: string[] }> {
        // Obtener TODOS los rangos de consumo para este tipo de tarifa, ordenados
        const rangosConsumo = await this.rangoConsumoSinSelloRepository.find({
            where: { Tipo_Tarifa: { Id_Tarifa_Lectura: idTipoTarifa } },
            order: { Minimo_M3: 'ASC' }
        });

        if (rangosConsumo.length === 0) {
            throw new NotFoundException(
                `No se encontraron rangos de consumo para la tarifa ${idTipoTarifa}`
            );
        }

        let totalCargo = 0;
        let consumoRestante = consumoM3;
        const detalles: string[] = [];

        // Calcular cargo progresivo por cada rango
        for (const rango of rangosConsumo) {
            if (consumoRestante <= 0) break;

            // Obtener el precio para este rango específico
            const precioBloque = await this.precioBloqueConsumoSinSelloRepository.findOne({
                where: {
                    Tipo_Tarifa: { Id_Tarifa_Lectura: idTipoTarifa },
                    Rango_Consumo: { Id_Rango_Consumo: rango.Id_Rango_Consumo },
                    Rango_Afiliados: { Id_Rango_Afiliados: idRangoAfiliados },
                    Activo: true
                }
            });

            if (!precioBloque) continue;

            // Calcular cuántos M³ caen en este rango
            const rangoBloque = rango.Maximo_M3 - rango.Minimo_M3 + 1;
            const m3EnRango = Math.min(consumoRestante, rangoBloque);

            const cargoRango = m3EnRango * precioBloque.Precio_Por_M3;
            totalCargo += cargoRango;
            consumoRestante -= m3EnRango;

            const detalle = `  Rango ${rango.Minimo_M3}-${rango.Maximo_M3} M³: ${m3EnRango} M³ * ₡${precioBloque.Precio_Por_M3}/M³ = ₡${cargoRango.toFixed(2)}`;
            detalles.push(detalle);
            console.log(detalle);
        }

        console.log(`💧 Cargo Consumo Total: ₡${totalCargo.toFixed(2)}`);
        return { cargo: totalCargo, detalles };
    }

    /**
     * Calcula el cargo por recurso hídrico usando bloques progresivos
     * (Similar a impuestos progresivos: cada bloque de consumo tiene su propio precio)
     */
    private async calcularCargoRecursoHidrico(
        consumoM3: number,
        nombreTipoTarifa: string
    ): Promise<{ cargo: number; detalles: string[] }> {
        // Determinar el recurso hídrico según el tipo de tarifa
        const nombreRecurso = nombreTipoTarifa.includes('Domipre')
            ? 'Recurso Hidrico Domipre'
            : 'Recurso Hidrico Emprego';

        const recursoHidrico = await this.recursoHidricoSinSelloRepository.findOne({
            where: { Nombre: nombreRecurso, Activo: true }
        });

        if (!recursoHidrico) {
            throw new NotFoundException(`No se encontró el recurso hídrico: ${nombreRecurso}`);
        }

        // Obtener todos los bloques del recurso hídrico ordenados
        const bloques = await this.bloqueRecursoHidricoSinSelloRepository.find({
            where: { Recurso_Hidrico: { Id_Recurso_Hidrico: recursoHidrico.Id_Recurso_Hidrico } },
            order: { Orden: 'ASC' }
        });

        let totalCargo = 0;
        let consumoRestante = consumoM3;
        const detalles: string[] = [];

        // Calcular cargo progresivo por bloques
        for (const bloque of bloques) {
            if (consumoRestante <= 0) break;

            // Obtener el precio para este bloque
            const precioBloque = await this.precioRecursoHidricoSinSelloRepository.findOne({
                where: {
                    Bloque_Recurso_Hidrico: { Id_Bloque_Recurso_Hidrico: bloque.Id_Bloque_Recurso_Hidrico },
                    Activo: true
                }
            });

            if (!precioBloque) continue;

            // Calcular cuántos M³ caen en este bloque
            const rangoBloque = bloque.Maximo_M3 - bloque.Minimo_M3 + 1;
            const m3EnBloque = Math.min(consumoRestante, rangoBloque);

            const cargoBloque = m3EnBloque * precioBloque.Precio_Por_M3;
            totalCargo += cargoBloque;
            consumoRestante -= m3EnBloque;

            const detalle = `  Bloque ${bloque.Minimo_M3}-${bloque.Maximo_M3} M³: ${m3EnBloque} M³ * ₡${precioBloque.Precio_Por_M3}/M³ = ₡${cargoBloque.toFixed(2)}`;
            detalles.push(detalle);
            console.log(detalle);
        }

        console.log(`🌊 Recurso Hídrico Total: ₡${totalCargo.toFixed(2)}`);
        return { cargo: totalCargo, detalles };
    }

    //Calcula el cargo por hidrantes (precio fijo por M³)
    private async calcularCargoHidrantes(consumoM3: number): Promise<{ cargo: number; detalles: string }> {
        const tarifa = await this.tarifaHidranteSinSelloRepository.findOne({
            where: { Activa: true }
        });

        if (!tarifa) {
            throw new NotFoundException('No se encontró tarifa de hidrantes activa');
        }

        const cargo = consumoM3 * tarifa.Precio_Hidrante_Por_M3;
        const detalles = `${consumoM3} M³ * ₡${tarifa.Precio_Hidrante_Por_M3}/M³ = ₡${cargo.toFixed(2)}`;

        console.log(`🚒 Cargo Hidrantes: ${detalles}`);
        return { cargo, detalles };
    }

    // Genera un número de factura secuencial único
    // Formato: FACT-YYYY-NNNNN (ej: FACT-2026-00001)
    private async generarNumeroFactura(): Promise<string> {
        const año = new Date().getFullYear();
        const prefijo = `FACT-${año}-`;

        // Buscar la última factura del año actual
        const ultimaFactura = await this.facturaRepository
            .createQueryBuilder('factura')
            .where('factura.Numero_Factura LIKE :prefijo', { prefijo: `${prefijo}%` })
            .orderBy('factura.Numero_Factura', 'DESC')
            .getOne();

        let siguienteNumero = 1;

        if (ultimaFactura) {
            const ultimoNumero = ultimaFactura.Numero_Factura.split('-')[2];
            siguienteNumero = parseInt(ultimoNumero, 10) + 1;
        }

        const numeroFormateado = siguienteNumero.toString().padStart(5, '0');
        return `${prefijo}${numeroFormateado}`;
    }

    // ====================================
    // MÉTODO PRINCIPAL: GENERAR FACTURA
    // ====================================
    async generarFacturaDesdeLectura(idLectura: number): Promise<FacturaGeneradaResponseDTO> {
        console.log('\n🧾 ========== GENERANDO FACTURA ==========');

        // 1. Obtener la lectura con sus relaciones
        const lectura = await this.lecturaRepository.findOne({
            where: { Id_Lectura: idLectura },
            relations: ['Medidor', 'Medidor.Afiliado', 'Tipo_Tarifa']
        });

        if (!lectura) {
            throw new NotFoundException(`No se encontró la lectura con ID ${idLectura}`);
        }

        const afiliado = lectura.Medidor.Afiliado;
        const consumoM3 = lectura.Consumo_Calculado_M3;

        console.log(`📊 Lectura #${idLectura} - Afiliado ID: ${afiliado.Id_Afiliado}`);
        console.log(`📏 Consumo: ${consumoM3} M³`);

        // 2. Determinar tipo de tarifa Sin Sello
        // Por defecto usa Domipre (residencial), pero se puede personalizar según el afiliado
        let tipoTarifa: TarifaLecturaSinSello | null = null;
        
        // Intentar determinar por tipo de afiliado o usar Domipre por defecto
        const tipoAfiliadoNombre = afiliado.Tipo_Afiliado?.Nombre_Tipo_Afiliado?.toLowerCase();
        
        if (tipoAfiliadoNombre?.includes('empresarial') || tipoAfiliadoNombre?.includes('comercial')) {
            tipoTarifa = await this.tarifaLecturaSinSelloRepository.findOne({
                where: { Nombre_Tipo_Tarifa: 'Emprego', Activa: true }
            });
        }
        
        // Si no se encontró Emprego o el tipo de afiliado no es empresarial, usar Domipre
        if (!tipoTarifa) {
            tipoTarifa = await this.tarifaLecturaSinSelloRepository.findOne({
                where: { Nombre_Tipo_Tarifa: 'Domipre', Activa: true }
            });
        }

        if (!tipoTarifa) {
            throw new NotFoundException('No se encontró tipo de tarifa Sin Sello activa');
        }

        console.log(`📋 Tipo Tarifa: ${tipoTarifa.Nombre_Tipo_Tarifa}`);

        // 3. Obtener rango de afiliados actual
        const rangoAfiliados = await this.obtenerRangoAfiliadosActual();

        // 4. CALCULAR COMPONENTES
        console.log('\n💰 Calculando componentes...');

        // Cargo Fijo
        const cargoFijo = await this.obtenerCargoFijo(
            tipoTarifa.Id_Tarifa_Lectura,
            rangoAfiliados.Id_Rango_Afiliados
        );
        console.log(`🏠 Cargo Fijo: ₡${cargoFijo.toFixed(2)}`);

        // Cargo Consumo
        const resultadoConsumo = await this.calcularCargoConsumo(
            consumoM3,
            tipoTarifa.Id_Tarifa_Lectura,
            rangoAfiliados.Id_Rango_Afiliados
        );

        // Cargo Recurso Hídrico
        const resultadoRecursoHidrico = await this.calcularCargoRecursoHidrico(
            consumoM3,
            tipoTarifa.Nombre_Tipo_Tarifa
        );

        // Cargo Hidrantes
        const resultadoHidrantes = await this.calcularCargoHidrantes(consumoM3);

        // 5. CALCULAR TOTALES
        const subtotal = cargoFijo + resultadoConsumo.cargo + resultadoRecursoHidrico.cargo + resultadoHidrantes.cargo;
        const impuestos = 0; // Ajusta si aplica IVA
        const total = subtotal + impuestos;

        console.log('\n💵 ========== RESUMEN ==========');
        console.log(`   Cargo Fijo:         ₡${cargoFijo.toFixed(2)}`);
        console.log(`   Cargo Consumo:      ₡${resultadoConsumo.cargo.toFixed(2)}`);
        console.log(`   Recurso Hídrico:    ₡${resultadoRecursoHidrico.cargo.toFixed(2)}`);
        console.log(`   Hidrantes:          ₡${resultadoHidrantes.cargo.toFixed(2)}`);
        console.log(`   --------------------------------`);
        console.log(`   TOTAL:              ₡${total.toFixed(2)}`);
        console.log('====================================\n');

        // 6. CREAR FACTURA
        const numeroFactura = await this.generarNumeroFactura();
        const estadoPendiente = await this.estadoFacturaRepository.findOne({
            where: { Nombre_Estado: 'Pendiente' }
        });

        if (!estadoPendiente) {
            throw new NotFoundException('No se encontró el estado "Pendiente" para facturas');
        }

        const fechaEmision = new Date();
        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 15); // 15 días para pagar

        // 7. OBTENER INFORMACIÓN DEL AFILIADO
        let nombreCompletoAfiliado = '';
        let identificacionAfiliado = '';

        const tipoAfiliado = afiliado.Tipo_Entidad;
        if (tipoAfiliado === 1) { // Afiliado Físico
            const afiliadoFisico = await this.afiliadoFisicoRepository.findOne({
                where: { Id_Afiliado: afiliado.Id_Afiliado }
            });
            if (afiliadoFisico) {
                nombreCompletoAfiliado = `${afiliadoFisico.Nombre} ${afiliadoFisico.Apellido1} ${afiliadoFisico.Apellido2 || ''}`.trim();
                identificacionAfiliado = afiliadoFisico.Identificacion;
                console.log(`👤 Afiliado Físico: ${nombreCompletoAfiliado} - ${identificacionAfiliado}`);
            }
        } else if (tipoAfiliado === 2) { // Afiliado Jurídico
            const afiliadoJuridico = await this.afiliadoJuridicoRepository.findOne({
                where: { Id_Afiliado: afiliado.Id_Afiliado }
            });
            if (afiliadoJuridico) {
                nombreCompletoAfiliado = afiliadoJuridico.Razon_Social;
                identificacionAfiliado = afiliadoJuridico.Cedula_Juridica;
                console.log(`🏢 Afiliado Jurídico: ${nombreCompletoAfiliado} - ${identificacionAfiliado}`);
            }
        }

        const factura = this.facturaRepository.create({
            Numero_Factura: numeroFactura,
            Afiliado: afiliado,
            Nombre_Completo_Afiliado: nombreCompletoAfiliado,
            Identificacion_Afiliado: identificacionAfiliado,
            Lectura: lectura,
            Consumo_M3: consumoM3,
            Cargo_Fijo: cargoFijo,
            Cargo_Consumo: resultadoConsumo.cargo,
            Cargo_Recurso_Hidrico: resultadoRecursoHidrico.cargo,
            Otros_Cargos: resultadoHidrantes.cargo,
            Subtotal: subtotal,
            Impuestos: impuestos,
            Total: total,
            Fecha_Emision: fechaEmision,
            Fecha_Vencimiento: fechaVencimiento,
            Estado: estadoPendiente,
            Tipo_Tarifa_Aplicada: tipoTarifa.Nombre_Tipo_Tarifa,
            Observaciones: [
                ...resultadoConsumo.detalles,
                ...resultadoRecursoHidrico.detalles,
                resultadoHidrantes.detalles
            ].join('\n')
        });

        const facturaSaved = await this.facturaRepository.save(factura);

        // 8. FORMATEAR RESPUESTA CON SOLO INFORMACIÓN ESENCIAL
        const response: FacturaGeneradaResponseDTO = {
            Id_Factura: facturaSaved.Id_Factura,
            Numero_Factura: facturaSaved.Numero_Factura,
            Afiliado: tipoAfiliado === 1 ? {
                Id_Afiliado: afiliado.Id_Afiliado,
                Nombre_Completo: nombreCompletoAfiliado,
                Identificacion: identificacionAfiliado
            } : {
                Id_Afiliado: afiliado.Id_Afiliado,
                Razon_Social: nombreCompletoAfiliado,
                Cedula_Juridica: identificacionAfiliado
            },
            Lectura: {
                Id_Lectura: lectura.Id_Lectura,
                Numero_Medidor: lectura.Medidor.Numero_Medidor,
                Fecha_Lectura: lectura.Fecha_Lectura,
                Valor_Lectura_Anterior: lectura.Valor_Lectura_Anterior,
                Valor_Lectura_Actual: lectura.Valor_Lectura_Actual,
            },
            Consumo_M3: Number(consumoM3),
            Cargo_Fijo: `₡${cargoFijo.toFixed(2)}`,
            Cargo_Consumo: `₡${resultadoConsumo.cargo.toFixed(2)}`,
            Cargo_Recurso_Hidrico: `₡${resultadoRecursoHidrico.cargo.toFixed(2)}`,
            Otros_Cargos: `₡${resultadoHidrantes.cargo.toFixed(2)}`,
            Subtotal: `₡${subtotal.toFixed(2)}`,
            Impuestos: `₡${impuestos.toFixed(2)}`,
            Total: `₡${total.toFixed(2)}`,
            Fecha_Emision: fechaEmision,
            Fecha_Vencimiento: fechaVencimiento,
            Estado: {
                Id_Estado_Factura: estadoPendiente.Id_Estado_Factura,
                Nombre_Estado: estadoPendiente.Nombre_Estado
            },
            Tipo_Tarifa_Aplicada: tipoTarifa.Nombre_Tipo_Tarifa,
            Observaciones: facturaSaved.Observaciones
        };

        console.log('✅ Factura generada exitosamente');
        return response;
    }
}
