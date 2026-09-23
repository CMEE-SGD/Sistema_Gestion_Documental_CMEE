// Diagnóstico de un archivo .p12/.pfx con la MISMA librería que usa el
// aplicativo (node-forge). Uso:
//   node diagnosticar-p12.cjs "E:\carpeta\mi_certificado.p12" [contraseña]
// Sin contraseña se intenta abrir como vacía y se reporta.
'use strict';
const fs = require('fs');
const forge = require('node-forge');

const ruta = process.argv[2];
const pass = process.argv[3] || '';

if (!ruta) {
  console.error('Uso: node diagnosticar-p12.cjs <ruta.p12> [contraseña]');
  process.exit(1);
}
if (!fs.existsSync(ruta)) {
  console.error('No existe el archivo: ' + ruta);
  process.exit(1);
}

const bytes = fs.readFileSync(ruta);
console.log('Archivo: ' + ruta);
console.log('Tamaño: ' + bytes.length + ' bytes');

const OIDS = {
  '1.2.840.113549.1.1.1': 'clave RSA (rsaEncryption)',
  '1.2.840.10045.2.1': 'clave EC / ECDSA (id-ecPublicKey)',
  '1.3.101.112': 'clave Ed25519',
  '1.2.840.113549.1.12.1.3': 'PKCS#12 PBE: SHA1 + 3DES (legado, el que soporta node-forge)',
  '1.2.840.113549.1.12.1.6': 'PKCS#12 PBE: SHA1 + 40-bit RC2 (legado)',
  '1.2.840.113549.1.5.13': 'PBES2 (cifrado MODERNO de la clave privada)',
  '2.16.840.1.101.3.4.1.42': 'AES-256-CBC (MODERNO)',
  '2.16.840.1.101.3.4.1.2': 'AES-128-CBC',
  '2.16.840.1.101.3.4.1.4': 'AES-192-CBC',
  '1.2.840.113549.1.5.12': 'PBKDF2 (derivación moderna de contraseña)',
  '1.3.14.3.2.26': 'resumen SHA-1 (legado)',
  '2.16.840.1.101.3.4.2.1': 'resumen SHA-256',
  '2.16.840.1.101.3.4.2.2': 'resumen SHA-384',
  '2.16.840.1.101.3.4.2.3': 'resumen SHA-512',
  '1.2.840.113549.2.7': 'HMAC con SHA-1 (MAC legado)',
  '1.2.840.113549.2.9': 'HMAC con SHA-256 (MAC moderno)',
  '1.2.840.113549.1.1.5': 'Firma del certificado: SHA1withRSA',
  '1.2.840.113549.1.1.11': 'Firma del certificado: SHA256withRSA',
  '1.2.840.10045.4.3.2': 'Firma del certificado: ecdsa-with-SHA256',
};

function recorrer(node, encontrados, todos) {
  if (!node) return;
  if (node.type === forge.asn1.Type.OID) {
    try {
      const oid = forge.asn1.derToOid(node.value);
      todos.add(oid);
      if (OIDS[oid]) encontrados[oid] = true;
    } catch {
      /* no es un OID reconocible */
    }
  }
  if (Array.isArray(node.value)) {
    node.value.forEach((n) => recorrer(n, encontrados, todos));
  }
}

try {
  const asn1 = forge.asn1.fromDer(bytes.toString('binary'));
  console.log('\n1) ASN.1 (DER): OK, se lee como estructura binaria válida.\n');

  const encontrados = {};
  const todos = new Set();
  recorrer(asn1, encontrados, todos);
  console.log('2) Algoritmos detectados dentro del archivo:');
  let alguno = false;
  for (const oid of Object.keys(OIDS)) {
    if (encontrados[oid]) {
      console.log('   - ' + OIDS[oid]);
      alguno = true;
    }
  }
  if (!alguno) console.log('   - (ninguno de los algoritmos conocidos)');
  console.log('   --- TODOS los OIDs presentes (ordenados): ---');
  for (const oid of [...todos].sort()) {
    console.log('      ' + oid + (OIDS[oid] ? '  => ' + OIDS[oid] : ''));
  }

  const tieneModerno = Object.keys(encontrados).some((oid) =>
    ['1.2.840.113549.1.5.13', '2.16.840.1.101.3.4.1.42', '2.16.840.1.101.3.4.1.2', '1.2.840.113549.2.9'].includes(oid),
  );
  const tieneEC = encontrados['1.2.840.10045.2.1'] || encontrados['1.3.101.112'];
  const tieneRSA = encontrados['1.2.840.113549.1.1.1'];
  const tieneRSAConSHA1 = encontrados['1.2.840.113549.1.1.5'] || encontrados['1.2.840.113549.1.1.5'];

  console.log('\n3) Intento de apertura con node-forge (la librería del aplicativo)...');
  try {
    const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, false, pass);
    console.log('   [OK] node-forge ABRIÓ el .p12 con esa contraseña.');
    const certs = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
    const keys = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag];
    console.log('   Certificados: ' + (certs?.length ?? 0) + ' | Bolsas de clave privada: ' + (keys?.length ?? 0));
    const cert = certs?.[0]?.cert;
    if (cert) {
      const esRSA = cert.publicKey && 'n' in cert.publicKey;
      console.log('   Titular (CN): ' + (cert.subject.getField('CN')?.value ?? '?'));
      console.log('   Tipo de clave pública: ' + (esRSA ? 'RSA' : cert.publicKey ? 'NO-RSA (¿EC/Ed25519?)' : 'desconocida'));
    }
    if ((keys?.length ?? 0) === 0) {
      console.log('\n   >>> ATENCIÓN: hay certificados pero NO hay bolsa de clave privada.');
      console.log('       Este archivo NO puede firmar (fue exportado sin la llave privada).');
    }
  } catch (err) {
    console.log('   [FALLA] node-forge NO pudo abrir el .p12.');
    console.log('   Error exacto de node-forge: ' + (err.message || err));
    if (/password|mac/i.test(err.message || '')) {
      console.log('\n   La librería lo interpretó como contraseña incorrecta o MAC no soportado.');
    }
    console.log('');
    if (tieneModerno) {
      console.log('   >>> CONCLUSIÓN PROBABLE: el .p12 usa CIFRADO MODERNO (PBES2/AES-256 o');
      console.log('       MAC SHA-256). node-forge solo soporta PKCS#12 legado (3DES/RC2 + SHA-1),');
      console.log('       por eso Adobe (que usa el sistema operativo) firma y el aplicativo no.');
    } else if (tieneEC) {
      console.log('   >>> CONCLUSIÓN PROBABLE: la clave es EC/ECDSA/Ed25519. node-forge solo');
      console.log('       soporta firmar con RSA, así que el aplicativo no puede usarla (Adobe sí).');
    } else {
      console.log('   >>> No se detectó un algoritmo moderno: puede ser contraseña incorrecta,');
      console.log('       archivo truncado, o un formato PKCS#12 que node-forge no reconoce.');
    }
    if (!pass) {
      console.log('\n   Nota: se intentó SIN contraseña. Si el archivo sí tiene contraseña,');
      console.log('   vuelve a ejecutarlo pasándola como segundo argumento.');
    }
  }
} catch (err) {
  console.log('\n1) ASN.1 (DER): NO parsea — el archivo está corrupto, truncado o no es un PKCS#12.');
  console.log('   Error: ' + (err.message || err));
}