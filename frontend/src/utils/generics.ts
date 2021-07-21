import { MouseEvent } from "react"

export type VariableCallback = (ev: MouseEvent<Element | MouseEvent>) => Promise<void> | void
export type Setter = (v: any) => void
export type BooleanSetter = (v: boolean) => void
