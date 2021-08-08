# Let Me Get

NFT Trading platform

## Development Environment

### Install Dependencies

#### Frontend

    cd frontend && yarn

#### Contracts

    brownie pm install OpenZeppelin/openzeppelin-contracts@4.2.0

### Running local node

`-a` and `-b` set the Alice and Bob accounts.  Apes and Rats are distributed evenly between them.  Alice gets even token IDs and Bob gets the odds.

    python setup.py node -a 0x9283099A29556fCF8fFF5b2Cea2D4F67CB7A7A8b -b 0x4984449818A45D0D43C8E69a5E56fb6ADb621d41
