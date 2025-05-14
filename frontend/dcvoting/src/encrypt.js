import publicJson from './assets/public.json';
import { PublicKey } from 'paillier-bigint';

export async function encryptVoteVector(candidateIndex, numCandidates) {
  const publicKey = new PublicKey(BigInt(publicJson.n), BigInt(publicJson.g));

  const encryptedVector = [];
  for (let i = 0; i < numCandidates; i++) {
    const vote = (i === candidateIndex) ? 1n : 0n;
    const encrypted = await publicKey.encrypt(vote);
    encryptedVector.push(encrypted.toString());
  }

  return encryptedVector;
}
