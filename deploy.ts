import { ethers, Wallet } from "ethers"
import * as readlineSync from "readline-sync"
import "dotenv/config"

async function main() {
    // **************
    // DEFINE WALLET
    // **************
    let mnemonic: string = process.env.MNEMONIC || ""
    let walletDerivative: string = process.env.WALLET_DERIVATIVE || ""

    let provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
    let wallet = ethers.Wallet.fromMnemonic(mnemonic, walletDerivative).connect(
        provider
    )

    console.log("\nMY WALLET ADDRESS")
    console.log(wallet.address)
    console.log()

    let maxPriorityFeePerGasGwei = await readlineSync.question(
        "Enter maxPriorityFeePerGasGwei: "
    )
    let maxFeePerGasGwei = await readlineSync.question(
        "Enter maxFeePerGasGwei: "
    )

    let contractBinary =
        "0x" + (await readlineSync.question("Enter Contract Binary: "))

    // **********************
    // TRANSACTION VARIABLES
    // **********************
    let gasLimit = "200000"
    let nonce = await provider.getTransactionCount(wallet.address)
    let transactionType = 2

    // *******************
    // CREATE TRANSACTION
    // *******************
    let transaction = {
        // to: , // Leave "to" address empty as that's how contracts are created
        gasLimit: gasLimit,
        maxPriorityFeePerGas: ethers.utils.parseUnits(
            maxPriorityFeePerGasGwei,
            "gwei"
        ),
        maxFeePerGas: ethers.utils.parseUnits(maxFeePerGasGwei, "gwei"),
        nonce: nonce,
        type: transactionType,
        chainId: parseInt(process.env.CHAIN_ID!),
        data: contractBinary,
    }

    // ************************
    // SEND SIGNED TRANSACTION
    // ************************
    let sentTransaction = await wallet.sendTransaction(transaction)

    console.log("\nSENT TRANSACTION HASH")
    console.log(sentTransaction.hash)

    console.log("\nTRANSACTION STATUS")

    let currentBlock = await provider.getBlockNumber()
    console.log("Starting block: " + currentBlock)

    let txBlockNumber = null
    let logTimer = 5

    while (!txBlockNumber) {
        let tx = await provider.getTransaction(sentTransaction.hash)

        if (!tx.blockNumber) {
            if (logTimer >= 5) {
                console.log("TX pending...")
                logTimer = 0
            }
            await new Promise((resolve) => setTimeout(resolve, 1000))
            logTimer++
        } else {
            console.log("TX CONFIRMED!")
            console.log("Confirmed in block: " + tx.blockNumber)
            txBlockNumber = tx.blockNumber
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
