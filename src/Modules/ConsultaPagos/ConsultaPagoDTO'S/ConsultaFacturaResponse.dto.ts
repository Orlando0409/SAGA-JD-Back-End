// DTOs para responses de consulta de facturas
export class FacturaDetalleDTO {
    Numero_Factura: string;
    Fecha_Emision: Date;
    Fecha_Vencimiento: Date;
    Estado: string;
    Consumo_M3: number;
    Cargo_Fijo: string;
    Cargo_Consumo: string;
    Cargo_Recurso_Hidrico: string;
    Otros_Cargos: string;
    Total: string;
    Tipo_Tarifa: string;
}

export class FacturaSimpleDTO {
    Numero_Factura: string;
    Fecha_Emision: Date;
    Fecha_Vencimiento: Date;
    Estado: string;
    Total: string;
}

export class ConsultaPorMedidorResponseDTO {
    Numero_Medidor: number;
    Total_Facturas: number;
    Facturas: FacturaDetalleDTO[];
}

export class MedidorConFacturasDTO {
    Numero_Medidor: number;
    Total_Facturas: number;
    Facturas: FacturaSimpleDTO[];
}

export class MedidorConErrorDTO {
    Numero_Medidor: number;
    Error: string;
}

export class ConsultaAfiliadoFisicoResponseDTO {
    Afiliado: {
        Nombre: string;
        Identificacion: string;
    };
    Total_Medidores: number;
    Medidores: (MedidorConFacturasDTO | MedidorConErrorDTO)[];
}

export class ConsultaAfiliadoJuridicoResponseDTO {
    Afiliado: {
        Razon_Social: string;
        Cedula_Juridica: string;
    };
    Total_Medidores: number;
    Medidores: (MedidorConFacturasDTO | MedidorConErrorDTO)[];
}
