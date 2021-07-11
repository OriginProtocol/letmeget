""" Setup Portle Singularity """
import os.path
from subprocess import check_call, CalledProcessError
from setuptools import setup, find_packages
from setuptools.command.develop import develop

__DIR__ = os.path.abspath(os.path.dirname(__file__))


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
)
