const area = document.getElementById('log');
let base = area.textContent;
function log(m: string) {
  base += '\n' + m;
  area.textContent = base;
  console.log(m);
}

// ---- PDF mínimo sobre el que firmar de prueba (catalog/pages/page vacía) ----
function pdfMinimo(): Uint8Array {
  const catalog = '<< /Type /Catalog /Pages 2 0 R >>';
  const pages = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
  const page =
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>';
  const empty = '<< /Length 0 >>';
  const parts = [
    Buffer.from('%PDF-1.4\n'),
    Buffer.from('\n1 0 obj\n' + catalog + '\nendobj\n'),
    Buffer.from('\n2 0 obj\n' + pages + '\nendobj\n'),
    Buffer.from('\n3 0 obj\n' + page + '\nendobj\n'),
    Buffer.from('\n4 0 obj\n' + empty + '\nstream\n'),
    Buffer.from(''),
    Buffer.from('\nendstream\nendobj\n'),
  ];
  const all = Buffer.concat(parts);
  const offs = [0];
  let run = 0;
  for (const p of parts) {
    offs.push(run);
    run += p.length;
  }
  const xref =
    'xref\n0 5\n0000000000 65535 f \n' +
    `${String(offs[1]).padStart(10, '0')} 00000 n \n` +
    `${String(offs[2]).padStart(10, '0')} 00000 n \n` +
    `${String(offs[3]).padStart(10, '0')} 00000 n \n` +
    `${String(offs[4]).padStart(10, '0')} 00000 n \n`;
  const trailer = 'trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n' + run + '\n%%EOF\n';
  return new Uint8Array(Buffer.concat([all, Buffer.from(xref + trailer)]));
}

function bboxCanvas(canvas: HTMLCanvasElement, f: (r: number, g: number, b: number) => boolean) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let n = 0, minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
  for (let y = 0; y < canvas.height; y += 1)
    for (let x = 0; x < canvas.width; x += 1) {
      const i = (y * canvas.width + x) * 4;
      if (f(data[i], data[i + 1], data[i + 2])) {
        n += 1;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  return n ? { n, minX, minY, maxX, maxY } : null;
}

const areaTest = document.createElement('div');
areaTest.style.width = '1200px';
areaTest.style.height = '300px';
document.body.appendChild(areaTest);

(async () => {
  log('IIFE inicio');
  const sello = 'https://cmee.gob.ec/verificar/8f14e45f-ceea-467a-977c-3464c39a7e42';
  try {
  if (typeof Buffer === 'undefined') log('NO BUFFER global');

  const { agregarSelloYPlaceholder } = await import(
    '/src/shared/utils/firma-pdf/agregarSelloYPlaceholder.ts'
  );
  const { asegurarXrefClasico } = await import(
    '/src/shared/utils/firma-pdf/asegurarXrefClasico.ts'
  );
  log('modulos importados OK');

  // Cargar imagen una vez para precalentar (si esto se cuelga, es la red de headless)
  const urlImagen = document.querySelector<HTMLImageElement>('img.debug')?.src as unknown;
  void urlImagen;

  const pdfBase = Buffer.from(pdfMinimo());
  const pdfClasico = await asegurarXrefClasico(pdfBase);
  const firmado = await agregarSelloYPlaceholder({
    pdfBuffer: pdfClasico,
    reason: 'razon',
    contactInfo: '',
    name: '',
    location: '',
    signatureLength: 8192,
    sello: {
      posicion: { pagina: 0, x: 20, y: 200, ancho: 150, alto: 45 },
      etiqueta: 'FIRMADO ELECTRONICAMENTE POR:',
      nombre: 'JUAN PEREZ',
      qrUrl: sello,
    },
  });
  log('agregarSelloYPlaceholder OK, tamaño=' + firmado.length);

  // Inspección directa: la apariencia la genera construirAparienciaSello por
  // dentro. ¿Llega con recursoImagen?
  const { construirAparienciaSello } = await import(
    '/src/shared/utils/firma-pdf/crearAparienciaSello.ts'
  );
  const ap = await construirAparienciaSello({
    etiqueta: 'FIRMADO ELECTRONICAMENTE POR:',
    nombre: 'JUAN PEREZ',
    qrUrl: sello,
  });
  log(
    'recursoImagen=' +
      (ap.recursoImagen
        ? 'SI nombre=' + ap.recursoImagen.nombre + ' stream=' + ap.recursoImagen.imagen.streamBytes.length + 'B'
        : 'NO'),
  );

  // Render del PDF firmado con pdfjs y análisis de píxeles del logo
  const pdfjsLib = await import('/node_modules/pdfjs-dist/build/pdf.mjs');
  (pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc =
    '/node_modules/pdfjs-dist/build/pdf.worker.min.mjs';

  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(firmado) }).promise;
  const pagina = await doc.getPage(1);
  const viewport = pagina.getViewport({ scale: 3 });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;
  await pagina.render({ canvas, canvasContext: ctx, viewport }).promise;
  areaTest.appendChild(canvas);

  const azul = bboxCanvas(canvas, (r, g, b) => r < 70 && g < 70 && b > 140);
  const rojo = bboxCanvas(canvas, (r, g, b) => r > 120 && g < 110 && b < 110 && r - b > 50);
  log('canvas=' + canvas.width + 'x' + canvas.height);
  log('QR azul bbox=' + JSON.stringify(azul));
  log('logo rojo bbox=' + JSON.stringify(rojo));
  if (azul && rojo) {
    const cxA = (azul.minX + azul.maxX) / 2;
    const cyA = (azul.minY + azul.maxY) / 2;
    const cxR = (rojo.minX + rojo.maxX) / 2;
    const cyR = (rojo.minY + rojo.maxY) / 2;
    log(
      'distancia centros: ' +
        Math.abs(cxA - cxR).toFixed(1) +
        'px  |  rojo dentro de azul: ' +
        (rojo.minX >= azul.minX && rojo.maxX <= azul.maxX && rojo.minY >= azul.minY && rojo.maxY <= azul.maxY),
    );
  }
} catch (e) {
  log('ERROR: ' + (e instanceof Error ? e.message : String(e)));
  if (e instanceof Error && e.stack) log(e.stack.split('\n').slice(0, 6).join(' | '));
}
document.title = 'listo';
})();