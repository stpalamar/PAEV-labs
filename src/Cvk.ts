import generateRSAKeyPair from './RSAKeyGenerator';
import {
  binaryArrayToString,
  privateKeyToBinaryArray,
  publicKeyToBinaryArray,
  quadraticHash,
} from './utils';

type Vote = { encryptedVote: number[]; signature: bigint };

class Cvk {
  publicKey: { e: number; n: number };
  privateKey: { d: number; n: number };
  candidates: string[];
  votes: Vote[] = [];

  constructor(candidates: string[]) {
    const { publicKey, privateKey } = generateRSAKeyPair();
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.candidates = candidates;
  }

  addVote(vote: { encryptedVote: number[]; signature: bigint }): Vote {
    this.votes.push(vote);
    return vote;
  }

  verifySignature(
    encryptedVote: number[],
    signature: bigint,
    publicVoterKey: { e: number; n: number }
  ): boolean {
    const decryptedSignature =
      signature ** BigInt(publicVoterKey.e) % BigInt(publicVoterKey.n);
    const hash = quadraticHash(encryptedVote, publicVoterKey.n);
    return hash === Number(decryptedSignature);
  }

  decryptVote(
    encryptedVote: number[],
    cvkPrivateKey: { d: number; n: number },
    cvkPublicKey: { e: number; n: number }
  ): string {
    // Отримуємо бінарний вигляд приватного ключа ЦВК
    const cvkPrivateKeyBits: number[] = publicKeyToBinaryArray(cvkPublicKey);

    // Розшифровуємо гамований голос, використовуючи приватний ключ ЦВК як розшифровувальний ключ
    const decryptedVote: number[] = encryptedVote.map(
      (bit, index) => bit ^ cvkPrivateKeyBits[index]
    );

    // Перетворюємо бінарний масив назад в рядок
    const candidateName = binaryArrayToString(decryptedVote);

    return candidateName;
  }
}

export default Cvk;
