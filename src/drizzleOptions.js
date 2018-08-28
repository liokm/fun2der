import ComplexStorage from './../build/contracts/ComplexStorage.json'
import SimpleStorage from './../build/contracts/SimpleStorage.json'
import TutorialToken from './../build/contracts/TutorialToken.json'
import Fun2der from './../build/contracts/Fun2der.json'

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:8545'
    }
  },
  contracts: [
    ComplexStorage,
    SimpleStorage,
    TutorialToken,
    Fun2der
  ],
  events: {
    SimpleStorage: ['StorageSet'],
    // Fun2der: ['ProjectCreate', 'Finalized', 'TokenPurchase']
  },
  polls: {
    accounts: 1500
  }
}

export default drizzleOptions