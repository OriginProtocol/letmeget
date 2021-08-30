import os
import json
import logging
import requests

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    logger.info("lambda_handler reached")
    try:
        content = None
        status_code = 419
        logger.info("event: {}".format(event.keys()))
        params = event.get("queryStringParameters", {})
        uri = params.get("uri", "") if params else ""

        if uri:
            logger.info("fetching {}...".format(uri))
            res = requests.get(uri, {"Accept": "application/json"})
            status_code = res.status_code
            logger.info("returned {}".format(status_code))
            if status_code == 200:
                content = res.json()

        return {
            "statusCode": 200,
            "body": json.dumps(
                {
                    "statusCode": status_code,
                    "body": content,
                    "uri": uri,
                }
            ),
        }
    except Exception as err:
        logger.error(str(err))
        return {
            "statusCode": 500,
            "body": json.dumps(
                {
                    "reason": str(err),
                    "uri": uri,
                }
            ),
        }


if __name__ == "__main__":
    from urllib.parse import quote

    # Good
    print(
        lambda_handler(
            {
                "queryStringParameters": {
                    "uri": quote(
                        "https://nft.micro.com/nft/0xB2da8F6D63c4113Fd214d7636F8FF1430AD5B863/1"
                    )
                }
            },
            None,
        )
    )
    # Bad (404)
    print(
        lambda_handler(
            {
                "queryStringParameters": {
                    "uri": quote(
                        "https://www.milliondollarrat.com/metadata/9999999.json"
                    )
                }
            },
            None,
        )
    )
