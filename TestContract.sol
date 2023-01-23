// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

/** @title TestContract
 *  @author EridianAlpha
 *  @dev An example contract used to show how to compile using solc.
 */
contract TestContract {
    uint256 public immutable favoriteNumber;

    constructor() {
        favoriteNumber = 7;
    }
}
