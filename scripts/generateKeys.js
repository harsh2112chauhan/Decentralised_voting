const paillierBigint = require('paillier-bigint');
const fs = require('fs');

async function generateKeys() {
    const { publicKey, privateKey } = await paillierBigint.generateRandomKeys(2048);
  
    // Manually serialize
    const pub = {
      n: publicKey.n.toString(),
      g: publicKey.g.toString()
    };
  
    const priv = {
      lambda: privateKey.lambda.toString(),
      mu: privateKey.mu.toString(),
      publicKey: pub
    };
  
    fs.writeFileSync('public.json', JSON.stringify(pub, null, 2));
    fs.writeFileSync('private.json', JSON.stringify(priv, null, 2));
  
    console.log('🔐 Keys generated and saved to public.json and private.json');
  }