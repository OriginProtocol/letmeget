""" Setup Portle Singularity """
import sys
import os.path
import shutil
from time import sleep
from subprocess import Popen, check_call, CalledProcessError
from setuptools import Command, setup, find_packages
from setuptools.command.develop import develop

__DIR__ = os.path.abspath(os.path.dirname(__file__))


class NodeCommand(Command):
    """ Start local chain and deploy contracts """

    description = "Startup ganache node with contracts"
    user_options = []

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):
        self.ganache = Popen("ganache-cli -a10 -i 1337 --chainId 1337".split())

        # Let ganache settle
        sleep(3)

        # Deploy
        try:
            check_call(
                "brownie run --network ganache scripts/deploy/dev_deploy.py".split()
            )
        except Exception as err:
            print(err)
            self.ganache.terminate()
            sys.exit(1)

        # Stay running
        self.ganache.wait()


class GanacheInstallCommand(Command):
    """ Install ganache-cli """

    description = "Install ganache-cli globally"
    user_options = [
        ("version=", "v", "version of ganache to install"),
    ]

    def initialize_options(self):
        self.version = "6.4.1"

    def finalize_options(self):
        pass

    def run(self):
        if shutil.which("ganache-cli"):
            print("Ganache already installed")
            return
        try:
            check_call([shutil.which("npm"), "install", "-g", "ganache-cli"])
        except CalledProcessError as err:
            if "non-zero" in str(err):
                print("extract failed", file=sys.stderr)
                sys.exit(1)


setup(
    name="letmeget_contracts",
    version="0.1.0",
    install_requires=[
        # "eth-ape>=0.1.0a13",
        # "ape-vyper>=0.1.0a5",
        "eth-brownie @ git+https://github.com/eth-brownie/brownie.git@4a399b1#egg=eth-brownie"
        # "eth-brownie>=1.14.6",
        "eip712>=0.1.0",
    ],
    extras_require={
        "dev": [
            "black==21.6b0",
        ]
    },
    cmdclass={
        "node": NodeCommand,
        "install_ganache": GanacheInstallCommand,
    },
)
