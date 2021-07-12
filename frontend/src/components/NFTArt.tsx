import React, { ReactElement } from "react"
import Alert from "@material-ui/lab/Alert"

import "./NFTArt.scss"

const DEFAULT_COLOR = "#fff"

export interface NFTArtProps {
  name?: string
  description?: string
  external_url?: string
  image?: string
  animation_url?: string
  youtube_url?: string
  attributes?: Array<any>
  background_color?: string
  maxWidth?: string
}

function parseBackgroundColor(colorString?: string) {
  if (colorString && colorString.match(/#[A-Fa-f0-9]{6}/)) {
    return colorString
  }

  return DEFAULT_COLOR
}

export default function NFTArt(props: NFTArtProps): ReactElement {
  const {
    name,
    description,
    external_url,
    image,
    animation_url,
    youtube_url,
    attributes,
    background_color,
    maxWidth,
  } = props

  const style = {
    backgroundColor: parseBackgroundColor(background_color),
  }
  const imageStyle = {
    maxWidth,
  }

  return (
    <div className="nft-container" style={style}>
      <div className="nft-art">
        {animation_url || youtube_url ? (
          <Alert severity="info">Animations not yet implemented</Alert>
        ) : (
          <img style={imageStyle} src={image} />
        )}
      </div>
      <div className="nft-meta">
        <div className="nft-name">{name}</div>
        <div className="nft-descrtiption">{description}</div>
      </div>
    </div>
  )
}
