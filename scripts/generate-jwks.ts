import * as fs from 'fs';
import * as path from 'path';
import * as jose from 'node-jose';

interface JWK {
  kty: string;
  kid: string;
  n: string;
  e: string;
  d?: string;
  p?: string;
  q?: string;
  dp?: string;
  dq?: string;
  qi?: string;
  alg: string;
  use: string;
}

async function generateJWKS() {
  try {
    // Gera o par de chaves RSA
    const keystore = jose.JWK.createKeyStore();
    const key = await keystore.generate('RSA', 2048, {
      kid: 'kid1',
      use: 'sig',
      alg: 'RS256',
    });

    // Exporta a chave como JWK
    const privateKey = key.toJSON(true) as JWK;

    // Cria o objeto JWKS com a chave privada
    const privateJwks = {
      keys: [
        {
          kty: privateKey.kty,
          kid: privateKey.kid,
          n: privateKey.n,
          e: privateKey.e,
          d: privateKey.d,
          p: privateKey.p,
          q: privateKey.q,
          dp: privateKey.dp,
          dq: privateKey.dq,
          qi: privateKey.qi,
          alg: 'RS256',
          use: 'sig',
        },
      ],
    };

    // Cria o objeto JWKS com a chave pública
    const publicJwks = {
      keys: [
        {
          kty: privateKey.kty,
          kid: privateKey.kid,
          n: privateKey.n,
          e: privateKey.e,
          alg: 'RS256',
          use: 'sig',
        },
      ],
    };

    // Cria o diretório se não existir
    const certsDir = path.join(process.cwd(), 'certs');
    if (!fs.existsSync(certsDir)) {
      fs.mkdirSync(certsDir);
    }

    // Salva os arquivos
    fs.writeFileSync(
      path.join(certsDir, 'jwks.json'),
      JSON.stringify(publicJwks, null, 2)
    );

    fs.writeFileSync(
      path.join(certsDir, 'private.json'),
      JSON.stringify(privateJwks, null, 2)
    );

    console.log('Arquivos gerados com sucesso em certs/');
    console.log('- jwks.json (chave pública para validação)');
    console.log('- private.json (chave privada para assinatura)');
  } catch (error) {
    console.error('Erro ao gerar as chaves:', error);
    process.exit(1);
  }
}

generateJWKS();
