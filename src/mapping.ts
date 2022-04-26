import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  BuzzedBearHideout,
  Approval,
  ApprovalForAll,
  OwnershipTransferred,
  Transfer
} from "../generated/BuzzedBearHideout/BuzzedBearHideout"
import { Minter } from "../generated/schema"

let minterTokenIdMap = new Map<Address, Map<BigInt, bool>>()

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleTransfer(event: Transfer): void {
  const tokenID = event.params.tokenId
  if (event.transaction.from === Address.fromString("0x0000000000000000000000000000000000000000")) {
    let minterAddress = event.transaction.to
    if (!minterAddress) {
      return
    }
    let minter = Minter.load(minterAddress.toHex())
    if (!minter) {
      minter = new Minter(minterAddress.toHex())
      minter.count = 0
    }
    if (!minterTokenIdMap.has(minterAddress)) {
      minterTokenIdMap.set(minterAddress, new Map<BigInt, bool>())
    }
    let mintedMap = minterTokenIdMap.get(minterAddress)
    mintedMap.set(tokenID, true)
    minterTokenIdMap.set(minterAddress, mintedMap)
    minter.count += 1
    minter.save()
  } else {
    let minterAddress = event.transaction.from
    let minter = Minter.load(minterAddress.toHex())
    if (!minter) {
      return
    }
    if (minterTokenIdMap.get(minterAddress).get(tokenID)) {
      minter.count -= 1
      minterTokenIdMap.get(minterAddress).set(tokenID, false)
      minter.save()
    }
  }
}
