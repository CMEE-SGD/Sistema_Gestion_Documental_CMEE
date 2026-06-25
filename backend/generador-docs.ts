import { Project, MethodDeclaration } from "ts-morph";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const sourceFiles = project.getSourceFiles("src/**/*.ts");
console.log(`Analizando ${sourceFiles.length} archivos fuente...`);

// Utilidad para limpiar rutas locales y objetos largos de Prisma
function limpiarTipo(tipo: string): string {
  if (tipo.includes("C:/") || tipo.includes("node_modules")) {
    return tipo.includes("[]") ? "Array<Entidad>" : "Entidad | PrismaResponse";
  }
  if (tipo.length > 50) return "Objeto complejo / PrismaResponse";
  return tipo;
}

// Utilidad para deducir la funcionalidad en base al decorador
function deducirFuncionalidad(metodo: MethodDeclaration): string {
  const nombre = metodo.getName();
  const decoradores = metodo.getDecorators().map(d => d.getName());
  
  if (decoradores.includes("Get")) return `Obtiene información de ${nombre === 'findAll' ? 'múltiples registros' : 'un registro específico'}.`;
  if (decoradores.includes("Post")) return "Crea un nuevo registro o procesa una acción en el sistema.";
  if (decoradores.includes("Patch") || decoradores.includes("Put")) return "Actualiza parcialmente la información de un registro existente.";
  if (decoradores.includes("Delete")) return "Elimina lógicamente o inactiva un registro en el sistema.";
  
  return `Ejecuta la operación de negocio ${nombre}.`;
}

sourceFiles.forEach((sourceFile) => {
  let modificado = false;

  // 1. Clases
  sourceFile.getClasses().forEach((clase) => {
    if (clase.getJsDocs().length === 0) {
      clase.addJsDoc({
        description: `Módulo controlador o servicio para gestionar la entidad ${clase.getName()?.replace('Controller', '')?.replace('Service', '') || 'Principal'}.`,
      });
      modificado = true;
    }

    // 2. Métodos
    clase.getMethods().forEach((metodo) => {
      if (metodo.getJsDocs().length === 0) {
        const funcionalidad = deducirFuncionalidad(metodo);
        
        const parametros = metodo.getParameters().map(p => ({
          name: p.getName(),
          description: limpiarTipo(p.getType().getText())
        }));

        const retornoLimpio = limpiarTipo(metodo.getReturnType().getText());

        metodo.addJsDoc({
          description: funcionalidad,
          tags: [
            ...parametros.map(p => ({ tagName: "param", text: `${p.name} - Datos o identificador requerido (${p.description})` })),
            { tagName: "returns", text: retornoLimpio }
          ]
        });
        modificado = true;
      }
    });
  });

  if (modificado) {
    console.log(`Comentarios inyectados en: ${sourceFile.getFilePath()}`);
  }
});

project.saveSync();
console.log("Fase 1 corregida. Código fuente documentado de forma funcional y limpia.");