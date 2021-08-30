# Let Me Get Contracts

## Development Setup

Setup Python vitual env

    python -m venv /path/to/venv
    source /path/to/venv/bin/activate

Install dependencies

    pip install .[dev]

## Deployment Notes

### Rinkeby

    LetMeGet_v2.deploy({"from": deployer, "type": 2, "maxFeePerGas": int(1e9), "maxPriorityFeePerGas": int(5e8)})
