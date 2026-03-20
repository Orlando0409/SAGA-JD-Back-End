export type CalculoFinal = {
    Total_A_Pagar: number;
    Detalles?: {
        Consumo_M3?: number;
        Costo_Por_M3?: number;
        Cargo_Fijo?: number;
    };
};

export type AfiliadoSimple = {
    Identificacion?: string;
    Cedula_Juridica?: string;
    Nombre?: string;
    Primer_Apellido?: string;
    Segundo_Apellido?: string;
    Razon_Social?: string;
};

export type HistorialLectura = {
    Consumo_Calculado_M3?: number;
    Tipo_Tarifa?: {
        Nombre_Tipo_Tarifa?: string;
        Nombre_Tipo_Tarifa_Lectura?: string;
    } | null;
    Afiliado?: AfiliadoSimple | null;
};

export type ConsultaMedidor = {
    Numero_Medidor: number;
    "Calculo final": CalculoFinal | number;
    "Historial de lecturas": HistorialLectura[];
};

export type ConsultaAfiliadoFisico = {
    Afiliado: {
        Nombre: string;
        Identificacion: string;
    };
    Total_Medidores: number;
    Medidores: ConsultaMedidor[];
};

export type ConsultaAfiliadoJuridico = {
    Afiliado: {
        Razon_Social: string;
        Cedula_Juridica: string;
    };
    Total_Medidores: number;
    Medidores: ConsultaMedidor[];
};

export type FacturaPdfInput = {
    numeroMedidor: number;
    identificacion: string;
    nombreCliente: string;
    consumoM3: number;
    costoPorM3: number;
    cargoFijo: number;
    totalPagar: number;
    tipoTarifa: string;
    fechaEmision: Date;
    historialLecturas: unknown[];
};