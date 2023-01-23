import { ethers, Wallet } from "ethers"
import * as readlineSync from "readline-sync"
import "dotenv/config"

async function main() {
    // **************
    // DEFINE WALLET
    // **************
    let privateKey: string = process.env.PRIVATE_KEY || ""
    let rpcUrl: string = process.env.RPC_URL || ""
    let rpcUser: string = process.env.RPC_USER || ""
    let rpcPassword: string = process.env.RPC_PASSWORD || ""

    var urlInfo = {
        url: rpcUrl,
        user: rpcUser,
        password: rpcPassword,
    }
    var provider = new ethers.providers.JsonRpcProvider(urlInfo)

    let wallet = new Wallet(privateKey).connect(provider)

    console.log("\nMY WALLET ADDRESS")
    console.log(wallet.address)
    console.log(
        "Nonce: " + (await provider.getTransactionCount(wallet.address))
    )

    let maxPriorityFeePerGasGwei = await readlineSync.question(
        "\nEnter maxPriorityFeePerGasGwei: "
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
