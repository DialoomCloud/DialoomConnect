import { initializeEmailTemplates } from "../server/email-templates-init";

async function run() {
  console.log("Inicializando plantillas de email...");
  try {
    await initializeEmailTemplates();
    console.log("✅ Plantillas de email inicializadas correctamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al inicializar plantillas:", error);
    process.exit(1);
  }
}

run();