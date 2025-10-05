// Utilidades para validación de pagos venezolanos

export interface VenezuelanPaymentMethod {
  id: string;
  type: "cash" | "transfer" | "pago_movil" | "zelle" | "bitcoin" | "wallet";
  bankCode?: string;
  requiresReference: boolean;
  description: string;
}

// Información completa de bancos venezolanos
export interface VenezuelanBank {
  code: string;
  name: string;
  shortName: string;
  supportsTransfers: boolean;
  supportsPagoMovil: boolean;
  maxTransferAmount?: number;
  description: string;
}

// Lista completa de bancos venezolanos según la superintendencia
export const VENEZUELAN_BANKS: Record<string, VenezuelanBank> = {
  "0102": {
    code: "0102",
    name: "Banco Universal, C.A. Banco Universal",
    shortName: "Banesco",
    supportsTransfers: true,
    supportsPagoMovil: true,
    maxTransferAmount: 5000000, // 5M Bs por día
    description: "Banco más grande de Venezuela, operaciones 24/7",
  },
  "0105": {
    code: "0105",
    name: "Banco Mercantil, C.A. Banco Universal",
    shortName: "Mercantil",
    supportsTransfers: true,
    supportsPagoMovil: true,
    maxTransferAmount: 3000000, // 3M Bs por día
    description: "Banco con red extensa de agencias",
  },
  "0104": {
    code: "0104",
    name: "Banco de Venezuela, S.A.C.A. Banco Universal",
    shortName: "Venezolano de Crédito",
    supportsTransfers: true,
    supportsPagoMovil: true,
    maxTransferAmount: 2000000, // 2M Bs por día
    description: "Banco del estado venezolano",
  },
  "0108": {
    code: "0108",
    name: "Banco Provincial, S.A. Banco Universal",
    shortName: "Provincial",
    supportsTransfers: true,
    supportsPagoMovil: true,
    maxTransferAmount: 4000000, // 4M Bs por día
    description: "Banco con fuerte presencia en el interior",
  },
  "0115": {
    code: "0115",
    name: "Banco Exterior, C.A. Banco Universal",
    shortName: "Bancaribe",
    supportsTransfers: true,
    supportsPagoMovil: true,
    maxTransferAmount: 2500000, // 2.5M Bs por día
    description: "Especializado en banca internacional",
  },
  "0137": {
    code: "0137",
    name: "Banco Sofitasa, Banco Universal",
    shortName: "Sofitasa",
    supportsTransfers: true,
    supportsPagoMovil: false,
    maxTransferAmount: 1000000, // 1M Bs por día
    description: "Banco con enfoque en pymes",
  },
  "0151": {
    code: "0151",
    name: "Banco Fondo Común, C.A. Banco Universal",
    shortName: "Fondo Común",
    supportsTransfers: true,
    supportsPagoMovil: false,
    maxTransferAmount: 800000, // 800k Bs por día
    description: "Banco cooperativo",
  },
  "0156": {
    code: "0156",
    name: "100% Banco, Banco Microfinanciero",
    shortName: "100% Banco",
    supportsTransfers: true,
    supportsPagoMovil: false,
    maxTransferAmount: 500000, // 500k Bs por día
    description: "Banco microfinanciero",
  },
  "0171": {
    code: "0171",
    name: "Banco Activo, C.A. Banco Universal",
    shortName: "Activo",
    supportsTransfers: true,
    supportsPagoMovil: false,
    maxTransferAmount: 1200000, // 1.2M Bs por día
    description: "Banco con enfoque digital",
  },
  "0172": {
    code: "0172",
    name: "Bancamiga Banco Microfinanciero, C.A.",
    shortName: "Bancamiga",
    supportsTransfers: true,
    supportsPagoMovil: false,
    maxTransferAmount: 600000, // 600k Bs por día
    description: "Banco microfinanciero con red de cajeros",
  },
};

// Función para obtener información completa del banco por código
export const getBankInfo = (bankCode: string): VenezuelanBank | null => {
  return VENEZUELAN_BANKS[bankCode] || null;
};

// Función para obtener bancos que soportan un tipo específico de pago
export const getBanksByPaymentType = (
  paymentType: "transfer" | "pago_movil",
): VenezuelanBank[] => {
  return Object.values(VENEZUELAN_BANKS).filter((bank) => {
    switch (paymentType) {
      case "transfer":
        return bank.supportsTransfers;
      case "pago_movil":
        return bank.supportsPagoMovil;
      default:
        return false;
    }
  });
};

// Función para formatear montos en bolívares venezolanos
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "VES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Función para generar métodos de pago dinámicamente basados en bancos disponibles
const generatePaymentMethods = (): Record<string, VenezuelanPaymentMethod> => {
  const methods: Record<string, VenezuelanPaymentMethod> = {
    cash: {
      id: "cash",
      type: "cash",
      requiresReference: false,
      description: "Pago en efectivo directo al conductor",
    },
    wallet: {
      id: "wallet",
      type: "wallet",
      requiresReference: false,
      description: "Pago desde wallet digital",
    },
    zelle: {
      id: "zelle",
      type: "zelle",
      requiresReference: false,
      description: "Pago Zelle - Confirmación directa",
    },
    bitcoin: {
      id: "bitcoin",
      type: "bitcoin",
      requiresReference: false,
      description: "Pago en Bitcoin - Dirección de wallet",
    },
  };

  // Agregar métodos de transferencia para todos los bancos que lo soportan
  const transferBanks = getBanksByPaymentType("transfer");
  transferBanks.forEach((bank) => {
    methods[`transfer_${bank.code}`] = {
      id: `transfer_${bank.code}`,
      type: "transfer",
      bankCode: bank.code,
      requiresReference: true,
      description: `Transferencia ${bank.shortName} - 20 dígitos (máx. ${formatAmount(bank.maxTransferAmount || 0)})`,
    };
  });

  // Agregar métodos de pago móvil para bancos que lo soportan
  const pagoMovilBanks = getBanksByPaymentType("pago_movil");
  pagoMovilBanks.forEach((bank) => {
    methods[`pago_movil_${bank.code}`] = {
      id: `pago_movil_${bank.code}`,
      type: "pago_movil",
      bankCode: bank.code,
      requiresReference: true,
      description: `Pago móvil ${bank.shortName} - 20 dígitos`,
    };
  });

  return methods;
};

// Métodos de pago venezolanos generados dinámicamente
export const VENEZUELAN_PAYMENT_METHODS: Record<
  string,
  VenezuelanPaymentMethod
> = generatePaymentMethods();

// Función para mapear ID de método de pago a método API
export const mapPaymentMethodToAPI = (
  paymentMethodId: string,
): { method: "cash" | "card" | "wallet"; bankCode?: string } => {
  // First map frontend ID to backend ID
  const backendId = mapFrontendPaymentMethodToBackend(paymentMethodId);
  const method = VENEZUELAN_PAYMENT_METHODS[backendId];

  if (!method) {
    // Fallback para métodos no reconocidos
    return { method: "cash" };
  }

  // Map Venezuelan payment methods to API-compatible types
  let apiMethod: "cash" | "card" | "wallet";

  switch (method.type) {
    case "cash":
      apiMethod = "cash";
      break;
    case "transfer":
      apiMethod = "card"; // Transferencias bancarias se mapean a card
      break;
    case "pago_movil":
    case "zelle":
    case "bitcoin":
      apiMethod = "wallet"; // Métodos digitales se mapean a wallet
      break;
    default:
      apiMethod = "cash";
  }

  return {
    method: apiMethod,
    bankCode: method.bankCode,
  };
};

// Función para mapear IDs del frontend a IDs del backend
export const mapFrontendPaymentMethodToBackend = (
  frontendId: string,
): string => {
  // Validate input
  if (!frontendId || typeof frontendId !== 'string') {
    
    return 'cash'; // Fallback to cash
  }

  switch (frontendId) {
    case "cash":
      return "cash";
    case "wallet":
      return "cash"; // Wallet se mapea a cash por ahora (se valida en backend)
    case "transfer_banesco":
      return "transfer_0102"; // Banesco
    case "transfer_mercantil":
      return "transfer_0105"; // Mercantil
    case "transfer_venezolano":
      return "transfer_0104"; // Venezolano de Crédito
    case "transfer_provincial":
      return "transfer_0108"; // Provincial
    case "transfer_bancaribe":
      return "transfer_0115"; // Bancaribe
    case "pago_movil_banesco":
      return "pago_movil_0102"; // Pago Móvil Banesco
    case "pago_movil_mercantil":
      return "pago_movil_0105"; // Pago Móvil Mercantil
    case "zelle":
      return "zelle";
    case "bitcoin":
      return "bitcoin";
    default:
      // Para métodos con códigos bancarios dinámicos
      if (frontendId.startsWith("transfer_")) {
        // Intentar extraer código bancario
        const bankCode = frontendId.replace("transfer_", "");
        if (VENEZUELAN_BANKS[bankCode]) {
          return `transfer_${bankCode}`;
        }
      }
      if (frontendId.startsWith("pago_movil_")) {
        // Intentar extraer código bancario
        const bankCode = frontendId.replace("pago_movil_", "");
        if (VENEZUELAN_BANKS[bankCode]) {
          return `pago_movil_${bankCode}`;
        }
      }
      return frontendId; // Retornar como está si no hay mapeo
  }
};

// Función para validar método de pago
export const validatePaymentMethod = (
  paymentMethodId: string,
): {
  isValid: boolean;
  method: VenezuelanPaymentMethod | null;
  error?: string;
} => {
  if (!paymentMethodId || paymentMethodId === "add_new") {
    return {
      isValid: false,
      method: null,
      error: "Método de pago no seleccionado",
    };
  }

  // Mapear ID del frontend al backend
  const backendId = mapFrontendPaymentMethodToBackend(paymentMethodId);
  const method = VENEZUELAN_PAYMENT_METHODS[backendId];

  if (!method) {
    return {
      isValid: false,
      method: null,
      error: `Método de pago no reconocido: ${paymentMethodId} (backend: ${backendId})`,
    };
  }

  return {
    isValid: true,
    method,
  };
};

// Función de validación específica que incluye datos adicionales por método
export const validatePaymentWithData = (
  paymentMethodId: string,
  bankCode?: string,
  amount?: number,
  totalAmount?: number
): {
  isValid: boolean;
  method: VenezuelanPaymentMethod | null;
  error?: string;
  requiresBankCode?: boolean;
  requiresAmount?: boolean;
} => {
  // Primero validar el método base
  const baseValidation = validatePaymentMethod(paymentMethodId);

  if (!baseValidation.isValid) {
    return {
      ...baseValidation,
      requiresBankCode: false,
      requiresAmount: false,
    };
  }

  const method = baseValidation.method!;

  // Validaciones específicas por método según documentación del backend
  switch (method.type) {
    case "cash":
      // Cash no requiere datos adicionales
      return {
        isValid: true,
        method,
        requiresBankCode: false,
        requiresAmount: false,
      };

    case "transfer":
    case "pago_movil":
      // Estos métodos requieren bankCode
      if (!bankCode) {
        return {
          isValid: false,
          method,
          error: `Código de banco requerido para ${method.description}`,
          requiresBankCode: true,
          requiresAmount: false,
        };
      }

      // Validar que el bankCode existe en la lista de bancos
      if (!VENEZUELAN_BANKS[bankCode]) {
        return {
          isValid: false,
          method,
          error: "Código de banco inválido",
          requiresBankCode: true,
          requiresAmount: false,
        };
      }

      // Validar que el banco soporte el método
      const bank = VENEZUELAN_BANKS[bankCode];
      if (method.type === "transfer" && !bank.supportsTransfers) {
        return {
          isValid: false,
          method,
          error: `${bank.shortName} no soporta transferencias`,
          requiresBankCode: true,
          requiresAmount: false,
        };
      }

      if (method.type === "pago_movil" && !bank.supportsPagoMovil) {
        return {
          isValid: false,
          method,
          error: `${bank.shortName} no soporta Pago Móvil`,
          requiresBankCode: true,
          requiresAmount: false,
        };
      }

      return {
        isValid: true,
        method,
        requiresBankCode: true,
        requiresAmount: false,
      };

    case "zelle":
    case "bitcoin":
    case "wallet":
      // Estos métodos no requieren datos adicionales específicos
      // (wallet requiere saldo, pero eso se valida en el backend)
      return {
        isValid: true,
        method,
        requiresBankCode: false,
        requiresAmount: false,
      };

    default:
      return {
        isValid: false,
        method: null,
        error: "Tipo de método no soportado",
        requiresBankCode: false,
        requiresAmount: false,
      };
  }
};

// Función para validar referencias bancarias simples (20 dígitos)
export const validateBankReferenceSimple = (reference: string): boolean => {
  // Debe tener exactamente 20 dígitos
  const digitRegex = /^\d{20}$/;
  return digitRegex.test(reference.replace(/\s+/g, ""));
};

// Sistema avanzado de referencias bancarias venezolanas
export interface BankReference {
  referenceNumber: string;
  bankCode: string;
  amount: number;
  createdAt: Date;
  expiresAt: Date;
  isExpired: boolean;
  timeRemaining: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  formattedReference: string; // Con espacios para mejor UX
}

// Función para generar referencia bancaria única y válida
export const generateBankReference = (
  bankCode: string,
  amount: number,
  serviceId?: number,
): BankReference => {
  // Validar código bancario
  const bankValidation = validateBankCode(bankCode);
  if (!bankValidation.isValid) {
    throw new Error(`Código bancario inválido: ${bankCode}`);
  }

  // Generar timestamp único (últimos 8 dígitos del timestamp)
  const timestamp = Date.now().toString().slice(-8);

  // Generar componente aleatorio único
  const random1 = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  const random2 = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  // Incluir serviceId si está disponible para mayor unicidad
  const servicePart = serviceId
    ? (serviceId % 1000).toString().padStart(3, "0")
    : "000";

  // Construir referencia: BANKCODE + TIMESTAMP + SERVICE + RANDOM1 + RANDOM2
  const referenceNumber =
    `${bankCode}${timestamp}${servicePart}${random1}${random2}`.slice(0, 20);

  // Calcular expiración (24 horas desde ahora)
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // 24 horas

  // Calcular tiempo restante
  const timeRemaining = calculateTimeRemaining(expiresAt);

  // Formatear referencia con espacios para mejor UX
  const formattedReference = formatBankReference(referenceNumber);

  return {
    referenceNumber,
    bankCode,
    amount,
    createdAt,
    expiresAt,
    isExpired: false,
    timeRemaining,
    formattedReference,
  };
};

// Función para validar referencia bancaria completa
export const validateBankReference = (
  reference: string,
): {
  isValid: boolean;
  bankCode?: string;
  bankName?: string;
  error?: string;
} => {
  // Limpiar espacios y caracteres no numéricos
  const cleanReference = reference.replace(/\s+/g, "").replace(/[^0-9]/g, "");

  // Debe tener exactamente 20 dígitos
  if (cleanReference.length !== 20) {
    return {
      isValid: false,
      error: "La referencia debe tener exactamente 20 dígitos",
    };
  }

  // Extraer código bancario (primeros 4 dígitos)
  const bankCode = cleanReference.substring(0, 4);

  // Validar código bancario
  const bankValidation = validateBankCode(bankCode);
  if (!bankValidation.isValid) {
    return {
      isValid: false,
      error: bankValidation.error,
    };
  }

  return {
    isValid: true,
    bankCode,
    bankName: bankValidation.bank?.shortName,
  };
};

// Función para formatear referencia bancaria con espacios
export const formatBankReference = (reference: string): string => {
  // Limpiar referencia
  const clean = reference.replace(/\s+/g, "").replace(/[^0-9]/g, "");

  // Formatear en grupos de 4 dígitos
  const groups = [];
  for (let i = 0; i < clean.length; i += 4) {
    groups.push(clean.substring(i, i + 4));
  }

  return groups.join(" ");
};

// Función para calcular tiempo restante hasta expiración
export const calculateTimeRemaining = (
  expiresAt: Date,
): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
} => {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isExpired: true,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
    totalSeconds,
    isExpired: false,
  };
};

// Función para verificar si una referencia está expirada
export const isReferenceExpired = (expiresAt: Date | string): boolean => {
  const expiryDate =
    typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return new Date() > expiryDate;
};

// Función para obtener información completa de una referencia
export const getReferenceInfo = (
  reference: string,
): {
  isValid: boolean;
  bankInfo?: VenezuelanBank;
  formattedReference: string;
  error?: string;
} => {
  const validation = validateBankReference(reference);

  if (!validation.isValid) {
    return {
      isValid: false,
      formattedReference: formatBankReference(reference),
      error: validation.error,
    };
  }

  const bankInfo = getBankInfo(validation.bankCode!);

  return {
    isValid: true,
    bankInfo: bankInfo || undefined,
    formattedReference: formatBankReference(reference),
  };
};

// Función para generar referencias por lotes (útil para pagos múltiples)
export const generateBulkReferences = (
  payments: Array<{ bankCode: string; amount: number }>,
  serviceId?: number,
): BankReference[] => {
  return payments.map((payment) =>
    generateBankReference(payment.bankCode, payment.amount, serviceId),
  );
};

// Función para validar código bancario
export const validateBankCode = (
  bankCode: string,
): {
  isValid: boolean;
  bank?: VenezuelanBank;
  error?: string;
} => {
  if (!bankCode || bankCode.length !== 4) {
    return {
      isValid: false,
      error: "Código bancario debe tener 4 dígitos",
    };
  }

  const bank = getBankInfo(bankCode);
  if (!bank) {
    return {
      isValid: false,
      error: "Código bancario no reconocido",
    };
  }

  return {
    isValid: true,
    bank,
  };
};

// Función para obtener bancos disponibles para un método de pago
export const getAvailableBanksForMethod = (
  methodType: "transfer" | "pago_movil",
): VenezuelanBank[] => {
  return getBanksByPaymentType(methodType);
};

// ===== PAGOS MÚLTIPLES =====

// Tipos para pagos múltiples
export interface SplitPayment {
  id: string;
  method: "cash" | "card" | "wallet";
  amount: number;
  percentage: number;
  bankCode?: string;
  description: string;
  status: "pending" | "confirmed" | "cancelled";
  reference?: string;
}

export interface MultiplePaymentData {
  serviceType: "ride" | "delivery" | "errand" | "parcel";
  serviceId: number;
  totalAmount: number;
  payments: SplitPayment[];
  groupId?: string;
}

// Función para crear un pago dividido
export const createSplitPayment = (
  methodId: string,
  amount: number,
  totalAmount: number,
): SplitPayment => {
  const paymentMethod = VENEZUELAN_PAYMENT_METHODS[methodId];
  const percentage = (amount / totalAmount) * 100;

  if (!paymentMethod) {
    throw new Error(`Método de pago no válido: ${methodId}`);
  }

  let apiMethod: "cash" | "card" | "wallet";
  switch (paymentMethod.type) {
    case "cash":
      apiMethod = "cash";
      break;
    case "transfer":
      apiMethod = "card";
      break;
    case "pago_movil":
    case "zelle":
    case "bitcoin":
      apiMethod = "wallet";
      break;
    default:
      apiMethod = "cash";
  }

  return {
    id: `${methodId}_${Date.now()}`,
    method: apiMethod,
    amount,
    percentage,
    bankCode: paymentMethod.bankCode,
    description: paymentMethod.description,
    status: "pending",
  };
};

// Función para validar división de pagos
export const validatePaymentSplit = (
  payments: SplitPayment[],
  totalAmount: number,
  tolerance: number = 0.01,
): { isValid: boolean; error?: string; totalSplit: number } => {
  const totalSplit = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const difference = Math.abs(totalAmount - totalSplit);

  if (difference > tolerance) {
    return {
      isValid: false,
      error: `La suma de los pagos (${totalSplit.toFixed(2)}) no coincide con el total (${totalAmount.toFixed(2)})`,
      totalSplit,
    };
  }

  if (payments.length === 0) {
    return {
      isValid: false,
      error: "Debe seleccionar al menos un método de pago",
      totalSplit,
    };
  }

  // Validar que no haya pagos con monto cero o negativo
  const invalidPayment = payments.find((p) => p.amount <= 0);
  if (invalidPayment) {
    return {
      isValid: false,
      error: `El monto del pago debe ser mayor a cero`,
      totalSplit,
    };
  }

  return {
    isValid: true,
    totalSplit,
  };
};

// Función para calcular sugerencias de división automática
export const calculatePaymentSuggestions = (
  totalAmount: number,
  availableMethods: string[],
): SplitPayment[][] => {
  const suggestions: SplitPayment[][] = [];

  // Sugerencia 1: 50% - 50%
  if (availableMethods.length >= 2) {
    const halfAmount = totalAmount / 2;
    suggestions.push([
      createSplitPayment(availableMethods[0], halfAmount, totalAmount),
      createSplitPayment(availableMethods[1], halfAmount, totalAmount),
    ]);
  }

  // Sugerencia 2: 70% efectivo + 30% otro método
  if (availableMethods.includes("cash") && availableMethods.length >= 2) {
    const cash70 = totalAmount * 0.7;
    const other30 = totalAmount * 0.3;
    const otherMethod = availableMethods.find((m) => m !== "cash")!;

    suggestions.push([
      createSplitPayment("cash", cash70, totalAmount),
      createSplitPayment(otherMethod, other30, totalAmount),
    ]);
  }

  // Sugerencia 3: 60% transferencia + 40% efectivo
  if (
    availableMethods.includes("cash") &&
    availableMethods.some((m) => m.includes("transfer"))
  ) {
    const transfer60 = totalAmount * 0.6;
    const cash40 = totalAmount * 0.4;
    const transferMethod = availableMethods.find((m) =>
      m.includes("transfer"),
    )!;

    suggestions.push([
      createSplitPayment(transferMethod, transfer60, totalAmount),
      createSplitPayment("cash", cash40, totalAmount),
    ]);
  }

  // Sugerencia 4: Dividir en partes iguales
  if (availableMethods.length >= 3) {
    const equalAmount = totalAmount / availableMethods.length;
    const equalSplit = availableMethods.map((method) =>
      createSplitPayment(method, equalAmount, totalAmount),
    );
    suggestions.push(equalSplit);
  }

  return suggestions;
};

// ===== UTILIDADES ADICIONALES =====

// Función para validar monto contra límites bancarios
export const validateAmountAgainstBankLimits = (
  amount: number,
  bankCode: string,
): {
  isValid: boolean;
  maxAllowed?: number;
  error?: string;
} => {
  const bank = getBankInfo(bankCode);
  if (!bank) {
    return {
      isValid: false,
      error: "Banco no encontrado",
    };
  }

  if (!bank.maxTransferAmount) {
    return { isValid: true }; // No hay límite definido
  }

  if (amount > bank.maxTransferAmount) {
    return {
      isValid: false,
      maxAllowed: bank.maxTransferAmount,
      error: `Monto excede el límite diario de ${formatAmount(bank.maxTransferAmount)} para ${bank.shortName}`,
    };
  }

  return { isValid: true };
};

// Función para obtener métodos de pago recomendados por monto
export const getRecommendedPaymentMethods = (
  amount: number,
  preferredBankCodes?: string[],
): VenezuelanPaymentMethod[] => {
  const allMethods = Object.values(VENEZUELAN_PAYMENT_METHODS);

  // Filtrar métodos que no requieren referencia para montos pequeños
  if (amount < 50000) {
    // Menos de 50k Bs
    return allMethods.filter(
      (method) => !method.requiresReference || method.type === "cash",
    );
  }

  // Para montos mayores, preferir métodos con referencia
  let recommended = allMethods.filter(
    (method) => method.requiresReference && method.bankCode,
  );

  // Si hay bancos preferidos, priorizarlos
  if (preferredBankCodes && preferredBankCodes.length > 0) {
    const preferred = recommended.filter(
      (method) =>
        method.bankCode && preferredBankCodes.includes(method.bankCode),
    );
    const others = recommended.filter(
      (method) =>
        !method.bankCode || !preferredBankCodes.includes(method.bankCode),
    );

    recommended = [...preferred, ...others];
  }

  // Validar contra límites bancarios
  recommended = recommended.filter((method) => {
    if (!method.bankCode) return true;
    const validation = validateAmountAgainstBankLimits(amount, method.bankCode);
    return validation.isValid;
  });

  // Incluir siempre efectivo como opción
  const cashMethod = allMethods.find((method) => method.type === "cash");
  if (cashMethod) {
    recommended.push(cashMethod);
  }

  return recommended.slice(0, 8); // Limitar a 8 opciones
};

// Función para generar resumen de pago para UI
export const generatePaymentSummary = (
  payments: SplitPayment[],
): {
  totalAmount: number;
  totalMethods: number;
  methodsByType: Record<string, number>;
  estimatedCompletionTime: number; // minutos
  riskLevel: "low" | "medium" | "high";
} => {
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalMethods = payments.length;

  // Contar métodos por tipo
  const methodsByType = payments.reduce(
    (acc, payment) => {
      const type = payment.method;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Estimar tiempo de completación basado en tipos de pago
  let estimatedCompletionTime = 0;
  payments.forEach((payment) => {
    switch (payment.method) {
      case "cash":
        estimatedCompletionTime += 2; // 2 minutos (entrega)
        break;
      case "card":
        estimatedCompletionTime += 5; // 5 minutos (transferencia)
        break;
      case "wallet":
        estimatedCompletionTime += 3; // 3 minutos (pago móvil/Zelle)
        break;
    }
  });

  // Calcular nivel de riesgo
  let riskLevel: "low" | "medium" | "high" = "low";
  if (totalMethods > 2) riskLevel = "medium";
  if (totalMethods > 3 || totalAmount > 1000000) riskLevel = "high";

  return {
    totalAmount,
    totalMethods,
    methodsByType,
    estimatedCompletionTime,
    riskLevel,
  };
};

// Función para validar configuración completa de pagos múltiples
export const validatePaymentConfiguration = (
  payments: SplitPayment[],
  serviceType: string,
  serviceId: number,
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validaciones básicas
  if (payments.length === 0) {
    errors.push("Debe seleccionar al menos un método de pago");
  }

  if (payments.length > 5) {
    warnings.push("Más de 5 métodos de pago pueden complicar el proceso");
  }

  // Validar montos
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  if (totalAmount <= 0) {
    errors.push("El monto total debe ser mayor a cero");
  }

  // Validar métodos individuales
  payments.forEach((payment, index) => {
    if (payment.amount <= 0) {
      errors.push(`Pago ${index + 1}: El monto debe ser mayor a cero`);
    }

    if (payment.amount > 10000000) {
      // 10M Bs
      warnings.push(
        `Pago ${index + 1}: Monto muy alto, puede tomar más tiempo`,
      );
    }

    // Validar límites bancarios
    if (
      payment.bankCode &&
      (payment.method === "card" || payment.method === "wallet")
    ) {
      const bankValidation = validateAmountAgainstBankLimits(
        payment.amount,
        payment.bankCode,
      );
      if (!bankValidation.isValid) {
        errors.push(`Pago ${index + 1}: ${bankValidation.error}`);
      }
    }
  });

  // Validar diversidad de métodos
  const uniqueMethods = new Set(payments.map((p) => p.method));
  if (uniqueMethods.size === 1 && payments.length > 1) {
    warnings.push("Usar el mismo método múltiples veces puede ser ineficiente");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Función para formatear pagos múltiples para API
export const formatMultiplePaymentsForAPI = (
  serviceType: "ride" | "delivery" | "errand" | "parcel",
  serviceId: number,
  payments: SplitPayment[],
): MultiplePaymentData => {
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  return {
    serviceType,
    serviceId,
    totalAmount,
    payments: payments.map((p) => ({
      id: p.id,
      method: p.method,
      amount: p.amount,
      percentage: p.percentage,
      bankCode: p.bankCode,
      description: p.description,
      status: p.status,
    })),
  };
};

