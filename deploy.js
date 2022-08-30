require("dotenv").config()

const ethers = require("ethers")
const readlineSync = require("readline-sync")

async function main() {
    // **************
    // DEFINE WALLET
    // **************
    let httpProvider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)

    let walletDerivativeCombined = `m/44'/60'/0'/0/0`
    let wallet = new ethers.Wallet.fromMnemonic(
        process.env.MNEMONIC,
        walletDerivativeCombined
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
    let nonce = await httpProvider.getTransactionCount(wallet.address)
    let transactionType = 2
    let chainId = process.env.CHAIN_ID

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
        chainId: chainId,
        data: contractBinary,
    }

    // ***********************************
    // SIGN AND SERIALIZE THE TRANSACTION
    // ***********************************
    let rawTransaction = await wallet
        .signTransaction(transaction)
        .then(ethers.utils.serializeTransaction(transaction))

    // ************************
    // SEND SIGNED TRANSACTION
    // ************************
    let sentTransaction = await httpProvider.sendTransaction(rawTransaction)
    console.log("\nSENT TRANSACTION HASH")
    console.log(sentTransaction.hash)

    console.log("\nTRANSACTION STATUS")

    let currentBlock = await httpProvider.getBlockNumber()
    console.log("Starting block: " + currentBlock)

    let txBlockNumber = null
    let logTimer = 5

    while (!txBlockNumber) {
        tx = await httpProvider.getTransaction(sentTransaction.hash)

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