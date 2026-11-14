import { pathToFileURL } from "node:url";

export class RegistryError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "RegistryError";
    this.status = status;
  }
}

function isString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function validType(type, index) {
  if (!type || typeof type !== "object") return `types[${index}] no es un objeto.`;
  if (!isString(type.id)) return `types[${index}] no tiene id.`;
  if (!isString(type.label)) return `types[${index}] no tiene label.`;
  if (!Array.isArray(type.globs) || !type.globs.every(isString)) {
    return `types[${index}] (${type.id}) necesita globs: string[].`;
  }
  if (type.fields && !Array.isArray(type.fields)) {
    return `types[${index}] (${type.id}) tiene fields inválidos.`;
  }
  return null;
}

function validOperation(operation, index) {
  if (!operation || typeof operation !== "object") return `operations[${index}] no es un objeto.`;
  if (!isString(operation.id)) return `operations[${index}] no tiene id.`;
  if (!isString(operation.label)) return `operations[${index}] no tiene label.`;
  if (typeof operation.plan !== "function") {
    return `operations[${index}] (${operation.id}) necesita una función plan().`;
  }
  if (operation.apply !== undefined && typeof operation.apply !== "function") {
    return `operations[${index}] (${operation.id}) tiene apply inválido.`;
  }
  if (operation.fields && !Array.isArray(operation.fields)) {
    return `operations[${index}] (${operation.id}) tiene fields inválidos.`;
  }
  return null;
}

export async function loadRegistry(configPath) {
  let module;
  try {
    module = await import(pathToFileURL(configPath).href);
  } catch (error) {
    throw new RegistryError(`No se pudo cargar el registro ${configPath}: ${error.message}`);
  }
  const config = module.default ?? module;
  if (!config || typeof config !== "object") {
    throw new RegistryError("El registro no exporta un objeto por default.");
  }

  const warnings = [];
  const types = [];
  const operations = [];
  const typeIds = new Set();
  const operationIds = new Set();

  for (const [index, type] of (config.types ?? []).entries()) {
    const problem = validType(type, index);
    if (problem) {
      warnings.push({ id: "tipo-invalido", message: `Tipo ignorado: ${problem}` });
      continue;
    }
    if (typeIds.has(type.id)) {
      warnings.push({ id: "tipo-duplicado", message: `Tipo duplicado ignorado: ${type.id}` });
      continue;
    }
    typeIds.add(type.id);
    types.push({
      id: type.id,
      label: type.label,
      description: type.description ?? "",
      globs: type.globs,
      exclude: type.exclude ?? [],
      required: type.required ?? [],
      fields: type.fields ?? [],
      public: Boolean(type.public),
      readOnly: Boolean(type.readOnly),
      urlPattern: type.urlPattern ?? null,
      validate: type.validate
    });
  }

  for (const [index, operation] of (config.operations ?? []).entries()) {
    const problem = validOperation(operation, index);
    if (problem) {
      warnings.push({ id: "operacion-invalida", message: `Operación ignorada: ${problem}` });
      continue;
    }
    if (operationIds.has(operation.id)) {
      warnings.push({
        id: "operacion-duplicada",
        message: `Operación duplicada ignorada: ${operation.id}`
      });
      continue;
    }
    operationIds.add(operation.id);
    operations.push({
      id: operation.id,
      label: operation.label,
      description: operation.description ?? "",
      palette: operation.palette !== false,
      fields: operation.fields ?? [],
      plan: operation.plan,
      apply: operation.apply
    });
  }

  return { types, operations, warnings };
}

export function serializeRegistry(registry) {
  return {
    types: registry.types.map((type) => ({
      id: type.id,
      label: type.label,
      description: type.description,
      required: type.required,
      fields: type.fields,
      public: type.public,
      readOnly: type.readOnly
    })),
    operations: registry.operations.map((operation) => ({
      id: operation.id,
      label: operation.label,
      description: operation.description,
      palette: operation.palette,
      fields: operation.fields
    })),
    warnings: registry.warnings
  };
}
