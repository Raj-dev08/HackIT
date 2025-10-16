import sodium from 'libsodium-wrappers'

export async function encryptMessage({ text , senderId , receiverPublicB64 }) {
    await sodium.ready;

    const senderPrivateB64 = localStorage.getItem(`${senderId}:privateKey`)

    if(!senderPrivateB64 || !receiverPublicB64 ) throw new Error("keys not found")
    
    const senderPrivateKey = sodium.from_base64(senderPrivateB64 , sodium.base64_variants.ORIGINAL)
    const receiverPublicKey = sodium.from_base64(receiverPublicB64 , sodium.base64_variants.ORIGINAL)

    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    const messageBytes = sodium.from_string(text)

    const cipher = sodium.crypto_box_easy(messageBytes, nonce, receiverPublicKey, senderPrivateKey)
    
    return sodium.to_base64(nonce,sodium.base64_variants.ORIGINAL) + ":" + sodium.to_base64(cipher,sodium.base64_variants.ORIGINAL)
}

export async function decryptMessage({ encrypted, senderPublicB64, receiverId }) {
    await sodium.ready;

    const receiverPrivateB64 = localStorage.getItem(`${receiverId}:privateKey`);

    if(!senderPublicB64 || !receiverPrivateB64) throw new Error("keys not found")

    const receiverPrivateKey = sodium.from_base64(receiverPrivateB64,sodium.base64_variants.ORIGINAL)
    const senderPublicKey = sodium.from_base64(senderPublicB64, sodium.base64_variants.ORIGINAL)

    const [nonceB64 , cipherB64] = encrypted.split(":")

    const nonce = sodium.from_base64(nonceB64,sodium.base64_variants.ORIGINAL)
    const cipher = sodium.from_base64(cipherB64, sodium.base64_variants.ORIGINAL)

    const decryptedBytes = sodium.crypto_box_open_easy(cipher, nonce, senderPublicKey, receiverPrivateKey)

    return sodium.to_string(decryptedBytes)
}