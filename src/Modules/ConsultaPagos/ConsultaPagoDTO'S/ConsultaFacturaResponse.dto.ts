// DTO para responses de consulta de facturas
export class ConsultaPagoResponseDTO {
    Id_Factura: number;
    Numero_Factura: string;
    Afiliado: {
        Id_Afiliado: number;
        Identificacion?: string;
        Nombre_Completo?: string;
        Razon_Social?: string;
        Cedula_Juridica?: string;
    };
    Lectura: {
        Id_Lectura: number;
        Numero_Medidor: number;
        Fecha_Lectura: Date;
        Valor_Lectura_Anterior: number;
        Valor_Lectura_Actual: number;
    };
    Consumo_M3: number;
    Cargo_Fijo: string;
    Cargo_Consumo: string;
    Cargo_Recurso_Hidrico: string;
    Otros_Cargos: string;
    Subtotal: string;
    Impuestos: string;
    Total: string;
    Fecha_Emision: Date;
    Fecha_Vencimiento: Date;
    Estado: {
        Id_Estado_Factura: number;
        Nombre_Estado: string;
    };
    Tipo_Tarifa_Aplicada?: string;
    Observaciones?: string;
}

// DTO para consulta por medidor (devuelve info del medidor + facturas detalladas)
export class ConsultaPorMedidorResponseDTO {
    Numero_Medidor: number;
    Afiliado?: {
        Nombre?: string;
        Razon_Social?: string;
        Identificacion?: string;
        Cedula_Juridica?: string;
    };
    Total_Facturas: number;
    Facturas: ConsultaPagoResponseDTO[];
}

// DTO para medidor con facturas (usado en consultas de múltiples medidores)
export class MedidorConFacturasDTO {
    Numero_Medidor: number;
    Total_Facturas?: number;
    Facturas?: ConsultaPagoResponseDTO[];
    Error?: string;
}

// Alias para FacturaDetalleDTO (mismo que ConsultaPagoResponseDTO)
export class FacturaDetalleDTO extends ConsultaPagoResponseDTO {}

// DTO para consulta de afiliado físico con múltiples medidores
export class ConsultaAfiliadoFisicoResponseDTO {
    Afiliado: {
        Nombre: string;
        Identificacion: string;
    };
    Total_Medidores: number;
    Medidores: MedidorConFacturasDTO[];
}

// DTO para consulta de afiliado jurídico con múltiples medidores
export class ConsultaAfiliadoJuridicoResponseDTO {
    Afiliado: {
        Razon_Social: string;
        Cedula_Juridica: string;
    };
    Total_Medidores: number;
    Medidores: MedidorConFacturasDTO[];
}
