const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Connection, PublicKey, Keypair, SystemProgram, sendAndConfirmTransaction, Transaction, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_PROGRAM_ID } = require('@solana/spl-token');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const mainWallet = Keypair.fromSecretKey(Uint8Array.from([106,154,227,16,149,36,188,28,137,201,135,217,120,63,131,95,44,138,188,57,88,215,211,6,37,66,127,26,22,79,16,140,12,9,1,222,48,72,177,66,146,57,82,206,190,121,27,170,213,174,37,12,25,93,188,201,249,208,71,252,83,49,103,199]));

app.post('/send', async (req, res) => {
  const { recipients, token } = req.body;
  if (!recipients || !Array.isArray(recipients)) {
    return res.status(400).send('Invalid request body');
  }

  try {
    for (const recipient of recipients) {
      if (!recipient.address || !recipient.amount) {
        return res.status(400).send('Recipient address and amount are required');
      }

      const recipientPubkey = new PublicKey(recipient.address);
      let amountUnits;

      const transaction = new Transaction();

      if (token === 'SOL') {
        // Send SOL
        amountUnits = recipient.amount * LAMPORTS_PER_SOL;
        console.log(`Sending ${recipient.amount} SOL to ${recipient.address}`);
        console.log(`Amount in lamports: ${amountUnits}`);
        
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: mainWallet.publicKey,
            toPubkey: recipientPubkey,
            lamports: amountUnits,
          })
        );
      } else {
        // Send SPL Token
        const mintPublicKey = new PublicKey(token);
        const mintInfo = await connection.getParsedAccountInfo(mintPublicKey);
        if (!mintInfo.value) {
          throw new Error('Invalid SPL Token mint address');
        }
        const decimals = mintInfo.value.data.parsed.info.decimals;
        amountUnits = recipient.amount * Math.pow(10, decimals); // Convert to smallest unit
        
        console.log(`Sending ${recipient.amount} tokens to ${recipient.address}`);
        console.log(`Token decimals: ${decimals}`);
        console.log(`Amount in smallest units: ${amountUnits}`);

        const mainWalletTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          mainWallet,
          mintPublicKey,
          mainWallet.publicKey
        );
        const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          mainWallet,
          mintPublicKey,
          recipientPubkey
        );

        transaction.add(
          createTransferInstruction(
            mainWalletTokenAccount.address,
            recipientTokenAccount.address,
            mainWallet.publicKey,
            amountUnits,
            [],
            TOKEN_PROGRAM_ID
          )
        );
      }

      const signature = await sendAndConfirmTransaction(connection, transaction, [mainWallet]);
      console.log(`Transaction ${signature} confirmed for ${recipient.address}`);
    }
    res.status(200).send('Transactions successful');
  } catch (error) {
    console.error('Error sending transactions:', error);
    res.status(500).send(`Error: ${error.message}`);
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
