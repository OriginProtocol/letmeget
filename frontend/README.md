# Let Me Get Dapp

This is the decentralized application for Let Me Get.

## Development

### Running

If you would like to test completely locally, make sure you're running a local
dev node. Run this in the `contracts/` directory:

    python setup.py node -a [AliceAddress] -b [BobAddress]

`AliceAddress` and `BobAddresses` are two accounts you would like to test with.
They'll be funded and transferred NFTs to test with.

Now run the frontend in the `frontend/` directory.

    yarn start

## Deploy

    cd frontend && yarn build && cd dist && aws --profile infra s3 cp --acl public-read --recursive . s3://letmeget.io/
