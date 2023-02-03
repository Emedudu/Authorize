require("hardhat-deploy")
require("hardhat-deploy-ethers")

const ethers = require("ethers")
const path = require("path")
const util = require("util")
const request = util.promisify(require("request"))
const { networkConfig } = require("../helper-hardhat-config")

const DEPLOYER_PRIVATE_KEY = network.config.accounts[0]

async function callRpc(method, params) {
    var options = {
        method: "POST",
        url: "https://api.hyperspace.node.glif.io/rpc/v1",
        // url: "http://localhost:1234/rpc/v0",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: method,
            params: params,
            id: 1,
        }),
    }
    const res = await request(options)
    return JSON.parse(res.body).result
}

const deployer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY)

module.exports = async ({ deployments }) => {
    const { deploy } = deployments

    const priorityFee = await callRpc("eth_maxPriorityFeePerGas")

    const saveFrontendFiles = (title, deployedContract) => {
        const fs = require("fs")
        const contractsDir = path.join(__dirname, "..", "abi")

        if (!fs.existsSync(contractsDir)) {
            fs.mkdirSync(contractsDir)
        }

        fs.writeFileSync(
            path.join(contractsDir, `${title}.json`),
            JSON.stringify({
                address: deployedContract.address,
                abi: deployedContract.abi,
                bytecode: deployedContract.bytecode,
                deployedBytecode: deployedContract.deployedBytecode,
            })
        )
    }
    // Wraps Hardhat's deploy, logging errors to console.
    const deployLogError = async (title, obj) => {
        let ret
        try {
            ret = await deploy(title, obj)
            saveFrontendFiles(title, ret)
        } catch (error) {
            console.log(error.toString())
            process.exit(1)
        }
        return ret
    }

    console.log("Wallet Ethereum Address:", deployer.address)
    const chainId = network.config.chainId

    console.log("deploying Test...")
    const test = await deployLogError("Test", {
        from: deployer.address,
        args: [],
        // maxPriorityFeePerGas to instruct hardhat to use EIP-1559 tx format
        maxPriorityFeePerGas: priorityFee,
        log: true,
    })

    console.log("deploying Key...")
    const key = await deployLogError("Key", {
        from: deployer.address,
        args: [],
        // maxPriorityFeePerGas to instruct hardhat to use EIP-1559 tx format
        maxPriorityFeePerGas: priorityFee,
        log: true,
    })

    console.log("deploying Book...")
    const book = await deployLogError("Book", {
        from: deployer.address,
        args: [3, key.address],
        // maxPriorityFeePerGas to instruct hardhat to use EIP-1559 tx format
        maxPriorityFeePerGas: priorityFee,
        log: true,
    })
}
