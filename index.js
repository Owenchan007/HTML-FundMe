// 获取前端可用的ethers.js，这个是在ethers网站上下载的代码
import { ethers } from "./ethers.min.js"
// 获取abi，文件在后端编译的abi中
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const getBalanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
getBalanceButton.onclick = getBalance // 这里是引用该函数而不是立刻调用，所以不需要括号
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        // 获取按钮的ID名称，然后改成想要的文字
        connectButton.innerHTML = "Ok,Connected!"
        console.log("Connected!")
    } else {
        connectButton.innerHTML = "Please install Metamask"
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount} ...`)
    if (typeof window.ethereum !== "undefined") {
        // 获取小狐狸钱包上的签名地址
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done")
        } catch (error) {
            console.log(error)
        }
    }
}

async function getBalance() {
    console.log(`Getting balance ...`)
    if (typeof window.ethereum !== "undefined") {
        // 获取小狐狸钱包上的签名地址
        const provider = new ethers.BrowserProvider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.formatEther(balance))
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing...")
        // 获取小狐狸钱包上的签名地址
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
        console.log("withdraw")
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    // create a listener for the blockchain
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations..`
            )
            resolve()
        })
    })
}
