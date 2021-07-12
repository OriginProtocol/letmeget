import json
import shutil
from pathlib import Path
from brownie import ApesMock, RatsMock, LetMeGet_v1, accounts, web3

CHAIN_ID = 1337


def deploy_mocks(deployer):
    apes = ApesMock.deploy({"from": deployer})
    rats = RatsMock.deploy({"from": deployer})
    return (apes, rats)


def deploy_lmg(deployer):
    return LetMeGet_v1.deploy({"from": deployer})


def fund_account(addr, value):
    return web3.eth.send_transaction(
        {"from": accounts[0].address, "to": addr, "value": value}
    )


def get_account(address):
    for account in accounts:
        print("account:", account)
        if account.address == address:
            return account
    return None


def copy_artifact(address):
    fe_dir = (
        Path(__file__)
        .parent.joinpath("../../../frontend/src/artifacts/{}".format(CHAIN_ID))
        .resolve()
    )

    if not fe_dir.exists():
        fe_dir.mkdir()

    artifact_dir = (
        Path(__file__)
        .parent.joinpath("../../build/deployments/{}".format(CHAIN_ID))
        .resolve()
    )
    artifact_file = artifact_dir.joinpath("{}.json".format(address))

    if not artifact_file.is_file():
        raise Exception("Artifact not found: {}".format(artifact_file))

    jason = json.loads(artifact_file.read_text())
    dest = fe_dir.joinpath("{}.json".format(jason.get("contractName")))
    shutil.copy(
        artifact_file,
        dest,
    )
    print("Copied artifact {}".format(dest))


def main():
    # deployer = accounts.load("deployer")
    # deployer = get_account("0x6772997B58BCFd05aCbc04256BaE38cEafc468Bb")
    deployer = accounts[9]
    # fund_account(deployer.address, int(5e18))
    apes, rats = deploy_mocks(deployer)
    lmg = deploy_lmg(deployer)

    copy_artifact(apes.address)
    copy_artifact(rats.address)
    copy_artifact(lmg.address)
