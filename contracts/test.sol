// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";




contract test is Ownable{

    constructor(address initialOwner) Ownable(initialOwner)  {
    }

}
